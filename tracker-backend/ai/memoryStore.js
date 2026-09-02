/**
 * Per-Session Conversation Memory
 * Keeps last N exchanges per session so Jarvis remembers context within a conversation.
 */

const MAX_TURNS = 8; // number of exchanges to keep
const SESSION_TTL = 30 * 60 * 1000; // 30 min idle before clearing

class MemoryStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> { turns, lastActive }
  }

  _getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { turns: [], lastActive: Date.now() });
    }
    const session = this.sessions.get(sessionId);
    session.lastActive = Date.now();
    return session;
  }

  /**
   * Add a user+assistant turn to session memory
   */
  addTurn(sessionId, userMessage, assistantMessage) {
    const session = this._getSession(sessionId);
    session.turns.push({ role: 'user', content: userMessage });
    session.turns.push({ role: 'assistant', content: assistantMessage });
    // Keep only last MAX_TURNS * 2 messages
    if (session.turns.length > MAX_TURNS * 2) {
      session.turns = session.turns.slice(-MAX_TURNS * 2);
    }
  }

  /**
   * Get conversation history as formatted string for LLM context
   */
  getContextString(sessionId) {
    const session = this._getSession(sessionId);
    if (session.turns.length === 0) return '';
    return session.turns.map(t => `${t.role === 'user' ? 'Aryan' : 'Jarvis'}: ${t.content}`).join('\n');
  }

  /**
   * Get turns array for Gemini multi-turn chat format
   */
  getTurns(sessionId) {
    return this._getSession(sessionId).turns;
  }

  /**
   * Clear a session
   */
  clear(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Auto-cleanup expired sessions (call periodically)
   */
  cleanup() {
    const now = Date.now();
    this.sessions.forEach((session, id) => {
      if (now - session.lastActive > SESSION_TTL) this.sessions.delete(id);
    });
  }
}

const memoryStore = new MemoryStore();
// Cleanup every 15 minutes
setInterval(() => memoryStore.cleanup(), 15 * 60 * 1000);

module.exports = memoryStore;
