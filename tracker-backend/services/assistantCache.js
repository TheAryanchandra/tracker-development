// Redis-backed assistant cache with a safe in-memory fallback for local runs.
// Set REDIS_URL to enable the shared cache across backend instances.
let client = null;
let connecting = null;
const memory = new Map();

async function getClient() {
  if (client) return client;
  if (!process.env.REDIS_URL) return null;
  try {
    const { createClient } = require('redis');
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.warn('[Redis] Cache unavailable:', err.message));
    connecting ||= client.connect().catch(() => { client = null; });
    await connecting;
    return client;
  } catch { return null; }
}

async function get(key) {
  const redis = await getClient();
  if (redis?.isReady) return redis.get(key);
  const entry = memory.get(key);
  if (!entry || entry.expires < Date.now()) { memory.delete(key); return null; }
  return entry.value;
}

async function set(key, value, ttlSeconds = 300) {
  const redis = await getClient();
  if (redis?.isReady) return redis.set(key, value, { EX: ttlSeconds });
  memory.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

module.exports = { get, set };
