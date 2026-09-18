/**
 * Agent Routes — Observability & Control Endpoints for Jarvis AI
 * ─────────────────────────────────────────────────────────────
 * Provides:
 *  - GET /api/agent/status — ModelGateway status, tool registry, context stats
 *  - GET /api/agent/tasks — Persistent multi-step agent tasks list
 *  - GET /api/agent/tasks/:id — Full task execution step traces
 *  - POST /api/agent/model — Dynamic model override (gemini / anthropic / openai)
 *  - POST /api/agent/run — Run an agentic task directly
 */

const express = require('express');
const router = express.Router();
const modelGateway = require('../ai/ModelGateway');
const toolRegistry = require('../ai/ToolRegistry');
const contextManager = require('../ai/ContextManager');
const taskStateEngine = require('../ai/TaskStateEngine');
const { runAgentLoop } = require('../ai/agentOrchestrator');
const AgentTask = require('../models/AgentTask');

// GET /api/agent/status
router.get('/status', (req, res) => {
  try {
    const status = modelGateway.getStatus();
    const tools = toolRegistry.listTools();
    const activeTasksCount = 0; // populated from DB if needed
    res.json({
      success: true,
      gateway: status,
      toolsCount: tools.length,
      tools: tools.map(t => ({ name: t.name, description: t.description })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/agent/tasks
router.get('/tasks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tasks = await AgentTask.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/agent/tasks/:id
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await AgentTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/agent/model — Set provider & model override
router.post('/model', (req, res) => {
  try {
    const { provider, modelName } = req.body;
    const newStatus = modelGateway.setModelOverride(provider, modelName);
    res.json({ success: true, gateway: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/agent/run — Run an agent loop query
router.post('/run', async (req, res) => {
  try {
    const { prompt, sessionId = 'agent-admin' } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const result = await runAgentLoop(prompt, sessionId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
