/**
 * In-Memory Redis-Style Cache Service
 * ─────────────────────────────────────────────────────────────
 * High-performance, zero-latency caching layer for:
 *  - Dashboard metrics & stats (sub-millisecond retrieval)
 *  - Learned facts & user profile (immediate fallback if DB is buffering)
 *  - Live Google Sheets tab data
 *  - Active conversation logs
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  set(key, value, ttlSeconds = 0) {
    this.store.set(key, value);
    if (ttlSeconds > 0) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      this.ttls.delete(key);
    }
  }

  get(key) {
    if (!this.store.has(key)) return null;
    const expiresAt = this.ttls.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    return this.store.get(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
    this.ttls.delete(key);
  }

  flush() {
    this.store.clear;
    this.ttls.clear();
  }

  // Helper for get or compute pattern
  async getOrSet(key, fetchFn, ttlSeconds = 60) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    try {
      const fresh = await fetchFn();
      if (fresh !== undefined && fresh !== null) {
        this.set(key, fresh, ttlSeconds);
      }
      return fresh;
    } catch (err) {
      console.warn(`[Cache Error for ${key}]:`, err.message);
      return cached;
    }
  }
}

const memoryCache = new MemoryCache();
module.exports = memoryCache;
