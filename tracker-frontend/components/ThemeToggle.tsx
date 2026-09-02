'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('app-theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    if (initial === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('app-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-gray-400 hover:text-white dark:hover:text-white bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-amber-500/40 dark:hover:border-indigo-500/40 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
      title={`Switch to ${theme === 'dark' ? 'Claude Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={15} className="text-amber-400" />
          <span className="hidden sm:inline text-[11px] text-gray-300">Light</span>
        </>
      ) : (
        <>
          <Moon size={15} className="text-indigo-600" />
          <span className="hidden sm:inline text-[11px] text-gray-700">Dark</span>
        </>
      )}
    </button>
  );
}
