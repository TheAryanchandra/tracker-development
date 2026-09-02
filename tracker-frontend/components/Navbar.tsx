'use client';

import { Bell, Search, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search lectures, topics, applications..."
          className="w-full bg-slate-900/80 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Sync Ready</span>
        </div>

        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition relative">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-semibold text-xs">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">Aryan Chandra</p>
            <p className="text-[10px] text-slate-400">Software Developer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
