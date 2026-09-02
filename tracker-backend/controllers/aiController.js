/**
 * Jarvis AI Controller — Upgraded with Agentic Reasoning + OCR + Web Scraping
 * ──────────────────────────────────────────────────────────────────────────────
 * Pipeline:
 *   1. File upload → OCR → RAG injection → Gemini response
 *   2. Text message → Intent classify → Agent loop (tools) → Stream response
 *   3. Fallback: local humanoid synthesis
 */

const { classify, INTENTS } = require('../ai/intentClassifier');
const { ragQuery } = require('../ai/ragEngine');
const { runAgentLoop } = require('../ai/agentOrchestrator');
const { processUploadedFile } = require('../ai/ocrEngine');
const { scrapeUrl, formatScrapeResult, extractUrls } = require('../ai/webScraper');
const memoryStore = require('../ai/memoryStore');
const { logDailyUpdate, logApplication, updateDsaProgress, updateLecture } = require('../ai/actionExecutor');
const {
  autoLearnFromMessage, teachFact, persistConversation,
  getLearnedFactsContext, getAllFacts, forgetFact,
} = require('../ai/longTermMemory');
const { searchJobsPaginated, formatJobsForResponse } = require('../ai/jobSearcher');
const { broadcast, WS_EVENTS } = require('../services/websocketService');

// ── Helpers ───────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/**
 * POST /api/ai/chat — Standard JSON response (with agent + URL detection)
 */
exports.handleAiChat = async (req, res) => {
  try {
    const { prompt, sessionId = 'default' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // 1. Auto-learn from message
    autoLearnFromMessage(prompt, 'user').catch(() => {});

    // 2. Classify intent
    const { intent, entities } = classify(prompt);

    // 3. Load context
    const history = memoryStore.getContextString(sessionId);
    const learnedFacts = await getLearnedFactsContext();

    // 4. Check for URLs → scrape them first
    const urls = extractUrls(prompt);
    let urlContext = '';
    if (urls.length > 0) {
      for (const url of urls.slice(0, 2)) { // max 2 URLs per message
        const scraped = await scrapeUrl(url);
        urlContext += '\n' + formatScrapeResult(scraped);
      }
    }

    let result = null;

    // 5. Route to correct handler
    switch (intent) {
      case INTENTS.LOG_DAILY:
        result = await logDailyUpdate(entities, prompt);
        broadcast(WS_EVENTS.AI_ACTION, { action: 'DAILY_LOG', entities });
        broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'daily_log_updated' });
        break;

      case INTENTS.ADD_APPLICATION:
        result = await logApplication(entities, prompt);
        broadcast(WS_EVENTS.AI_ACTION, { action: 'APPLICATION_ADDED', company: entities.company });
        broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'application_added' });
        break;

      case INTENTS.UPDATE_DSA:
        result = await updateDsaProgress(entities, prompt);
        broadcast(WS_EVENTS.AI_ACTION, { action: 'DSA_UPDATED', topic: entities.dsaTopic });
        broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'dsa_updated' });
        break;

      case INTENTS.UPDATE_LECTURE:
        result = await updateLecture(entities, prompt);
        broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'lecture_updated' });
        break;

      case INTENTS.TEACH_SKILL: {
        result = await handleTeachSkill(prompt, entities);
        break;
      }

      case INTENTS.RECALL_MEMORY: {
        const facts = await getAllFacts();
        result = formatMemoryReply(facts);
        break;
      }

      case INTENTS.SEARCH_JOBS: {
        const query = entities.jobQuery || '';
        const { jobs } = await searchJobsPaginated({ query, limit: 6, forceRefresh: true });
        result = {
          reply: `🔍 **Live Jobs matching "${query || 'Tech & Engineering'}"**:\n\n${formatJobsForResponse(jobs)}\n\n💡 Open [/jobs](/jobs) for full pagination, search & filters!`,
          source: 'Live Job Engine',
        };
        break;
      }

      default: {
        // Try agentic loop first (handles complex multi-step + URL scraping)
        const augmentedPrompt = urlContext
          ? `${prompt}\n\n[Additional context from URLs you shared]:\n${urlContext}`
          : prompt;

        const agentResult = await runAgentLoop(augmentedPrompt, history, learnedFacts);
        if (agentResult.usedAgent && agentResult.reply) {
          result = {
            reply: agentResult.reply,
            source: agentResult.source || 'Jarvis Agent',
            toolsUsed: agentResult.toolsUsed,
            actionExecuted: agentResult.actionExecuted,
          };
          if (agentResult.actionExecuted) {
            broadcast(WS_EVENTS.AI_ACTION, { action: agentResult.actionExecuted });
            broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'agent_action' });
          }
        } else {
          // Fallback to RAG
          const ragResult = await ragQuery(augmentedPrompt, history, learnedFacts);
          result = { reply: ragResult.reply, source: ragResult.source };
        }
        break;
      }
    }

    // 6. Persist conversation
    persistConversation(sessionId, 'user', prompt, intent).catch(() => {});
    persistConversation(sessionId, 'assistant', result.reply, intent, result.actionExecuted || null).catch(() => {});
    memoryStore.addTurn(sessionId, prompt, result.reply);

    return res.json({
      success: true,
      reply: result.reply,
      source: result.source || 'Jarvis',
      intent,
      actionExecuted: result.actionExecuted || null,
      toolsUsed: result.toolsUsed || [],
      entities,
    });

  } catch (error) {
    console.error('[Jarvis Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/ai/stream?prompt=...&sessionId=... — SSE Streaming response
 */
exports.handleAiStream = async (req, res) => {
  const { prompt, sessionId = 'default' } = req.query;
  if (!prompt) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (e) {}
  };

  try {
    autoLearnFromMessage(String(prompt), 'user').catch(() => {});
    const { intent, entities } = classify(String(prompt));
    const history = memoryStore.getContextString(String(sessionId));
    const learnedFacts = await getLearnedFactsContext();

    let fullReply = '';
    let actionExecuted = null;
    let toolsUsed = [];

    // Handle action intents directly
    const directActionMap = {
      [INTENTS.LOG_DAILY]: () => logDailyUpdate(entities, String(prompt)),
      [INTENTS.ADD_APPLICATION]: () => logApplication(entities, String(prompt)),
      [INTENTS.UPDATE_DSA]: () => updateDsaProgress(entities, String(prompt)),
      [INTENTS.UPDATE_LECTURE]: () => updateLecture(entities, String(prompt)),
    };

    if (directActionMap[intent]) {
      send({ token: '⚡ ', done: false });
      const result = await directActionMap[intent]();
      fullReply = result.reply;
      actionExecuted = result.actionExecuted;
      broadcast(WS_EVENTS.AI_ACTION, { action: actionExecuted, entities });
      broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'action_executed' });
    } else if (intent === INTENTS.SEARCH_JOBS) {
      send({ token: '🔍 Searching live job boards... ', done: false });
      const q = entities.jobQuery || '';
      const { jobs } = await searchJobsPaginated({ query: q, limit: 6, forceRefresh: true });
      fullReply = `🔍 **Live Jobs matching "${q || 'Tech & Engineering'}":**\n\n${formatJobsForResponse(jobs)}\n\n💡 Open [/jobs](/jobs) for pagination, search & filters!`;
    } else {
      // Agentic loop with streaming indicator
      send({ token: '🤔 ', done: false });

      // Check for URLs
      const urls = extractUrls(String(prompt));
      if (urls.length > 0) {
        send({ token: `🌐 Reading ${urls.length} URL(s)... `, done: false });
      }

      const agentResult = await runAgentLoop(String(prompt), history, learnedFacts);

      if (agentResult.usedAgent && agentResult.reply) {
        fullReply = agentResult.reply;
        actionExecuted = agentResult.actionExecuted;
        toolsUsed = agentResult.toolsUsed || [];
        if (actionExecuted) {
          broadcast(WS_EVENTS.AI_ACTION, { action: actionExecuted });
          broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'agent_action' });
        }
        // Show which tools were used
        if (toolsUsed.length > 0) {
          const toolNames = toolsUsed.map(t => t.tool).join(', ');
          send({ token: `\n*[Used: ${toolNames}]*\n\n`, done: false });
        }
      } else {
        // Fallback to RAG
        const r = await ragQuery(String(prompt), history, learnedFacts);
        fullReply = r.reply;
      }
    }

    // Stream word-by-word with natural delay
    const words = fullReply.split(' ');
    for (let i = 0; i < words.length; i++) {
      send({ token: words[i] + ' ', done: false });
      await new Promise(r => setTimeout(r, 18 + Math.random() * 12)); // natural variation
    }

    send({ token: '', done: true, intent, actionExecuted, toolsUsed, entities });

    memoryStore.addTurn(String(sessionId), String(prompt), fullReply);
    persistConversation(String(sessionId), 'user', String(prompt), intent).catch(() => {});
    persistConversation(String(sessionId), 'assistant', fullReply, intent, actionExecuted).catch(() => {});
    res.end();

  } catch (err) {
    send({ error: err.message, done: true });
    res.end();
  }
};

/**
 * POST /api/ai/upload — OCR a file and inject into RAG
 */
exports.handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { prompt: userPrompt = '' } = req.body;
    const { sessionId = 'default' } = req.body;

    // Run OCR on the uploaded file
    const ocrResult = await processUploadedFile(req.file.path, req.file.originalname);

    const formatEntities = (ent) => {
      if (!ent) return '';
      if (typeof ent === 'string') return ent;
      if (typeof ent === 'object') {
        const entries = Object.entries(ent).filter(([_, v]) => v);
        if (entries.length === 0) return '';
        return entries.map(([k, v]) => `• **${k}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
      }
      return String(ent);
    };

    const formattedEntities = formatEntities(ocrResult.entities);

    // If user also sent a prompt alongside the file, answer it with file context
    let aiReply = '';
    if (userPrompt.trim()) {
      const history = memoryStore.getContextString(sessionId);
      const learnedFacts = await getLearnedFactsContext();
      const augmentedPrompt = `User uploaded a file: "${req.file.originalname}"\n\nExtracted content:\n${ocrResult.text?.slice(0, 2000)}\n\nUser question: ${userPrompt}`;
      const ragResult = await ragQuery(augmentedPrompt, history, learnedFacts);
      aiReply = ragResult.reply;
    } else {
      aiReply = `✅ **File processed: ${req.file.originalname}**\n\n` +
        `**Type detected**: ${ocrResult.type || 'document'}\n\n` +
        (ocrResult.summary ? `**Summary**:\n${typeof ocrResult.summary === 'object' ? JSON.stringify(ocrResult.summary) : ocrResult.summary}\n\n` : '') +
        (formattedEntities ? `**Key info extracted**:\n${formattedEntities}\n\n` : '') +
        `📌 I've added this to my memory. You can now ask me anything about this ${ocrResult.type || 'document'}!`;
    }

    return res.json({
      success: true,
      reply: aiReply,
      fileInfo: {
        name: req.file.originalname,
        size: req.file.size,
        type: ocrResult.type,
        extractedTextLength: ocrResult.text?.length || 0,
        summary: ocrResult.summary,
        entities: ocrResult.entities,
        source: ocrResult.source,
      },
    });

  } catch (err) {
    console.error('[AI Upload Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Helper functions ──────────────────────────────────────────

async function handleTeachSkill(prompt, entities) {
  const lower = prompt.toLowerCase();
  if (/forget/i.test(lower) && entities.forgetKey) {
    await forgetFact(entities.forgetKey);
    return { reply: `🗑️ Forgotten: "${entities.forgetKey}". I'll no longer reference that.` };
  }
  if (/show|list|what do you know|my profile|my memory|my skills/i.test(lower)) {
    const facts = await getAllFacts();
    return formatMemoryReply(facts);
  }
  if (entities.teachKey && entities.teachValue) {
    await teachFact(entities.teachKey, entities.teachValue);
    return { reply: `✅ Got it! I'll remember: **${entities.teachKey}** → ${entities.teachValue}` };
  }
  const cleaned = prompt.replace(/remember|learn|note|store|save|that/gi, '').trim();
  await teachFact(`note_${Date.now()}`, cleaned);
  return { reply: `✅ Noted and saved to my memory! I'll factor this in future responses.` };
}

function formatMemoryReply(facts) {
  if (!facts || facts.length === 0) {
    return { reply: `I haven't learned anything specific yet — just start talking and I'll pick things up automatically!` };
  }
  const grouped = {};
  facts.forEach(f => { if (!grouped[f.category]) grouped[f.category] = []; grouped[f.category].push(f.value); });
  const text = Object.entries(grouped)
    .map(([cat, vals]) => `**${cat.toUpperCase()}**:\n${vals.map(v => `• ${v}`).join('\n')}`)
    .join('\n\n');
  return { reply: `📋 **Here's what I know about you:**\n\n${text}` };
}
