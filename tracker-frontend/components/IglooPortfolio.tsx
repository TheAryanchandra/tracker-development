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
  VolumeX,
  Wifi,
  Workflow,
  Zap,
} from 'lucide-react';
import IglooGlacialCanvas from './IglooGlacialCanvas';
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
      'Enterprise knowledge retrieval platform built with Java 21 virtual threads, Spring Boot 3, and Spring AI. Designed a JWT-secured RBAC API gateway, event-driven Kafka ingestion pipeline, and Qdrant hybrid vector search (dense HNSW + BM25 lexical) with sub-200ms P95 latency at enterprise scale.',
    stack: ['Java 21', 'Spring Boot 3', 'Spring AI', 'Apache Kafka', 'Qdrant Vector DB', 'PostgreSQL', 'Redis', 'Docker'],
    metrics: ['Sub-200ms P95', 'Kafka Event Pipeline', 'Dense + BM25 Hybrid Search', 'JWT RBAC Gateway'],
    href: 'https://github.com/TheAryanchandra/AI-Copilot',
  },
  {
    id: '02',
    title: 'Stadium Pulse — Crowd Intelligence',
    subtitle: 'Agentic AI / Google Cloud Premier League',
    description:
      'Agentic crowd-intelligence platform built in Python with LangGraph multi-agent state graph orchestration calling Gemini API with structured Pydantic schema validation. Won Top Builder Award in the Google Cloud Agentic Premier League; deployed serverless on Cloud Run with sub-500ms latency.',
    stack: ['Python', 'LangGraph', 'Gemini API', 'OpenAI Embeddings', 'Pydantic', 'Google Cloud Run'],
    metrics: ['Top Builder Award', 'Multi-Agent LangGraph', 'Sub-500ms Latency', 'Serverless Cloud Run'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
  },
  {
    id: '03',
    title: 'Jarvis Autonomous Copilot & IoT Workspace',
    subtitle: 'Agentic AI / Model Gateway / IoT',
    description:
      'Continuous agentic AI copilot with LangGraph ReAct orchestration (Plan→Think→Act→Observe→Synthesize), Playwright browser automation, Triple-Model Gateway (Gemini 2.5 Flash / Claude 3.5 / GPT-4o), MongoDB Atlas Vector Search, and live IoT ambient workspace control via persistent WebSockets.',
    stack: ['Node.js', 'Next.js', 'Playwright', 'MongoDB Atlas', 'WebSocket', 'Gemini', 'Claude', 'GPT-4o'],
    metrics: ['Playwright Automation', 'Triple-Model Gateway', 'Atlas Vector Search', 'Live IoT Control'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
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

const ARCHITECTURE_PILLARS = [
  {
    num: '01',
    title: 'Distributed Systems & Microservices',
    desc: 'Java 21 virtual threads, Spring Boot 3, and Apache Kafka event pipelines engineered for high concurrency and sub-200ms P95 latency.',
    tags: ['Java 21', 'Spring Boot 3', 'Apache Kafka', 'PostgreSQL', 'Redis'],
  },
  {
    num: '02',
    title: 'Autonomous AI & Vector Search',
    desc: 'Multi-agent LangGraph ReAct state machines, Qdrant & Atlas hybrid vector search, and model gateways with automatic failover.',
    tags: ['LangGraph', 'Gemini API', 'Qdrant', 'MongoDB Vector', 'Playwright'],
  },
  {
    num: '03',
    title: 'Consumer Scale & Mobile Engineering',
    desc: 'React Native & Next.js architectures shipped to 10,000+ real users on Google Play Store with real-time WebSocket sync.',
    tags: ['React Native', 'Next.js 14', 'WebSockets', 'TailwindCSS'],
  },
  {
    num: '04',
    title: 'Cloud Infrastructure & Reliability',
    desc: 'Dockerized microservices deployed on Google Cloud Run maintaining 99.9% uptime SLA across 50,000+ daily production transactions.',
    tags: ['Google Cloud Run', 'Docker', 'CI/CD Pipelines', 'Linux'],
  },
];

export default function IglooPortfolio() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [copiedBio, setCopiedBio] = useState(false);

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Web Audio Glacial Wind Ambient Synthesizer
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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

  const toggleSound = () => {
    if (!soundEnabled) {
      // Start ambient wind synthesizer
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Generate pink/brown ambient wind noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.96 * b1 + white * 0.1;
          b2 = 0.86 * b2 + white * 0.25;
          output[i] = (b0 + b1 + b2) * 0.15;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Lowpass glacial filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
        gainNodeRef.current = gain;
        setSoundEnabled(true);
      } catch {
        /* audio blocked */
      }
    } else {
      // Stop audio
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          audioCtxRef.current?.close();
          setSoundEnabled(false);
        }, 500);
      } else {
        setSoundEnabled(false);
      }
    }
  };

  const openJarvis = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt } }));
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(
      `Aryan Chandra — Software Engineer (SDE-1 / Full-Stack / AI Systems)\n• 10,000+ Downloads on Google Play Store (Fonofy Partner App, 4.8★)\n• Google Cloud Agentic Premier League: Top Builder Award\n• Enterprise RAG Copilot: Java 21, Spring Boot 3, Kafka, Qdrant — sub-200ms P95\n• 420+ LeetCode DSA Problems Solved | Delhi NCR, India (Open to Remote & Relocation)\n• Email: aryanchandra3456@gmail.com | Phone: +91 92057 23006\n• Resume: ${DEFAULT_RESUME_URL}`
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
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-[#1b2230] font-mono selection:bg-[#4a5568] selection:text-white overflow-x-hidden">
      {/* ── 1. The 3D Glacial Igloo Canvas (Full Viewport) ──────────── */}
      <IglooGlacialCanvas
        scrollProgress={scrollProgress}
        activeSection={activeSection}
        hoveredProjectIndex={hoveredProject}
      />

      {/* ── 2. Fixed Igloo.inc Minimalist Editorial Header ──────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between p-6 md:p-10 pointer-events-none">
        {/* Top Left: Logo & Copyright */}
        <div className="pointer-events-auto space-y-1">
          <Link href="#hero" className="inline-block group">
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#18212e] uppercase font-sans">
              ARYAN
            </span>
          </Link>
          <div className="text-[11px] leading-relaxed text-[#434f63]">
            <p>// Copyright © 2026</p>
            <p>Aryan Chandra</p>
            <p className="font-semibold text-[#18212e]">Software Engineer // AI Systems</p>
          </div>
        </div>

        {/* Top Right: Manifesto */}
        <div className="pointer-events-auto max-w-xs md:max-w-sm text-right space-y-1">
          <p className="text-[12px] font-bold text-[#18212e] tracking-wider">////// Manifesto</p>
          <p className="text-[11px] leading-relaxed text-[#434f63]">
            Our mission is to build the next generation of intelligent software,
            distributed systems, and interactive AI experiences at consumer scale.
          </p>
        </div>
      </header>

      {/* ── 3. Bottom Fixed Telemetry & Sound Controls ──────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-between p-6 md:p-10 pointer-events-none">
        {/* Bottom Left: Scroll & Audio Toggle */}
        <div className="pointer-events-auto space-y-2 text-[11px] text-[#434f63]">
          <p className="flex items-center gap-1.5 font-medium text-[#18212e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18212e] animate-pulse" />
            Scroll down to explore ↓
          </p>
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 hover:text-[#18212e] transition-colors uppercase tracking-wider text-[10px]"
          >
            {soundEnabled ? <Volume2 size={13} className="text-[#18212e]" /> : <VolumeX size={13} />}
            <span>Sound: {soundEnabled ? 'Ambient Glacial // ON' : 'Off'}</span>
          </button>
        </div>

        {/* Bottom Right: Jarvis 3D Launcher & Fast Actions */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => openJarvis()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18212e]/10 hover:bg-[#18212e]/20 border border-[#18212e]/20 text-[#18212e] text-[11px] font-bold tracking-wider backdrop-blur-md transition-all shadow-sm"
          >
            <Bot size={13} />
            <span>JARVIS COPILOT ✦</span>
          </button>

          <a
            href={DEFAULT_RESUME_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#18212e] hover:bg-[#2b3749] text-white text-[11px] font-bold tracking-wider transition-all shadow-sm"
          >
            <Download size={13} />
            <span>RESUME</span>
          </a>
        </div>
      </div>

      {/* ── 4. Main Scroll Narrative Chapters Layered on 3D ─────────── */}
      <main className="relative z-10 w-full">
        {/* ── CHAPTER 01: HERO OPENING ───────────────────────────────── */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col justify-start items-center text-center px-6 md:px-12 pt-24 md:pt-32 pointer-events-none"
        >
          <div className="max-w-2xl space-y-4 pointer-events-auto bg-white/80 backdrop-blur-md border border-white/80 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-900/5">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase bg-[#18212e]/10 border border-[#18212e]/15 text-[#18212e] font-semibold">
              Available for SDE-1 / Software Engineering Roles
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0f172a] font-sans uppercase">
              ARYAN CHANDRA
            </h1>

            <p className="text-xs sm:text-sm text-[#334155] max-w-lg mx-auto leading-relaxed">
              Software Engineer specializing in Java 21, Spring Boot 3, Kafka,
              and autonomous multi-agent AI systems. Shipped consumer mobile apps
              with over <strong className="text-[#0f172a] font-bold">10,000+ Google Play Store downloads</strong>.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <a
                href="#projects"
                className="px-4 py-2 rounded-lg bg-[#0f172a] text-white text-xs font-bold tracking-wider hover:bg-[#1e293b] transition-all flex items-center gap-2"
              >
                <span>EXPLORE WORK</span>
                <ArrowRight size={13} />
              </a>

              <a
                href={DEFAULT_RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#0f172a]/10 hover:bg-[#0f172a]/20 border border-[#0f172a]/20 text-[#0f172a] text-xs font-bold tracking-wider transition-all flex items-center gap-1.5"
              >
                <FileText size={13} />
                <span>RESUME (PDF)</span>
              </a>

              <button
                onClick={copyBrief}
                className="px-3 py-2 rounded-lg bg-[#0f172a]/5 hover:bg-[#0f172a]/15 border border-[#0f172a]/15 text-[#475569] hover:text-[#0f172a] text-xs tracking-wider transition-all flex items-center gap-1.5"
                title="Copy Quick Candidate Summary"
              >
                {copiedBio ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedBio ? 'COPIED' : 'COPY BRIEF'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: THE FOUNDRY (DISTRIBUTED SYSTEMS) ─────────── */}
        <section
          id="architecture"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-5xl mx-auto w-full space-y-12">
            <div className="space-y-2">
              <p className="text-xs text-[#526177] tracking-widest uppercase font-bold">
                Chapter 02 // The Foundry
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-[#18212e] font-sans tracking-tight">
                High-Throughput Engineering & Distributed Architecture
              </h2>
              <p className="text-sm text-[#434f63] max-w-2xl leading-relaxed">
                As the 3D igloo expands, the core quantum monolith powers enterprise
                data streams, asynchronous Kafka events, and sub-200ms vector retrieval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARCHITECTURE_PILLARS.map((p) => (
                <div
                  key={p.num}
                  className="p-8 rounded-xl bg-white/75 backdrop-blur-xl border border-[#cbd5e1] hover:border-[#18212e]/40 transition-all space-y-4 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18212e] tracking-widest">
                      PILLAR // {p.num}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#18212e]/40 group-hover:bg-[#18212e] transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-[#18212e] font-sans">{p.title}</h3>
                  <p className="text-xs leading-relaxed text-[#434f63]">{p.desc}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {p.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#18212e]/5 border border-[#18212e]/10 text-[#2d3748]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: THE ARTIFACTS (VERIFIED PROJECTS) ─────────── */}
        <section
          id="projects"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-5xl mx-auto w-full space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs text-[#526177] tracking-widest uppercase font-bold">
                  Chapter 03 // The Artifacts
                </p>
                <h2 className="text-3xl sm:text-5xl font-black text-[#18212e] font-sans tracking-tight">
                  Featured Production Systems
                </h2>
                <p className="text-sm text-[#434f63] max-w-xl leading-relaxed">
                  Proven systems with public GitHub codebases, benchmarked latencies,
                  and live cloud runtimes.
                </p>
              </div>

              <div className="text-xs text-[#526177] tracking-widest">
                VERIFIED FLAGSHIPS // 04
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  onMouseEnter={() => setHoveredProject(idx)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-[#cbd5e1] hover:border-[#18212e]/50 transition-all space-y-5 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18212e] tracking-widest">
                      ARTIFACT // {proj.id}
                    </span>
                    <a
                      href={proj.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-md bg-[#18212e]/5 hover:bg-[#18212e] hover:text-white border border-[#18212e]/10 flex items-center justify-center text-[#18212e] transition-all"
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#18212e] font-sans group-hover:text-[#2b6cb0] transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-[#526177] uppercase tracking-wider">
                      {proj.subtitle}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#434f63]">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.metrics.map((m, k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18212e]/10 border border-[#18212e]/20 text-[#18212e]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.stack.map((s, si) => (
                      <span
                        key={si}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#18212e]/5 border border-[#18212e]/10 text-[#4a5568]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHAPTER 04: THE ECOSYSTEM (10,000+ DOWNLOADS) ─────────── */}
        <section
          id="apps"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-5xl mx-auto w-full space-y-12">
            <div className="space-y-2">
              <p className="text-xs text-[#526177] tracking-widest uppercase font-bold">
                Chapter 04 // The Ecosystem
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-[#18212e] font-sans tracking-tight">
                Shipped to 10,000+ Real Mobile Users
              </h2>
              <p className="text-sm text-[#434f63] max-w-xl leading-relaxed">
                Mobile products live on Google Play Store and Apple App Store powering
                device trade-in evaluation, tournament scoring, and healthcare dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOBILE_APPS.map((app, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-[#cbd5e1] hover:border-[#18212e]/40 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18212e]/10 border border-[#18212e]/20 text-[#18212e]">
                      {app.downloads} USERS
                    </span>
                    <span className="text-xs font-bold text-[#18212e]">{app.rating}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#18212e] font-sans">{app.name}</h3>
                    <p className="text-[11px] text-[#526177]">{app.role}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#434f63]">{app.desc}</p>

                  <div className="pt-2">
                    <a
                      href={app.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18212e] hover:underline"
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

        {/* ── CHAPTER 05: THE COPILOT (JARVIS AI LAB) ───────────────── */}
        <section
          id="ailab"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-4xl mx-auto w-full space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs text-[#526177] tracking-widest uppercase font-bold">
                Chapter 05 // The Copilot
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-[#18212e] font-sans tracking-tight">
                Jarvis Autonomous Engineering Assistant
              </h2>
              <p className="text-sm text-[#434f63] max-w-xl mx-auto leading-relaxed">
                Interact with Aryan's live conversational AI copilot. Ask about system
                architecture decisions, candidate screening questions, or test voice mode.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
              {[
                'Screen Aryan as an SDE-1 candidate',
                'Explain your Java 21 + Kafka architecture',
                'Tell me about the Fonofy app metrics',
                'What is your DSA solved streak?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => openJarvis(q)}
                  className="px-3.5 py-2 rounded-md bg-white/80 hover:bg-[#18212e] hover:text-white border border-[#cbd5e1] text-xs text-[#2d3748] transition-all shadow-sm"
                >
                  "{q}"
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => openJarvis()}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-[#18212e] hover:bg-[#2d3748] text-white text-xs font-bold tracking-wider shadow-lg transition-all"
              >
                <Bot size={15} />
                <span>LAUNCH CONVERSATION</span>
                <Sparkles size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 06: THE NEXUS (CONTACT & COORDINATES) ─────────── */}
        <section
          id="contact"
          className="relative min-h-screen py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center"
        >
          <div className="max-w-4xl mx-auto w-full space-y-12">
            <div className="space-y-2 text-center">
              <p className="text-xs text-[#526177] tracking-widest uppercase font-bold">
                Chapter 06 // The Nexus
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-[#18212e] font-sans tracking-tight uppercase">
                Initiate Transmission
              </h2>
              <p className="text-sm text-[#434f63] max-w-lg mx-auto leading-relaxed">
                Open for Software Engineer / SDE-1 / AI Engineer roles. Available immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Direct coordinates */}
              <div className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-[#cbd5e1] space-y-6 shadow-sm">
                <h3 className="text-base font-bold text-[#18212e] font-sans uppercase">
                  Direct Coordinates
                </h3>

                <div className="space-y-3.5 text-xs text-[#2d3748]">
                  <a
                    href="mailto:aryanchandra3456@gmail.com"
                    className="flex items-center gap-3 hover:text-[#18212e] transition-colors"
                  >
                    <Mail size={15} className="text-[#18212e] shrink-0" />
                    <span>aryanchandra3456@gmail.com</span>
                  </a>

                  <a
                    href="tel:+919205723006"
                    className="flex items-center gap-3 hover:text-[#18212e] transition-colors"
                  >
                    <Phone size={15} className="text-[#18212e] shrink-0" />
                    <span>+91 92057 23006</span>
                  </a>

                  <div className="flex items-center gap-3 text-[#526177]">
                    <MapPin size={15} className="text-[#18212e] shrink-0" />
                    <span>Delhi NCR, India (Open to Remote & Relocation)</span>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <a
                      href="https://github.com/TheAryanchandra"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-md bg-[#18212e]/5 hover:bg-[#18212e] hover:text-white border border-[#18212e]/10 flex items-center justify-center transition-all"
                      title="GitHub"
                    >
                      <Github size={16} />
                    </a>

                    <a
                      href="https://linkedin.com/in/aryanchandra"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-md bg-[#18212e]/5 hover:bg-[#18212e] hover:text-white border border-[#18212e]/10 flex items-center justify-center transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>

                    <a
                      href={DEFAULT_RESUME_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-md bg-[#18212e]/5 hover:bg-[#18212e] hover:text-white border border-[#18212e]/10 flex items-center justify-center transition-all"
                      title="Resume PDF"
                    >
                      <FileText size={16} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Transmission Form */}
              <form
                onSubmit={handleContactSubmit}
                className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-[#cbd5e1] space-y-4 shadow-sm"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-[#526177] uppercase font-bold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Recruiter / Engineering Manager"
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#cbd5e1] text-xs text-[#18212e] focus:outline-none focus:border-[#18212e] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#526177] uppercase font-bold">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#cbd5e1] text-xs text-[#18212e] focus:outline-none focus:border-[#18212e] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#526177] uppercase font-bold">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Discuss SDE-1 opportunity or distributed architecture..."
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#cbd5e1] text-xs text-[#18212e] focus:outline-none focus:border-[#18212e] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-md bg-[#18212e] hover:bg-[#2d3748] text-white text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>TRANSMISSION CONFIRMED</span>
                    </>
                  ) : submitting ? (
                    <span>TRANSMITTING...</span>
                  ) : (
                    <>
                      <span>SEND TRANSMISSION</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ── 5. Integrated Jarvis 3D AI Assistant ────────────────────── */}
      <AiVoiceAssistant hideTriggerButton={true} />
    </div>
  );
}
