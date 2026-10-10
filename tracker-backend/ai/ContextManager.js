/**
 * Context Manager — Persistent MongoDB-backed Memory & Safe Context Budget Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Memory Exhaustion & Safety Features:
 *  - Hard maximum context budget (max tokens: 6000)
 *  - Maximum message character cap (2000 chars) prevents runaway prompts
 *  - Tool observation truncation (max 1200 chars)
 *  - LRU in-memory session cache bounded to MAX_CACHED_SESSIONS (50 sessions)
 *  - Inactivity-based session eviction (30 minutes) without deleting MongoDB records
 *  - Duplicate user turn protection
 *  - Safe structured history formats for Gemini, Claude, OpenAI & Ollama
 */

const mongoose = require('mongoose');

let JarvisMemory;
try { JarvisMemory = require('../models/JarvisMemory'); } catch {}

const MAX_CACHED_SESSIONS = parseInt(process.env.AI_MAX_CACHED_SESSIONS || '50', 10);
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes inactivity eviction
const MAX_CONTEXT_TOKENS = parseInt(process.env.AI_MAX_CONTEXT_TOKENS || '6000', 10);
const MAX_TURNS = 20;

class ContextManager {
  constructor() {
    this.maxTokens = MAX_CONTEXT_TOKENS;
    this.maxTurns = MAX_TURNS;
    this.sessions = new Map(); // LRU memory cache
    this.loadedSessions = new Set();
    this.sessionLocks = new Map(); // Mutex per session for concurrent requests
  }

  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(String(text).length / 3.8);
  }

  // ── Session Cache & Inactivity Eviction ───────────────────────────

  _evictStaleSessions() {
    const now = Date.now();
    // If cache exceeds limit or has stale sessions, evict oldest
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.updatedAt.getTime() > SESSION_TTL_MS) {
        this.sessions.delete(id);
        this.loadedSessions.delete(id);
      }
    }

    if (this.sessions.size > MAX_CACHED_SESSIONS) {
      // Evict least recently updated
      const sorted = [...this.sessions.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt);
      const toRemove = sorted.slice(0, this.sessions.size - MAX_CACHED_SESSIONS);
      for (const [id] of toRemove) {
        this.sessions.delete(id);
        this.loadedSessions.delete(id);
      }
    }
  }

  getSession(sessionId = 'default') {
    this._evictStaleSessions();

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

    const session = this.sessions.get(sessionId);
    session.updatedAt = new Date();
    return session;
  }

  /**
   * Acquire a temporary mutex lock for a session to prevent concurrent race conditions
   */
  async acquireLock(sessionId = 'default', timeoutMs = 15000) {
    const start = Date.now();
    while (this.sessionLocks.get(sessionId)) {
      if (Date.now() - start > timeoutMs) {
        console.warn(`[ContextManager] Lock timeout reached for session ${sessionId}. Releasing.`);
        this.sessionLocks.delete(sessionId);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    this.sessionLocks.set(sessionId, true);
    return () => this.sessionLocks.delete(sessionId);
  }

  // ── Session Loading From MongoDB ──────────────────────────────────

  async loadSession(sessionId = 'default') {
    if (this.loadedSessions.has(sessionId)) return this.getSession(sessionId);

    const session = this.getSession(sessionId);
    this.loadedSessions.add(sessionId);

    if (!JarvisMemory || mongoose.connection.readyState !== 1) return session;

    try {
      const saved = await JarvisMemory.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(16)
        .lean();

      if (saved.length > 0) {
        const turns = saved.reverse().map((doc) => ({
          id: `db_${doc._id}`,
          role: doc.role || 'user',
          content: String(doc.content || doc.message || '').slice(0, 2000),
          tokens: this.estimateTokens(doc.content || doc.message || ''),
          metadata: { source: 'db', intent: doc.intent },
          timestamp: new Date(doc.createdAt),
        }));
        session.turns = turns;
        console.log(`[ContextManager] Restored ${turns.length} turns from MongoDB for session ${sessionId}`);
      }
    } catch (err) {
      console.warn(`[ContextManager] Could not load session from MongoDB:`, err.message);
    }

    return session;
  }

  // ── Task Management ───────────────────────────────────────────────

  setActiveTask(sessionId, taskId) {
    const session = this.getSession(sessionId);
    session.activeTaskId = taskId;
    session.updatedAt = new Date();
  }

  getActiveTask(sessionId) {
    return this.getSession(sessionId).activeTaskId;
  }

  // ── Turn Management ───────────────────────────────────────────────

  addTurn(sessionId = 'default', role, content, metadata = {}) {
    const session = this.getSession(sessionId);

    // Bounded message size (max 2000 chars)
    const sanitizedContent = String(content || '').slice(0, 2000);

    // Prevent duplicate insertion of identical consecutive turns
    const lastTurn = session.turns[session.turns.length - 1];
    if (lastTurn && lastTurn.role === role && lastTurn.content === sanitizedContent) {
      return lastTurn;
    }

    const tokens = this.estimateTokens(sanitizedContent);
    const turn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      role,
      content: sanitizedContent,
      tokens,
      metadata,
      timestamp: new Date(),
    };

    session.turns.push(turn);
    session.updatedAt = new Date();
    this.pruneAndCompact(sessionId);

    // Persist to MongoDB (background task)
    this._persistTurn(sessionId, turn);

    return turn;
  }

  injectToolObservation(sessionId = 'default', toolName, result) {
    // Truncate tool observations to max 1200 chars to avoid token exhaustion
    let stringResult = typeof result === 'object' ? JSON.stringify(result) : String(result);
    if (stringResult.length > 1200) {
      stringResult = `${stringResult.slice(0, 1100)}... [Truncated observation]`;
    }

    const content = `Tool "${toolName}" observation:\n${stringResult}`;
    return this.addTurn(sessionId, 'tool', content, { tool: toolName, source: 'tool_result' });
  }

  addToolObservation(sessionId = 'default', toolName, result) {
    return this.injectToolObservation(sessionId, toolName, result);
  }

  // ── Context Compaction & Summarization ────────────────────────────

  getTotalTokens(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const summaryTokens = this.estimateTokens(session.summary);
    const turnsTokens = session.turns.reduce((sum, t) => sum + t.tokens, 0);
    return summaryTokens + turnsTokens;
  }

  pruneAndCompact(sessionId = 'default') {
    const session = this.getSession(sessionId);

    // Bound turn count
    if (session.turns.length > this.maxTurns) {
      const overflow = session.turns.length - this.maxTurns;
      const removed = session.turns.splice(0, overflow);
      this._updateSummary(session, removed);
    }

    // Bound total token budget
    let total = this.getTotalTokens(sessionId);
    while (total > this.maxTokens && session.turns.length > 4) {
      const removed = session.turns.splice(0, 2);
      this._updateSummary(session, removed);
      total = this.getTotalTokens(sessionId);
    }
  }

  _updateSummary(session, oldTurns) {
    const textSnippet = oldTurns
      .filter((t) => t.role !== 'tool')
      .map((t) => `${t.role === 'user' ? 'User' : 'Jarvis'}: ${t.content}`)
      .join(' | ');

    if (!textSnippet) return;

    const addition = textSnippet.slice(0, 400);
    session.summary = session.summary
      ? `${session.summary.slice(0, 600)} … ${addition}`
      : `Prior summary: ${addition}`;

    if (session.summary.length > 1200) {
      session.summary = session.summary.slice(session.summary.length - 1000);
    }
  }

  // ── Context String & Formats ──────────────────────────────────────

  getContextString(sessionId = 'default', includeSummary = true) {
    const session = this.getSession(sessionId);
    let output = '';

    if (includeSummary && session.summary) {
      output += `[Context Summary]: ${session.summary}\n\n`;
    }

    const historyLines = session.turns.map((t) => {
      if (t.role === 'user') return `User: ${t.content}`;
      if (t.role === 'assistant') return `Jarvis: ${t.content}`;
      if (t.role === 'tool') return `[Observation — ${t.metadata?.tool || 'tool'}]: ${t.content}`;
      return `${t.role}: ${t.content}`;
    });

    output += historyLines.join('\n');
    return output;
  }

  getFormattedHistory(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const result = [];

    for (const t of session.turns) {
      if (t.role === 'user') {
        result.push({ role: 'user', parts: [{ text: t.content }] });
      } else if (t.role === 'assistant') {
        result.push({ role: 'model', parts: [{ text: t.content }] });
      } else if (t.role === 'tool') {
        result.push({ role: 'model', parts: [{ text: `[Tool Observation]: ${t.content}` }] });
      }
    }

    return result;
  }

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
        messages.push({ role: 'user', content: `[Tool Observation]: ${t.content}` });
      }
    }

    return messages;
  }

  // ── MongoDB Persistence ───────────────────────────────────────────

  async _persistTurn(sessionId, turn) {
    if (!JarvisMemory || mongoose.connection.readyState !== 1) return;
    if (turn.role === 'tool') return;

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

  clearSession(sessionId = 'default') {
    this.sessions.delete(sessionId);
    this.loadedSessions.delete(sessionId);
    return true;
  }
}

const contextManager = new ContextManager();
module.exports = contextManager;
