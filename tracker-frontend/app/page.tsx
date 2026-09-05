'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, BrainCircuit, ChevronRight, Cloud, Code2, Database, FileSpreadsheet, Github, Globe2, Linkedin, MapPin, Sparkles, Terminal, Zap } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { SheetSyncStatus } from '@/components/SheetSyncStatus';
import ThemeToggle from '@/components/ThemeToggle';

const defaultStats = { solvedDsaProblems: 0, totalDsaProblems: 100, totalAppsLogged: 0, currentDsaStreak: 0, overallDsaPercent: 0, dailyTracker: { daysTracked: 0 } };

const projects = [
  { number: '01', title: 'Stadium Pulse', type: 'Agentic crowd intelligence', description: 'A multi-agent system that turns live stadium signals into fast, structured insights for real-time pattern detection.', stack: ['Python', 'LangGraph', 'Gemini', 'Cloud Run'], href: 'https://github.com/TheAryanchandra/agentic-premier-league', icon: Globe2 },
  { number: '02', title: 'AI Engineering Knowledge Copilot', type: 'Enterprise retrieval platform', description: 'A secure, event-driven RAG platform that makes internal engineering knowledge searchable, grounded, and useful at scale.', stack: ['Java 21', 'Spring AI', 'Kafka', 'Qdrant'], href: 'https://github.com/TheAryanchandra/AI-Copilot', icon: BrainCircuit },
];

const capabilities = [
  { label: 'Build', icon: Code2, items: 'TypeScript · React · Next.js · Redux' },
  { label: 'Scale', icon: Database, items: 'Node.js · Java · Spring Boot · REST · WebSockets' },
  { label: 'Ship', icon: Cloud, items: 'AWS · Cloud Run · Docker · GitHub Actions' },
  { label: 'Think', icon: BrainCircuit, items: 'RAG · LangGraph · Qdrant · XGBoost' },
];

export default function PortfolioPage() {
  const [stats, setStats] = useState<any>(defaultStats);
  const refreshStats = () => fetchDashboardStats().then((r) => r?.success && r.data && setStats(r.data)).catch(() => {});
  useWebSocket({ SHEET_SYNCED: refreshStats, DATA_UPDATED: refreshStats, STATS_REFRESH: refreshStats, AI_ACTION: refreshStats });
  useEffect(() => { refreshStats(); }, []);

  const openAssistant = (prompt = '') => window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt } }));
  const openExcel = () => window.dispatchEvent(new Event('atlas:open-excel'));

  return (
    <div className="portfolio-page">
      <nav className="portfolio-nav" aria-label="Portfolio navigation">
        <a className="portfolio-mark" href="#top"><span>AC</span><strong>Aryan Chandra</strong></a>
        <div className="portfolio-links"><a href="#work">Work</a><a href="#experience">Experience</a><a href="#stack">Stack</a></div>
        <div className="portfolio-nav-actions"><a className="nav-system-link" href="#system"><Terminal size={15} /> System <ArrowUpRight size={13} /></a><ThemeToggle /></div>
      </nav>

      <header className="portfolio-hero" id="top">
        <div className="hero-copy">
          <div className="portfolio-kicker"><span className="live-dot" /> SOFTWARE ENGINEER / 2026</div>
          <h1>Software engineer<br /><em>building systems</em><br />that think &amp; scale.</h1>
          <p className="hero-lede">I design resilient products at the intersection of full-stack engineering, backend systems, and applied AI.</p>
          <div className="hero-meta"><span><MapPin size={14} /> New Delhi, India</span><span className="availability"><i /> Open to opportunities</span></div>
          <div className="hero-actions"><a className="button-primary" href="mailto:aryanchandra3456@gmail.com">Let&apos;s connect <ArrowUpRight size={16} /></a><a className="button-quiet" href="https://www.linkedin.com/in/thearyanchandra/" target="_blank" rel="noreferrer">View profile <ArrowUpRight size={15} /></a></div>
          <div className="social-links"><a href="https://github.com/TheAryanchandra" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a><a href="https://www.linkedin.com/in/thearyanchandra/" target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a></div>
        </div>
        <div className="hero-aside"><div className="hero-aside-label">CURRENTLY BUILDING</div><div className="signal-line"><span className="signal-node" /><span /><span className="signal-node" /></div><div className="hero-aside-title">A personal operating<br />system for growth.</div><p>This site is both my portfolio and my private tracker — connected to live progress, applications, and an AI copilot.</p><div className="live-metric"><span>LIVE SYSTEM SIGNAL</span><strong>{stats?.overallDsaPercent || 0}<small>%</small></strong><b>DSA progress</b></div></div>
      </header>

      <SheetSyncStatus />

      <section className="portfolio-section work-section" id="work"><div className="section-intro"><div className="portfolio-kicker">SELECTED WORK <span>/ 02</span></div><h2>Things I&apos;ve<br /><em>made useful.</em></h2></div><div className="project-list">{projects.map((project) => { const Icon = project.icon; return <a className="project-card" href={project.href} target="_blank" rel="noreferrer" key={project.title}><div className="project-top"><span className="project-number">{project.number}</span><Icon size={23} strokeWidth={1.5} /><ArrowUpRight className="project-arrow" size={18} /></div><div><div className="project-type">{project.type}</div><h3>{project.title}</h3><p>{project.description}</p><div className="stack-badges">{project.stack.map((item) => <span key={item}>{item}</span>)}</div></div><span className="project-link">View on GitHub <ArrowUpRight size={14} /></span></a> })}</div></section>

      <section className="portfolio-section experience-section" id="experience"><div className="section-label">EXPERIENCE <span>/ WHERE I&apos;VE LEARNED TO SHIP</span></div><div className="experience-list"><article className="experience-item"><div className="experience-date">SEP 2024 — NOW</div><div><h3>Ta Rule Technology <span>· Software Engineer</span></h3><p>Architecting a production MERN healthcare commerce platform across payments, inventory, and internal systems.</p><div className="experience-stats"><strong>50K+ <small>daily transactions</small></strong><strong>99.9% <small>uptime</small></strong><strong>30% <small>latency cut</small></strong></div></div></article><article className="experience-item"><div className="experience-date">JUN 2024 — AUG 2024</div><div><h3>Indian Oil Corporation <span>· Software Engineer Intern</span></h3><p>Built forecasting and monitoring systems that helped operational teams see anomalies sooner and act with confidence.</p><div className="experience-stats"><strong>85% <small>forecast accuracy</small></strong><strong>70% <small>latency cut</small></strong></div></div></article></div></section>

      <section className="portfolio-section stack-section" id="stack"><div className="section-intro compact"><div className="portfolio-kicker">CAPABILITIES <span>/ THE TOOLKIT</span></div><h2>Curious by default.<br /><em>Precise by practice.</em></h2></div><div className="capability-grid">{capabilities.map(({ label, icon: Icon, items }) => <div className="capability" key={label}><Icon size={19} /><span>{label}</span><p>{items}</p></div>)}</div></section>

      <section className="system-panel" id="system"><div><div className="portfolio-kicker"><Zap size={13} /> PRIVATE SYSTEM / LIVE</div><h2>Track the work<br /><em>behind the work.</em></h2><p>My personal dashboard keeps the long game visible. Jarvis can turn a sentence into a task, then n8n can carry it into reminders, email, calendar, or reports.</p></div><div className="system-actions"><a href="/dsa-progress"><span>DSA progress</span><strong>{stats?.solvedDsaProblems || 0}<small> / {stats?.totalDsaProblems || 100} solved</small></strong><ChevronRight size={16} /></a><a href="/applications"><span>Applications</span><strong>{stats?.totalAppsLogged || 0}<small> tracked</small></strong><ChevronRight size={16} /></a><button onClick={() => openAssistant('Create a task for me and trigger my automation workflow: ')}><span>Automations</span><strong><Zap size={16} /> Run with n8n</strong><ChevronRight size={16} /></button><button onClick={() => openAssistant('Give me a concise review of my current progress')}><span>Ask Jarvis</span><strong><Sparkles size={16} /> Open copilot</strong><ChevronRight size={16} /></button><button onClick={openExcel}><span>Data layer</span><strong><FileSpreadsheet size={15} /> Sync Excel</strong><ChevronRight size={16} /></button></div></section>

      <footer className="portfolio-footer"><div><span className="footer-mark">AC</span><p>Building with intention.<br />Learning in public.</p></div><a className="footer-contact" href="mailto:aryanchandra3456@gmail.com">Have a hard problem?<br /><strong>Let&apos;s talk <ArrowUpRight size={16} /></strong></a><span className="footer-note">© 2026 Aryan Chandra</span></footer>
    </div>
  );
}
