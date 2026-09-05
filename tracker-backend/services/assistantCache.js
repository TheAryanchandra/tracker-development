// Redis-backed assistant cache with a safe in-memory fallback for local runs.
// Set REDIS_URL to enable the shared cache across backend instances.
let client = null;
let connecting = null;
const memory = new Map();
const pending = new Map();
const REDIS_CONNECT_TIMEOUT = 1500;

async function getClient() {
  if (client) return client;
  if (!process.env.REDIS_URL) return null;
  try {
    const { createClient } = require('redis');
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.warn('[Redis] Cache unavailable:', err.message));
    connecting ||= Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), REDIS_CONNECT_TIMEOUT)),
    ]).catch(() => { client = null; connecting = null; });
    await connecting;
    return client;
  } catch { return null; }
}

async function get(key) {
  try {
    const redis = await getClient();
    if (redis?.isReady) return await redis.get(key);
  } catch (err) { console.warn('[Redis] Read fallback:', err.message); }
  const entry = memory.get(key);
  if (!entry || entry.expires < Date.now()) { memory.delete(key); return null; }
  return entry.value;
}

async function set(key, value, ttlSeconds = 300) {
  try {
    const redis = await getClient();
    if (redis?.isReady) return await redis.set(key, value, { EX: ttlSeconds });
  } catch (err) { console.warn('[Redis] Write fallback:', err.message); }
  memory.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

async function getOrSet(key, producer, ttlSeconds = 300) {
  const cached = await get(key);
  if (cached !== null) return cached;
  if (pending.has(key)) return pending.get(key);
  const work = Promise.resolve().then(producer).then(async value => {
    if (value !== undefined && value !== null) await set(key, value, ttlSeconds);
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, work);
  return work;
}

module.exports = { get, set, getOrSet };
