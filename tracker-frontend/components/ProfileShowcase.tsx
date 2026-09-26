'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bot,
  BrainCircuit,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Linkedin,
  Mail,
  MapPin,
  Maximize2,
  Minimize2,
  Network,
  Phone,
  Radio,
  Rocket,
  Search,
  Server,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Wifi,
  Workflow,
  Zap,
} from 'lucide-react';
import ThreeProfileCanvas, { ObjectType, ThemeColor } from './ThreeProfileCanvas';
import ThemeToggle from './ThemeToggle';

const TARGET_ROLE_FITS = [
  {
    role: 'Software Engineer / SDE-1 / SWE-1',
    capability: 'End-to-end product ownership using JavaScript, TypeScript, Node.js, Express, Next.js, Java, Spring Boot, MongoDB, and cloud systems.',
    tags: ['Java 21', 'Spring Boot 3', 'Node.js', 'Next.js 14', 'PostgreSQL', 'MongoDB'],
    accent: 'border-amber-500/40 bg-amber-500/5 text-amber-500',
  },
  {
    role: 'Full Stack Engineer',
    capability: 'Frontend dashboard, backend APIs, web application integration, live WebSocket events, and cloud-ready Docker deployment.',
    tags: ['React 18', 'TypeScript', 'TailwindCSS', 'REST APIs', 'WebSockets', 'Next.js App Router'],
    accent: 'border-blue-500/40 bg-blue-500/5 text-blue-500',
  },
  {
    role: 'Backend Engineer',
    capability: 'High-throughput REST APIs, auth workflows, data integrity, DB modeling, Redis caching, event systems, and distributed service patterns.',
    tags: ['Express 5', 'Spring Security', 'Kafka Streams', 'Redis Caching', 'Database Sharding', 'Microservices'],
    accent: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500',
  },
  {
    role: 'AI Engineer',
    capability: 'Gemini-powered Multimodal Vision OCR, web scraping, agentic ReAct workflows, RAG, semantic TF-IDF memory, and vector retrieval.',
    tags: ['LangGraph', 'Gemini 1.5 Flash', 'Qdrant Vector DB', 'TF-IDF RAG', 'Multi-Agent State Graphs', 'Function Calling'],
    accent: 'border-purple-500/40 bg-purple-500/5 text-purple-500',
  },
  {
    role: 'Product / Startup Engineering',
    capability: 'Automation workflow design, portfolio-grade products, real-time dashboard systems, cloud servicing, and AI-assisted user tooling.',
    tags: ['Google Sheets Auto-Sync', 'Playwright Scraping', 'Rapid Prototyping', 'CI/CD Pipelines', 'Cloud Run'],
    accent: 'border-rose-500/40 bg-rose-500/5 text-rose-500',
  },
];

const STAR_REPORTS = [
  {
    id: 'sheets',
    title: '1. Live Google Sheets Auto-Sync & Real-Time Reflection',
    icon: FileSpreadsheet,
    badge: '1-min Cron Sync',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    situation: 'Engineering tracking data was updated manually in Google Sheets, causing discrepancy with the web dashboard unless manually re-uploaded.',
    task: 'Automatically synchronize the live Google Sheet with the backend every minute without requiring manual CSV exports or Google Cloud API service account credentials, and immediately reflect changes across all active client dashboards.',
    action: [
      'Developed services/googleSheetsService.js using node-cron with a 1-minute scheduling interval (*/1 * * * *).',
      'Utilized Google Sheets public CSV export pipeline (/export?format=csv&gid=<GID>) with automatic header pattern detection.',
      'Built smart upsert mapping for DailyTracker, ApplicationTracker, DsaProgress, and DsaLectures.',
      'Dispatched SHEET_SYNCED and DATA_UPDATED WebSocket broadcast events whenever changes are detected.',
      'Implemented SheetSyncStatus React component on dashboard with live sync timestamps and 1-click manual sync override.',
    ],
    result: 'Any edit made to the live Google Sheet updates MongoDB and instantly triggers a smooth, non-blocking dashboard refresh across all connected client tabs in under 2 seconds.',
  },
  {
    id: 'ws',
    title: '2. High-Performance WebSocket Real-Time Event Layer',
    icon: Wifi,
    badge: 'Zero Latency',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    situation: 'Standard HTTP REST polling created unnecessary network traffic, high latency, and stale dashboard metrics during active sessions.',
    task: 'Establish a persistent, bi-directional communication layer to stream database mutations, Google Sheets sync notifications, and AI action triggers to the UI.',
    action: [
      'Upgraded Express HTTP server into a dual HTTP/WebSocket server using the ws library on path /ws in services/websocketService.js.',
      'Implemented client heartbeat pings (every 25s) with automatic reconnection.',
      'Built a client-side singleton React hook (useWebSocket in lib/websocket.ts) with typed event subscriptions (SHEET_SYNCED, DATA_UPDATED, STATS_REFRESH, AI_ACTION, JOBS_UPDATED).',
    ],
    result: 'Zero-latency real-time updates across the dashboard; when Jarvis executes an action (e.g., logging 3 DP problems), the dashboard numbers and progress rings update immediately without refreshing.',
  },
  {
    id: 'jarvis',
    title: '3. Jarvis Agentic AI Copilot (ReAct Loop & Multi-Turn Persona)',
    icon: Bot,
    badge: 'ReAct Agent',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    situation: 'Standard chatbot assistants are rigid, repetitive, forget conversation context, and cannot take proactive actions or answer questions outside a fixed database.',
    task: 'Build an autonomous, human-like AI companion (Jarvis) with continuous multi-turn memory, nuanced reasoning comparable to Claude 3.5 Sonnet, and tool-calling capabilities.',
    action: [
      'Engineered ai/agentOrchestrator.js utilizing a ReAct (Reason + Act) loop with Google Gemini function declarations (search_web, scrape_url, query_database, search_jobs, log_daily_activity, log_application, get_memory).',
      'Implemented persistent conversation storage in MongoDB (ConversationLog & LearnedFact) paired with client-side localStorage caching.',
      'Designed an empathetic, high-intelligence engineering mentor persona capable of seamless English and Hinglish communication.',
      'Integrated Server-Sent Events (SSE) for token-by-token typewriter streaming with visual agent activity badges.',
    ],
    result: 'Jarvis answers any general programming, career, or life question, remembers past user statements across sessions, and autonomously calls tools to update the database in real time.',
  },
  {
    id: 'ocr',
    title: '4. Multimodal Vision OCR & Document Intelligence',
    icon: Eye,
    badge: 'Gemini Vision',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    situation: 'Users frequently encounter job descriptions, offer letters, resume PDFs, or LeetCode questions as images and screenshots that cannot be pasted as plaintext.',
    task: 'Enable drag-and-drop and attachment of images (PNG, JPG, WebP) and documents (PDF, DOCX, TXT) with automatic optical character recognition (OCR) and semantic chunk indexing.',
    action: [
      'Built ai/ocrEngine.js using Gemini Multimodal Vision API to parse images, identify document types (Offer Letter, Job Description, LeetCode problem, Resume), and extract structured entities.',
      'Integrated pdf-parse for extraction of multi-page PDF documents.',
      'Implemented dynamic TF-IDF vector memory insertion via vectorStore.addChunk(), making uploaded files immediately queryable via RAG.',
      'Built a drag-and-drop attachment UI in AiVoiceAssistant.tsx with live image thumbnails and processing indicators.',
    ],
    result: 'Users can upload a screenshot of a LeetCode problem or a job posting and immediately ask Jarvis: "Summarize the edge cases" or "Draft a tailored cover letter for this role".',
  },
  {
    id: 'scraper',
    title: '5. Live Internet Search & Web Scraping Engine',
    icon: Search,
    badge: 'Zero API Key Scraper',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    situation: 'LLM knowledge cutoffs and lack of browsing capabilities prevented the assistant from answering questions about current hiring trends, new library releases, or external job links.',
    task: 'Equip Jarvis with live internet search and URL scraping capabilities with zero API key dependencies.',
    action: [
      'Developed ai/webScraper.js with DuckDuckGo HTML search scraping and Cheerio DOM parsing.',
      'Built tailored extractors for LinkedIn job descriptions, Naukri postings, LeetCode problems, and GitHub repositories.',
      'Implemented an in-memory 12-hour cache with automatic RAG vector indexing.',
    ],
    result: 'Jarvis can be asked to "Search the web for hiring trends at Google" or given a URL: "Read this job posting and tell me if my tech stack matches".',
  },
];

const FLAGSHIP_APPS = [
  {
    name: 'Fonofy Partners',
    tagline: 'Refurbished Device Commerce & Diagnostics Platform',
    platform: 'Android — Google Play Store',
    downloads: '10,000+',
    rating: '4.8 ★',
    desc: 'B2B merchant app for device diagnostic evaluation, automated trade-in grading, dynamic pricing engine, and order fulfillment powering a nationwide supply chain.',
    url: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    tech: ['React Native', 'Node.js', 'MongoDB', 'REST APIs'],
  },
  {
    name: 'Delhi Golf Federation',
    tagline: 'Tournament Scoring & League Management System',
    platform: 'iOS & Android Store',
    downloads: '5,000+',
    rating: '4.9 ★',
    desc: 'Real-time tournament scoring, handicap calculations, live leaderboard tracking, and professional member profiles used by premier golf clubs.',
    url: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    tech: ['React Native', 'Spring Boot', 'PostgreSQL', 'WebSockets'],
  },
  {
    name: 'Carenzy',
    tagline: 'Personalized Healthcare & Caregiver Booking',
    platform: 'Android Application',
    downloads: '2,000+',
    rating: '4.7 ★',
    desc: 'On-demand caregiver dispatch, real-time medical vitals telemetry, appointment scheduling, and patient health timeline management platform.',
    url: 'https://carenzy.com',
    tech: ['React Native', 'Node.js', 'Firebase', 'GCP'],
  },
];

export default function ProfileShowcase() {
  const [activeStarTab, setActiveStarTab] = useState<string>('sheets');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#3b82f6', '#10b981'],
      });
    } catch {
      // Fallback
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    fireConfetti();
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] transition-colors duration-300">
      {/* ── Top Navigation Bar on Profile Page ─────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[var(--modal-bg)] border-b border-[var(--card-border)] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-md">
              AC
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Aryan Chandra</span>
              <span className="text-[10px] text-amber-500 font-mono">Software Engineer & AI Builder</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <span>Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Tracker Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          <button
            onClick={() => handleCopy('aryanchandra3456@gmail.com', 'email')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            {copiedType === 'email' ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedType === 'email' ? 'Copied Email!' : 'Hire Aryan'}</span>
            <span className="sm:hidden">Hire</span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ── Hero Section with 3D Three.js Object Viewport ────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Identity & Hiring Pitch */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Available Immediately • Open to SDE-1 / SWE-1 / Full-Stack / AI Roles</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Aryan Chandra
              </h1>
              <p className="text-lg sm:text-xl font-medium text-amber-500">
                Software Engineer • Full-Stack, Backend & AI Product Builder
              </p>
            </div>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Engineering high-throughput distributed backends, mobile platforms, and autonomous agentic workflows with{' '}
              <strong className="text-[var(--text-primary)]">Java 21, Spring Boot 3, Node.js, Next.js, WebSockets</strong>, and{' '}
              <strong className="text-[var(--text-primary)]">Google Gemini AI</strong>. Built production systems handling{' '}
              <span className="text-amber-500 font-semibold">50,000+ daily transactions</span> and applications with{' '}
              <span className="text-amber-500 font-semibold">10,000+ Play Store downloads</span>.
            </p>

            {/* Quick Profile Metas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)]">
                <span className="text-[var(--text-tertiary)] block">Location</span>
                <span className="font-semibold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> New Delhi, India
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)]">
                <span className="text-[var(--text-tertiary)] block">Target Companies</span>
                <span className="font-semibold flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Product, MNCs, GCCs
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] col-span-2 sm:col-span-1">
                <span className="text-[var(--text-tertiary)] block">Experience</span>
                <span className="font-semibold flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" /> Ta Rule & IOCL
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  fireConfetti();
                  window.open('/resume.pdf', '_blank');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>

              <button
                onClick={() => handleCopy('aryanchandra3456@gmail.com', 'email')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-sm font-semibold hover:border-amber-500 transition active:scale-95"
              >
                {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'email' ? 'Email Copied!' : 'Copy Email'}</span>
              </button>

              <button
                onClick={() => handleCopy('+919205723006', 'phone')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-sm font-semibold hover:border-amber-500 transition active:scale-95"
              >
                {copiedType === 'phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Phone className="w-4 h-4" />}
                <span>{copiedType === 'phone' ? 'Phone Copied!' : '+91 9205723006'}</span>
              </button>

              <a
                href="https://github.com/TheAryanchandra"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-white hover:border-amber-500 transition"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/thearyanchandra/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-white hover:border-amber-500 transition"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Three.js 3D Showcase */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Interactive 3D Engineering Core (Three.js WebGL)</span>
              </div>
              <span className="text-[11px] text-zinc-500">Move mouse to tilt & rotate</span>
            </div>

            {/* Three.js Canvas */}
            <ThreeProfileCanvas initialObject="architect" initialTheme="gold" showControls={true} />

            <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] px-2">
              <span>3 Professional 3D Models: System Architect · Neural Core · Data Pipeline</span>
              <span className="font-mono text-amber-500/80">WebGL 2.0 Accelerated</span>
            </div>
          </div>
        </section>

        {/* ── Architecture Overview ────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Platform System Architecture</h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Autonomous Engineer Growth Platform with real-time multi-agent orchestration and cloud sync
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Full-Stack Bi-Directional</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] font-mono text-xs overflow-x-auto shadow-xl">
            <div className="min-w-[680px] text-zinc-300 space-y-3">
              <div className="flex justify-center">
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-center">
                  Live Google Sheet (Cloud Engine)<br />
                  <span className="text-[10px] text-emerald-300 font-normal">Daily Logs • DSA 18 Topics • Applications • Lectures (1-min Cron Polling)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="text-emerald-500 font-bold">▼</span>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-center">
                  <strong className="block text-blue-400">Next.js 14 App</strong>
                  <span className="text-[10px]">Apple Glassmorphism UI & Three.js 3D</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
                  <strong className="block text-amber-400">Node / Express Backend</strong>
                  <span className="text-[10px]">WebSocket Server on /ws & Heartbeat</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-center">
                  <strong className="block text-purple-400">MongoDB Atlas</strong>
                  <span className="text-[10px]">Collections & Hybrid Vector Search</span>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="text-amber-500 font-bold">▲ ▼</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/60">
                <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span>Jarvis Autonomous Agentic Engine (ReAct Loop)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400">
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">• DuckDuckGo Web Search</div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">• Gemini Multimodal Vision</div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">• Cheerio Web Scraper</div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">• TF-IDF Semantic Memory</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Target Role Fit Grid ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Target Role Fit & Demonstrated Depth</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Tailored capabilities proven through production codebases and real-world architectures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TARGET_ROLE_FITS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-md group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-amber-500">0{idx + 1}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${item.accent}`}>
                      Ready
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-amber-500 transition">
                    {item.role}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.capability}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-lg bg-[var(--card-flat)] border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-tertiary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Experience Signal & Flagship Mobile Apps ──────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Experience Signals */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Experience Signal</h2>
            <div className="space-y-4">
              {/* Experience 1 */}
              <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">Ta Rule Technology Pvt. Ltd.</h3>
                    <p className="text-xs text-amber-500 font-medium">Software Engineer • Full Stack, Backend, Java & Mobile Systems</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-mono">
                    Production
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Architected and scaled the <strong>GiantCell Healthcare Commerce Platform</strong> with 150+ REST APIs, payment gateways (Razorpay, Paytm), real-time inventory synchronization, and 50,000+ daily transactions with 99.9% uptime SLA.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Java 21</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Spring Boot</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Node.js</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Redis</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">React Native</span>
                </div>
              </div>

              {/* Experience 2 */}
              <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">Indian Oil Corporation Limited (IOCL)</h3>
                    <p className="text-xs text-amber-500 font-medium">Software Engineer Intern • ML Inference & Forecasting</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[11px] font-mono">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Developed automated telemetry pipelines and machine learning inference models for industrial fuel supply forecasting, telemetry monitoring, and inventory anomaly detection.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Python</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Time-Series ML</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Data Pipelines</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--card-flat)]">Telemetry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flagship Mobile & Deployed Apps */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Flagship Mobile Apps</h2>
            <div className="space-y-4">
              {FLAGSHIP_APPS.map((app, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/40 transition-all duration-300 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--text-primary)]">{app.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                          {app.downloads}
                        </span>
                      </div>
                      <p className="text-xs text-amber-500 font-medium mt-0.5">{app.tagline}</p>
                    </div>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] hover:text-amber-500 transition flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{app.desc}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.tech.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-lg bg-[var(--card-flat)] border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-tertiary)]"
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

        {/* ── Comprehensive STAR Method Feature Report ──────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">STAR Method Feature Deep Dives</h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Structured engineering reports (Situation, Task, Action, Result) for hiring interview evaluations
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {STAR_REPORTS.map((report) => {
              const Icon = report.icon;
              const isActive = activeStarTab === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveStarTab(report.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                      : 'bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{report.title.split('. ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Active STAR Details */}
          {(() => {
            const report = STAR_REPORTS.find((r) => r.id === activeStarTab) || STAR_REPORTS[0];
            const Icon = report.icon;
            return (
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">{report.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${report.badgeColor}`}>
                        {report.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Situation */}
                  <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] space-y-1.5">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Situation (S)</span>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{report.situation}</p>
                  </div>

                  {/* Task */}
                  <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] space-y-1.5">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Task (T)</span>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{report.task}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] space-y-2">
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Action (A)</span>
                  <ul className="space-y-1.5">
                    {report.action.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Result */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Result (R)</span>
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed">{report.result}</p>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── Footer / Recruiter CTA ─────────────────────────────────────── */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black/40 to-amber-500/10 border border-amber-500/30 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
            <Rocket className="w-3.5 h-3.5" />
            <span>Ready for Immediate Onboarding</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Let's Build Impactful Software Together
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Whether you need a high-velocity SDE-1 / SWE-1, a full-stack engineer who owns features end-to-end, or an AI builder who ships production agents and RAG pipelines — Aryan Chandra is ready to contribute from day one.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleCopy('aryanchandra3456@gmail.com', 'email')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>{copiedType === 'email' ? 'Email Copied!' : 'aryanchandra3456@gmail.com'}</span>
            </button>

            <button
              onClick={() => handleCopy('+919205723006', 'phone')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-sm font-semibold hover:border-amber-500 transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{copiedType === 'phone' ? 'Phone Copied!' : '+91 9205723006'}</span>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] text-sm font-semibold hover:text-amber-500 transition active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
