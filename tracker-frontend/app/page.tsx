'use client';

import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchDsaProgress } from '@/lib/api';
import {
  Youtube,
  BarChart3,
  Briefcase,
  CalendarCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, progressRes] = await Promise.all([
        fetchDashboardStats(),
        fetchDsaProgress(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (progressRes.success) setProgressData(progressRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const applicationChartData = stats
    ? [
        { name: 'Applied', value: stats.applications.byStatus.Applied || 0 },
        { name: 'Interviewing', value: stats.applications.byStatus.Interviewing || 0 },
        { name: 'Offer', value: stats.applications.byStatus.Offer || 0 },
        { name: 'Rejected', value: stats.applications.byStatus.Rejected || 0 },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-slate-800 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Career & Learning Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Aryan!</span> 👋
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Track your daily DSA lectures, problem-solving progress, job application pipeline, and daily work logs all in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Import Excel Data
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: DSA Lectures */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              DSA Lectures
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Youtube className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.dsaLectures.completed || 0}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                / {stats?.dsaLectures.total || 0} Videos
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.dsaLectures.percent || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex justify-between">
              <span>Completion Rate</span>
              <span className="text-indigo-400 font-semibold">{stats?.dsaLectures.percent || 0}%</span>
            </p>
          </div>
        </div>

        {/* Card 2: DSA Problems Solved */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              DSA Problems
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.dsaProgress.solvedProblems || 0}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                / {stats?.dsaProgress.totalProblems || 0} Solved
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.dsaProgress.percent || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex justify-between">
              <span>Overall Coverage</span>
              <span className="text-emerald-400 font-semibold">{stats?.dsaProgress.percent || 0}%</span>
            </p>
          </div>
        </div>

        {/* Card 3: Job Applications */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Job Applications
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.applications.total || 0}
              </span>
              <span className="text-sm text-slate-400 font-medium">Total Applied</span>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="flex-1 bg-slate-800/80 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-400">Interview</p>
                <p className="text-sm font-bold text-indigo-400">
                  {stats?.applications.byStatus.Interviewing || 0}
                </p>
              </div>
              <div className="flex-1 bg-slate-800/80 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-400">Offers</p>
                <p className="text-sm font-bold text-emerald-400">
                  {stats?.applications.byStatus.Offer || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Daily Work Activity */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tracked Days
            </span>
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.dailyTracker.daysTracked || 0}
              </span>
              <span className="text-sm text-slate-400 font-medium">Days Logged</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
              <div className="bg-slate-800/60 py-1.5 rounded-md">
                <p className="text-[10px] text-slate-400">DSA</p>
                <p className="text-xs font-semibold text-indigo-400">
                  {stats?.dailyTracker.dsaDoneDays || 0}d
                </p>
              </div>
              <div className="bg-slate-800/60 py-1.5 rounded-md">
                <p className="text-[10px] text-slate-400">Project</p>
                <p className="text-xs font-semibold text-emerald-400">
                  {stats?.dailyTracker.projectDoneDays || 0}d
                </p>
              </div>
              <div className="bg-slate-800/60 py-1.5 rounded-md">
                <p className="text-[10px] text-slate-400">AI</p>
                <p className="text-xs font-semibold text-amber-400">
                  {stats?.dailyTracker.aiLearningDays || 0}d
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: DSA Category Solved Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                DSA Problems Solved by Category
              </h2>
              <p className="text-xs text-slate-400">Target problem counts across all topics</p>
            </div>
            <Link
              href="/dsa-progress"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View Full Sheet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="topic" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Bar dataKey="problemsSolved" fill="#6366f1" radius={[6, 6, 0, 0]} name="Solved" />
                  <Bar dataKey="totalProblems" fill="#334155" radius={[6, 6, 0, 0]} name="Total Target" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No progress data found. Upload Excel from Admin to populate.
              </div>
            )}
          </div>
        </div>

        {/* Right: Job Application Status Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Application Pipeline
            </h2>
            <p className="text-xs text-slate-400 mb-4">Current application stages breakdown</p>

            <div className="h-52 w-full flex items-center justify-center">
              {stats?.applications.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {applicationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-sm">No application stats logged</div>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {applicationChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
