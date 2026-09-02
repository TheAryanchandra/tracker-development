'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const getWsUrl = () => {
  if (typeof window === 'undefined') return '';
  const isHttps = window.location.protocol === 'https:';
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (isHttps) return 'wss://tracker-backend-rnec.onrender.com/ws';
  return 'ws://127.0.0.1:5000/ws';
};

export type WsEvent = {
  type: string;
  timestamp?: string;
  [key: string]: any;
};

type EventHandler = (event: WsEvent) => void;

// ── Global singleton WebSocket ────────────────────────────────
let globalWs: WebSocket | null = null;
const globalHandlers = new Map<string, Set<EventHandler>>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isConnecting = false;

function connectGlobal() {
  if (isConnecting || (globalWs && globalWs.readyState === WebSocket.OPEN)) return;
  isConnecting = true;

  const url = getWsUrl();
  if (!url) { isConnecting = false; return; }

  try {
    globalWs = new WebSocket(url);

    globalWs.onopen = () => {
      isConnecting = false;
      console.log('[WS] Connected to Jarvis WebSocket');
      // Notify all CONNECTED handlers
      notifyHandlers('CONNECTED', { type: 'CONNECTED', timestamp: new Date().toISOString() });
    };

    globalWs.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as WsEvent;
        notifyHandlers(data.type, data);
        notifyHandlers('*', data); // wildcard handlers
      } catch { /* ignore malformed */ }
    };

    globalWs.onclose = () => {
      isConnecting = false;
      console.log('[WS] Disconnected, reconnecting in 3s...');
      notifyHandlers('DISCONNECTED', { type: 'DISCONNECTED', timestamp: new Date().toISOString() });
      // Auto-reconnect
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectGlobal, 3000);
    };

    globalWs.onerror = () => {
      isConnecting = false;
      globalWs?.close();
    };
  } catch (e) {
    isConnecting = false;
  }
}

function notifyHandlers(type: string, event: WsEvent) {
  const handlers = globalHandlers.get(type);
  if (handlers) handlers.forEach(h => { try { h(event); } catch { /* skip */ } });
}

function subscribeHandler(type: string, handler: EventHandler) {
  if (!globalHandlers.has(type)) globalHandlers.set(type, new Set());
  globalHandlers.get(type)!.add(handler);
}

function unsubscribeHandler(type: string, handler: EventHandler) {
  globalHandlers.get(type)?.delete(handler);
}

// ── useWebSocket hook ─────────────────────────────────────────
export function useWebSocket(handlers?: Record<string, EventHandler>) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    // Start global connection if not already
    connectGlobal();

    const connHandler = () => setConnected(true);
    const disconnHandler = () => setConnected(false);
    const wildcardHandler = (e: WsEvent) => setLastEvent(e);

    subscribeHandler('CONNECTED', connHandler);
    subscribeHandler('DISCONNECTED', disconnHandler);
    subscribeHandler('*', wildcardHandler);

    // Register all passed handlers
    if (handlers) {
      Object.entries(handlers).forEach(([type, fn]) => {
        subscribeHandler(type, fn);
      });
    }

    // Check if already connected
    if (globalWs?.readyState === WebSocket.OPEN) setConnected(true);

    return () => {
      unsubscribeHandler('CONNECTED', connHandler);
      unsubscribeHandler('DISCONNECTED', disconnHandler);
      unsubscribeHandler('*', wildcardHandler);
      if (handlers) {
        Object.entries(handlers).forEach(([type, fn]) => {
          unsubscribeHandler(type, fn);
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { connected, lastEvent };
}

export default useWebSocket;
