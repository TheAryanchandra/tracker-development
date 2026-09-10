'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight, BrainCircuit, CalendarCheck, FileSpreadsheet, LogOut, RefreshCw, Settings2, Target, TrendingUp, Zap } from 'lucide-react';
import { fetchAiModels, fetchDashboardStats, fetchSheetsStatus, syncGoogleSheets } from '@/lib/api';
import { clearAuth, getAuthToken, getAuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const routes = [
  ['DSA Progress', '/dsa-progress', Target], ['Daily Tracker', '/daily-tracker', CalendarCheck], ['Lectures', '/dsa-lectures', BrainCircuit], ['Applications', '/applications', TrendingUp], ['Jobs', '/jobs', Activity], ['Admin & Uploads', '/admin', Settings2],
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [models, setModels] = useState<any>(null);
  const [sheetStatus, setSheetStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const user = getAuthUser<{ name?: string; email?: string }>();

  const load = async () => {
    const [statsResult, modelsResult, sheetResult] = await Promise.all([fetchDashboardStats(), fetchAiModels(), fetchSheetsStatus()]);
    setStats(statsResult?.data); setModels(modelsResult); setSheetStatus(sheetResult?.data);
  };
  useEffect(() => { if (getAuthToken()) load().catch(() => {}); }, []);

  const logout = () => { clearAuth(); router.replace('/login'); };
  const sync = async () => { setSyncing(true); try { await syncGoogleSheets(); await load(); } finally { setSyncing(false); } };
  const metricCards = [['DSA solved', `${stats?.solvedDsaProblems || 0}/${stats?.totalDsaProblems || 0}`, `${stats?.overallDsaPercent || 0}% complete`], ['Current streak', `${stats?.currentDsaStreak || 0} days`, 'Keep the chain alive'], ['Applications', `${stats?.totalAppsLogged || 0}`, `${stats?.interviewsInProgress || 0} in interview`], ['Offers', `${stats?.offersReceived || 0}`, 'Pipeline signal']];

  return <main className="min-h-screen px-5 py-7 md:px-10 md:py-10 bg-[var(--page-bg)]"><div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Command center</p><h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--text-primary)]">Good to see you, {user?.name || 'Aryan'}.</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">One place to steer your learning, applications, data sync, and AI copilot.</p></div><div className="flex gap-2"><button onClick={sync} disabled={syncing} className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-flat)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)]"><RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync</button><button onClick={logout} className="flex items-center gap-2 rounded-xl bg-[var(--text-primary)] px-3 py-2 text-xs font-bold text-[var(--page-bg)]"><LogOut size={14} /> Sign out</button></div></header>
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metricCards.map(([label, value, detail]) => <div key={label} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5"><p className="text-xs font-bold text-[var(--text-tertiary)]">{label}</p><p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{value}</p><p className="mt-1 text-xs text-emerald-600">{detail}</p></div>)}</section>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]"><div><div className="flex items-center justify-between"><h2 className="text-lg font-black text-[var(--text-primary)]">Workspace controls</h2><Link href="/" className="text-xs font-bold text-amber-700">Portfolio <ArrowUpRight size={13} className="inline" /></Link></div><div className="mt-3 grid gap-3 sm:grid-cols-2">{routes.map(([label, href, Icon]) => <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 transition hover:-translate-y-0.5 hover:border-amber-500"><span className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)]"><span className="rounded-xl bg-amber-500/10 p-2 text-amber-700"><Icon size={17} /></span>{label}</span><ArrowUpRight size={16} className="text-[var(--text-tertiary)] transition group-hover:text-amber-700" /></Link>)}</div></div><aside className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5"><div className="flex items-center gap-2"><Zap size={17} className="text-amber-600" /><h2 className="text-lg font-black text-[var(--text-primary)]">System status</h2></div><div className="mt-5 space-y-4 text-xs"><p className="flex justify-between"><span className="text-[var(--text-tertiary)]">AI providers</span><strong className="text-emerald-600">{models?.providers?.length || 0} available</strong></p><p className="flex justify-between"><span className="text-[var(--text-tertiary)]">Sheet sync</span><strong className="text-[var(--text-primary)]">{sheetStatus?.status || 'Ready'}</strong></p><p className="flex justify-between"><span className="text-[var(--text-tertiary)]">Tracked days</span><strong className="text-[var(--text-primary)]">{stats?.dailyTracker?.daysTracked || 0}</strong></p><Link href="/admin" className="flex items-center justify-center gap-2 rounded-xl bg-amber-700 py-2.5 font-bold text-white"><FileSpreadsheet size={14} /> Manage data</Link></div></aside></section>
  </div></main>;
}