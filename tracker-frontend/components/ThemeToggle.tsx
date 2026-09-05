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
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'light'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={15} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon size={15} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
