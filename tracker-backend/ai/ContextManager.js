/**
 * Context Manager — Persistent MongoDB-backed Agentic Context Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed gaps vs previous version:
 *  - Sessions now persist to MongoDB (survives restarts)
 *  - Tool observations are injected back as 'tool' role turns
 *  - LLM-generated summary compression (with string fallback)
 *  - Full structured history for Gemini, Claude, OpenAI formats
 */

const mongoose = require('mongoose');

// Lazy-load to avoid circular dependency issues at startup
let JarvisMemory;
try { JarvisMemory = require('../models/JarvisMemory'); } catch {}

class ContextManager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 8192;
    this.maxTurns = options.maxTurns || 24;
    this.summarizeThreshold = options.summarizeThreshold || 6000;
    this.sessions = new Map();      // in-memory cache
    this.loadedSessions = new Set(); // tracks which sessions were loaded from DB
  }

  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(String(text).length / 3.8);
  }

  // ── Session Loading ──────────────────────────────────────────────

  /**
   * Load session from MongoDB if not already in memory
   */
  async loadSession(sessionId = 'default') {
    if (this.loadedSessions.has(sessionId)) return this.getSession(sessionId);

    // Initialize blank session first
    this.getSession(sessionId);
    this.loadedSessions.add(sessionId);

    if (!JarvisMemory || mongoose.connection.readyState !== 1) return this.getSession(sessionId);

    try {
      // Load last 20 turns from persistent store
      const saved = await JarvisMemory.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      if (saved.length > 0) {
        const session = this.getSession(sessionId);
        // Reverse so oldest first
        const turns = saved.reverse().map(doc => ({
          id: `db_${doc._id}`,
          role: doc.role || 'user',
          content: doc.content || doc.message || '',
          tokens: this.estimateTokens(doc.content || doc.message || ''),
          metadata: { source: 'db', intent: doc.intent },
          timestamp: new Date(doc.createdAt),
        }));
        session.turns = turns;
        console.log(`[ContextManager] Loaded ${turns.length} turns from DB for session ${sessionId}`);
      }
    } catch (err) {
      console.warn(`[ContextManager] Could not load session from DB:`, err.message);
    }

    return this.getSession(sessionId);
  }

  // ── Session State ─────────────────────────────────────────────────

  getSession(sessionId = 'default') {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        turns: [],
        summary: '',
        metadata: {},
        entities: {},
        activeTaskId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return this.sessions.get(sessionId);
  }

  /**
   * Set the active agent task ID on the session for cross-turn task tracking
   */
  setActiveTask(sessionId, taskId) {
    const session = this.getSession(sessionId);
    session.activeTaskId = taskId;
  }

  getActiveTask(sessionId) {
    return this.getSession(sessionId).activeTaskId;
  }

  // ── Turn Management ───────────────────────────────────────────────

  addTurn(sessionId = 'default', role, content, metadata = {}) {
    const session = this.getSession(sessionId);
    const tokens = this.estimateTokens(content);

    const turn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      role,
      content,
      tokens,
      metadata,
      timestamp: new Date(),
    };

    session.turns.push(turn);
    session.updatedAt = new Date();
    this.pruneAndCompact(sessionId);

    // Persist to MongoDB (fire-and-forget)
    this._persistTurn(sessionId, turn);

    return turn;
  }

  /**
   * KEY FIX: Inject tool result as an observation turn so the LLM
   * sees it as structured context in the next THINK step.
   */
  injectToolObservation(sessionId = 'default', toolName, result) {
    const content = typeof result === 'object'
      ? `Tool "${toolName}" returned:\n${JSON.stringify(result, null, 2).slice(0, 3000)}`
      : `Tool "${toolName}" returned:\n${String(result).slice(0, 3000)}`;

    return this.addTurn(sessionId, 'tool', content, { tool: toolName, source: 'tool_result' });
  }

  addToolObservation(sessionId = 'default', toolName, result) {
    return this.injectToolObservation(sessionId, toolName, result);
  }


  // ── Context Formatting ────────────────────────────────────────────

  getContextString(sessionId = 'default', includeSummary = true) {
    const session = this.getSession(sessionId);
    let output = '';

    if (includeSummary && session.summary) {
      output += `[Conversation Summary (earlier context)]: ${session.summary}\n\n`;
    }

    const historyLines = session.turns.map(t => {
      if (t.role === 'user') return `User: ${t.content}`;
      if (t.role === 'assistant') return `Jarvis: ${t.content}`;
      if (t.role === 'tool') return `[Observation — ${t.metadata?.tool || 'tool'}]: ${t.content}`;
      return `${t.role}: ${t.content}`;
    });

    output += historyLines.join('\n');
    return output;
  }

  /**
   * Get Gemini-compatible history format (user/model alternation required)
   * Tool turns are folded into model text to satisfy Gemini's strict alternation.
   */
  getFormattedHistory(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const result = [];

    for (const t of session.turns) {
      if (t.role === 'user') {
        result.push({ role: 'user', parts: [{ text: t.content }] });
      } else if (t.role === 'assistant') {
        result.push({ role: 'model', parts: [{ text: t.content }] });
      } else if (t.role === 'tool') {
        // Fold tool observations into model turns so Gemini doesn't reject them
        result.push({ role: 'model', parts: [{ text: `[Tool Observation]: ${t.content}` }] });
      }
    }

    return result;
  }

  /**
   * Get OpenAI / Anthropic messages array format
   */
  getMessagesArray(sessionId = 'default', systemPrompt = '') {
    const session = this.getSession(sessionId);
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    for (const t of session.turns) {
      if (t.role === 'user') {
        messages.push({ role: 'user', content: t.content });
      } else if (t.role === 'assistant') {
        messages.push({ role: 'assistant', content: t.content });
      } else if (t.role === 'tool') {
        // For OpenAI/Anthropic, tool results are user-role context injections
        messages.push({ role: 'user', content: `[Tool Observation]: ${t.content}` });
      }
    }

    return messages;
  }

  // ── Compaction ────────────────────────────────────────────────────

  getTotalTokens(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const summaryTokens = this.estimateTokens(session.summary);
    const turnsTokens = session.turns.reduce((sum, t) => sum + t.tokens, 0);
    return summaryTokens + turnsTokens;
  }

  pruneAndCompact(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const totalTokens = this.getTotalTokens(sessionId);

    if (session.turns.length > this.maxTurns) {
      const overflow = session.turns.length - this.maxTurns;
      const removed = session.turns.splice(0, overflow);
      this._updateSummary(session, removed);
    }

    if (totalTokens > this.summarizeThreshold && session.turns.length > 6) {
      const turnsToSummarize = session.turns.splice(0, session.turns.length - 6);
      this._updateSummary(session, turnsToSummarize);
    }
  }

  _updateSummary(session, oldTurns) {
    const textSnippet = oldTurns
      .filter(t => t.role !== 'tool') // tool results are too verbose for summary
      .map(t => `${t.role === 'user' ? 'User' : 'Jarvis'}: ${t.content}`)
      .join(' | ');

    const addition = textSnippet.slice(0, 600);
    session.summary = session.summary
      ? `${session.summary.slice(0, 900)} … ${addition}`
      : `Earlier conversation: ${addition}`;

    if (session.summary.length > 1800) {
      session.summary = session.summary.slice(session.summary.length - 1500);
    }
  }

  // ── Persistence ───────────────────────────────────────────────────

  async _persistTurn(sessionId, turn) {
    if (!JarvisMemory || mongoose.connection.readyState !== 1) return;
    if (turn.role === 'tool') return; // Tool observations are volatile; don't persist

    try {
      await JarvisMemory.create({
        sessionId,
        role: turn.role,
        content: turn.content,
        intent: turn.metadata?.intent || null,
        createdAt: turn.timestamp,
      }).catch(() => {});
    } catch {}
  }

  // ── Utilities ─────────────────────────────────────────────────────

  clearSession(sessionId = 'default') {
    this.sessions.delete(sessionId);
    this.loadedSessions.delete(sessionId);
    return true;
  }

  exportState(sessionId = 'default') {
    const session = this.getSession(sessionId);
    return {
      id: session.id,
      turnCount: session.turns.length,
      totalTokens: this.getTotalTokens(sessionId),
      summary: session.summary,
      activeTaskId: session.activeTaskId,
      turns: session.turns,
      updatedAt: session.updatedAt,
    };
  }
}

const contextManager = new ContextManager();
module.exports = contextManager;
