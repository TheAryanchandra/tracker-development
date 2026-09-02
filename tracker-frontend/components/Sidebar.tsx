'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Youtube,
  CalendarCheck,
  BarChart3,
  Briefcase,
  UploadCloud,
  Zap,
  BriefcaseBusiness,
} from 'lucide-react';
import { ExcelUploadModal } from './ExcelUploadModal';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Dashboard',    href: '/',             icon: LayoutDashboard },
  { label: 'DSA Lectures', href: '/dsa-lectures', icon: Youtube },
  { label: 'Daily Log',    href: '/daily-tracker', icon: CalendarCheck },
  { label: 'DSA Progress', href: '/dsa-progress', icon: BarChart3 },
  { label: 'Applications', href: '/applications', icon: Briefcase },
  { label: 'Jobs',         href: '/jobs',          icon: BriefcaseBusiness },
  { label: 'Admin',        href: '/admin',         icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [excelOpen, setExcelOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className="desktop-sidebar border-r border-black/[0.08] dark:border-white/[0.06] bg-[var(--sidebar-bg)] transition-colors duration-200"
        style={{
          width: 220,
          minHeight: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.06]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-600 to-indigo-600 shadow-md">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[var(--text-primary)] tracking-tight leading-none">
                  Daily Tracker
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] font-medium mt-0.5">
                  Aryan Chandra
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={() => setExcelOpen(true)}
            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/10 dark:bg-indigo-500/10 border border-amber-500/20 dark:border-indigo-500/20 text-amber-700 dark:text-indigo-400 text-xs font-semibold hover:bg-amber-500/20 dark:hover:bg-indigo-500/20 transition flex items-center justify-center gap-1.5"
          >
            <UploadCloud size={13} /> Sync Excel Sheet
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 no-underline ${
                  active
                    ? 'bg-amber-500/15 dark:bg-indigo-500/15 text-amber-800 dark:text-indigo-300 border border-amber-500/20 dark:border-indigo-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-black/[0.08] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              MongoDB Live
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ───────────────────────── */}
      <nav className="mobile-nav flex items-center justify-around border-t border-black/[0.08] dark:border-white/[0.08] bg-[var(--sidebar-bg)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-1 text-[10px] font-bold no-underline transition ${
                active
                  ? 'text-amber-700 dark:text-indigo-400'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <div className="p-1">
          <ThemeToggle />
        </div>
      </nav>

      <ExcelUploadModal
        isOpen={excelOpen}
        onClose={() => setExcelOpen(false)}
        onSuccess={() => setExcelOpen(false)}
      />
    </>
  );
}
