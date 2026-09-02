/**
 * Jarvis AI Controller
 * Full pipeline: Intent → Action / RAG → Long-term Memory → Persist
 */

const { classify, INTENTS } = require('../ai/intentClassifier');
const { ragQuery } = require('../ai/ragEngine');
const memoryStore = require('../ai/memoryStore');
const { logDailyUpdate, logApplication, updateDsaProgress, updateLecture } = require('../ai/actionExecutor');
const {
  autoLearnFromMessage, teachFact, persistConversation,
  getLearnedFactsContext, getAllFacts, forgetFact,
} = require('../ai/longTermMemory');
const { searchJobsPaginated, formatJobsForResponse } = require('../ai/jobSearcher');

exports.handleAiChat = async (req, res) => {
  try {
    const { prompt, sessionId = 'default' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // 1. Auto-learn from every message silently
    autoLearnFromMessage(prompt, 'user').catch(() => {});

    // 2. Classify intent
    const { intent, entities } = classify(prompt);
    let result = null;

    // 3. Route to correct handler
    switch (intent) {
      case INTENTS.LOG_DAILY:
        result = await logDailyUpdate(entities, prompt);
        break;

      case INTENTS.ADD_APPLICATION:
        result = await logApplication(entities, prompt);
        break;

      case INTENTS.UPDATE_DSA:
        result = await updateDsaProgress(entities, prompt);
        break;

      case INTENTS.UPDATE_LECTURE:
        result = await updateLecture(entities, prompt);
        break;

      case INTENTS.TEACH_SKILL: {
        const lower = prompt.toLowerCase();
        if (/forget/i.test(lower) && entities.forgetKey) {
          await forgetFact(entities.forgetKey);
          result = { reply: `🗑️ Forgotten: "${entities.forgetKey}". I'll no longer remember that.` };
        } else if (/show|list|what do you know|my profile|my memory|my skills/i.test(lower)) {
          const facts = await getAllFacts();
          if (facts.length === 0) {
            result = { reply: `I don't have any learned facts yet. Just talk to me and I'll learn automatically!` };
          } else {
            const grouped = {};
            facts.forEach(f => {
              if (!grouped[f.category]) grouped[f.category] = [];
              grouped[f.category].push(f.value);
            });
            const text = Object.entries(grouped)
              .map(([cat, vals]) => `**${cat.toUpperCase()}**:\n${vals.map(v => `• ${v}`).join('\n')}`)
              .join('\n\n');
            result = { reply: `📋 **Here's what I know about you:**\n\n${text}` };
          }
        } else if (entities.teachKey && entities.teachValue) {
          await teachFact(entities.teachKey, entities.teachValue);
          result = { reply: `✅ Got it! I'll remember: **${entities.teachKey}** → ${entities.teachValue}` };
        } else {
          const cleaned = prompt.replace(/remember|learn|note|store|save|that/gi, '').trim();
          await teachFact(`note_${Date.now()}`, cleaned);
          result = { reply: `✅ Noted and saved to my memory! I'll factor this in future responses.` };
        }
        break;
      }

      case INTENTS.RECALL_MEMORY: {
        const facts = await getAllFacts();
        if (facts.length === 0) {
          result = { reply: `I haven't learned anything specific yet — just start talking and I'll pick up on things automatically!` };
        } else {
          const grouped = {};
          facts.forEach(f => { if (!grouped[f.category]) grouped[f.category] = []; grouped[f.category].push(f.value); });
          const text = Object.entries(grouped)
            .map(([cat, vals]) => `**${cat}**: ${vals.join('; ')}`)
            .join('\n');
          result = { reply: `Here's my memory of you, Aryan:\n\n${text}` };
        }
        break;
      }

      case INTENTS.SEARCH_JOBS: {
        const query = entities.jobQuery || '';
        const { jobs } = await searchJobsPaginated({ query, limit: 5, forceRefresh: true });
        const jobText = formatJobsForResponse(jobs);
        result = {
          reply: `🔍 **Live Jobs matching "${query || 'Tech & Engineering'}"**:\n\n${jobText}\n\n💡 Open [/jobs](/jobs) for full pagination, search & filters!`,
          source: 'Live Job Engine',
        };
        break;
      }

      case INTENTS.GREETING:
      case INTENTS.QUERY_STATS:
      case INTENTS.GENERAL:
      default: {
        const history = memoryStore.getContextString(sessionId);
        const learnedFacts = await getLearnedFactsContext();
        const ragResult = await ragQuery(prompt, history, learnedFacts);
        result = { reply: ragResult.reply, source: ragResult.source };
        break;
      }
    }

    // 4. Persist to MongoDB + in-process memory
    persistConversation(sessionId, 'user', prompt, intent).catch(() => {});
    persistConversation(sessionId, 'assistant', result.reply, intent, result.actionExecuted || null).catch(() => {});
    memoryStore.addTurn(sessionId, prompt, result.reply);

    return res.json({
      success: true,
      reply: result.reply,
      source: result.source || 'Jarvis',
      intent,
      actionExecuted: result.actionExecuted || null,
      entities,
    });

  } catch (error) {
    console.error('[Jarvis Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SSE Streaming — GET /api/ai/stream?prompt=...&sessionId=...
 */
exports.handleAiStream = async (req, res) => {
  const { prompt, sessionId = 'default' } = req.query;
  if (!prompt) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    autoLearnFromMessage(String(prompt), 'user').catch(() => {});
    const { intent, entities } = classify(String(prompt));
    let fullReply = '';

    // Action intents — execute then stream result
    const actionIntents = [INTENTS.LOG_DAILY, INTENTS.ADD_APPLICATION, INTENTS.UPDATE_DSA, INTENTS.UPDATE_LECTURE];
    if (actionIntents.includes(intent)) {
      let result;
      if (intent === INTENTS.LOG_DAILY)        result = await logDailyUpdate(entities, String(prompt));
      else if (intent === INTENTS.ADD_APPLICATION) result = await logApplication(entities, String(prompt));
      else if (intent === INTENTS.UPDATE_DSA)  result = await updateDsaProgress(entities, String(prompt));
      else                                     result = await updateLecture(entities, String(prompt));

      fullReply = result.reply;
      for (const word of fullReply.split(' ')) {
        send({ token: word + ' ', done: false });
        await new Promise(r => setTimeout(r, 22));
      }
      send({ token: '', done: true, intent, actionExecuted: result.actionExecuted || null, entities });
      persistConversation(String(sessionId), 'user', String(prompt), intent).catch(() => {});
      persistConversation(String(sessionId), 'assistant', fullReply, intent, result.actionExecuted || null).catch(() => {});
      return res.end();
    }

    // Job search
    if (intent === INTENTS.SEARCH_JOBS) {
      const q = entities.jobQuery || '';
      const { jobs } = await searchJobsPaginated({ query: q, limit: 5, forceRefresh: true });
      fullReply = `🔍 **Live Jobs matching "${q || 'Tech & Engineering'}":**\n\n${formatJobsForResponse(jobs)}\n\n💡 Open [/jobs](/jobs) for pagination, search & filters!`;
    } else {
      const history = memoryStore.getContextString(String(sessionId));
      const learnedFacts = await getLearnedFactsContext();
      const r = await ragQuery(String(prompt), history, learnedFacts);
      fullReply = r.reply;
    }

    // Stream word by word
    for (const word of fullReply.split(' ')) {
      send({ token: word + ' ', done: false });
      await new Promise(r => setTimeout(r, 28));
    }
    send({ token: '', done: true, intent, entities });

    memoryStore.addTurn(String(sessionId), String(prompt), fullReply);
    persistConversation(String(sessionId), 'user', String(prompt), intent).catch(() => {});
    persistConversation(String(sessionId), 'assistant', fullReply, intent).catch(() => {});
    res.end();

  } catch (err) {
    send({ error: err.message, done: true });
    res.end();
  }
};
