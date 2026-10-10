'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Mic,
  Network,
  Phone,
  Radio,
  Rocket,
  Server,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Trophy,
  Volume2,
  Wifi,
  Workflow,
  Zap,
} from 'lucide-react';
import Cinematic3DCanvas from './Cinematic3DCanvas';
import AiVoiceAssistant from './AiVoiceAssistant';
import { submitContactForm } from '@/lib/api';

const DEFAULT_RESUME_URL =
  'https://drive.google.com/file/d/1fnwhYzbHkrANYvNCtQWQndm9WKlAl2QD/view?usp=sharing';

const PROJECTS = [
  {
    id: '01',
    title: 'Enterprise RAG Knowledge Copilot',
    subtitle: 'Distributed Backend / Enterprise AI',
    description:
      'Enterprise knowledge retrieval platform built with Java 21 virtual threads, Spring Boot 3, and Spring AI. Designed a JWT-secured RBAC API gateway, event-driven Kafka ingestion pipeline, and Qdrant hybrid vector search (dense HNSW + BM25 lexical) with sub-200ms P95 latency at scale.',
    stack: ['Java 21', 'Spring Boot 3', 'Spring AI', 'Apache Kafka', 'Qdrant Vector DB', 'PostgreSQL', 'Redis', 'Docker'],
    metrics: ['Sub-200ms P95', 'Kafka Event Pipeline', 'Dense + BM25 Hybrid Search', 'JWT RBAC Gateway'],
    href: 'https://github.com/TheAryanchandra/AI-Copilot',
    accent: 'amber',
  },
  {
    id: '02',
    title: 'Stadium Pulse — Crowd Intelligence',
    subtitle: 'Agentic AI / Google Cloud Premier League',
    description:
      'Agentic crowd-intelligence platform built in Python with LangGraph multi-agent state graph orchestration calling Gemini API with structured Pydantic schema validation. Won Top Builder Award in the Google Cloud Agentic Premier League; deployed serverless on Cloud Run with sub-500ms response.',
    stack: ['Python', 'LangGraph', 'Gemini API', 'OpenAI Embeddings', 'Pydantic', 'Google Cloud Run'],
    metrics: ['Top Builder Award', 'Multi-Agent LangGraph', 'Sub-500ms Latency', 'Serverless Cloud Run'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
    accent: 'cyan',
  },
  {
    id: '03',
    title: 'Jarvis Autonomous Copilot & IoT Workspace',
    subtitle: 'Agentic AI / Model Gateway / IoT',
    description:
      'Autonomous multi-tool AI assistant with LangGraph ReAct orchestration (Plan→Think→Act→Observe→Synthesize), Playwright browser automation, Triple-Model Gateway (Gemini 2.5 Flash / Claude 3.5 / GPT-4o), MongoDB Atlas Vector Search, and live IoT ambient workspace control via persistent WebSockets.',
    stack: ['Node.js', 'Next.js', 'Playwright', 'MongoDB Atlas', 'WebSocket', 'Gemini', 'Claude', 'GPT-4o'],
    metrics: ['Playwright Automation', 'Triple-Model Gateway', 'Atlas Vector Search', 'Live IoT Control'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
    accent: 'emerald',
  },
  {
    id: '04',
    title: 'GiantCell Healthcare Commerce Platform',
    subtitle: 'High-Throughput Commerce & Microservices',
    description:
      'High-throughput healthcare commerce platform featuring 150+ REST APIs, payment integrations (Razorpay, Paytm), real-time inventory synchronization, handling 50,000+ daily transactions with 99.9% uptime SLA maintained over 24 continuous months in production.',
    stack: ['Node.js', 'Express', 'React Native', 'MySQL', 'Redis', 'Docker'],
    metrics: ['50K+ Daily Transactions', '150+ REST APIs', '99.9% Uptime SLA', 'Multi-Payment Gateways'],
    href: 'https://github.com/TheAryanchandra',
    accent: 'purple',
  },
];

const MOBILE_APPS = [
  {
    name: 'Fonofy Partners',
    role: 'Refurbished Device Commerce & Trade-In Platform',
    downloads: '10,000+',
    rating: '4.8 ★',
    desc: 'Full-featured B2B merchant app for device diagnostic evaluation, automated trade-in grading, live dynamic pricing, and order fulfillment.',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    tech: ['React Native', 'Node.js', 'MongoDB', 'REST APIs'],
  },
  {
    name: 'Golf Federation',
    role: 'Golf Tournament & League Management',
    downloads: '5,000+',
    rating: '4.9 ★',
    desc: 'Real-time tournament scoring, handicap calculations, live leaderboard tracking, and verified player club profiles.',
    storeUrl: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    tech: ['React Native', 'Spring Boot', 'PostgreSQL', 'WebSocket'],
  },
  {
    name: 'Carenzy',
    role: 'Personalized Healthcare & Caregiver Booking',
    downloads: '2,000+',
    rating: '4.7 ★',
    desc: 'On-demand caregiver dispatch, real-time medical vitals telemetry, appointment scheduling, and patient health timeline management.',
    storeUrl: 'https://carenzy.com',
    tech: ['React Native', 'Node.js', 'Firebase', 'GCP'],
  },
];

const ARCHITECTURE_DOMAINS = [
  {
    title: 'Distributed Backend & Systems',
    tag: 'Core Infrastructure',
    icon: Server,
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    textAccent: 'text-amber-400',
    points: [
      'Java 21 virtual threads & Spring Boot 3 microservices with sub-200ms latency',
      'Event-driven Apache Kafka stream pipelines for asynchronous data ingestion',
      'High-throughput Node.js & Express REST APIs handling 50K+ daily transactions',
      'Redis distributed caching and PostgreSQL / MongoDB schema optimization',
    ],
  },
  {
    title: 'AI & Vector Infrastructure',
    tag: 'Agentic & RAG Systems',
    icon: BrainCircuit,
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/30',
    textAccent: 'text-cyan-400',
    points: [
      'LangGraph multi-agent ReAct orchestration with structured Pydantic schemas',
      'Qdrant & MongoDB Atlas hybrid vector search (dense HNSW + lexical BM25)',
      'Model Gateway with automatic Gemini → Claude → GPT-4o failover',
      'Playwright headless browser automation & OCR multimodal document pipelines',
    ],
  },
  {
    title: 'Mobile & Full-Stack Products',
    tag: 'Client Ecosystems',
    icon: Smartphone,
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    textAccent: 'text-emerald-400',
    points: [
      '10,000+ Google Play Store downloads shipped on production React Native app',
      'Next.js 14 / 15 App Router with SSR, dynamic animations, and Three.js WebGL',
      'Real-time WebSocket event layer for zero-latency bi-directional sync',
      'Cross-platform iOS and Android production release management',
    ],
  },
  {
    title: 'Cloud, DevOps & Reliability',
    tag: 'Production SLA',
    icon: Database,
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    textAccent: 'text-purple-400',
    points: [
      'Google Cloud Run serverless microservices containerized with Docker',
      '99.9% uptime SLA sustained over 24 months across distributed production services',
      'Automated CI/CD pipelines with GitHub Actions and zero-downtime rollouts',
      'Comprehensive telemetry, structured logging, and automated health recovery',
    ],
  },
];

export default function CinematicPortfolio() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [copiedBio, setCopiedBio] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Audio / Speech State
  const [assistantActive, setAssistantActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      const progress = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0;
      setScrollProgress(progress);

      if (progress < 0.2) setActiveSection(0);
      else if (progress < 0.45) setActiveSection(1);
      else if (progress < 0.7) setActiveSection(2);
      else if (progress < 0.88) setActiveSection(3);
      else setActiveSection(4);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openJarvis = (prompt?: string) => {
    window.dispatchEvent(
      new CustomEvent('atlas:open-assistant', { detail: { prompt } })
    );
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(
      `Aryan Chandra — Software Engineer (SDE-1 / Full-Stack / AI Systems)\nLocation: Delhi NCR, India (Open to Remote & Global Relocation)\n• Fonofy Partner App: 10,000+ downloads on Google Play Store (4.8★)\n• Google Cloud Agentic Premier League: Top Builder Award (LangGraph + Cloud Run)\n• Enterprise RAG Copilot: Java 21, Spring Boot 3, Kafka, Qdrant — sub-200ms P95\n• 420+ LeetCode DSA solved | Contact: aryanchandra3456@gmail.com | +91 92057 23006\n• Portfolio & 3D Experience: https://github.com/TheAryanchandra`
    );
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 3000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmitting(true);
    try {
      await submitContactForm({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      });
      setSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch {
      // fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05050a] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans overflow-x-hidden">
      {/* ── 1. Full-Screen Cinematic 3D Canvas ──────────────────────── */}
      <Cinematic3DCanvas
        scrollProgress={scrollProgress}
        activeSection={activeSection}
        hoveredProjectIndex={hoveredProject}
      />

      {/* ── 2. Fixed Studio HUD Navigation ─────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-gradient-to-b from-[#05050a]/90 via-[#05050a]/60 to-transparent backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link
            href="#hero"
            className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-white group uppercase"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
            <span>
              ARYAN CHANDRA <span className="text-amber-400">//</span> 3D
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AVAILABLE FOR SDE-1
          </span>
        </div>

        {/* Spatial Coordinates / Section Anchors */}
        <nav className="hidden lg:flex items-center gap-8 text-[12px] font-mono tracking-widest text-white/50">
          {[
            ['#hero', '01 // OVERVIEW'],
            ['#architecture', '02 // SYSTEMS'],
            ['#projects', '03 // PROJECTS'],
            ['#apps', '04 // APPS (10K+)'],
            ['#ailab', '05 // AI LAB'],
            ['#contact', '06 // CONTACT'],
          ].map(([href, label], idx) => (
            <a
              key={href}
              href={href}
              className={`transition-colors duration-200 hover:text-amber-400 ${
                activeSection === idx ? 'text-amber-400 font-bold' : ''
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openJarvis()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-all duration-200"
            title="Launch Jarvis 3D AI Assistant"
          >
            <Bot size={13} className="text-amber-400" />
            <span className="hidden sm:inline">JARVIS COPILOT</span>
          </button>

          <a
            href={DEFAULT_RESUME_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            <Download size={13} />
            <span>RESUME</span>
          </a>
        </div>
      </header>

      {/* ── 3. Spatial Sections Layered Over 3D Scene ───────────────── */}
      <main className="relative z-10 w-full">
        {/* ── SECTION 0: HERO — CINEMATIC OPENING ───────────────────── */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col justify-end px-6 md:px-16 lg:px-24 pb-20 pt-36"
        >
          <div className="max-w-4xl space-y-6">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                <Sparkles size={12} />
                FULL-STACK · BACKEND · AI SYSTEMS
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5">
                <MapPin size={12} />
                DELHI NCR · OPEN TO REMOTE & RELOCATION
              </span>
            </div>

            {/* Editorial Title */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-white">
                ARYAN <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                  CHANDRA
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-light text-white/80 tracking-wide max-w-2xl pt-2">
                Software Engineer · Distributed Systems · Agentic AI
              </p>
            </div>

            {/* Supporting Line */}
            <p className="text-base sm:text-lg text-white/60 font-normal max-w-2xl leading-relaxed">
              Building intelligent software, high-throughput distributed backends,
              and interactive 3D AI experiences. Shipped mobile applications with
              over <strong className="text-amber-400 font-semibold">10,000+ Google Play Store downloads</strong> and microservices with <strong className="text-white font-semibold">50K+ daily transactions</strong>.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#projects"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-amber-400 transition-all duration-200 shadow-xl"
              >
                <span>EXPLORE MY WORK</span>
                <ArrowRight size={16} />
              </a>

              <a
                href={DEFAULT_RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white transition-all duration-200 backdrop-blur-md"
              >
                <FileText size={16} className="text-amber-400" />
                <span>DOWNLOAD RESUME (PDF)</span>
              </a>

              <a
                href="#contact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                <span>CONTACT ME</span>
                <ChevronRight size={16} />
              </a>

              <button
                onClick={copyBrief}
                className="px-3.5 py-3.5 rounded-xl text-xs font-mono bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1.5"
                title="Copy Candidate Screen Summary"
              >
                {copiedBio ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedBio ? 'COPIED TO CLIPBOARD' : 'COPY CANDIDATE BRIEF'}</span>
              </button>
            </div>
          </div>

          {/* Minimalist Scroll Prompt */}
          <div className="pt-16 flex items-center gap-3 text-xs font-mono tracking-widest text-white/40">
            <span className="w-8 h-[1px] bg-white/20" />
            <ArrowDown size={12} className="animate-bounce text-amber-400" />
            <span>SCROLL TO EXPLORE SPATIAL ENGINE // 01</span>
          </div>
        </section>

        {/* ── SECTION 1: ARCHITECTURE & ENGINEERING ─────────────────── */}
        <section
          id="architecture"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-6xl mx-auto w-full space-y-12">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                02 // SYSTEM ARCHITECTURE & EXPERTISE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Engineered for High Throughput & Autonomous AI
              </h2>
              <p className="text-white/60 max-w-2xl text-base">
                Architectural blueprints, event streams, and production technologies
                powering distributed enterprise systems and conversational AI agents.
              </p>
            </div>

            {/* Spatial Architectural Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARCHITECTURE_DOMAINS.map((domain, i) => {
                const Icon = domain.icon;
                return (
                  <div
                    key={i}
                    className={`relative p-8 rounded-2xl bg-gradient-to-br ${domain.color} backdrop-blur-xl border ${domain.border} hover:border-white/40 transition-all duration-300 space-y-5 group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center">
                        <Icon size={22} className={domain.textAccent} />
                      </div>
                      <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                        {domain.tag}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {domain.title}
                      </h3>
                    </div>

                    <ul className="space-y-2.5 text-sm text-white/70 font-light">
                      {domain.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: PROJECTS — SPATIAL PORTALS ─────────────────── */}
        <section
          id="projects"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-6xl mx-auto w-full space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  03 // VERIFIED PRODUCTION PROJECTS
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  Featured Distributed & AI Systems
                </h2>
                <p className="text-white/60 max-w-xl text-base">
                  Real projects with source repositories, live deployments, and measurable production impact.
                </p>
              </div>

              <div className="text-xs font-mono tracking-widest text-white/40">
                TOTAL FLAGSHIPS // 04
              </div>
            </div>

            {/* Project Hologram Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  onMouseEnter={() => setHoveredProject(idx)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="relative p-8 rounded-2xl bg-[#090d18]/85 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 transition-all duration-300 space-y-5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-amber-400">
                      PROJECT // {proj.id}
                    </span>
                    <a
                      href={proj.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-amber-500 hover:text-black border border-white/10 flex items-center justify-center text-white transition-all"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs font-mono tracking-wider text-white/50 uppercase">
                      {proj.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    {proj.description}
                  </p>

                  {/* Metrics Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.metrics.map((m, k) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide bg-amber-500/10 border border-amber-500/25 text-amber-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.stack.map((tech, t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] border border-white/[0.08] text-white/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: MOBILE ECOSYSTEM (10K+ DOWNLOADS) ──────────── */}
        <section
          id="apps"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-6xl mx-auto w-full space-y-12">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
                04 // PRODUCTION MOBILE APPLICATIONS
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Shipped to 10,000+ Real Users Worldwide
              </h2>
              <p className="text-white/60 max-w-xl text-base">
                Cross-platform mobile applications live on the Google Play Store and Apple App Store.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOBILE_APPS.map((app, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-[#090d18]/85 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      {app.downloads} DOWNLOADS
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {app.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">{app.name}</h3>
                    <p className="text-xs text-white/50 font-mono">{app.role}</p>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    {app.desc}
                  </p>

                  <div className="pt-2">
                    <a
                      href={app.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-emerald-400 hover:text-emerald-300"
                    >
                      <span>VIEW ON STORE</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: AI LAB — INTERACTIVE COPILOT ────────────────── */}
        <section
          id="ailab"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-4xl mx-auto w-full space-y-8 text-center">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                05 // AI LAB & CONVERSATIONAL ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Talk with Jarvis // The 3D Humanoid Copilot
              </h2>
              <p className="text-white/60 max-w-xl mx-auto text-base">
                Jarvis has complete context over Aryan's codebase, system architecture,
                career achievements, and DSA mastery. Engage via live voice or text.
              </p>
            </div>

            {/* Quick interactive prompts */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
              {[
                'Screen Aryan as an SDE-1 candidate',
                'Explain your Java 21 + Kafka architecture',
                'Tell me about the Fonofy app metrics',
                'What is your DSA solved streak?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => openJarvis(q)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono bg-white/[0.06] hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-400 text-white/80 transition-all duration-200"
                >
                  "{q}"
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => openJarvis()}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-2xl shadow-amber-500/25 transition-all"
              >
                <Bot size={18} />
                <span>OPEN JARVIS 3D HUD DIALOGUE</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: CONTACT NEXUS ───────────────────────────────── */}
        <section
          id="contact"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-4xl mx-auto w-full space-y-12">
            <div className="space-y-3 text-center">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                06 // INITIATE TRANSMISSION
              </span>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
                Let's Build Together
              </h2>
              <p className="text-white/60 max-w-xl mx-auto text-base">
                Open for Software Engineer / SDE-1 / AI Engineer roles. Available immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Direct Channels */}
              <div className="space-y-6 p-8 rounded-2xl bg-[#090d18]/85 backdrop-blur-xl border border-white/10">
                <h3 className="text-lg font-bold text-white">Direct Coordinates</h3>
                <div className="space-y-4 text-sm font-mono text-white/80">
                  <a
                    href="mailto:aryanchandra3456@gmail.com"
                    className="flex items-center gap-3 hover:text-amber-400 transition-colors"
                  >
                    <Mail size={16} className="text-amber-400 shrink-0" />
                    <span>aryanchandra3456@gmail.com</span>
                  </a>

                  <a
                    href="tel:+919205723006"
                    className="flex items-center gap-3 hover:text-amber-400 transition-colors"
                  >
                    <Phone size={16} className="text-amber-400 shrink-0" />
                    <span>+91 92057 23006</span>
                  </a>

                  <div className="flex items-center gap-3 text-white/60">
                    <MapPin size={16} className="text-amber-400 shrink-0" />
                    <span>Delhi NCR, India (Open to Remote & Global Relocation)</span>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <a
                      href="https://github.com/TheAryanchandra"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-amber-400 hover:text-black border border-white/10 flex items-center justify-center transition-all"
                      title="GitHub"
                    >
                      <Github size={18} />
                    </a>

                    <a
                      href="https://linkedin.com/in/aryanchandra"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-amber-400 hover:text-black border border-white/10 flex items-center justify-center transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>

                    <a
                      href={DEFAULT_RESUME_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-amber-400 hover:text-black border border-white/10 flex items-center justify-center transition-all"
                      title="Resume PDF"
                    >
                      <FileText size={18} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Contact Form */}
              <form
                onSubmit={handleContactSubmit}
                className="space-y-4 p-8 rounded-2xl bg-[#090d18]/85 backdrop-blur-xl border border-white/10"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/50 uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your Name / Recruiter"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/50 uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/50 uppercase">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Discuss an SDE-1 opening or software architecture..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>MESSAGE TRANSMITTED</span>
                    </>
                  ) : submitting ? (
                    <span>TRANSMITTING...</span>
                  ) : (
                    <>
                      <span>TRANSMIT MESSAGE</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ── 4. Jarvis AI Voice Assistant Integration ───────────────── */}
      <AiVoiceAssistant />
    </div>
  );
}
