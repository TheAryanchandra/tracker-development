/**
 * Intent Classifier — 9-class NLP engine
 * Understands what you mean, not just what you type.
 */

const INTENTS = {
  LOG_DAILY:       'LOG_DAILY',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_DSA:      'UPDATE_DSA',
  UPDATE_LECTURE:  'UPDATE_LECTURE',
  TEACH_SKILL:     'TEACH_SKILL',
  SEARCH_JOBS:     'SEARCH_JOBS',
  RECALL_MEMORY:   'RECALL_MEMORY',
  QUERY_STATS:     'QUERY_STATS',
  GREETING:        'GREETING',
  GENERAL:         'GENERAL',
  CREATE_TASK:     'CREATE_TASK',
  LIST_TASKS:      'LIST_TASKS',
  COMPLETE_TASK:   'COMPLETE_TASK',
};

const INTENT_RULES = [
  {
    intent: INTENTS.COMPLETE_TASK,
    patterns: [/(?:complete|finish|done|mark) (?:the )?(?:task|todo|reminder)\b/i, /(?:complete|finish|mark) .+ (?:as )?(?:done|complete|finished)/i],
  },
  {
    intent: INTENTS.LIST_TASKS,
    patterns: [/(?:show|list|give|get|what are) (?:me )?(?:my )?(?:open )?(?:tasks?|todos?|to-dos?|reminders?)/i, /what do i need to do/i],
  },
  {
    intent: INTENTS.CREATE_TASK,
    patterns: [/(?:remind|remember) me to\s+(.+)/i, /(?:add|create|assign|make) (?:a )?(?:task|todo|to-do|reminder)\s*(?:to|for|:)?\s*(.+)/i, /i need to\s+(.+)/i],
  },
  // ── Job search ──────────────────────────────────────────────
  {
    intent: INTENTS.SEARCH_JOBS,
    patterns: [
      /find (me )?(jobs?|roles?|openings?|positions?|opportunities?)/i,
      /search (for )?(jobs?|openings?|roles?)/i,
      /what (jobs?|roles?|openings?|opportunities?) are (there|available|open)/i,
      /(show|get|fetch|list) (me )?(jobs?|listings?|openings?)/i,
      /any (new )?(jobs?|roles?|openings?) (on|from|at)?/i,
      /job (search|listings?|updates?|alerts?)/i,
      /hiring (now|today|this week)/i,
      /(recent|latest|new) (job|opening|role|position)s?/i,
    ],
  },
  // ── Teach / Learn skill / Remember ──────────────────────────
  {
    intent: INTENTS.TEACH_SKILL,
    patterns: [
      /^(remember|learn|note|store|save)\s+(that\s+)?/i,
      /teach you (that|about|my)/i,
      /i want you to (know|remember|learn)/i,
      /add (to )?(my|your) (memory|skills?|profile|knowledge)/i,
      /forget (that|about|my)?/i,
      /what do you know about me/i,
      /show (my |your )?(memory|profile|skills?|what you know)/i,
      /list (my |your |all )?(facts?|skills?|memory|knowledge)/i,
    ],
  },
  // ── Memory recall ───────────────────────────────────────────
  {
    intent: INTENTS.RECALL_MEMORY,
    patterns: [
      /what do you (know|remember) about me/i,
      /(show|list|tell me) (my |your )?(profile|skills?|facts?|memory|what you know)/i,
      /what (have you |did you )?learn(ed)? about me/i,
    ],
  },
  // ── Add application ─────────────────────────────────────────
  {
    intent: INTENTS.ADD_APPLICATION,
    patterns: [
      /^(add app|new application|log app)/i,
      /applied (to|at|for) [a-z]/i,
      /sent (my |a )?(resume|cv|application) to/i,
      /submitted (to|for|at)/i,
      /logged an? application/i,
    ],
  },
  // ── Update DSA ──────────────────────────────────────────────
  {
    intent: INTENTS.UPDATE_DSA,
    patterns: [
      /updated? (dsa |my )?(progress|topic|problem)/i,
      /finished (dsa|problems?|topic)/i,
      /completed? (dsa|topic|arrays?|trees?|graphs?|dp|dynamic programming|strings?|recursion|backtracking)/i,
      /mark(ed)? (.*) (as )?(done|complete|finished)/i,
      /(solved|did) \d+ (problems?|questions?)/i,
    ],
  },
  // ── Update lecture ──────────────────────────────────────────
  {
    intent: INTENTS.UPDATE_LECTURE,
    patterns: [
      /watched? (a |the |lecture|video)/i,
      /finished? (the |a )?(lecture|video)/i,
      /completed? (the |a )?(lecture|video|episode)/i,
      /mark(ed)? lecture/i,
    ],
  },
  // ── Log daily ───────────────────────────────────────────────
  {
    intent: INTENTS.LOG_DAILY,
    patterns: [
      /^(log|today|this morning|tonight|just finished)/i,
      /today i (did|solved|worked|applied|watched|studied|practiced)/i,
      /worked on (dsa|project|leetcode|arrays|graphs|trees)/i,
      /(did|completed?) (my )?(dsa|coding|project|practice)/i,
      /\d+ (app|application|job)s? (sent|applied|submitted)/i,
      /daily (update|log|check.?in)/i,
    ],
  },
  // ── Query stats ─────────────────────────────────────────────
  {
    intent: INTENTS.QUERY_STATS,
    patterns: [
      /(what|how|show|tell|give|get) (me )?(my |the )?(dsa|progress|streak|stats|applications?|status|performance|overview|summary|score|count|number|total|lecture)/i,
      /(how many|what is|what are|show) (my )?(application|interview|offer|reject|problem|topic|lecture)/i,
      /am i (doing|making) (progress|good|well)/i,
      /(current|active|ongoing) streak/i,
      /weak(est)? (topic|area|subject)/i,
      /strong(est)? (topic|area)/i,
      /pending (lecture|topic|task)/i,
      /recent (application|job|company)/i,
      /where (do|am) i (stand|at)/i,
      /jarvis (update|report|brief|status)/i,
      /give me (a |an )?(update|summary|report|overview|brief)/i,
    ],
  },
  // ── Greeting & Smalltalk ─────────────────────────────────────
  {
    intent: INTENTS.GREETING,
    patterns: [
      /^(hi|hello|hey|yo|sup|hola|namaste|good\s+(morning|afternoon|evening|night|day)|what'?s\s+up|wassup|howdy|greetings)(\s+.*)?$/i,
      /^(how\s+are\s+you|how'?s\s+it\s+going|how\s+do\s+you\s+do|who\s+are\s+you|what\s+can\s+you\s+do|tell\s+me\s+about\s+yourself)/i,
    ],
  },
];

function classify(prompt) {
  const text = prompt.trim();
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return { intent: rule.intent, confidence: 0.9, entities: extractEntities(text) };
      }
    }
  }
  return { intent: INTENTS.GENERAL, confidence: 0.5, entities: extractEntities(text) };
}

function extractEntities(text) {
  const entities = {};

  const taskMatch = text.match(/(?:remind me to|add (?:a )?task (?:to|for)?|create (?:a )?task (?:to|for)?|assign (?:a )?task (?:to|for)?|i need to)\s+(.+)/i);
  if (taskMatch) entities.taskTitle = taskMatch[1].trim();
  const completeTaskMatch = text.match(/(?:complete|finish|done|mark)(?: the)?(?: task| todo| reminder)?\s+(.+?)(?:\s+as\s+(?:done|complete|finished))?$/i);
  if (completeTaskMatch && !entities.taskTitle && /complete|finish|done|mark/i.test(text)) entities.taskTitle = completeTaskMatch[1].trim();
  const priorityMatch = text.match(/\b(high|medium|low)\s+priority\b/i);
  if (priorityMatch) entities.priority = priorityMatch[1].toLowerCase();

  const companyMatch = text.match(/(?:applied to|at|for|company:|to)\s+([A-Z][a-zA-Z0-9\s&.]+?)(?:\s+as|\s+for|\s+on|\s*[,.]|$)/);
  if (companyMatch) entities.company = companyMatch[1].trim();

  const roleMatch = text.match(/(?:as|for role|role:|position:)\s+([A-Za-z\s]+?)(?:\s+at|\s+on|\s*[,.]|$)/);
  if (roleMatch) entities.role = roleMatch[1].trim();

  const problemsMatch = text.match(/(\d+)\s+(?:dsa\s+)?(?:problems?|questions?|leet)/i);
  if (problemsMatch) entities.problemCount = parseInt(problemsMatch[1]);

  const appsMatch = text.match(/(\d+)\s+(?:app(?:lication)?s?|jobs?)/i);
  if (appsMatch) entities.appCount = parseInt(appsMatch[1]);

  const dsaTopics = ['arrays', 'strings', 'linked list', 'trees', 'graphs', 'dp', 'dynamic programming',
    'binary search', 'sorting', 'heaps', 'trie', 'stack', 'queue', 'recursion', 'backtracking',
    'greedy', 'bit manipulation', 'sliding window', 'two pointer'];
  for (const topic of dsaTopics) {
    if (text.toLowerCase().includes(topic)) { entities.dsaTopic = topic; break; }
  }

  const platforms = ['linkedin', 'naukri', 'instahyre', 'angellist', 'referral', 'company website', 'internshala', 'wellfound'];
  for (const p of platforms) {
    if (text.toLowerCase().includes(p)) { entities.platform = p; break; }
  }

  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateMatch) entities.date = dateMatch[1];

  // Extract teaching key/value for TEACH_SKILL
  const teachMatch = text.match(/(?:remember|learn|note|store|save)\s+(?:that\s+)?(?:my\s+)?([^:]+?)(?:\s+is\s+|\s*:\s*)(.+)/i);
  if (teachMatch) { entities.teachKey = teachMatch[1].trim(); entities.teachValue = teachMatch[2].trim(); }

  // Extract job search query
  const jobQueryMatch = text.match(/(?:find|search|show|get)\s+(?:me\s+)?(?:jobs?|roles?)\s+(?:for|in|at|as)?\s+(.+)/i);
  if (jobQueryMatch) entities.jobQuery = jobQueryMatch[1].trim();

  // Forget intent
  if (/forget/i.test(text)) {
    const forgetMatch = text.match(/forget\s+(?:about\s+|that\s+)?(.+)/i);
    if (forgetMatch) entities.forgetKey = forgetMatch[1].trim();
  }

  return entities;
}

module.exports = { classify, INTENTS };
