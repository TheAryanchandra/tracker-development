'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Briefcase,
  Flame,
  AlertTriangle,
  Info,
  ExternalLink,
  RefreshCw,
  Trash2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

interface Notif {
  _id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  url?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_STYLE: Record<string, { badge: string; icon: React.ReactNode }> = {
  job_alert:          { badge: 'badge-blue',   icon: <Briefcase size={12} className="text-blue-600 dark:text-blue-400" /> },
  streak_warning:     { badge: 'badge-orange', icon: <Flame size={12} className="text-orange-600 dark:text-orange-400" /> },
  dsa_reminder:       { badge: 'badge-purple', icon: <AlertTriangle size={12} className="text-purple-600 dark:text-purple-400" /> },
  application_update: { badge: 'badge-green',  icon: <Briefcase size={12} className="text-emerald-600 dark:text-emerald-400" /> },
  system:             { badge: 'badge-dim',    icon: <Info size={12} className="text-gray-500" /> },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${API}/notifications`);
      const data = await res.json();
      if (data.success) {
        setNotifs(data.data || []);
        setUnread(data.unreadCount || 0);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchNotifs();

    try {
      const es = new EventSource(`${API}/notifications/stream`);
      sseRef.current = es;

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'init' || msg.type === 'update') {
            setUnread(msg.unreadCount || 0);
            if (msg.latest) {
              setNotifs((prev) => [
                msg.latest,
                ...prev.filter((n) => n._id !== msg.latest._id),
              ]);
            }
          }
        } catch {
          // ignore
        }
      };

      return () => {
        es.close();
      };
    } catch {
      // SSE not available
    }
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: 'PUT' });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch(`${API}/notifications`, { method: 'DELETE' });
      setNotifs([]);
      setUnread(0);
    } catch {
      // ignore
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/notifications/trigger`, { method: 'POST' });
      await fetchNotifs();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[var(--card-border)] transition"
        title="Notifications & Alerts"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl apple-card p-4 z-50 shadow-2xl border border-[var(--card-border)] bg-[var(--modal-bg)] space-y-3 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Notifications</h3>
              {unread > 0 && (
                <span className="apple-badge badge-orange text-[9px]">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-amber-700 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} /> Read all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                No notifications right now. You&apos;re all caught up!
              </div>
            ) : (
              notifs.map((n) => {
                const style = TYPE_STYLE[n.type] || TYPE_STYLE.system;
                return (
                  <div
                    key={n._id}
                    className={`p-2.5 rounded-xl border transition ${
                      n.read
                        ? 'bg-[var(--card-flat)] border-[var(--card-border)] opacity-70'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] border-amber-500/20 dark:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {style.icon}
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[9px] text-[var(--text-tertiary)] whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 whitespace-pre-wrap leading-relaxed">
                      {n.body}
                    </p>

                    {n.url && (
                      <a
                        href={n.url}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-indigo-400 hover:underline mt-1.5"
                      >
                        Open <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between text-[10px]">
            <button
              onClick={handleTrigger}
              disabled={loading}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Run Checks Now
            </button>
            {notifs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={11} /> Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
