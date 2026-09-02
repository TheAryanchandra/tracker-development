'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Briefcase, Flame, AlertTriangle, Info, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

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

const TYPE_STYLE: Record<string, { border: string; icon: React.ReactNode }> = {
  job_alert:          { border: 'var(--blue)',   icon: <Briefcase size={13} style={{ color: 'var(--blue)' }} /> },
  streak_warning:     { border: 'var(--orange)', icon: <Flame size={13} style={{ color: 'var(--orange)' }} /> },
  dsa_reminder:       { border: 'var(--purple)', icon: <AlertTriangle size={13} style={{ color: 'var(--purple)' }} /> },
  application_update: { border: 'var(--green)',  icon: <Briefcase size={13} style={{ color: 'var(--green)' }} /> },
  system:             { border: 'var(--text-3)', icon: <Info size={13} style={{ color: 'var(--text-3)' }} /> },
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

  // Fetch notifications
  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${API}/notifications`);
      const data = await res.json();
      if (data.success) {
        setNotifs(data.data);
        setUnread(data.unreadCount);
      }
    } catch { /* offline */ }
  };

  // SSE real-time updates
  useEffect(() => {
    fetchNotifs();

    const es = new EventSource(`${API}/notifications/stream`);
    sseRef.current = es;
    es.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.unreadCount !== undefined) setUnread(d.unreadCount);
      if (d.type === 'update' && d.latest) {
        setNotifs(prev => {
          const exists = prev.find(n => n._id === d.latest._id);
          if (exists) return prev;
          return [d.latest, ...prev];
        });
        // Browser notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(d.latest.title, { body: d.latest.body, icon: '/favicon.ico' });
        }
      }
    };
    es.onerror = () => es.close();
    return () => { es.close(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Request browser notification permission
  const requestPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, { method: 'PUT' });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetch(`${API}/notifications/${id}/read`, { method: 'PUT' });
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const clearAll = async () => {
    await fetch(`${API}/notifications`, { method: 'DELETE' });
    setNotifs([]);
    setUnread(0);
  };

  const triggerRefresh = async () => {
    setLoading(true);
    await fetch(`${API}/notifications/trigger`, { method: 'POST' });
    setTimeout(() => { fetchNotifs(); setLoading(false); }, 2000);
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); requestPermission(); }}
        className="btn btn-ghost btn-icon"
        style={{ position: 'relative' }}
        title="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--red)', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 340, maxHeight: 480,
          background: 'var(--bg-1)', border: '1px solid var(--border-md)',
          borderRadius: 'var(--r-xl)', zIndex: 100,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeUp 0.2s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Notifications</span>
              {unread > 0 && <span className="badge badge-accent">{unread} new</span>}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={triggerRefresh} className="btn btn-ghost btn-icon btn-sm" title="Refresh checks">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
              {notifs.length > 0 && (
                <>
                  <button onClick={markAllRead} className="btn btn-ghost btn-icon btn-sm" title="Mark all read"><CheckCheck size={12} /></button>
                  <button onClick={clearAll} className="btn btn-ghost btn-icon btn-sm" title="Clear all"><Trash2 size={12} /></button>
                </>
              )}
              <button onClick={() => setOpen(false)} className="btn btn-ghost btn-icon btn-sm"><X size={12} /></button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <Bell size={28} />
                <span style={{ fontSize: 13 }}>No notifications yet</span>
                <button onClick={triggerRefresh} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
                  <RefreshCw size={12} /> Check for updates
                </button>
              </div>
            ) : notifs.map(n => {
              const style = TYPE_STYLE[n.type] || TYPE_STYLE.system;
              return (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    transition: 'background 0.15s',
                    borderLeft: n.read ? '2px solid transparent' : `2px solid ${style.border}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.04)')}
                >
                  <div style={{ marginTop: 2, flexShrink: 0 }}>{style.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: n.read ? 'var(--text-2)' : 'var(--text-1)', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{n.body}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeAgo(n.createdAt)}</span>
                      {n.url && n.url !== '/' && (
                        <a href={n.url} style={{ fontSize: 10, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
                          Open <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
