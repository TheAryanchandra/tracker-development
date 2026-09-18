/**
 * Default Tools Initializer for Jarvis ToolRegistry
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers web search, job search, database query, task management,
 * daily logs, and memory tools into ToolRegistry.
 */

const toolRegistry = require('./ToolRegistry');
const webScraper = require('./webScraper');
const { searchJobsPaginated, formatJobsForResponse } = require('./jobSearcher');
const { logDailyUpdate, logApplication, updateDsaProgress, updateLecture, createTask, listTasks, completeTask } = require('./actionExecutor');
const { getAllFacts } = require('./longTermMemory');
const { loadAndBuild } = require('./documentLoader');
const vectorStore = require('./vectorStore');
const { registerBrowserTools } = require('./browserTools');
const { registerIotTools } = require('./iotTools');

function initializeDefaultTools() {
  // Register IoT Tools
  registerIotTools();
  // 1. Web Search
  toolRegistry.register({
    name: 'search_web',
    description: 'Search the live public internet for current tech news, DSA solutions, documentation, company info, current events.',
    category: 'web',
    isMutating: false,
    timeoutMs: 12000,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query string' },
      },
      required: ['query'],
    },
    handler: async (args) => {
      if (typeof webScraper.searchWeb !== 'function') {
        return 'Live web search is temporarily unavailable.';
      }
      const results = await webScraper.searchWeb(args.query || '', 5);
      return webScraper.formatSearchResults(args.query || '', results);
    },
  });

  // 2. Query Database (RAG)
  toolRegistry.register({
    name: 'query_database',
    description: "Query Aryan's MongoDB tracker database: DSA progress, daily logs, job applications, lectures, streak info, tasks.",
    category: 'database',
    isMutating: false,
    timeoutMs: 10000,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language query about Aryan\'s tracker data' },
      },
      required: ['query'],
    },
    handler: async (args) => {
      await loadAndBuild();
      const chunks = await vectorStore.searchAtlasOrTfidf(args.query || '', 8);
      if (!chunks || chunks.length === 0) return 'No relevant data found in your tracker database.';
      return chunks.map(c => c.text).join('\n\n');
    },
  });

  // 3. Search Jobs
  toolRegistry.register({
    name: 'search_jobs',
    description: 'Search live tech job listings from RemoteOK, Remotive, Arbeitnow.',
    category: 'career',
    isMutating: false,
    timeoutMs: 12000,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Job role or tech stack (e.g., "React developer", "Backend engineer")' },
        limit: { type: 'number', description: 'Max number of jobs to return (default 5)' },
      },
      required: ['query'],
    },
    handler: async (args) => {
      const { jobs } = await searchJobsPaginated({
        query: args.query || 'software engineer',
        limit: args.limit || 5,
        forceRefresh: false,
      });
      return formatJobsForResponse(jobs);
    },
  });

  // 4. Log Daily Activity
  toolRegistry.register({
    name: 'log_daily_activity',
    description: "Log today's daily activity: DSA status, job applications count, project work, notes.",
    category: 'tracker',
    isMutating: true,
    timeoutMs: 8000,
    parameters: {
      type: 'object',
      properties: {
        dsaDone: { type: 'boolean', description: 'Did DSA practice today?' },
        dsaTopic: { type: 'string', description: 'DSA topic worked on' },
        applicationsSent: { type: 'number', description: 'Number of job applications sent' },
        projectWork: { type: 'boolean', description: 'Did project work today?' },
        notes: { type: 'string', description: 'Additional notes' },
      },
    },
    handler: async (args) => {
      const entities = { dsaTopic: args.dsaTopic, appCount: args.applicationsSent || 0 };
      const rawPrompt = `DSA: ${args.dsaDone ? 'yes' : 'no'}, Topic: ${args.dsaTopic || 'none'}, Apps: ${args.applicationsSent || 0}, Project: ${args.projectWork ? 'yes' : 'no'}`;
      const result = await logDailyUpdate(entities, rawPrompt);
      return result.reply;
    },
  });

  // 5. Log Application
  toolRegistry.register({
    name: 'log_application',
    description: 'Add a new job application to the tracker pipeline.',
    category: 'tracker',
    isMutating: true,
    timeoutMs: 8000,
    parameters: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Company name' },
        role: { type: 'string', description: 'Job role/position' },
        platform: { type: 'string', description: 'Platform used (LinkedIn, Naukri, etc.)' },
      },
      required: ['company'],
    },
    handler: async (args) => {
      const result = await logApplication({
        company: args.company,
        role: args.role || 'Software Engineer',
        platform: args.platform || 'LinkedIn',
      }, `Applied to ${args.company}`);
      return result.reply;
    },
  });

  // 6. Memory Facts
  toolRegistry.register({
    name: 'get_memory',
    description: 'Recall all learned facts and personal profile details from long-term memory.',
    category: 'memory',
    isMutating: false,
    timeoutMs: 5000,
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      const facts = await getAllFacts();
      if (!facts.length) return 'No learned facts yet.';
      return facts.map(f => `${f.category}: ${f.value}`).join('\n');
    },
  });

  // 7. Tasks
  toolRegistry.register({
    name: 'create_task',
    description: 'Persist a task or reminder for Aryan.',
    category: 'tracker',
    isMutating: true,
    timeoutMs: 5000,
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', description: 'low, medium, or high' },
        dueAt: { type: 'string', description: 'ISO date string' },
      },
      required: ['title'],
    },
    handler: async (args) => {
      const result = await createTask({ taskTitle: args.title, priority: args.priority, date: args.dueAt }, args.title);
      return result.reply;
    },
  });

  toolRegistry.register({
    name: 'list_tasks',
    description: "List Aryan's currently open tasks and reminders.",
    category: 'tracker',
    isMutating: false,
    timeoutMs: 5000,
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      const result = await listTasks();
      return result.reply;
    },
  });

  toolRegistry.register({
    name: 'complete_task',
    description: "Mark one of Aryan's open tasks complete.",
    category: 'tracker',
    isMutating: true,
    timeoutMs: 5000,
    parameters: {
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
    },
    handler: async (args) => {
      const result = await completeTask({ taskTitle: args.title }, args.title);
      return result.reply;
    },
  });

  // Register browser automation tools
  registerBrowserTools();

  console.log('[DefaultTools] All Jarvis core tools initialized in ToolRegistry');
}

module.exports = { initializeDefaultTools };
