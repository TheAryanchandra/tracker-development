const mongoose = require('mongoose');

/**
 * JarvisMemory — Persistent long-term memory for Jarvis.
 * Stores: user facts, skills, preferences, goals, learned knowledge, conversations.
 */

// Long-term facts Jarvis learns about Aryan
const learnedFactSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['skill', 'goal', 'preference', 'personal', 'achievement', 'context', 'custom'],
    default: 'context',
  },
  key: { type: String, required: true },   // e.g. "preferred_role"
  value: { type: String, required: true }, // e.g. "Full Stack Engineer"
  source: { type: String, default: 'conversation' }, // how Jarvis learned this
  confidence: { type: Number, default: 1.0 }, // 0-1
  learnedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
learnedFactSchema.index({ category: 1 });
learnedFactSchema.index({ key: 1 }, { unique: true });

// Full conversation history persisted in MongoDB
const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  intent: { type: String },
  actionExecuted: { type: String },
  createdAt: { type: Date, default: Date.now },
});
conversationSchema.index({ sessionId: 1, createdAt: -1 });

const LearnedFact = mongoose.model('LearnedFact', learnedFactSchema);
const ConversationLog = mongoose.model('ConversationLog', conversationSchema);

module.exports = { LearnedFact, ConversationLog };
