/**
 * TaskStateEngine — MongoDB-Backed Stateful Agent Task Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the full lifecycle of multi-step agent tasks:
 *  - Create task with goal & initial plan
 *  - Track step execution status (pending → running → completed/failed)
 *  - Record observations after each tool call
 *  - Retry failed steps (up to maxRetries)
 *  - Persist state across server restarts
 *  - Surface state for Admin panel observability
 */

const AgentTask = require('../models/AgentTask');
const { broadcast } = require('../services/websocketService');

const MAX_STEP_RETRIES = 2;

class TaskStateEngine {

  /**
   * Generate a unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Create a new agent task in MongoDB
   */
  async createTask({ sessionId, goal, steps = [], plan = null }) {
    const taskId = this.generateTaskId();
    const doc = await AgentTask.create({
      taskId,
      sessionId,
      goal,
      plan,
      status: 'planning',
      steps: steps.map((s, i) => ({
        name: typeof s === 'string' ? s : s.name,
        toolName: s.toolName || null,
        toolArgs: s.toolArgs || {},
        status: 'pending',
      })),
      totalSteps: steps.length,
      completedSteps: 0,
    });

    console.log(`[TaskStateEngine] Created task ${taskId}: "${goal.slice(0, 60)}"`);
    this._broadcast(doc);
    return doc;
  }

  /**
   * Get task by taskId
   */
  async getTask(taskId) {
    return AgentTask.findOne({ taskId });
  }

  /**
   * Get the latest active task for a session
   */
  async getLatestTask(sessionId) {
    return AgentTask.findOne({ sessionId, status: { $in: ['planning', 'running'] } })
      .sort({ createdAt: -1 });
  }

  /**
   * Get recent tasks for a session (for observability)
   */
  async getRecentTasks(sessionId, limit = 10) {
    return AgentTask.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v');
  }

  /**
   * Set task status to running and update plan text
   */
  async startTask(taskId, plan = null) {
    const doc = await AgentTask.findOneAndUpdate(
      { taskId },
      { $set: { status: 'running', plan } },
      { new: true }
    );
    this._broadcast(doc);
    return doc;
  }

  /**
   * Mark a named step as 'running'
   */
  async startStep(taskId, stepName, toolName = null, toolArgs = {}) {
    const doc = await AgentTask.findOneAndUpdate(
      { taskId, 'steps.name': stepName },
      {
        $set: {
          'steps.$.status': 'running',
          'steps.$.toolName': toolName,
          'steps.$.toolArgs': toolArgs,
          'steps.$.startedAt': new Date(),
        },
      },
      { new: true }
    );
    this._broadcast(doc);
    return doc;
  }

  /**
   * Mark a step as completed with its result
   */
  async completeStep(taskId, stepName, result = '') {
    const now = new Date();
    const doc = await AgentTask.findOneAndUpdate(
      { taskId, 'steps.name': stepName },
      {
        $set: {
          'steps.$.status': 'completed',
          'steps.$.result': String(result).slice(0, 2000),
          'steps.$.completedAt': now,
        },
        $inc: { completedSteps: 1 },
      },
      { new: true }
    );
    this._broadcast(doc);
    return doc;
  }

  /**
   * Mark a step as failed with error context
   */
  async failStep(taskId, stepName, error = '') {
    const doc = await AgentTask.findOne({ taskId });
    if (!doc) return null;

    const step = doc.steps.find(s => s.name === stepName);
    if (!step) return doc;

    const retries = (step.retryCount || 0) + 1;
    const canRetry = retries <= MAX_STEP_RETRIES;

    await AgentTask.updateOne(
      { taskId, 'steps.name': stepName },
      {
        $set: {
          'steps.$.status': canRetry ? 'pending' : 'failed',
          'steps.$.error': String(error).slice(0, 500),
          'steps.$.retryCount': retries,
        },
      }
    );

    const updated = await AgentTask.findOne({ taskId });
    this._broadcast(updated);
    return { doc: updated, canRetry, retries };
  }

  /**
   * Record an observation (structured tool result analysis)
   */
  async addObservation(taskId, { stepName, observation, verdict = 'success' }) {
    const doc = await AgentTask.findOneAndUpdate(
      { taskId },
      {
        $push: {
          observations: {
            stepName,
            observation: String(observation).slice(0, 1000),
            verdict,
            at: new Date(),
          },
        },
      },
      { new: true }
    );
    return doc;
  }

  /**
   * Add a tool name to the invoked list
   */
  async recordToolInvocation(taskId, toolName) {
    await AgentTask.updateOne({ taskId }, { $addToSet: { toolsInvoked: toolName } });
  }

  /**
   * Complete the full task with the final reply
   */
  async completeTask(taskId, finalReply) {
    const doc = await AgentTask.findOneAndUpdate(
      { taskId },
      { $set: { status: 'completed', finalReply: String(finalReply).slice(0, 4000) } },
      { new: true }
    );
    console.log(`[TaskStateEngine] Task ${taskId} COMPLETED`);
    this._broadcast(doc);
    return doc;
  }

  /**
   * Fail the entire task
   */
  async failTask(taskId, error) {
    const doc = await AgentTask.findOneAndUpdate(
      { taskId },
      { $set: { status: 'failed', 'context.finalError': String(error).slice(0, 500) } },
      { new: true }
    );
    console.log(`[TaskStateEngine] Task ${taskId} FAILED:`, error);
    this._broadcast(doc);
    return doc;
  }

  /**
   * Transition task to new state (e.g. PLANNING, EXECUTING, COMPLETED, FAILED)
   */
  async transition(taskId, state, note = '') {
    if (!taskId) return null;
    const query = typeof taskId === 'string' && taskId.startsWith('task_') ? { taskId } : { _id: taskId };
    const doc = await AgentTask.findOneAndUpdate(
      query,
      { $set: { status: state.toLowerCase(), 'context.currentNote': note } },
      { new: true }
    ).catch(() => null);
    this._broadcast(doc);
    return doc;
  }

  /**
   * Record a step in the state machine (e.g., ACT, OBSERVE)
   */
  async recordStep(taskId, stepData = {}) {
    if (!taskId) return null;
    const query = typeof taskId === 'string' && taskId.startsWith('task_') ? { taskId } : { _id: taskId };
    const doc = await AgentTask.findOneAndUpdate(
      query,
      {
        $push: {
          steps: {
            name: `${stepData.nodeName || 'STEP'}: ${stepData.action || ''}`,
            toolName: stepData.action || null,
            toolArgs: stepData.input || {},
            result: typeof stepData.output === 'object' ? JSON.stringify(stepData.output).slice(0, 1000) : String(stepData.output || '').slice(0, 1000),
            status: stepData.status === 'COMPLETED' ? 'completed' : stepData.status === 'FAILED' ? 'failed' : 'running',
            startedAt: new Date(),
            completedAt: new Date(),
          },
        },
        $inc: {
          totalSteps: 1,
          completedSteps: stepData.status === 'COMPLETED' ? 1 : 0,
        },
      },
      { new: true }
    ).catch(() => null);
    this._broadcast(doc);
    return doc;
  }

  /**
   * Build a formatted step context string for LLM reasoning
   */
  formatStepsForContext(task) {

    if (!task || !task.steps.length) return '';
    return task.steps.map(s => {
      const badge = s.status === 'completed' ? '✅' : s.status === 'running' ? '⚡' : s.status === 'failed' ? '❌' : '⏳';
      const result = s.result ? ` → ${s.result.slice(0, 200)}` : '';
      return `${badge} [${s.status.toUpperCase()}] ${s.name}${result}`;
    }).join('\n');
  }

  _broadcast(task) {
    if (!task) return;
    try {
      broadcast('AGENT_TASK_UPDATE', {
        taskId: task.taskId,
        status: task.status,
        completedSteps: task.completedSteps,
        totalSteps: task.totalSteps,
        goal: task.goal?.slice(0, 80),
      });
    } catch {}
  }
}

const taskStateEngine = new TaskStateEngine();
module.exports = taskStateEngine;
