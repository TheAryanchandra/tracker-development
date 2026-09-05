'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShieldCheck, FileSpreadsheet, Menu, BarChart3, CalendarCheck, Home } from 'lucide-react';
import { ExcelUploadModal } from './ExcelUploadModal';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const isHome = pathname === '/';

  if (isHome) return null;

  return (
    <>
      <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-2xl bg-[var(--modal-bg)] border-b border-[var(--card-border)] transition-colors duration-300">
        {/* Mobile Menu Trigger & Brand / Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => window.dispatchEvent(new Event('atlas:open-mobile-menu'))}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-primary)] hover:border-amber-500 transition flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <Link href="/" className="md:hidden flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white font-extrabold flex items-center justify-center text-xs shadow-md">
              AC
            </span>
          </Link>

          <div className="relative hidden sm:block w-48 md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search tracker, topics, jobs..."
              className="w-full text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] pl-8 pr-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] focus:outline-none focus:border-amber-600 dark:focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Header Actions & Quick Route Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Portfolio Home</span>
          </Link>

          <Link
            href="/dsa-progress"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              pathname === '/dsa-progress'
                ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-600/30'
                : 'bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>DSA Progress</span>
          </Link>

          <Link
            href="/daily-tracker"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              pathname === '/daily-tracker'
                ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-600/30'
                : 'bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Daily Log</span>
          </Link>

          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 dark:bg-amber-600 hover:opacity-90 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload Excel</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Atlas Live</span>
          </div>

          <ThemeToggle />

          <div className="flex items-center gap-2 pl-2 border-l border-[var(--card-border)]">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              A
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Aryan</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Admin</p>
            </div>
          </div>
        </div>
      </header>

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => {
          setIsExcelModalOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}

