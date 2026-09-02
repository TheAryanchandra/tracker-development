'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  Flame,
  ListChecks,
  Mic,
  Paperclip,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TimerReset,
  UploadCloud,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { SheetSyncStatus } from '@/components/SheetSyncStatus';

const presets = [15, 25, 50];
const starterTasks = [
  { id: 'dsa', label: 'Solve 2 DSA problems', done: false },
  { id: 'apply', label: 'Send 3 focused applications', done: false },
  { id: 'review', label: 'Review today’s notes', done: true },
];

const defaultStats = {
  daysElapsed: 1, currentDsaStreak: 0, longestDsaStreak: 0, totalAppsLogged: 0,
  interviewsInProgress: 0, offersReceived: 0, solvedDsaProblems: 0, totalDsaProblems: 100,
  overallDsaPercent: 0, dsaLectures: { completed: 0, total: 35 },
  dailyTracker: { daysTracked: 0 },
};

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return <button aria-label={label} title={label} onClick={onClick} className="icon-button">{children}</button>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(defaultStats);
  const [tasks, setTasks] = useState(starterTasks);
  const [newTask, setNewTask] = useState('');
  const [prompt, setPrompt] = useState('');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const refreshStats = () => fetchDashboardStats().then((r) => r?.success && r.data && setStats(r.data)).catch(() => {});
  useWebSocket({ SHEET_SYNCED: refreshStats, DATA_UPDATED: refreshStats, STATS_REFRESH: refreshStats, AI_ACTION: refreshStats });

  useEffect(() => {
    refreshStats();
    try {
      const saved = localStorage.getItem('atlas-checklist');
      if (saved) setTasks(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const updateTasks = (next: typeof tasks) => { setTasks(next); localStorage.setItem('atlas-checklist', JSON.stringify(next)); };
  const completedTasks = tasks.filter((task) => task.done).length;
  const today = useMemo(() => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date()), []);
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const solved = stats?.solvedDsaProblems ?? 0;
  const total = stats?.totalDsaProblems ?? 100;

  const openAssistant = (value?: string, openFile = false) => {
    window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt: value || '', openFile } }));
  };
  const addTask = () => {
    if (!newTask.trim()) return;
    updateTasks([...tasks, { id: `task-${Date.now()}`, label: newTask.trim(), done: false }]);
    setNewTask('');
  };

  return (
    <div className="dashboard-shell animate-fade-up">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow"><span className="live-dot" /> PERSONAL COMMAND CENTER <span className="eyebrow-divider">/</span> DAY {stats?.daysElapsed || 1}</div>
          <h1>{greeting}, Aryan<span className="heading-dot">.</span></h1>
          <p className="header-subtitle">Keep the important things close. I’ll help you turn thoughts into momentum.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-action" onClick={() => window.dispatchEvent(new Event('atlas:open-excel'))}><FileSpreadsheet size={15} /> Upload Excel</button>
          <button className="primary-action" onClick={() => openAssistant()}><Sparkles size={15} /> Open full chat</button>
        </div>
      </header>

      <SheetSyncStatus />

      <section className="capture-card">
        <div className="capture-copy">
          <div className="eyebrow accent-eyebrow"><Sparkles size={13} /> ATLAS IS READY</div>
          <h2>What’s on your mind?</h2>
          <p>Capture a thought, ask a question, or tell me what to remember. I’ll search your memory and the web when it helps.</p>
          <div className="status-row"><span><Brain size={13} /> Memory on</span><span><Wifi size={13} /> Web search ready</span><span><Volume2 size={13} /> Voice replies</span></div>
        </div>
        <div className="capture-input-wrap">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); openAssistant(prompt); setPrompt(''); } }} placeholder="Try “remember that…” or ask anything" rows={2} />
          <div className="capture-controls"><div className="capture-tools"><IconButton label="Attach a file" onClick={() => openAssistant('', true)}><Paperclip size={17} /></IconButton><IconButton label="Talk to Atlas" onClick={() => openAssistant()}><Mic size={17} /></IconButton></div><button className="send-action" aria-label="Send to Atlas" onClick={() => { openAssistant(prompt); setPrompt(''); }}><Send size={16} /> <span>Send to Atlas</span></button></div>
        </div>
        <div className="prompt-row"><span>Try asking</span>{['Remember my next idea', 'What should I focus on?', 'Find me new roles'].map((item) => <button key={item} onClick={() => { setPrompt(item); openAssistant(item); }}>{item}<ArrowUpRight size={12} /></button>)}</div>
      </section>

      <div className="dashboard-grid">
        <main className="today-column">
          <div className="section-heading"><div><div className="eyebrow">TODAY</div><h2>Your day, in view</h2></div><div className="date-chip"><CalendarDays size={14} /> {today}</div></div>

          <section className="timer-card">
            <div className="timer-top"><div><div className="eyebrow accent-eyebrow"><Target size={13} /> FOCUS SESSION</div><h3>{running ? 'Deep work in progress' : seconds === 0 ? 'Session complete' : 'Make space for one thing'}</h3></div><TimerReset size={22} className="timer-mark" /></div>
            <div className="timer-display">{formatTime(seconds)}</div>
            <div className="timer-actions"><button className="timer-main" onClick={() => setRunning(!running)}>{running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause timer' : 'Start timer'}</button><IconButton label="Reset timer" onClick={() => { setRunning(false); setSeconds(25 * 60); }}><RotateCcw size={16} /></IconButton></div>
            <div className="preset-row">{presets.map((preset) => <button key={preset} className={seconds === preset * 60 ? 'active' : ''} onClick={() => { setRunning(false); setSeconds(preset * 60); }}>{preset} min</button>)}</div>
          </section>

          <section className="panel-card checklist-card"><div className="card-heading"><div><div className="eyebrow">KEEP MOVING</div><h3>Today’s priorities</h3></div><span className="progress-count">{completedTasks}/{tasks.length}</span></div><div className="progress-track"><span style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} /></div><div className="task-list">{tasks.map((task) => <button className={`task-row ${task.done ? 'done' : ''}`} key={task.id} onClick={() => updateTasks(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}><span className="check-box">{task.done && <Check size={13} />}</span><span>{task.label}</span></button>)}</div><div className="add-task"><input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Add a priority for today…" /><button onClick={addTask} aria-label="Add priority"><Plus size={16} /></button></div></section>

          <section className="panel-card reminder-card"><div className="card-heading"><div><div className="eyebrow">UP NEXT</div><h3>Reminders</h3></div><Clock3 size={19} className="muted-icon" /></div><div className="reminder-row"><span className="reminder-time">18:30</span><span className="reminder-dot orange" /><div><strong>Evening review</strong><small>Close loops and capture loose thoughts</small></div></div><div className="reminder-row"><span className="reminder-time">Tomorrow</span><span className="reminder-dot blue" /><div><strong>Keep applications moving</strong><small>{stats?.totalAppsLogged || 0} tracked so far</small></div></div></section>
        </main>

        <aside className="memory-column">
          <section className="panel-card memory-card"><div className="card-heading"><div><div className="eyebrow accent-eyebrow"><Brain size={13} /> YOUR MEMORY</div><h3>A little context goes a long way.</h3></div><span className="memory-pulse" /></div><p className="memory-intro">Atlas keeps your notes, decisions, and progress connected so you can pick up where you left off.</p><div className="memory-stats"><div><strong>{stats?.dailyTracker?.daysTracked || 0}</strong><span>daily logs</span></div><div><strong>{stats?.totalAppsLogged || 0}</strong><span>applications</span></div><div><strong>{solved}</strong><span>DSA solved</span></div></div><div className="memory-items"><div><span className="memory-icon"><Sparkles size={14} /></span><p><strong>Recent activity</strong><small>Ask Atlas to surface your latest notes</small></p><ChevronRight size={15} /></div><div><span className="memory-icon"><ListChecks size={14} /></span><p><strong>Daily log connected</strong><small>{stats?.dailyTracker?.daysTracked || 0} days tracked in your workspace</small></p><ChevronRight size={15} /></div></div><button className="text-action" onClick={() => openAssistant('Show me what you remember about my recent goals')}>Explore my memory <ArrowUpRight size={14} /></button></section>

          <section className="panel-card signals-card"><div className="card-heading"><div><div className="eyebrow">TRACKER SIGNALS</div><h3>Small steps, visible</h3></div><Flame size={18} className="orange-icon" /></div><div className="signal"><div className="signal-label"><span>DSA progress</span><strong>{stats?.overallDsaPercent || 0}%</strong></div><div className="signal-track"><span style={{ width: `${stats?.overallDsaPercent || 0}%` }} /></div><small>{solved} of {total} problems solved</small></div><div className="signal-grid"><div><strong>{stats?.currentDsaStreak || 0}</strong><small>day streak</small></div><div><strong>{stats?.interviewsInProgress || 0}</strong><small>interviews</small></div><div><strong>{stats?.offersReceived || 0}</strong><small>offers</small></div></div></section>

          <section className="career-pulse"><div><div className="eyebrow">CAREER PULSE</div><h3>Keep the pipeline warm.</h3><p>Review your applications and make the next thoughtful move.</p></div><a href="/applications" aria-label="Open applications"><ArrowUpRight size={18} /></a></section>
        </aside>
      </div>
    </div>
  );
}
