/**
 * Agent Orchestrator — ReAct-style Agentic AI Loop
 * ─────────────────────────────────────────────────────────────
 * Jarvis can now: Think → Act (use tools) → Observe → Respond
 * Multi-step reasoning, live internet web search, web scraping, DB mutations, RAG — all chained.
 *
 * Tools available to the agent:
 *  - search_web: Live DuckDuckGo search across the entire internet for any query
 *  - scrape_url: Scrape specific URLs (LinkedIn, LeetCode, GitHub, blogs, docs)
 *  - search_jobs: Find tech job openings from RemoteOK, Remotive, Arbeitnow
 *  - query_database: Search Aryan's live MongoDB tracker data via RAG
 *  - log_daily_activity: Log today's DSA, project, apps, learning
 *  - log_application: Add new job application to pipeline
 *  - get_memory: Recall personal profile, preferences, and facts
 */

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {}

// Keep the module namespace so deployments with a cached/older export cannot
// turn a web-search request into an unhandled ReferenceError.
const webScraper = require('./webScraper');
const { formatSearchResults, scrapeUrl, formatScrapeResult, extractUrls } = webScraper;
const { searchJobsPaginated, formatJobsForResponse } = require('./jobSearcher');
const { logDailyUpdate, logApplication, updateDsaProgress, updateLecture } = require('./actionExecutor');
const { getLearnedFactsContext, getAllFacts } = require('./longTermMemory');
const { loadAndBuild } = require('./documentLoader');
const vectorStore = require('./vectorStore');

// ── Tool Declarations for Gemini Function Calling ────────────
const TOOLS = [
  {
    name: 'search_web',
    description: 'Search the live public internet using Google/DuckDuckGo for any general topic, company news, DSA explanation, tech stack comparison, or documentation. Use when user asks anything outside the personal database.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query to look up on the web' },
      },
      required: ['query'],
    },
  },
  {
    name: 'scrape_url',
    description: 'Scrape a webpage URL to extract its live content. Use when user shares a link or asks to read a specific URL (job link, leetcode, docs).',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The full URL to scrape' },
      },
      required: ['url'],
    },
  },
  {
    name: 'query_database',
    description: 'Query Aryan\'s MongoDB tracker database: DSA progress, daily logs, job applications, lectures, streak info, weak/strong topics.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language query about the tracker data' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_jobs',
    description: 'Search for live tech job listings from RemoteOK, Remotive, Arbeitnow.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Job role or keyword, e.g. "React developer", "backend engineer"' },
        limit: { type: 'number', description: 'Max number of jobs to return (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'log_daily_activity',
    description: 'Log today\'s daily tracker entry: DSA done, applications sent, project work, AI learning.',
    parameters: {
      type: 'object',
      properties: {
        dsaDone: { type: 'boolean', description: 'Did DSA practice today?' },
        dsaTopic: { type: 'string', description: 'DSA topic worked on' },
        applicationsSent: { type: 'number', description: 'Number of job applications sent' },
        projectWork: { type: 'boolean', description: 'Did project work today?' },
        notes: { type: 'string', description: 'Any additional notes' },
      },
    },
  },
  {
    name: 'log_application',
    description: 'Add a job application to the tracker pipeline.',
    parameters: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Company name' },
        role: { type: 'string', description: 'Job role/position' },
        platform: { type: 'string', description: 'Platform used (LinkedIn, Naukri, etc.)' },
      },
      required: ['company'],
    },
  },
  {
    name: 'get_memory',
    description: 'Recall all learned facts and personal profile details about Aryan from long-term memory.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Execute tool calls from agent
 */
async function executeTool(toolName, toolArgs) {
  console.log(`[Agent] Executing tool: ${toolName}`, JSON.stringify(toolArgs).slice(0, 120));

  switch (toolName) {
    case 'search_web': {
      if (typeof webScraper.searchWeb !== 'function') {
        return 'Live web search is temporarily unavailable. I can still search your tracker database and memory.';
      }
      const results = await webScraper.searchWeb(toolArgs.query || '', 5);
      return formatSearchResults(toolArgs.query || '', results);
    }

    case 'scrape_url': {
      const result = await scrapeUrl(toolArgs.url);
      return formatScrapeResult(result);
    }

    case 'query_database': {
      await loadAndBuild();
      const chunks = vectorStore.search(toolArgs.query || '', 8);
      if (chunks.length === 0) return 'No relevant data found in your tracker database.';
      return chunks.map(c => c.text).join('\n\n');
    }

    case 'search_jobs': {
      const { jobs } = await searchJobsPaginated({
        query: toolArgs.query || 'software engineer',
        limit: toolArgs.limit || 5,
        forceRefresh: false,
      });
      return formatJobsForResponse(jobs);
    }

    case 'log_daily_activity': {
      const entities = {
        dsaTopic: toolArgs.dsaTopic,
        appCount: toolArgs.applicationsSent || 0,
      };
      const rawPrompt = `DSA: ${toolArgs.dsaDone ? 'yes' : 'no'}, Topic: ${toolArgs.dsaTopic || 'none'}, Apps: ${toolArgs.applicationsSent || 0}, Project: ${toolArgs.projectWork ? 'yes' : 'no'}`;
      const result = await logDailyUpdate(entities, rawPrompt);
      return result.reply;
    }

    case 'log_application': {
      const entities = {
        company: toolArgs.company,
        role: toolArgs.role || 'Software Engineer',
        platform: toolArgs.platform || 'LinkedIn',
      };
      const result = await logApplication(entities, `Applied to ${toolArgs.company}`);
      return result.reply;
    }

    case 'get_memory': {
      const facts = await getAllFacts();
      if (!facts.length) return 'No learned facts yet.';
      return facts.map(f => `${f.category}: ${f.value}`).join('\n');
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

/**
 * Build humanoid personality prompt
 */
function buildAgentSystemPrompt(learnedFacts, conversationHistory) {
  return `You are Jarvis — Aryan's ultra-smart, humanoid, agentic AI life and career copilot. You behave like a world-class mentor and close engineer friend (similar to Claude 3.5 Sonnet in nuance, intelligence, and empathy).

## Personality & Conversational Style:
- Speak continuously and naturally like a human peer, never robotic or brief unless asked.
- You can talk about ANYTHING: coding, DSA, system design, life advice, interview prep, current affairs, tech news, web research.
- Always maintain full context across turns. If Aryan continues a thought, follow up seamlessly.
- Use humor, motivation, and sharp engineering intuition. Seamlessly handle English and Hinglish.
- If asked about live internet events or anything you don't know, use the "search_web" tool immediately.
- If asked about streak, applications, or DSA progress, query the live database with "query_database".
- If user mentions performing an action ("I solved 2 DP problems today"), automatically log it using the right tool.

## What You Know About Aryan:
${learnedFacts || 'Aryan Chandra — Software Engineering student working on DSA mastery and tier-1 tech job search.'}

## Recent Conversation History:
${conversationHistory || 'Fresh session.'}`;
}

/**
 * Main agent loop
 */
async function runAgentLoop(userMessage, conversationHistory = '', learnedFacts = '', maxSteps = 5) {
  if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
    return { reply: null, toolsUsed: [], usedAgent: false };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.75,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      tools: [{ functionDeclarations: TOOLS }],
    });

    const systemPrompt = buildAgentSystemPrompt(learnedFacts, conversationHistory);

    const urls = extractUrls(userMessage);
    let augmentedMessage = userMessage;
    if (urls.length > 0) {
      augmentedMessage = `${userMessage}\n\n[URLs in message: ${urls.join(', ')}]`;
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'System instruction: act as Jarvis.' }] },
        { role: 'model', parts: [{ text: systemPrompt }] },
      ],
    });

    const toolsUsed = [];
    let actionExecuted = null;
    let steps = 0;

    let response = await chat.sendMessage(augmentedMessage);
    let candidate = response.response;

    while (steps < maxSteps) {
      steps++;
      const functionCalls = candidate.functionCalls?.() || [];

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const toolResults = await Promise.all(
        functionCalls.map(async (call) => {
          const toolResult = await executeTool(call.name, call.args);
          toolsUsed.push({ tool: call.name, args: call.args });

          if (['log_daily_activity', 'log_application'].includes(call.name)) {
            actionExecuted = call.name.toUpperCase();
          }

          return {
            functionResponse: {
              name: call.name,
              response: { result: toolResult },
            },
          };
        })
      );

      response = await chat.sendMessage(toolResults);
      candidate = response.response;
    }

    const finalText = candidate.text?.();
    if (!finalText) return { reply: null, toolsUsed, usedAgent: true };

    return {
      reply: finalText,
      toolsUsed,
      actionExecuted,
      usedAgent: true,
      source: 'Jarvis Agentic Copilot',
    };

  } catch (err) {
    console.warn('[Agent] Agent loop error:', err.message);
    return { reply: null, toolsUsed: [], usedAgent: false, error: err.message };
  }
}

module.exports = { runAgentLoop, TOOLS };
