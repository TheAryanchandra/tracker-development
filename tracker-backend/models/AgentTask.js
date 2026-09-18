/**
 * AgentTask Mongoose Schema
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists every multi-step agent run to MongoDB `agent_tasks` collection.
 * Enables stateful execution, failure recovery, and observability across
 * server restarts.
 */

const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  toolName: { type: String, default: null },
  toolArgs: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
    default: 'pending',
  },
  result: { type: String, default: null },
  error: { type: String, default: null },
  retryCount: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  durationMs: { type: Number, default: 0 },
}, { _id: false });

const ObservationSchema = new mongoose.Schema({
  stepName: String,
  observation: String,
  verdict: { type: String, enum: ['success', 'partial', 'failure'], default: 'success' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const AgentTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true, index: true },
  sessionId: { type: String, required: true, index: true },
  goal: { type: String, required: true },
  status: {
    type: String,
    enum: ['planning', 'running', 'completed', 'failed', 'cancelled'],
    default: 'planning',
  },
  plan: { type: String, default: null },        // LLM-generated plan text
  steps: { type: [StepSchema], default: [] },
  observations: { type: [ObservationSchema], default: [] },
  finalReply: { type: String, default: null },
  toolsInvoked: { type: [String], default: [] },
  totalSteps: { type: Number, default: 0 },
  completedSteps: { type: Number, default: 0 },
  context: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('AgentTask', AgentTaskSchema);
