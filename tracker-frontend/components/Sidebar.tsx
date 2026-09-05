'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Youtube,
  CalendarCheck,
  BarChart3,
  Briefcase,
  UploadCloud,
  Zap,
  BriefcaseBusiness,
  Menu,
  X,
} from 'lucide-react';
import { ExcelUploadModal } from './ExcelUploadModal';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Dashboard',    href: '/',             icon: LayoutDashboard },
  { label: 'DSA Progress', href: '/dsa-progress', icon: BarChart3 },
  { label: 'Daily Log',    href: '/daily-tracker', icon: CalendarCheck },
  { label: 'DSA Lectures', href: '/dsa-lectures', icon: Youtube },
  { label: 'Applications', href: '/applications', icon: Briefcase },
  { label: 'Jobs',         href: '/jobs',          icon: BriefcaseBusiness },
  { label: 'Admin',        href: '/admin',         icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [excelOpen, setExcelOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const open = () => setExcelOpen(true);
    window.addEventListener('atlas:open-excel', open);
    return () => window.removeEventListener('atlas:open-excel', open);
  }, []);

  useEffect(() => {
    const openMobile = () => setMobileOpen(true);
    window.addEventListener('atlas:open-mobile-menu', openMobile);
    return () => window.removeEventListener('atlas:open-mobile-menu', openMobile);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar (Active on tracker routes) ─────────────────────────── */}
      {!isHome && (
        <aside
          className="desktop-sidebar border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] transition-colors duration-200"
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
          <div className="p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-800 shadow-md">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[var(--text-primary)] tracking-tight leading-none">
                    Aryan Tracker
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
              className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                      ? 'bg-amber-600/15 text-amber-800 dark:text-amber-300 border border-amber-600/25 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                MongoDB Live
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Full navigation drawer for mobile screens */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`mobile-drawer ${mobileOpen ? 'is-open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mobile-drawer-head">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-800 shadow-md">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--text-primary)]">Aryan Tracker</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Your command center</div>
            </div>
          </div>
          <button className="mobile-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="mobile-drawer-label">Workspace &amp; Tracker</div>
        <nav className="mobile-drawer-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? 0 : -1}
                className={`mobile-drawer-link ${active ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <span className="mobile-drawer-active-dot" />}
              </Link>
            );
          })}
        </nav>
        <div className="mobile-drawer-footer">
          <button
            onClick={() => { setMobileOpen(false); setExcelOpen(true); }}
            className="mobile-drawer-sync"
          >
            <UploadCloud size={16} /> Sync Excel Sheet
          </button>
          <div className="mobile-drawer-settings">
            <span><i /> MongoDB Live</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (Always visible on mobile) ───────────────────────── */}
      <nav className="mobile-nav flex items-center justify-around border-t border-[var(--card-border)] bg-[var(--sidebar-bg)] z-50">
        {[
          { label: 'Home',     href: '/',             icon: LayoutDashboard },
          { label: 'Progress', href: '/dsa-progress', icon: BarChart3 },
          { label: 'Daily',    href: '/daily-tracker', icon: CalendarCheck },
          { label: 'Lectures', href: '/dsa-lectures', icon: Youtube },
          { label: 'Apps',     href: '/applications', icon: Briefcase },
        ].map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-1 text-[10px] font-bold no-underline transition ${
                active
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open full navigation"
          aria-expanded={mobileOpen}
        >
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>

      <ExcelUploadModal
        isOpen={excelOpen}
        onClose={() => setExcelOpen(false)}
        onSuccess={() => setExcelOpen(false)}
      />
    </>
  );
}
