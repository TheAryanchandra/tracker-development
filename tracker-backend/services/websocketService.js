/**
 * WebSocket Service
 * ─────────────────────────────────────────────────────────────
 * Manages real-time bidirectional communication between:
 *  - Google Sheets sync → dashboard auto-refresh
 *  - DB writes from AI → live stat updates
 *  - Sheet cron events → frontend indicators
 */

const WebSocket = require('ws');

let wss = null;
const clients = new Set();

/**
 * Initialize WebSocket server on the existing HTTP server
 */
function initWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);

    // Send welcome + current server time
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Jarvis WebSocket Live ⚡',
      timestamp: new Date().toISOString(),
      clientCount: clients.size,
    }));

    // Heartbeat ping every 25s to prevent connection drops
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
      }
    }, 25000);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'PONG') return; // Client heartbeat response
        console.log('[WS] Message from client:', msg.type);
      } catch (e) { /* ignore malformed */ }
    });

    ws.on('close', () => {
      clients.delete(ws);
      clearInterval(heartbeat);
      console.log(`[WS] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[WS] Client error:', err.message);
      clients.delete(ws);
      clearInterval(heartbeat);
    });
  });

  console.log('[WS] WebSocket server initialized on /ws');
  return wss;
}

/**
 * Broadcast a typed event to all connected clients
 * @param {string} type - Event type (SHEET_SYNCED, DATA_UPDATED, etc.)
 * @param {object} data - Payload to broadcast
 */
function broadcast(type, data = {}) {
  if (!wss) return;
  const payload = JSON.stringify({ type, ...data, timestamp: new Date().toISOString() });
  let sent = 0;
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      sent++;
    }
  });
  if (sent > 0) console.log(`[WS] Broadcast "${type}" to ${sent} client(s)`);
}

/**
 * Get current connected client count
 */
function getClientCount() {
  return clients.size;
}

// ── Event Type Constants ─────────────────────────────────────
const WS_EVENTS = {
  CONNECTED:      'CONNECTED',
  SHEET_SYNCED:   'SHEET_SYNCED',    // Google Sheets cron completed
  DATA_UPDATED:   'DATA_UPDATED',    // Any DB write
  STATS_REFRESH:  'STATS_REFRESH',   // Dashboard stats changed
  AI_ACTION:      'AI_ACTION',       // Jarvis executed a DB action
  JOBS_UPDATED:   'JOBS_UPDATED',    // New job listings fetched
  SYNC_ERROR:     'SYNC_ERROR',      // Sheets sync failed
  PING:           'PING',
};

module.exports = { initWebSocket, broadcast, getClientCount, WS_EVENTS };
