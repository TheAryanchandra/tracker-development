'use client';

import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '@/lib/api';
import {
  Flame,
  Briefcase,
  Trophy,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'https://tracker-backend-rnec.onrender.com/api';
  }
  return 'http://127.0.0.1:5000/api';
};

const API = getBaseUrl();

interface MetricWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeType?: 'green' | 'blue' | 'indigo' | 'orange' | 'purple';
  icon: React.ReactNode;
  iconBg: string;
}

function MetricWidget({
  title,
  value,
  subtitle,
  badge,
  badgeType = 'indigo',
  icon,
  iconBg,
}: MetricWidgetProps) {
  const badgeClasses = {
    green: 'badge-green',
    blue: 'badge-blue',
    indigo: 'badge-indigo',
    orange: 'badge-orange',
    purple: 'badge-purple',
  }[badgeType];

  return (
    <div className="apple-card p-5 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center transition group-hover:scale-105"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none">
          {value}
        </div>
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <span className="text-[11px] text-[var(--text-tertiary)] font-medium">{subtitle}</span>
          )}
          {badge && (
            <span className={`apple-badge ${badgeClasses}`}>{badge}</span>
          )}
        </div>
      </div>
    </div>
  );
}

const defaultStats = {
  startDate: '31-Aug-2026',
  daysElapsed: 1,
  currentDsaStreak: 0,
  longestDsaStreak: 0,
  totalAppsLogged: 0,
  avgAppsPerLoggedDay: 0.0,
  interviewsInProgress: 0,
  offersReceived: 0,
  solvedDsaProblems: 0,
  totalDsaProblems: 100,
  overallDsaPercent: 0,
  dsaLectures: { total: 35, completed: 0, percent: 0 },
  applications: {
    total: 0,
    byStatus: { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 },
  },
  dailyTracker: {
    daysTracked: 0,
    dsaDoneDays: 0,
    projectDoneDays: 0,
    aiLearningDays: 0,
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(defaultStats);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    fetchDashboardStats()
      .then((r) => {
        if (r?.success && r.data) {
          setStats(r.data);
        }
      })
      .catch(() => {});

    setLoadingJobs(true);
    fetch(`${API}/notifications/jobs?limit=4`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setJobs(data.data?.slice(0, 4) || []);
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  const appFunnel = [
    { name: 'Applied', count: stats?.applications?.byStatus?.Applied || 0, color: '#3b82f6' },
    { name: 'Interview', count: stats?.interviewsInProgress || 0, color: '#a855f7' },
    { name: 'Offer', count: stats?.offersReceived || 0, color: '#22c55e' },
    { name: 'Rejected', count: stats?.applications?.byStatus?.Rejected || 0, color: '#ef4444' },
  ];

  const solvedCount = stats?.solvedDsaProblems ?? stats?.solvedProblems ?? stats?.dsaProgress?.solvedProblems ?? 0;
  const totalCount = stats?.totalDsaProblems ?? stats?.totalProblems ?? stats?.dsaProgress?.totalProblems ?? 100;

  const dsaRing = [
    { name: 'Solved', value: solvedCount, color: '#da7756' },
    {
      name: 'Remaining',
      value: Math.max(totalCount - solvedCount, 0),
      color: 'rgba(150, 150, 150, 0.15)',
    },
  ];

  const quickNav = [
    {
      title: 'DSA Lectures',
      meta: `${stats?.dsaLectures?.completed || 0} / ${stats?.dsaLectures?.total || 35} Done`,
      href: '/dsa-lectures',
      gradient: 'linear-gradient(135deg, rgba(218, 119, 86, 0.12), rgba(218, 119, 86, 0.03))',
      border: 'rgba(218, 119, 86, 0.25)',
      accent: '#da7756',
    },
    {
      title: 'Daily Log',
      meta: `${stats?.dailyTracker?.daysTracked || 0} Logs Tracked`,
      href: '/daily-tracker',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.03))',
      border: 'rgba(168, 85, 247, 0.25)',
      accent: '#a855f7',
    },
    {
      title: 'DSA Progress',
      meta: `${stats?.overallDsaPercent || 0}% Completed`,
      href: '/dsa-progress',
      gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.03))',
      border: 'rgba(34, 197, 94, 0.25)',
      accent: '#22c55e',
    },
    {
      title: 'Applications',
      meta: `${stats?.totalAppsLogged || 0} Jobs Logged`,
      href: '/applications',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.03))',
      border: 'rgba(59, 130, 246, 0.25)',
      accent: '#3b82f6',
    },
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }} className="space-y-6 animate-fade-up">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">
              Overview
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
              <Sparkles size={11} /> Day {stats?.daysElapsed || 1}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Welcome back, Aryan
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="apple-card-flat px-3.5 py-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DB Synchronized</span>
          </div>
        </div>
      </div>

      {/* ── Hero Activity Bento Card ──────────────────────────── */}
      <div className="apple-card p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Hero Content */}
          <div className="space-y-2 max-w-lg">
            <div className="apple-badge badge-orange font-semibold">
              <Flame size={12} /> Active DSA Streak
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter">
                {stats?.currentDsaStreak || 0}
              </span>
              <span className="text-lg text-[var(--text-secondary)] font-medium">
                Days in a row
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              All-time record is{' '}
              <span className="text-[var(--text-primary)] font-semibold">
                {stats?.longestDsaStreak || 0} days
              </span>
              . Consistent problem solving and daily logging keeps the streak alive.
            </p>
          </div>

          {/* Right Quick Summary Numbers */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--card-border)]">
            <div className="text-center px-3 py-2">
              <div className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">
                {stats?.totalAppsLogged || 0}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5 uppercase tracking-wider">
                Apps
              </div>
            </div>
            <div className="text-center px-3 py-2 border-x border-[var(--card-border)]">
              <div className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400">
                {stats?.interviewsInProgress || 0}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5 uppercase tracking-wider">
                Interviews
              </div>
            </div>
            <div className="text-center px-3 py-2">
              <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats?.overallDsaPercent || 0}%
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5 uppercase tracking-wider">
                DSA Done
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Modular Metric Bento Cards ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricWidget
          title="DSA Solved"
          value={solvedCount}
          subtitle={`Goal: ${totalCount}`}
          badge={`${stats?.overallDsaPercent || 0}%`}
          badgeType="indigo"
          icon={<Zap size={15} className="text-amber-700 dark:text-indigo-400" />}
          iconBg="rgba(218, 119, 86, 0.15)"
        />

        <MetricWidget
          title="Applications"
          value={stats?.totalAppsLogged || 0}
          subtitle="Pipeline count"
          badge="Active"
          badgeType="blue"
          icon={<Briefcase size={15} className="text-blue-600 dark:text-blue-400" />}
          iconBg="rgba(59, 130, 246, 0.15)"
        />

        <MetricWidget
          title="Daily Apps Pace"
          value={stats?.avgAppsPerLoggedDay || '0.0'}
          subtitle="Avg/Day"
          badge="Target: 5"
          badgeType="green"
          icon={<TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />}
          iconBg="rgba(34, 197, 94, 0.15)"
        />

        <MetricWidget
          title="Interviews Active"
          value={stats?.interviewsInProgress || 0}
          subtitle={`${stats?.offersReceived || 0} Offers`}
          badge="Pipeline"
          badgeType="purple"
          icon={<Trophy size={15} className="text-purple-600 dark:text-purple-400" />}
          iconBg="rgba(168, 85, 247, 0.15)"
        />
      </div>

      {/* ── 2 Chart Bento Visualizations ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Application Stage Funnel */}
        <div className="lg:col-span-2 apple-card p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Application Pipeline Funnel
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Distribution across recruitment stages
              </p>
            </div>
            <span className="apple-badge badge-blue">
              {stats?.totalAppsLogged || 0} Total Logged
            </span>
          </div>

          <div style={{ height: 160 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appFunnel} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-tertiary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--text-tertiary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(150, 150, 150, 0.06)' }}
                  contentStyle={{
                    background: 'var(--modal-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 2, 2]}>
                  {appFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSA Target Radial */}
        <div className="apple-card p-5 md:p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              DSA Target
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Completion ratio</p>
          </div>

          <div className="relative w-32 h-32 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dsaRing}
                  innerRadius={46}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dsaRing.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {stats?.overallDsaPercent || 0}%
              </span>
              <span className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase">
                Solved
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-[var(--card-border)] text-xs">
            <div>
              <div className="font-bold text-amber-700 dark:text-indigo-400">
                {stats?.solvedDsaProblems || 0}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Solved</div>
            </div>
            <div>
              <div className="font-bold text-[var(--text-secondary)]">
                {Math.max(
                  (stats?.totalDsaProblems || 0) - (stats?.solvedDsaProblems || 0),
                  0
                )}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Navigation Bento ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickNav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="apple-card p-4 flex items-center justify-between group no-underline"
            style={{
              background: item.gradient,
              borderColor: item.border,
            }}
          >
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-800 dark:group-hover:text-gray-200 transition">
                {item.title}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.meta}</div>
            </div>
            <ChevronRight
              size={14}
              className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition duration-150"
            />
          </a>
        ))}
      </div>

      {/* ── Live Global Job Feed Widget ───────────────────────── */}
      <div className="apple-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Compass size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Live Tech Job Openings
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Synced from RemoteOK, Remotive & Arbeitnow
              </p>
            </div>
          </div>

          <a
            href="/jobs"
            className="apple-badge badge-indigo hover:opacity-80 transition flex items-center gap-1 font-semibold"
          >
            Explore all <ArrowUpRight size={11} />
          </a>
        </div>

        {/* Job Rows */}
        <div className="space-y-2">
          {loadingJobs &&
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-2xl" />
              ))}

          {!loadingJobs && jobs.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
              No jobs cached yet. Tap Jarvis and say &quot;Find me software engineer jobs&quot;!
            </div>
          )}

          {!loadingJobs &&
            jobs.map((job, idx) => (
              <a
                key={idx}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--card-border)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition group no-underline"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-700 dark:group-hover:text-indigo-300 transition truncate">
                    {job.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                    {job.company} · {job.location || 'Remote'}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="apple-badge badge-dim text-[10px]">
                    {job.source}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
