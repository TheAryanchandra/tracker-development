'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { fetchSheetsStatus, syncGoogleSheets } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

export function SheetSyncStatus() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [lastSyncDiff, setLastSyncDiff] = useState<string>('Just now');
  const [pulse, setPulse] = useState(false);

  const { connected } = useWebSocket({
    SHEET_SYNCED: (event) => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
      loadStatus();
    },
    DATA_UPDATED: () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    },
  });

  const loadStatus = () => {
    fetchSheetsStatus().then((res) => {
      if (res?.success && res.data) {
        setStatus(res.data);
      }
    });
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update time ago string
  useEffect(() => {
    const updateDiff = () => {
      if (!status?.lastSyncTime) {
        setLastSyncDiff('Waiting for initial sync...');
        return;
      }
      const seconds = Math.floor((Date.now() - new Date(status.lastSyncTime).getTime()) / 1000);
      if (seconds < 10) setLastSyncDiff('Just now');
      else if (seconds < 60) setLastSyncDiff(`${seconds}s ago`);
      else if (seconds < 3600) setLastSyncDiff(`${Math.floor(seconds / 60)}m ago`);
      else setLastSyncDiff(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateDiff();
    const timer = setInterval(updateDiff, 10000);
    return () => clearInterval(timer);
  }, [status?.lastSyncTime]);

  const handleManualSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncGoogleSheets();
      loadStatus();
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  return (
    <div
      className={`apple-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border transition-all duration-500 ${
        pulse ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            connected
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-600'
          }`}
        >
          {connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Live Google Sheets Sync
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                connected
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {connected ? 'WebSocket Live (1-min Cron)' : 'Reconnecting...'}
            </span>
          </div>

          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 flex items-center gap-2">
            <span>Last synced: <b className="text-[var(--text-secondary)]">{lastSyncDiff}</b></span>
            {status?.lastSyncResult?.totalChanges > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                • {status.lastSyncResult.totalChanges} update(s) applied
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {status?.sheetUrl && (
          <a
            href={status.sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--card-border)] hover:bg-black/[0.05] transition flex items-center gap-1"
            title="Open Google Sheet"
          >
            <span>Open Sheet</span>
            <ExternalLink size={11} />
          </a>
        )}

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white bg-amber-700 dark:bg-indigo-600 hover:opacity-90 disabled:opacity-50 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
}

export default SheetSyncStatus;
