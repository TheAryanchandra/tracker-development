'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Youtube,
  CalendarCheck,
  BarChart3,
  Briefcase,
  UploadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'DSA Lectures', href: '/dsa-lectures', icon: Youtube },
  { label: 'Daily Tracker', href: '/daily-tracker', icon: CalendarCheck },
  { label: 'DSA Progress', href: '/dsa-progress', icon: BarChart3 },
  { label: 'Application Tracker', href: '/applications', icon: Briefcase },
  { label: 'Admin & Excel Hub', href: '/admin', icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel flex flex-col justify-between border-r border-slate-800/80 min-h-screen p-4 sticky top-0 h-screen z-30">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              DAILY TRACKER
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Pro Career Suite</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300">MongoDB Atlas Connected</span>
        </div>
        <p className="text-[11px] text-slate-500">Node/Express Backend v1.0</p>
      </div>
    </aside>
  );
}
