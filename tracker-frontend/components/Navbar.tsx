'use client';

import React, { useState } from 'react';
import { Search, User, ShieldCheck, FileSpreadsheet, Sparkles } from 'lucide-react';
import { ExcelUploadModal } from './ExcelUploadModal';

export default function Navbar() {
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 glass-card border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xl backdrop-blur-xl">
        {/* Title / Search */}
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lectures, topics, applications..."
              className="w-full glass-input text-xs text-white placeholder-gray-400 pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 border border-emerald-400/30 transition duration-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sync Excel Sheet</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Live DB Connected</span>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 text-white font-bold text-xs shadow-md">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">Aryan Chandra</p>
              <p className="text-[10px] text-gray-400">Daily Tracker Admin</p>
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
