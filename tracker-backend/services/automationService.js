/**
 * n8n automation bridge.
 *
 * Jarvis and the dashboard remain the source of truth for tasks. When an n8n
 * webhook is configured, task events are delivered asynchronously so n8n can
 * send reminders, create calendar events, post notifications, or build daily
 * reports without slowing down the main request.
 */
const fetch = require('node-fetch');

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;
const REQUEST_TIMEOUT = Number(process.env.N8N_TIMEOUT_MS || 5000);

function isEnabled() {
  return Boolean(WEBHOOK_URL && WEBHOOK_SECRET);
}

async function dispatch(event, payload = {}) {
  if (!isEnabled()) return { enabled: false, delivered: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const body = JSON.stringify({
      event,
      eventId: `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      occurredAt: new Date().toISOString(),
      source: 'aryan-tracker',
      payload,
    });
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aryan-Tracker-Secret': WEBHOOK_SECRET,
      },
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`n8n webhook HTTP ${response.status}`);
    return { enabled: true, delivered: true };
  } catch (error) {
    console.warn(`[Automation] ${event} delivery skipped:`, error.message);
    return { enabled: true, delivered: false, error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

function dispatchAsync(event, payload) {
  // Automation is a side effect. Never make task CRUD or Jarvis wait for it.
  void dispatch(event, payload);
}

function status() {
  return {
    enabled: isEnabled(),
    provider: isEnabled() ? 'n8n' : null,
    configured: Boolean(WEBHOOK_URL),
  };
}

module.exports = { dispatch, dispatchAsync, isEnabled, status };
