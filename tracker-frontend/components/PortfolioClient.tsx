'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowUpRight, Bot, BrainCircuit, Check, CheckCircle2,
  ChevronRight, Code2, Copy, Cpu, Database, Download, ExternalLink,
  FileCheck, FileText, Gauge, Github, GraduationCap, Layers,
  Linkedin, Mail, MapPin, Network, Phone, Printer, Rocket,
  Server, ShieldCheck, Smartphone, Sparkles, Terminal, Trophy,
  Users, Workflow, X, Zap,
} from 'lucide-react';
import { fetchDashboardStats, fetchIotDevices, fetchPortfolio, submitContactForm } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import ThemeToggle from '@/components/ThemeToggle';
import AiVoiceAssistant from '@/components/AiVoiceAssistant';

const FONOFY_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN';

const DEFAULT_MOBILE_APPS = [
  {
    name: 'Fonofy Partners',
    tagline: 'Refurbished Device Commerce & Trade-In Platform',
    platform: 'Android — Google Play Store',
    downloads: '10,000+',
    rating: '4.8 ★',
    description: 'Full-featured B2B merchant app for device diagnostic evaluation, automated trade-in grading, live dynamic pricing, and order fulfillment. Powers a nationwide refurbished electronics supply chain.',
    storeUrl: FONOFY_PLAY_STORE_URL,
    tech: ['React Native', 'Node.js', 'MongoDB', 'REST APIs'],
    highlights: ['10,000+ Play Store Downloads', 'Automated Device Diagnostics', 'Live Trade-In Pricing Engine'],
    isLive: true,
    isFlagship: true,
  },
  {
    name: 'Golf Federation',
    tagline: 'Golf Tournament & League Management System',
    platform: 'iOS & Android',
    downloads: '5,000+',
    rating: '4.9 ★',
    description: 'Real-time golf tournament scoring, handicap calculations, live leaderboard tracking, and professional member profiles used by clubs and federations.',
    storeUrl: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',

    tech: ['React Native', 'Spring Boot', 'PostgreSQL', 'WebSocket'],
    highlights: ['Live Tournament Leaderboards', 'Handicap Management', 'Club Member Profiles'],
    isLive: true,
    isFlagship: false,
  },
  {
    name: 'Carenzy',
    tagline: 'Personalized Healthcare & Caregiver Booking',
    platform: 'Android',
    downloads: '2,000+',
    rating: '4.7 ★',
    description: 'On-demand caregiver dispatch, real-time medical vitals telemetry, appointment scheduling, and patient health timeline management platform.',
    storeUrl: 'https://carenzy.com',
    tech: ['React Native', 'Node.js', 'Firebase', 'GCP'],
    highlights: ['Caregiver Dispatch Pipeline', 'Vitals Telemetry', 'Patient Health Timeline'],
    isLive: true,
    isFlagship: false,
  },
];

const DEFAULT_PROJECTS = [
  {
    number: '01',
    title: 'Enterprise RAG Knowledge Copilot',
    type: 'Distributed Backend / Enterprise AI',
    description: 'Enterprise knowledge retrieval platform built with Java 21 virtual threads, Spring Boot 3, and Spring AI. JWT-secured RBAC API gateway + Kafka event ingestion pipeline + Qdrant hybrid vector search (dense HNSW + BM25 lexical). Achieved sub-200ms P95 latency at enterprise scale.',
    stack: ['Java 21', 'Spring Boot 3', 'Spring AI', 'Apache Kafka', 'Qdrant Vector DB', 'PostgreSQL', 'Redis', 'Docker'],
    href: 'https://github.com/TheAryanchandra/AI-Copilot',
    metrics: ['Sub-200ms P95', 'Kafka Event Stream', 'BM25 + HNSW Hybrid Search', 'JWT + RBAC Gateway'],
    icon: BrainCircuit,
  },
  {
    number: '02',
    title: 'Stadium Pulse — Crowd Intelligence',
    type: 'Agentic AI / Google Cloud Premier League',
    description: 'Agentic crowd-intelligence system in Python with LangGraph multi-agent state graph orchestration calling Gemini API with structured Pydantic schema outputs. Top Builder Award — Google Cloud Agentic Premier League. Deployed serverless on Cloud Run at sub-500ms.',
    stack: ['Python', 'LangGraph', 'Gemini API', 'OpenAI Embeddings', 'Pydantic', 'Google Cloud Run'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
    metrics: ['Top Builder Award', 'Multi-Agent LangGraph', 'Sub-500ms Latency', 'Serverless Cloud Run'],
    icon: Trophy,
  },
  {
    number: '03',
    title: 'Jarvis Autonomous Copilot & IoT Workspace',
    type: 'Agentic AI / Multi-Model Gateway / IoT',
    description: 'Continuous agentic AI copilot powered by LangGraph ReAct orchestration (Plan→Think→Act→Observe→Synthesize), dynamic Tool Registry, Model Gateway with automatic Gemini→Claude→GPT-4o fallback, Playwright browser automation, MongoDB Atlas Vector Search, and real-time IoT ambient workspace control via WebSockets.',
    stack: ['Node.js', 'Next.js', 'Playwright', 'MongoDB Atlas', 'WebSocket', 'Gemini', 'Claude', 'GPT-4o'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
    metrics: ['Playwright Browser Automation', 'Triple-Model Gateway', 'Atlas Vector Search', 'Live IoT Control'],
    icon: Cpu,
  },
  {
    number: '04',
    title: 'GiantCell Healthcare Commerce Platform',
    type: 'High-Throughput Commerce / Microservices',
    description: 'High-throughput healthcare commerce platform with 150+ REST APIs, payment gateway integrations (Razorpay, Paytm), real-time inventory sync, 50,000+ daily transactions, and 99.9% uptime SLA maintained over 24 months in production.',
    stack: ['Node.js', 'Express', 'React Native', 'MySQL', 'Redis', 'Docker'],
    href: '#',
    metrics: ['50K+ Daily Transactions', '150+ REST APIs', '99.9% Uptime SLA', 'Multi-Payment Gateways'],
    icon: Activity,
  },
];

const SKILLS = [
  { category: 'Backend & Systems', items: ['Java 21', 'Spring Boot 3', 'Spring AI', 'Node.js', 'Express', 'REST APIs', 'Microservices', 'WebSocket'], icon: Server },
  { category: 'AI & Vector Infrastructure', items: ['LangGraph', 'Multi-Agent State Graphs', 'Qdrant', 'MongoDB Atlas Vector', 'Redis HNSW', 'Kafka', 'Playwright', 'RAG Pipelines'], icon: BrainCircuit },
  { category: 'Mobile & Full-Stack', items: ['React Native', 'Next.js 15', 'React', 'TypeScript', 'JavaScript', 'Android & iOS Deploy', 'TailwindCSS'], icon: Smartphone },
  { category: 'Cloud, DevOps & Databases', items: ['Docker', 'Google Cloud Run', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'CI/CD Pipelines', 'Linux & Git'], icon: Database },
];

export default function PortfolioClient({ initialStats, initialPortfolio }: { initialStats?: any; initialPortfolio?: any }) {
  const [stats, setStats] = useState<any>(initialStats || {
    solvedDsaProblems: 420, totalDsaProblems: 600,
    totalAppsLogged: 85, currentDsaStreak: 14, overallDsaPercent: 70,
  });
  const [portfolio, setPortfolio] = useState<any>(initialPortfolio || null);
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [activePersona, setActivePersona] = useState<'recruiter' | 'tech' | 'cto' | 'ceo'>('recruiter');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Job Opportunity (SDE-1 / AI Engineer)');
  const [contactMsg, setContactMsg] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardStats().then(r => r?.success && r?.data && setStats(r.data)).catch(() => {});
    fetchIotDevices().then(r => r?.success && r?.devices && setIotDevices(r.devices)).catch(() => {});
    fetchPortfolio().then(r => r?.success && r?.portfolio && setPortfolio(r.portfolio)).catch(() => {});
  }, []);

  useWebSocket({
    STATS_REFRESH: () => fetchDashboardStats().then(r => r?.data && setStats(r.data)).catch(() => {}),
    IOT_STATUS_CHANGED: () => fetchIotDevices().then(r => r?.devices && setIotDevices(r.devices)).catch(() => {}),
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setSubmittingContact(true);
    try {
      await submitContactForm({ name: contactName, email: contactEmail, message: `[${contactSubject}]\n\n${contactMsg}` });
      setContactSuccess(true);
      setContactName(''); setContactEmail(''); setContactMsg('');
    } catch {}
    setSubmittingContact(false);
  };

  const copyCandidateSummary = () => {
    navigator.clipboard.writeText(`Aryan Chandra — Full-Stack Software & AI Engineer
Roles: SDE-1 / Backend Engineer / AI Engineer | Available: Immediate (2026 Grad)
Location: Delhi NCR, India (Open to Remote & Global Relocation)
• Fonofy Partner App: 10,000+ downloads on Google Play Store (4.8★)
• Top Builder — Google Cloud Agentic Premier League (LangGraph + Cloud Run)
• Enterprise RAG Copilot: Java 21, Spring Boot 3, Kafka, Qdrant — sub-200ms P95
• 420+ LeetCode DSA problems solved, 14-day active streak
Phone: +91 92057 23006 | Email: aryanchandra3456@gmail.com
GitHub: https://github.com/TheAryanchandra | LinkedIn: https://linkedin.com/in/aryanchandra`);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const openJarvis = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt } }));
  };

  const DEFAULT_RESUME_URL = 'https://drive.google.com/file/d/1fnwhYzbHkrANYvNCtQWQndm9WKlAl2QD/view?usp=sharing';

  const info = portfolio?.personalInfo || {
    fullName: 'Aryan Chandra',
    title: 'Full-Stack Software & AI Engineer',
    bio: 'Software Engineering student with hands-on production experience shipping mobile apps with 10,000+ Google Play Store downloads, high-throughput microservices (50K+ daily transactions), enterprise RAG architectures, and autonomous multi-agent AI systems.',
    location: 'Delhi NCR, India',
    email: 'aryanchandra3456@gmail.com',
    phone: '+91 92057 23006',
    github: 'https://github.com/TheAryanchandra',
    linkedin: 'https://linkedin.com/in/aryanchandra',
    resumeUrl: DEFAULT_RESUME_URL,
  };

  const resumeUrl = info.resumeUrl || DEFAULT_RESUME_URL;
  const mobileApps = portfolio?.mobileApps?.length ? portfolio.mobileApps : DEFAULT_MOBILE_APPS;
  const projects = portfolio?.featuredProjects?.length ? portfolio.featuredProjects : DEFAULT_PROJECTS;

  return (
    <div className="pf-root" style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── STICKY NAV ─────────────────────────────────────────── */}
      <nav className="pf-nav">
        <div className="pf-container">
          <div className="pf-nav-inner">
            <div className="pf-brand">
              <span className="pf-live-dot" />
              <a href="#hero" className="pf-name">{info.fullName}<span className="pf-accent">.</span></a>
              {/* <span className="pf-badge pf-badge-green" style={{ display: 'none' as any }}>Available SDE-1</span> */}
              <span className="pf-badge pf-badge-green pf-show-sm">Available SDE-1</span>
            </div>
            <div className="pf-nav-links">
              {[['#apps', 'Apps (10K+)'], ['#projects', 'Projects'], ['#skills', 'Tech Stack'], ['#contact', 'Contact']].map(([href, label]) => (
                <a key={href} href={href} className="pf-nav-link">{label}</a>
              ))}
            </div>
            <div className="pf-nav-actions">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="pf-btn pf-btn-outline pf-btn-sm pf-show-md"
                style={{ cursor: 'pointer' }}
                title="Open Aryan Chandra's Resume PDF"
              >
                <FileText size={14} /> Resume <ExternalLink size={11} />
              </a>
              <Link href="/admin" className="pf-nav-link pf-show-md" style={{ fontSize: '12px' }}>
                <Layers size={13} /> Admin
              </Link>
              <ThemeToggle />
              <a href="#contact" className="pf-btn pf-btn-accent pf-btn-sm">Hire Me</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pf-container">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section id="hero" className="pf-hero">
          <div className="pf-hero-grid">
            {/* Left */}
            <div className="pf-hero-left">
              <div className="pf-badges-row">
                <span className="pf-badge pf-badge-accent"><Sparkles size={11} /> {info.title}</span>
                <span className="pf-badge pf-badge-green"><MapPin size={11} /> {info.location} — Open to Remote</span>
                <span className="pf-badge pf-badge-gold"><Trophy size={11} /> Google Cloud Premier League — Top Builder</span>
              </div>

              <h1 className="pf-hero-h1">
                Shipping real products,<br />
                <span className="pf-accent">10K+ downloads</span> on Play Store<br />
                & agentic AI backends.
              </h1>

              <p className="pf-hero-bio">{info.bio}</p>

              <div className="pf-hero-actions">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-btn pf-btn-accent"
                  style={{ cursor: 'pointer' }}
                  title="View Aryan Chandra's Resume on Google Drive"
                >
                  <FileText size={16} /> View & Download Resume <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="pf-btn pf-btn-outline"
                  style={{ cursor: 'pointer' }}
                >
                  <FileCheck size={15} /> ATS Text View
                </button>
                <a href={info.github} target="_blank" rel="noreferrer" className="pf-btn pf-btn-outline">
                  <Github size={15} /> GitHub
                </a>

                <a href={info.linkedin} target="_blank" rel="noreferrer" className="pf-btn pf-btn-linkedin">
                  <Linkedin size={15} /> LinkedIn
                </a>
              </div>

              <div className="pf-contact-strip">
                <a href={`mailto:${info.email}`} className="pf-contact-link"><Mail size={13} /> {info.email}</a>
                <a href={`tel:${info.phone}`} className="pf-contact-link"><Phone size={13} /> {info.phone}</a>
                <button onClick={copyCandidateSummary} className="pf-contact-copy" style={{ cursor: 'pointer' }}>
                  {copiedSummary ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy summary for HR</>}
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="pf-hero-right">
              {/* Fonofy Flagship Card */}
              <a href={FONOFY_PLAY_STORE_URL} target="_blank" rel="noreferrer" className="pf-flagship-card">
                <div className="pf-flagship-top">
                  <span className="pf-badge pf-badge-green"><Smartphone size={11} /> Live on Google Play Store</span>
                  <span className="pf-badge pf-badge-green">10,000+ Downloads</span>
                </div>
                <div className="pf-flagship-name">
                  <span className="pf-flagship-icon"><Smartphone size={22} /></span>
                  <div>
                    <div className="pf-flagship-title">Fonofy Partners App <span className="pf-accent">4.8 ★</span></div>
                    <div className="pf-flagship-sub">B2B Refurbished Device Commerce & Trade-In Platform</div>
                  </div>
                </div>
                <p className="pf-flagship-desc">Automated device evaluation, dynamic pricing & order management. Powering a nationwide merchant network.</p>
                <div className="pf-flagship-footer">
                  <span className="pf-btn pf-btn-accent pf-btn-sm"><Download size={13} /> Open on Google Play</span>
                  <span className="pf-flagship-arrow"><ArrowUpRight size={18} /></span>
                </div>
              </a>

              {/* Live Stats Card */}
              <div className="pf-stats-card">
                <div className="pf-stats-header">
                  <span className="pf-label">Engineering Telemetry</span>
                  <span className="pf-live-badge"><span className="pf-live-dot-sm" /> Live</span>
                </div>
                <div className="pf-stats-grid">
                  {/* <div className="pf-stat-box"><div className="pf-stat-val pf-accent">{stats?.solvedDsaProblems || 420}+</div><div className="pf-stat-label">LeetCode Solved</div></div>
                  <div className="pf-stat-box"><div className="pf-stat-val pf-green">{stats?.currentDsaStreak || 14} Days</div><div className="pf-stat-label">Active Streak 🔥</div></div> */}
                  <div className="pf-stat-box"><div className="pf-stat-val pf-gold">99.9%</div><div className="pf-stat-label">Uptime SLA</div></div>
                  <div className="pf-stat-box"><div className="pf-stat-val pf-red">50K+</div><div className="pf-stat-label">Daily Transactions</div></div>
                </div>
              </div>

              {/* Ask Jarvis AI card */}
              <button
                onClick={() => openJarvis('Give me a comprehensive summary of Aryan Chandra as a candidate for an SDE-1 or AI Engineering role.')}
                className="pf-jarvis-card"
                style={{ cursor: 'pointer' }}
              >
                <div className="pf-jarvis-icon"><Bot size={18} /></div>
                <div>
                  <div className="pf-jarvis-title">Ask Jarvis AI — Aryan's AI Copilot</div>
                  <div className="pf-jarvis-sub">"Why hire Aryan? What's his best system design?"</div>
                </div>
                <ChevronRight size={16} className="pf-jarvis-chevron" />
              </button>
            </div>
          </div>
        </section>

        {/* ── METRICS STRIP ───────────────────────────────────── */}
        <section className="pf-metrics-strip">
          {[
            { val: '10,000+', label: 'Play Store Downloads', detail: 'Fonofy App — Live' },
            { val: '50K+', label: 'Daily Transactions', detail: 'GiantCell Production' },
            { val: '99.9%', label: 'Uptime SLA', detail: '24 months production' },
            { val: '420+', label: 'LeetCode Solved', detail: '14-day active streak' },
            { val: 'Sub-200ms', label: 'RAG Latency', detail: 'Kafka + Qdrant hybrid' },
            { val: '150+', label: 'REST APIs Built', detail: 'Payment microservices' },
          ].map((m, i) => (
            <div key={i} className="pf-metric">
              <div className="pf-metric-val pf-accent">{m.val}</div>
              <div className="pf-metric-label">{m.label}</div>
              <div className="pf-metric-detail">{m.detail}</div>
            </div>
          ))}
        </section>

        {/* ── AUDIENCE PERSONA SWITCHER ────────────────────────── */}
        <section className="pf-section" style={{ paddingTop: '40px' }}>
          <div className="pf-persona-header">
            <div>
              <div className="pf-eyebrow pf-accent"><Terminal size={13} /> Tailored Perspectives</div>
              <h2 className="pf-section-h2">View Aryan's Work Through Your Lens</h2>
            </div>
            <div className="pf-persona-tabs">
              {[
                { id: 'recruiter', label: '👔 Recruiter & HR' },
                { id: 'tech', label: '💻 SDE & Tech Lead' },
                { id: 'cto', label: '🏛️ CTO & VP Eng' },
                { id: 'ceo', label: '🚀 Founder & CEO' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePersona(tab.id as any)}
                  className={`pf-persona-tab ${activePersona === tab.id ? 'pf-persona-tab-active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RECRUITER VIEW */}
          {activePersona === 'recruiter' && (
            <div className="pf-persona-panel">
              <div className="pf-persona-panel-head">
                <div>
                  <h3 className="pf-persona-panel-title">Candidate Factsheet — Screen & Schedule in 60 Seconds</h3>
                  <p className="pf-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Verified production deployments, award recognitions, and immediate availability.</p>
                </div>
                <div className="pf-persona-actions">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pf-btn pf-btn-accent pf-btn-sm"
                    style={{ cursor: 'pointer' }}
                    title="Open Aryan Chandra's Resume PDF"
                  >
                    <Download size={14} /> Download Resume PDF <ExternalLink size={12} />
                  </a>
                  {/* <button onClick={() => setShowResumeModal(true)} className="pf-btn pf-btn-outline pf-btn-sm" style={{ cursor: 'pointer' }}>
                    <FileCheck size={13} /> ATS View
                  </button> */}
                  <button onClick={copyCandidateSummary} className="pf-btn pf-btn-outline pf-btn-sm" style={{ cursor: 'pointer' }}>
                    {copiedSummary ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Summary</>}
                  </button>
                </div>

              </div>

              <div className="pf-fact-grid">
                <div className="pf-fact-box"><div className="pf-fact-label pf-accent">Target Roles</div><div className="pf-fact-val">SDE-1 / Software Engineer</div><div className="pf-muted pf-xs">Backend, Full-Stack, AI Systems</div></div>
                <div className="pf-fact-box">
  <div className="pf-fact-label pf-green">Availability</div>
  <div className="pf-fact-val">Immediate</div>
  <div className="pf-muted pf-xs">Software Engineer · 2025 Graduate</div>
</div>
                <div className="pf-fact-box"><div className="pf-fact-label pf-gold">Location</div><div className="pf-fact-val">Delhi NCR, India</div><div className="pf-muted pf-xs">Open to Remote & Global Relocation</div></div>
                <div className="pf-fact-box"><div className="pf-fact-label" style={{ color: 'var(--color-purple)' }}>Education</div><div className="pf-fact-val">B.Tech Software Engineering</div><div className="pf-muted pf-xs">Strong CS Fundamentals & DSA</div></div>
              </div>

              <div className="pf-achievement-strip">
                {[
                  'Fonofy Partner App: 10,000+ downloads on Google Play Store (4.8★)',
                  'GiantCell: 150+ REST APIs · 50K+ daily transactions · 99.9% uptime over 24 months',
                  'Top Builder Award: Google Cloud Agentic Premier League (LangGraph + Cloud Run)',
                  '420+ LeetCode DSA problems solved · 14-day active streak',
                ].map((a, i) => (
                  <div key={i} className="pf-achievement-item">
                    <CheckCircle2 size={15} className="pf-green-icon" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TECH LEAD VIEW */}
          {activePersona === 'tech' && (
            <div className="pf-persona-panel">
              <h3 className="pf-persona-panel-title">Technical Architecture — System Design Deep Dive</h3>
              <div className="pf-arch-grid">
                {DEFAULT_PROJECTS.slice(0, 3).map((p, i) => {
                  const Icon = p.icon || BrainCircuit;
                  return (
                    <div key={i} className="pf-arch-card">
                      <div className="pf-arch-card-top">
                        <div className="pf-arch-icon"><Icon size={20} /></div>
                        <div className="pf-muted pf-xs">{p.type}</div>
                      </div>
                      <div className="pf-arch-title">{p.number} {p.title}</div>
                      <p className="pf-arch-desc">{p.description}</p>
                      <div className="pf-stack-row">
                        {p.stack.slice(0, 5).map((t, j) => <span key={j} className="pf-tech-chip">{t}</span>)}
                      </div>
                      <div className="pf-metrics-row">
                        {p.metrics.map((m, j) => <span key={j} className="pf-metric-chip">{m}</span>)}
                      </div>
                      {p.href && p.href !== '#' && (
                        <a href={p.href} target="_blank" rel="noreferrer" className="pf-link-btn">
                          <Github size={13} /> View on GitHub <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTO VIEW */}
          {activePersona === 'cto' && (
            <div className="pf-persona-panel">
              <h3 className="pf-persona-panel-title">Production Reliability, SLAs & Platform Governance</h3>
              <div className="pf-sla-grid">
                <div className="pf-sla-card">
                  <div className="pf-sla-icon pf-green"><ShieldCheck size={22} /></div>
                  <div className="pf-sla-val">99.9% Uptime</div>
                  <div className="pf-sla-label">Availability SLA</div>
                  <p className="pf-muted pf-xs">Sustained across 24+ months of production commerce. Redis distributed locking + MySQL connection pool + automated restart policies.</p>
                </div>
                <div className="pf-sla-card">
                  <div className="pf-sla-icon pf-accent"><Activity size={22} /></div>
                  <div className="pf-sla-val">50K+ Daily TXs</div>
                  <div className="pf-sla-label">Throughput Scale</div>
                  <p className="pf-muted pf-xs">Event-driven order orchestration across Razorpay, Paytm, and merchant APIs with zero transaction loss guarantees.</p>
                </div>
                <div className="pf-sla-card">
                  <div className="pf-sla-icon pf-gold"><Zap size={22} /></div>
                  <div className="pf-sla-val">Triple Fallback</div>
                  <div className="pf-sla-label">AI Gateway Resilience</div>
                  <p className="pf-muted pf-xs">Model Gateway auto-routes across Gemini 3 Flash → Claude 3.5 Sonnet → GPT-4o without downtime. No single model SPOF.</p>
                </div>
              </div>
            </div>
          )}

          {/* CEO VIEW */}
          {activePersona === 'ceo' && (
            <div className="pf-persona-panel">
              <h3 className="pf-persona-panel-title">Product Execution, User Traction & Business Value</h3>
              <a href={FONOFY_PLAY_STORE_URL} target="_blank" rel="noreferrer" className="pf-ceo-fonofy-banner">
                <div className="pf-ceo-fonofy-left">
                  <div className="pf-ceo-fonofy-icon"><Smartphone size={26} /></div>
                  <div>
                    <div className="pf-ceo-fonofy-title">Fonofy Partners App <span className="pf-badge pf-badge-green">10,000+ Downloads</span></div>
                    <p className="pf-muted" style={{ fontSize: '12px', margin: '4px 0 0' }}>B2B Refurbished Device Trade-In & Commerce Platform — nationwide merchant network, 4.8★ rating</p>
                  </div>
                </div>
                <span className="pf-btn pf-btn-accent pf-btn-sm">View on Google Play <ArrowUpRight size={13} /></span>
              </a>
              <div className="pf-ceo-metrics">
                <div className="pf-ceo-metric"><div className="pf-ceo-metric-val pf-green">10,000+</div><div className="pf-ceo-metric-label">Active Installs</div><div className="pf-muted pf-xs">Used daily by electronics partners</div></div>
                <div className="pf-ceo-metric"><div className="pf-ceo-metric-val pf-gold">4.8 ★</div><div className="pf-ceo-metric-label">User Rating</div><div className="pf-muted pf-xs">High merchant satisfaction</div></div>
                <div className="pf-ceo-metric"><div className="pf-ceo-metric-val pf-accent">3 Apps</div><div className="pf-ceo-metric-label">Shipped to Stores</div><div className="pf-muted pf-xs">Fonofy, Delhi Golf Federation, Carenzy</div></div>
              </div>
            </div>
          )}
        </section>

        {/* ── PRODUCTION MOBILE APPS ──────────────────────────── */}
        <section id="apps" className="pf-section">
          <div className="pf-section-head">
            <div className="pf-eyebrow pf-accent"><Smartphone size={13} /> Live Mobile App Ecosystem</div>
            <h2 className="pf-section-h2">Production Apps Shipped to Stores</h2>
            <p className="pf-muted">Real apps, live users — deployed on Google Play Store and Apple App Store with 10,000+ total downloads.</p>
          </div>

          <div className="pf-apps-grid">
            {mobileApps.map((app: any, idx: number) => (
              <div key={idx} className={`pf-app-card ${app.isFlagship ? 'pf-app-card-flagship' : ''}`}>
                <div className="pf-app-top">
                  <div>
                    <h3 className="pf-app-name">{app.name}</h3>
                    <div className="pf-app-tagline">{app.tagline}</div>
                  </div>
                  {app.isLive && <span className="pf-badge pf-badge-green pf-xs-badge">LIVE</span>}
                </div>
                <p className="pf-app-desc">{app.description}</p>
                {app.highlights && (
                  <div className="pf-app-highlights">
                    {app.highlights.map((h: string, i: number) => (
                      <div key={i} className="pf-app-highlight-item">
                        <CheckCircle2 size={11} className="pf-green-icon" /><span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pf-stack-row">
                  {app.tech?.map((t: string, i: number) => <span key={i} className="pf-tech-chip">{t}</span>)}
                </div>
                <div className="pf-app-footer">
                  <div className="pf-app-stats">
                    <span className="pf-green">{app.downloads}</span>
                    <span className="pf-gold">{app.rating}</span>
                  </div>
                  <a href={app.storeUrl} target="_blank" rel="noreferrer" className="pf-link-btn">
                    {app.name.includes('Fonofy') ? <><Download size={13} /> Google Play</> : <><ExternalLink size={13} /> View App</>}
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURED PROJECTS ───────────────────────────────── */}
        <section id="projects" className="pf-section">
          <div className="pf-section-head">
            <div className="pf-eyebrow pf-accent">Engineering Systems</div>
            <h2 className="pf-section-h2">Flagship Systems & AI Architecture</h2>
            <p className="pf-muted">Production architectures engineered with strict latency SLAs, distributed messaging, and agentic workflows.</p>
          </div>

          <div className="pf-projects-grid">
            {projects.map((proj: any, idx: number) => {
              const Icon = proj.icon || BrainCircuit;
              return (
                <div key={idx} className="pf-project-card">
                  <div className="pf-project-top">
                    <div className="pf-project-icon"><Icon size={20} /></div>
                    <span className="pf-badge">{typeof proj.type === 'string' ? proj.type : ''}</span>
                  </div>
                  <div className="pf-project-num">{proj.number}</div>
                  <h3 className="pf-project-title">{proj.title}</h3>
                  <p className="pf-project-desc">{proj.description}</p>
                  <div className="pf-stack-row">
                    {proj.stack?.map((t: string, i: number) => <span key={i} className="pf-tech-chip">{t}</span>)}
                  </div>
                  <div className="pf-project-footer">
                    <div className="pf-metrics-row">
                      {proj.metrics?.map((m: string, i: number) => <span key={i} className="pf-metric-chip">{m}</span>)}
                    </div>
                    {proj.href && proj.href !== '#' && (
                      <a href={proj.href} target="_blank" rel="noreferrer" className="pf-link-btn">
                        Code <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TECHNICAL SKILLS ────────────────────────────────── */}
        <section id="skills" className="pf-section">
          <div className="pf-section-head">
            <div className="pf-eyebrow pf-accent">Engineering Toolkit</div>
            <h2 className="pf-section-h2">Technical Skills & Competencies</h2>
          </div>
          <div className="pf-skills-grid">
            {SKILLS.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="pf-skill-card">
                  <div className="pf-skill-head">
                    <div className="pf-skill-icon"><Icon size={17} /></div>
                    <h3 className="pf-skill-cat">{cat.category}</h3>
                  </div>
                  <div className="pf-skill-items">
                    {cat.items.map((item, i) => <span key={i} className="pf-tech-chip">{item}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── LIVE IOT AMBIENT ────────────────────────────────── */}
        {iotDevices.length > 0 && (
          <section className="pf-section">
            <div className="pf-iot-card">
              <div className="pf-iot-header">
                <span className="pf-label"><Cpu size={14} /> Jarvis Ambient IoT Workspace</span>
                <span className="pf-live-badge"><span className="pf-live-dot-sm" /> WebSocket Live</span>
              </div>
              <div className="pf-iot-grid">
                {iotDevices.slice(0, 4).map((dev: any) => (
                  <div key={dev.deviceId} className="pf-iot-device">
                    <div className="pf-iot-device-top">
                      <span className="pf-xs">{dev.location}</span>
                      <span className={dev.state?.isOn ? 'pf-green' : 'pf-muted'}>●</span>
                    </div>
                    <div className="pf-iot-device-name">{dev.name}</div>
                    <div className="pf-xs pf-muted">{dev.state?.statusText}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CONTACT FORM ─────────────────────────────────────── */}
        <section id="contact" className="pf-section">
          <div className="pf-contact-grid">
            {/* Left */}
            <div className="pf-contact-left">
              <div className="pf-eyebrow pf-accent"><Mail size={13} /> Open for High-Impact Roles</div>
              <h2 className="pf-contact-h2">Let's build something remarkable.</h2>
              <p className="pf-muted">Actively interviewing for <strong>SDE-1, Backend Engineer, and AI Systems</strong> roles. Open to startups and tier-1 tech companies.</p>

              <div className="pf-contact-links">
                <a href={`mailto:${info.email}`} className="pf-contact-row">
                  <div className="pf-contact-row-icon"><Mail size={17} /></div>
                  <div><div className="pf-xs pf-muted">Direct Email</div><div className="pf-contact-row-val">{info.email}</div></div>
                </a>
                <a href={`tel:${info.phone}`} className="pf-contact-row">
                  <div className="pf-contact-row-icon pf-contact-row-icon-green"><Phone size={17} /></div>
                  <div><div className="pf-xs pf-muted">Phone / WhatsApp</div><div className="pf-contact-row-val">{info.phone}</div></div>
                </a>
                <div className="pf-contact-row" style={{ cursor: 'default' }}>
                  <div className="pf-contact-row-icon pf-contact-row-icon-red"><MapPin size={17} /></div>
                  <div><div className="pf-xs pf-muted">Location</div><div className="pf-contact-row-val">{info.location} — Open to Remote & Relocation</div></div>
                </div>
              </div>

              <div className="pf-contact-socials">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-btn pf-btn-accent pf-btn-sm"
                  style={{ cursor: 'pointer' }}
                  title="Open Aryan Chandra's Resume PDF"
                >
                  <Download size={13} /> Resume PDF <ExternalLink size={11} />
                </a>
                <a href={info.github} target="_blank" rel="noreferrer" className="pf-btn pf-btn-outline pf-btn-sm"><Github size={14} /> GitHub</a>
                <a href={info.linkedin} target="_blank" rel="noreferrer" className="pf-btn pf-btn-outline pf-btn-sm"><Linkedin size={14} /> LinkedIn</a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="pf-contact-form-wrap">
              {contactSuccess ? (
                <div className="pf-contact-success">
                  <div className="pf-success-icon"><CheckCircle2 size={28} /></div>
                  <h3>Message Dispatched!</h3>
                  <p className="pf-muted">Delivered via Whisperflow to <strong>aryanchandra3456@gmail.com</strong>. Expect a response within 24 hours.</p>
                  <button onClick={() => setContactSuccess(false)} className="pf-btn pf-btn-outline pf-btn-sm" style={{ cursor: 'pointer' }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="pf-contact-form">
                  <div className="pf-form-header">
                    <Mail size={15} className="pf-accent-icon" /> Send a Message
                    <span className="pf-badge pf-badge-green pf-xs-badge">Whisperflow Live</span>
                  </div>
                  <div className="pf-form-row">
                    <div className="pf-form-group">
                      <label>Your Name *</label>
                      <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Sarah Jenkins" />
                    </div>
                    <div className="pf-form-group">
                      <label>Email *</label>
                      <input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sarah@company.com" />
                    </div>
                  </div>
                  <div className="pf-form-group">
                    <label>Subject / Role</label>
                    <select value={contactSubject} onChange={e => setContactSubject(e.target.value)}>
                      <option>Job Opportunity (SDE-1 / AI Engineer)</option>
                      <option>Technical Interview Invitation</option>
                      <option>Fonofy Merchant / Business Collaboration</option>
                      <option>Consulting / Freelance Project</option>
                      <option>General Engineering Inquiry</option>
                    </select>
                  </div>
                  <div className="pf-form-group">
                    <label>Message *</label>
                    <textarea rows={4} required value={contactMsg} onChange={e => setContactMsg(e.target.value)} placeholder="Hi Aryan, we'd love to invite you for an interview..." />
                  </div>
                  <button type="submit" disabled={submittingContact} className="pf-btn pf-btn-accent pf-btn-full">
                    {submittingContact ? <><span className="pf-spinner" /> Dispatching...</> : <><Mail size={14} /> Send Message</>}
                  </button>
                  <div className="pf-form-footer-note">Notifications sent to aryanchandra3456@gmail.com via Whisperflow</div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="pf-footer">
          <span>© 2026 {info.fullName} — Full-Stack Software & AI Engineer</span>
          <div className="pf-footer-links">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="pf-footer-link">Resume</a>
            <a href={FONOFY_PLAY_STORE_URL} target="_blank" rel="noreferrer" className="pf-footer-link">Fonofy Play Store</a>
            <a href={info.github} target="_blank" rel="noreferrer" className="pf-footer-link">GitHub</a>
            <a href={info.linkedin} target="_blank" rel="noreferrer" className="pf-footer-link">LinkedIn</a>
          </div>
        </footer>
      </div>

      {/* ── RESUME MODAL ─────────────────────────────────────── */}
      {showResumeModal && (
        <div className="pf-modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div className="pf-modal" onClick={e => e.stopPropagation()}>
            <div className="pf-modal-header">
              <span className="pf-modal-title"><FileCheck size={16} /> Aryan Chandra — ATS Resume</span>
              <div className="pf-modal-actions">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-btn pf-btn-accent pf-btn-sm"
                  style={{ cursor: 'pointer' }}
                >
                  <ExternalLink size={13} /> Open Drive PDF
                </a>
                <button onClick={() => window.print()} className="pf-btn pf-btn-outline pf-btn-sm" style={{ cursor: 'pointer' }}><Printer size={13} /> Print</button>
                <button onClick={copyCandidateSummary} className="pf-btn pf-btn-outline pf-btn-sm" style={{ cursor: 'pointer' }}>
                  {copiedSummary ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
                <button onClick={() => setShowResumeModal(false)} className="pf-modal-close" style={{ cursor: 'pointer' }}><X size={16} /></button>
              </div>
            </div>

            <div id="printable-resume" className="pf-resume-body">
              <div className="pf-resume-header-block">
                <h1>ARYAN CHANDRA</h1>
                <p className="pf-resume-subtitle">Full-Stack Software Engineer & AI Systems Developer</p>
                <p className="pf-resume-contact-line">Delhi NCR, India &nbsp;•&nbsp; +91 92057 23006 &nbsp;•&nbsp; aryanchandra3456@gmail.com &nbsp;•&nbsp; linkedin.com/in/aryanchandra &nbsp;•&nbsp; github.com/TheAryanchandra</p>
              </div>

              <div className="pf-resume-section">
                <h2 className="pf-resume-h2">EDUCATION</h2>
                <div className="pf-resume-row"><strong>Bachelor of Technology in Software Engineering</strong><span>2022 — 2026</span></div>
                <p className="pf-resume-detail">Data Structures & Algorithms, Operating Systems, Database Management, Distributed Systems, Computer Networks.</p>
              </div>

              <div className="pf-resume-section">
                <h2 className="pf-resume-h2">TECHNICAL SKILLS</h2>
                <p className="pf-resume-detail"><strong>Languages:</strong> Java 21, Python, TypeScript, JavaScript, C++, SQL</p>
                <p className="pf-resume-detail"><strong>Frameworks:</strong> Spring Boot 3, Spring AI, Node.js, Express, Next.js 15, React, React Native</p>
                <p className="pf-resume-detail"><strong>AI & Data:</strong> LangGraph, Kafka, Qdrant Vector DB, MongoDB Atlas Vector, Redis, Playwright Browser Automation</p>
                <p className="pf-resume-detail"><strong>Cloud & Databases:</strong> Docker, Google Cloud Run, PostgreSQL, MongoDB, MySQL, Redis, Git, CI/CD</p>
              </div>

              <div className="pf-resume-section">
                <h2 className="pf-resume-h2">PRODUCTION MOBILE APPLICATIONS</h2>
                <div className="pf-resume-row"><strong>Fonofy Partners — B2B Mobile Commerce Platform (React Native, Node.js, MongoDB)</strong><span>10,000+ Google Play Store Downloads</span></div>
                <ul className="pf-resume-ul">
                  <li>Engineered full-featured B2B merchant application powering nationwide device trade-in, automated diagnostic evaluation, and live dynamic pricing.</li>
                  <li>Sustained 4.8★ rating with zero critical production downtime across active retail electronics partner network.</li>
                </ul>
                <div className="pf-resume-row"><strong>GiantCell Healthcare Commerce Platform (Node.js, MySQL, Redis)</strong><span>50,000+ Daily Transactions</span></div>
                <ul className="pf-resume-ul">
                  <li>Built 150+ RESTful APIs for high-throughput medical order processing with Razorpay & Paytm payment gateway integrations.</li>
                  <li>Maintained 99.9% uptime SLA for 24 months in production using Redis caching and MySQL connection pooling.</li>
                </ul>
              </div>

              <div className="pf-resume-section">
                <h2 className="pf-resume-h2">KEY ENGINEERING PROJECTS</h2>
                <div className="pf-resume-row"><strong>Enterprise RAG Knowledge Copilot (Java 21, Spring Boot 3, Kafka, Qdrant)</strong><span>Sub-200ms P95 Latency</span></div>
                <ul className="pf-resume-ul">
                  <li>Engineered JWT-secured RBAC API gateway and Kafka event ingestion pipeline feeding Qdrant hybrid vector search (BM25 + HNSW).</li>
                </ul>
                <div className="pf-resume-row"><strong>Stadium Pulse — Agentic Crowd Intelligence (Python, LangGraph, Cloud Run)</strong><span>Google Cloud Premier League Top Builder</span></div>
                <ul className="pf-resume-ul">
                  <li>Built autonomous multi-agent state graph with Gemini API + Pydantic structured output for real-time semantic venue telemetry. Deployed serverless on Cloud Run.</li>
                </ul>
              </div>

              <div className="pf-resume-section">
                <h2 className="pf-resume-h2">HONORS & PROBLEM SOLVING</h2>
                <p className="pf-resume-detail">• <strong>420+ LeetCode Problems Solved</strong> with 14-day active streak (Graphs, DP, Trees, Arrays)</p>
                <p className="pf-resume-detail">• <strong>Top Builder Award</strong> — Google Cloud Agentic Premier League (April 2026)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Jarvis AI ──────────────────────────────── */}
      <AiVoiceAssistant />
    </div>
  );
}
