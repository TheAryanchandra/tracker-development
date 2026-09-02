/**
 * Long-Term Memory Engine
 * ─────────────────────────────────────────────────────────────
 * Self-training system: Jarvis learns from every conversation.
 * Zero cost — everything stored in your own MongoDB.
 *
 * What it does:
 * 1. Extracts facts about Aryan from natural conversation
 * 2. Persists them in MongoDB as learned knowledge
 * 3. Accepts explicit "teach me" commands
 * 4. Persists full conversation history (cross-session memory)
 * 5. Rebuilds RAG context with accumulated personal knowledge
 */

const { LearnedFact, ConversationLog } = require('../models/JarvisMemory');
const vectorStore = require('./vectorStore');

// ─── Fact Extraction Patterns ────────────────────────────────
// Extracts personal facts from natural conversation
const FACT_PATTERNS = [
  // Skills
  { regex: /i (know|use|work with|code in|build with|have (experience|expertise) (in|with))\s+([a-zA-Z,\s&.+#]+)/i, category: 'skill', keyFn: m => 'skill_' + m[4]?.trim().split(/[\s,]+/)[0].toLowerCase(), valueFn: m => m[4]?.trim() },
  // Goals
  { regex: /i (want to|am trying to|planning to|aim to|hope to)\s+(.+?)(?:\.|$)/i, category: 'goal', keyFn: (_, i) => `goal_${Date.now() + i}`, valueFn: m => m[2]?.trim() },
  // Target companies
  { regex: /i want to (work at|join|get into|land at)\s+([a-zA-Z\s]+?)(?:\.|,|$)/i, category: 'goal', keyFn: m => 'target_company_' + m[2]?.trim().toLowerCase().replace(/\s+/g, '_'), valueFn: m => 'Target company: ' + m[2]?.trim() },
  // Role preferences
  { regex: /i (prefer|want|looking for|interested in)\s+(backend|frontend|fullstack|full.stack|data|ml|ai|devops|mobile|ios|android|sde|software)\s*(engineer|developer|role|job|position)?/i, category: 'preference', keyFn: m => 'preferred_role', valueFn: m => m[2]?.trim() + (m[3] ? ' ' + m[3] : '') },
  // Degree / college
  { regex: /i (study|studied|am studying|am from|go to|attend(ing)?)\s+([a-zA-Z\s]+?(university|college|institute|iit|nit|bits))/i, category: 'personal', keyFn: () => 'college', valueFn: m => m[3]?.trim() },
  // Batch
  { regex: /(?:batch|graduating|graduate|pass out|passout)(?:\s+of)?\s+(20\d{2})/i, category: 'personal', keyFn: () => 'batch', valueFn: m => m[1] },
  // Location
  { regex: /i(?:'m| am) (?:from|in|based in|located in)\s+([a-zA-Z\s]+?)(?:\.|,|$)/i, category: 'personal', keyFn: () => 'location', valueFn: m => m[1]?.trim() },
  // Custom teach command: "Remember that I..." or "Learn that..."
  { regex: /(?:remember|learn|note|store)\s+(?:that\s+)?(.+)/i, category: 'custom', keyFn: (_, i) => `custom_${Date.now() + i}`, valueFn: m => m[1]?.trim() },
];

/**
 * Auto-extract facts from any message and upsert them into MongoDB
 */
async function autoLearnFromMessage(message, role = 'user') {
  if (role !== 'user') return []; // only learn from what Aryan says
  const learnedKeys = [];

  for (let i = 0; i < FACT_PATTERNS.length; i++) {
    const { regex, category, keyFn, valueFn } = FACT_PATTERNS[i];
    const match = message.match(regex);
    if (match) {
      try {
        const key = keyFn(match, i);
        const value = valueFn(match, i);
        if (!key || !value || value.length < 2) continue;

        await LearnedFact.findOneAndUpdate(
          { key },
          { category, key, value: value.slice(0, 500), source: 'auto-extract', updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        learnedKeys.push({ key, value, category });
      } catch (e) { /* skip dupe key errors */ }
    }
  }

  if (learnedKeys.length > 0) {
    // Invalidate vector store so new facts are indexed next query
    vectorStore.lastBuilt = null;
  }

  return learnedKeys;
}

/**
 * Explicit skill/fact teaching: "Jarvis, learn that I love system design"
 */
async function teachFact(key, value, category = 'custom') {
  await LearnedFact.findOneAndUpdate(
    { key: key.toLowerCase().replace(/\s+/g, '_') },
    { category, key: key.toLowerCase().replace(/\s+/g, '_'), value, source: 'user-taught', updatedAt: new Date() },
    { upsert: true, returnDocument: 'after' }
  );
  vectorStore.lastBuilt = null;
}

/**
 * Persist a conversation turn to MongoDB (cross-session memory)
 */
async function persistConversation(sessionId, role, content, intent = null, actionExecuted = null) {
  try {
    await ConversationLog.create({ sessionId, role, content: content.slice(0, 2000), intent, actionExecuted });
  } catch (e) { /* non-fatal */ }
}

const memoryCache = require('../services/cacheService');

/**
 * Load recent conversation history from MongoDB for a session
 */
async function loadSessionHistory(sessionId, limit = 12) {
  try {
    const logs = await ConversationLog.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return logs.reverse();
  } catch (e) {
    return memoryCache.get(`chat_${sessionId}`) || [];
  }
}

/**
 * Load ALL learned facts as a formatted string for the LLM system prompt
 */
async function getLearnedFactsContext() {
  try {
    const facts = await LearnedFact.find().sort({ updatedAt: -1 }).maxTimeMS(2500).lean();
    if (facts.length === 0) return memoryCache.get('learned_facts_str') || '';

    const grouped = {};
    facts.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f.value);
    });

    const lines = [];
    if (grouped.personal)    lines.push(`Personal: ${grouped.personal.join('; ')}`);
    if (grouped.skill)       lines.push(`Skills: ${grouped.skill.join('; ')}`);
    if (grouped.goal)        lines.push(`Goals: ${grouped.goal.join('; ')}`);
    if (grouped.preference)  lines.push(`Preferences: ${grouped.preference.join('; ')}`);
    if (grouped.achievement) lines.push(`Achievements: ${grouped.achievement.join('; ')}`);
    if (grouped.custom)      lines.push(`Learned notes: ${grouped.custom.join('; ')}`);
    if (grouped.context)     lines.push(`Context: ${grouped.context.join('; ')}`);

    const result = lines.join('\n');
    memoryCache.set('learned_facts_str', result, 3600);
    return result;
  } catch (err) {
    return memoryCache.get('learned_facts_str') || 'Aryan Chandra — Software Engineering student working on DSA mastery and tech job search.';
  }
}

/**
 * Build long-term memory document chunks for vector store inclusion
 */
async function getMemoryChunks() {
  try {
    const facts = await LearnedFact.find().maxTimeMS(2500).lean();
    if (facts.length === 0) return [];

    return facts.map(f => ({
      id: `memory-${f._id}`,
      text: `Jarvis learned about Aryan — ${f.category}: ${f.value}`,
      metadata: { type: 'long_term_memory', category: f.category, key: f.key },
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Get all facts (for listing to user)
 */
async function getAllFacts() {
  try {
    const facts = await LearnedFact.find().sort({ category: 1, updatedAt: -1 }).maxTimeMS(2500).lean();
    memoryCache.set('all_facts', facts, 3600);
    return facts;
  } catch (e) {
    return memoryCache.get('all_facts') || [];
  }
}

/**
 * Delete a learned fact by key
 */
async function forgetFact(key) {
  try {
    return await LearnedFact.deleteOne({ key });
  } catch (e) {
    return null;
  }
}

module.exports = {
  autoLearnFromMessage,
  teachFact,
  persistConversation,
  loadSessionHistory,
  getLearnedFactsContext,
  getMemoryChunks,
  getAllFacts,
  forgetFact,
};
