'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowUpRight,
  BrainCircuit,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  FileSpreadsheet,
  Github,
  Globe2,
  Linkedin,
  MapPin,
  Sparkles,
  Terminal,
  Zap,
  Trophy,
  GraduationCap,
  Cpu,
  Layers,
  Smartphone,
  FileText,
  Send,
  Server,
  ShieldCheck,
  Activity,
  GitBranch,
  Boxes,
  Search,
  Gauge,
  DatabaseZap,
  Network,
  CheckCircle2,
  BriefcaseBusiness,
  CodeXml,
  Rocket,
  Bot,
  BarChart3,
  CalendarCheck,
  Clock3,
  Users,
  Package,
  LockKeyhole,
  Workflow,
  ExternalLink,
  Mail,
  Phone,
  ChevronDown,
  LayoutDashboard,
  Youtube,
  Briefcase,
  Menu,
  UploadCloud,
} from 'lucide-react';

import { fetchDashboardStats, submitContactForm } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import ThemeToggle from '@/components/ThemeToggle';

const defaultStats = {
  solvedDsaProblems: 0,
  totalDsaProblems: 100,
  totalAppsLogged: 0,
  currentDsaStreak: 0,
  overallDsaPercent: 0,
  dailyTracker: {
    daysTracked: 0,
  },
};

const impactMetrics = [
  {
    value: '3 Apps',
    label: 'Play Store & App Store',
    detail: 'Fonofy, Golf Fed, Carenzy',
    icon: Smartphone,
  },
  {
    value: '50K+',
    label: 'Daily Transactions',
    detail: 'Production commerce platform',
    icon: Activity,
  },
  {
    value: '1,000+',
    label: 'Listings & Golfers',
    detail: 'Live mobile active users',
    icon: Users,
  },
  {
    value: '99.9%',
    label: 'Platform Uptime',
    detail: 'Reliable transaction backbone',
    icon: Gauge,
  },
  {
    value: '70%',
    label: 'Latency Reduction',
    detail: '8.2s → 2.4s inference',
    icon: Zap,
  },
  {
    value: '150+',
    label: 'REST APIs',
    detail: 'Payment & order workflows',
    icon: Network,
  },
];

const projects = [
  {
    number: '01',
    title: 'AI Engineering Knowledge Copilot',
    type: 'Enterprise RAG / Backend Systems',
    description:
      'Enterprise knowledge retrieval platform built with Java 21, Spring Boot and Spring AI. Designed a JWT-secured RBAC API gateway and event-driven Kafka retrieval pipeline with Qdrant vector search, PostgreSQL and Redis (HNSW vector indexing, BM25 + vector-score hybrid search) with sub-200ms latency.',
    stack: [
      'Java 21',
      'Spring Boot',
      'Spring AI',
      'Kafka',
      'Qdrant',
      'PostgreSQL',
      'Redis',
      'Docker',
    ],
    href: 'https://github.com/TheAryanchandra/AI-Copilot',
    icon: BrainCircuit,
    featured: true,
    metrics: ['JWT + RBAC', 'Kafka Events', 'Hybrid Search', 'Sub-200ms'],
  },
  {
    number: '02',
    title: 'Stadium Pulse — Crowd Intelligence',
    type: 'Agentic AI / Google Cloud Premier League',
    description:
      'Agentic crowd-intelligence system built in Python with LangGraph multi-agent orchestration workflows calling Gemini API with prompt-engineered, structured Pydantic output, plus OpenAI embeddings for real-time semantic analysis and pattern detection. Deployed on Google Cloud Run at sub-500ms latency. Recognized as top builder in Google Cloud Agentic Premier League (April 2026).',
    stack: ['Python', 'LangGraph', 'Gemini API', 'OpenAI', 'Pydantic', 'Cloud Run'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
    icon: Globe2,
    featured: true,
    metrics: ['Multi-Agent', 'Sub-500ms', 'Semantic Search', 'Cloud Run'],
  },
  {
    number: '03',
    title: 'GiantCell Healthcare Commerce Platform',
    type: 'Full-Stack Commerce / Distributed Backend',
    description:
      'Production MERN & Java healthcare commerce platform handling pharmacy, diagnostics, and consultations on AWS (EC2, S3). Shipped 150+ REST APIs, automated Razorpay payments, and engineered distributed inventory management across 5 warehouses and 200K+ SKUs scaling to 50K+ daily transactions at 99.9% uptime.',
    stack: ['React.js', 'Node.js', 'Express.js', 'Java Servlets', 'MongoDB', 'Redis', 'AWS EC2/S3'],
    href: 'https://github.com/TheAryanchandra',
    icon: DatabaseZap,
    featured: true,
    metrics: ['50K+ Daily Txns', '99.9% Uptime', '200K+ SKUs', '150+ REST APIs'],
  },
  {
    number: '04',
    title: 'Fonofy — Mobile Phone Marketplace',
    type: 'Mobile Engineering / React Native & Android/iOS',
    description:
      'Built and shipped Fonofy, a cross-platform mobile marketplace app (React Native, JavaScript/TypeScript) live with 1,000+ product listings for buying and selling phones — engineered listings, search, end-to-end buyer-seller transactions, and in-app messaging; released to production on Android (Google Play Store) and iOS (App Store).',
    stack: [
      'React Native',
      'JavaScript',
      'TypeScript',
      'Android',
      'iOS',
      'REST APIs',
      'In-App Chat',
    ],
    href: 'https://github.com/TheAryanchandra',
    icon: Smartphone,
    featured: true,
    metrics: ['Play Store & App Store', '1,000+ Listings', 'Buyer-Seller Txns', 'In-App Chat'],
  },
  {
    number: '05',
    title: 'Delhi Golf Federation Mobile App',
    type: 'Mobile Engineering / Flutter, Dart & Location Tracking',
    description:
      'Developed the official Delhi Golf Federation mobile app (Flutter, Dart), serving 1,000+ concurrent member players — built live scorecards, membership management, real-time GPS player-location tracking, Razorpay-integrated payments, and an in-app wallet for membership/booking fees; live on Android (Google Play Store) and iOS (App Store).',
    stack: [
      'Flutter',
      'Dart',
      'Android',
      'iOS',
      'Razorpay SDK',
      'GPS Location',
      'In-App Wallet',
    ],
    href: 'https://github.com/TheAryanchandra',
    icon: Smartphone,
    featured: true,
    metrics: ['1,000+ Players', 'GPS Tracking', 'Razorpay Wallet', 'Play & App Store'],
  },
  {
    number: '06',
    title: 'Carenzy — Car Bidding & Marketplace App',
    type: 'Mobile Engineering / Flutter & Native Swift Module',
    description:
      'Built Carenzy, a car buy-and-sell marketplace app (Flutter, Dart) featuring VIN-verified vehicle listings and a real-time WebSocket bidding engine for live auctions; engineered a native Swift iOS module for camera-based VIN/registration scanning — live on Android (Google Play Store) and iOS (App Store).',
    stack: [
      'Flutter',
      'Dart',
      'Swift',
      'WebSockets',
      'Android',
      'iOS',
      'Camera VIN Scan',
    ],
    href: 'https://github.com/TheAryanchandra',
    icon: Smartphone,
    featured: true,
    metrics: ['Live Bidding Engine', 'Native Swift Module', 'VIN Camera Scan', 'Play & App Store'],
  },
  {
    number: '07',
    title: 'Jarvis — Personal SDE Command Copilot',
    type: 'Developer Platform / Full-Stack & RAG',
    description:
      'Personal engineering command center with live WebSocket state sync, automated Google Sheets background ingestion, n8n webhook workflow automation, and voice-assisted natural language task orchestration.',
    stack: ['Next.js', 'Node.js', 'WebSockets', 'LangChain', 'n8n', 'Tailwind CSS'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
    icon: Bot,
    featured: true,
    metrics: ['Live WS Sync', 'n8n Automations', 'SSE Streams', 'OCR RAG'],
  },
];

const capabilities = [
  {
    label: 'Backend & Systems Engineering',
    icon: Server,
    description:
      'Production APIs, authentication, microservices, distributed workflows and real-time services.',
    items:
      'Java (Spring Boot, Servlets) · Node.js · Express.js · REST APIs · WebSockets · Kafka · JWT · RBAC',
  },
  {
    label: 'Full-Stack Web Engineering',
    icon: Code2,
    description:
      'High-performance interfaces with modern React, Next.js, and Redux state architecture.',
    items:
      'React.js · Next.js · TypeScript · JavaScript · Redux · Tailwind CSS · D3.js · HTML5/CSS3',
  },
  {
    label: 'AI & ML Engineering',
    icon: Cpu,
    description:
      'Production RAG platforms, multi-agent workflows, Gemini & OpenAI APIs, and ML pipelines.',
    items:
      'LangGraph · Gemini API · LangChain · RAG · Qdrant · XGBoost · Scikit-Learn · OpenAI Embeddings',
  },
  {
    label: 'Databases & Caching',
    icon: Database,
    description:
      'Data modeling, aggregation pipelines, vector indexing and low-latency multi-layer caching.',
    items:
      'MongoDB · Redis · PostgreSQL · MySQL · Firestore · HNSW Indexing · BM25 Hybrid Search',
  },
  {
    label: 'Cloud & DevOps Infrastructure',
    icon: Cloud,
    description:
      'Production cloud deployments, containerization, and automated CI/CD release pipelines.',
    items:
      'AWS (EC2, S3) · Google Cloud Run · Docker · GitHub Actions CI/CD · Jest/Supertest',
  },
  {
    label: 'Mobile Engineering',
    icon: Smartphone,
    description:
      'Cross-platform & native mobile apps released live to Google Play Store & Apple App Store.',
    items:
      'React Native · Flutter · Swift (native iOS modules) · Dart · Play Store & App Store Deployment',
  },
];

const architectureItems = [
  {
    icon: Server,
    title: 'Backend Systems & API Gateway',
    description: 'Java Spring Boot & Node.js RESTful microservices, JWT/RBAC security, and third-party API integrations',
  },
  {
    icon: Network,
    title: 'Distributed Events & RAG',
    description: 'Kafka event-driven retrieval, vector search with Qdrant (HNSW indexing), and LangGraph multi-agent orchestration',
  },
  {
    icon: DatabaseZap,
    title: 'Data & Performance Layer',
    description: 'MongoDB aggregation pipelines, multi-layer Redis caching, query indexing, and 70% latency reduction',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform & Native Mobile',
    description: 'React Native & Flutter mobile apps with native Swift iOS modules and store releases',
  },
  {
    icon: GitBranch,
    title: 'DevOps & CI/CD Pipelines',
    description: 'Automated Jest/Supertest testing, GitHub Actions CI/CD with automated rollbacks, AWS EC2/S3 & Cloud Run',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Auth',
    description: 'JWT, OAuth, RBAC, session management, and PCI-compliant Razorpay payment automation',
  },
];

const experience = [
  {
    date: 'SEP 2024 — NOW',
    company: 'Ta Rule Technology Pvt. Ltd.',
    role: 'Software Engineer – Full Stack, Backend, Java & Mobile Systems',
    location: 'Noida, Uttar Pradesh',
    description:
      'Architecting and shipping production software across full-stack healthcare commerce, distributed backend microservices, mobile applications (Android & iOS), and AI platforms.',
    bullets: [
      'Architected and shipped a production MERN healthcare commerce platform (React, Node.js, Express, MongoDB, Redis) on AWS (EC2, S3) to give the business a reliable, transaction-safe payment and order backbone — integrated 150+ REST APIs for Razorpay automation and order orchestration, scaling to 50K+ daily transactions at 99.9% uptime.',
      'Engineered a distributed inventory system to eliminate manual, error-prone stock tracking across 5 warehouses and 200K+ SKUs, using MongoDB aggregation pipelines, Redis caching, and query indexing — cut backend latency 30% (2.1s → 1.47s) while achieving sub-second query response.',
      'Identified underperforming frontend load times (Lighthouse score of 65) and elevated performance to Lighthouse 92 through Redux state optimization, code splitting, and lazy loading, directly improving page speed for end users.',
      'Built a Jest/Supertest automated test suite with GitHub Actions CI/CD and automated rollback to strengthen release confidence, reducing defects reaching production and enabling faster, safer deployments.',
      'Extended the Node.js/Express backend with Java Servlets to add secure session management, authentication, and third-party API integrations for legacy admin workflows running alongside the core MERN stack.',
      'Built and shipped production mobile apps (Fonofy, Delhi Golf Federation, Carenzy) live on Android (Google Play Store) and iOS (App Store) using React Native, Flutter, Dart, and native Swift iOS modules.',
    ],
    tags: [
      'Node.js',
      'React',
      'Java (Spring Boot / Servlets)',
      'MongoDB',
      'Redis',
      'AWS (EC2, S3)',
      'GitHub Actions CI/CD',
      'React Native',
      'Flutter',
      'Swift',
    ],
  },
  {
    date: 'JUN 2024 — AUG 2024',
    company: 'Indian Oil Corporation Limited (IOCL)',
    role: 'Software Engineer Intern',
    location: 'New Delhi, India',
    description:
      'Worked on forecasting, real-time monitoring and ML inference optimization for operational network data.',
    bullets: [
      'Designed and trained an XGBoost regression model to replace manual bandwidth monitoring across network nodes, achieving 85% forecasting accuracy — deployed automated inference with Redis caching and anomaly detection to eliminate manual monitoring entirely.',
      'Engineered a feature pipeline (7/14/30-day lags, seasonality, trend decomposition) to strengthen model signal quality, accelerating operational decision-making for the forecasting team.',
      'Built a real-time model-monitoring layer (React.js/D3.js, Node.js WebSockets) surfacing live predictions across concurrent forecasting streams, shortening time-to-detect for anomalies.',
      'Optimized an ML inference pipeline suffering 8.2s end-to-end latency using MongoDB aggregation, multi-layer Redis caching, and indexed queries — cut latency 70% (8.2s → 2.4s) while sustaining high uptime under production load.',
    ],
    tags: [
      'Python',
      'XGBoost',
      'React.js',
      'D3.js',
      'Node.js WebSockets',
      'MongoDB',
      'Redis',
    ],
  },
];

const timeline = [
  {
    year: '2026',
    title: 'Google Cloud Agentic Premier League',
    description:
      'Recognized as a top builder for shipping production AI systems using Gemini API, LangGraph agentic workflows and Google Cloud Run.',
    icon: Trophy,
  },
  {
    year: '2025',
    title: 'B.Tech — Computer Science & Engineering',
    description:
      'Maharaja Agrasen Institute of Technology · AI & ML Specialization · CGPA 8.2',
    icon: GraduationCap,
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 16,
    },
  },
};

export default function PortfolioPage() {
  const [stats, setStats] = useState<any>(defaultStats);

  const [contactStatus, setContactStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const refreshStats = () =>
    fetchDashboardStats()
      .then(
        (r) =>
          r?.success &&
          r.data &&
          setStats(r.data)
      )
      .catch(() => {});

  useWebSocket({
    SHEET_SYNCED: refreshStats,
    DATA_UPDATED: refreshStats,
    STATS_REFRESH: refreshStats,
    AI_ACTION: refreshStats,
  });

  useEffect(() => {
    refreshStats();
  }, []);

  const openAssistant = (prompt = '') => {
    window.dispatchEvent(
      new CustomEvent('atlas:open-assistant', {
        detail: { prompt },
      })
    );
  };

  const openExcel = () => {
    window.dispatchEvent(new Event('atlas:open-excel'));
  };

  const handleContactSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setContactStatus('sending');

    try {
      await submitContactForm(contactForm);
      setContactStatus('success');
      setContactForm({
        name: '',
        email: '',
        message: '',
      });
    } catch (err) {
      console.error('Failed to submit contact:', err);
      setContactStatus('error');
    }

    setTimeout(() => {
      setContactStatus((prev) =>
        prev === 'success' || prev === 'error'
          ? 'idle'
          : prev
      );
    }, 4000);
  };


  return (
    <div
      className="portfolio-page min-h-screen overflow-x-hidden"
      id="top"
    >
      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <nav
        className="portfolio-nav sticky top-0 z-50 backdrop-blur-2xl bg-opacity-80"
        aria-label="Portfolio navigation"
      >
        <a
          className="portfolio-mark group flex items-center gap-2.5"
          href="#top"
        >
          <span className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white font-extrabold flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            AC
          </span>
          <strong className="hidden sm:inline font-extrabold text-sm text-[var(--text-primary)] whitespace-nowrap">
            Aryan Chandra
          </strong>
        </a>

        <div className="portfolio-links hidden lg:flex items-center gap-6">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#stack">Stack</a>
          <a href="#system">System</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="portfolio-nav-actions flex items-center gap-2">
          {/* DSA Progress Direct Badge */}
          <Link
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/20 transition shadow-sm whitespace-nowrap"
            href="/dsa-progress"
          >
            <BarChart3 size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="inline">DSA Progress</span>
          </Link>

          {/* Daily Log Direct Badge */}
          <Link
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/20 transition shadow-sm whitespace-nowrap"
            href="/daily-tracker"
          >
            <CalendarCheck size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="hidden sm:inline">Daily Log</span>
          </Link>

          {/* Apps Dropdown Menu (Desktop) */}
          <div className="relative group hidden md:block">
            <button
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-primary)] text-xs font-bold hover:border-amber-500 transition whitespace-nowrap"
              aria-label="Open application modules menu"
            >
              <LayoutDashboard size={14} className="flex-shrink-0" />
              <span>Apps</span>
              <ChevronDown size={12} className="flex-shrink-0" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-52 py-2 bg-[var(--modal-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl backdrop-blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 space-y-1 px-1.5">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
                Tracker Modules
              </div>
              <Link href="/dsa-progress" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <BarChart3 size={15} /> DSA Progress
              </Link>
              <Link href="/daily-tracker" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <CalendarCheck size={15} /> Daily Log
              </Link>
              <Link href="/dsa-lectures" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <Youtube size={15} /> DSA Lectures
              </Link>
              <Link href="/applications" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <Briefcase size={15} /> Applications
              </Link>
              <Link href="/jobs" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <BriefcaseBusiness size={15} /> Jobs
              </Link>
              <Link href="/admin" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300 transition">
                <UploadCloud size={15} /> Admin &amp; Sheet Sync
              </Link>
            </div>
          </div>

          {/* Resume Button */}
          <a
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[var(--accent)] text-black font-bold text-xs hover:brightness-110 shadow-sm transition whitespace-nowrap"
            href="https://drive.google.com/file/d/16_xFWEtL5LRA6mamE2wlLHSLALQpTltm/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline">Resume</span>
            <ArrowUpRight size={13} className="flex-shrink-0" />
          </a>

          <ThemeToggle />

          {/* Mobile Navigation Drawer Trigger */}
          <button
            onClick={() => window.dispatchEvent(new Event('atlas:open-mobile-menu'))}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)] text-[var(--text-primary)] hover:border-amber-500 transition flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}

      <header className="portfolio-hero relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--accent-glow)] blur-3xl opacity-30" />
          <div className="absolute top-40 -left-60 w-[400px] h-[400px] rounded-full bg-[var(--accent-glow)] blur-3xl opacity-20" />
        </div>

        <motion.div
          className="hero-copy relative z-10"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="portfolio-kicker"
          >
            <span className="live-dot animate-pulse" />
            SOFTWARE ENGINEER / SDE 1 / SWE 1 / FULL-STACK &amp; BACKEND / AI
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500"
          >
            Software Engineer
            <br />

            <em className="text-[var(--accent)] drop-shadow-md">
              building high-throughput backends &amp; AI platforms
            </em>

            <br />

            that scale in production.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="hero-lede text-lg md:text-xl"
          >
            Software Engineer specializing in Java, Spring Boot, Node.js, React,
            distributed systems, RAG &amp; Agentic AI, cross-platform mobile apps
            (React Native, Flutter, Swift), and high-throughput cloud infrastructure.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="hero-meta"
          >
            <span>
              <MapPin
                size={14}
                className="text-[var(--accent)]"
              />
              New Delhi, India
            </span>

            <span className="availability">
              <i />
              Open to SDE 1 / SWE 1 / Full-Stack / Backend / AI &amp; Mobile roles
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-3 mt-7"
          >
            {[
              'Software Engineer',
              'Full-Stack (MERN)',
              'Java & Spring Boot',
              'Agentic AI & RAG',
              'Node.js & React',
              'Mobile (Android & iOS)',
              'Cloud & DevOps',
            ].map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card-flat)] text-xs font-semibold"
              >
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="hero-actions mt-7"
          >
            <a
              className="button-primary"
              href="https://drive.google.com/file/d/16_xFWEtL5LRA6mamE2wlLHSLALQpTltm/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={16} />
              View Resume
              <ArrowUpRight size={14} />
            </a>

            <a
              className="button-quiet"
              href="#contact"
            >
              Let&apos;s Connect
              <ArrowUpRight size={15} />
            </a>

            <a
              className="button-quiet"
              href="#work"
            >
              Explore Work
              <ChevronRight size={15} />
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="social-links"
          >
            <a
              href="https://github.com/TheAryanchandra"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={15} />
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/thearyanchandra/"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={15} />
              LinkedIn
            </a>

            <a href="mailto:aryanchandra3456@gmail.com">
              <Mail size={15} />
              Email
            </a>

            <a href="tel:+919205723006" title="Call or WhatsApp: +91 92057 23006">
              <Phone size={15} />
              +91 92057 23006
            </a>
          </motion.div>
        </motion.div>

        {/* Hero system card */}

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
          }}
          className="hero-aside relative z-10 hover:shadow-2xl transition-all rounded-3xl apple-card"
        >
          <div className="hero-aside-label">
            ENGINEERING SIGNAL
          </div>

          <div className="signal-line">
            <span className="signal-node animate-ping" />
            <span />
            <span className="signal-node" />
          </div>

          <div className="hero-aside-title">
            Build.
            <br />
            Optimize.
            <br />
            Scale.
          </div>

          <p>
            I focus on engineering systems that are
            reliable in production — from cross-platform mobile apps
            (React Native, Flutter, Swift) live on Play Store &amp; App Store to
            scalable backends and AI-powered applications.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)]">
              <span className="text-xs opacity-60 block mb-1">
                CURRENT FOCUS
              </span>
              <strong className="text-sm">
                Mobile (Android/iOS) + Backend
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)]">
              <span className="text-xs opacity-60 block mb-1">
                SPECIALIZATION
              </span>
              <strong className="text-sm">
                React Native / Flutter / Swift
              </strong>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--accent)]/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">
                  PRODUCTION CAPACITY
                </span>
                <strong className="text-2xl font-black text-[var(--text-primary)] block mt-0.5">
                  50,000+
                </strong>
                <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5">
                  Daily transactions · 99.9% uptime
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)] font-bold shrink-0 group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-[var(--accent)]" />
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* =========================================================
          IMPACT METRICS
      ========================================================= */}

      <section className="portfolio-section" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          {impactMetrics.map(
            ({
              value,
              label,
              detail,
              icon: Icon,
            }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={{
                  y: -5,
                }}
                className="apple-card p-5 rounded-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <Icon
                    size={18}
                    className="text-[var(--accent)] mb-4 group-hover:scale-110 transition-transform"
                  />

                  <strong className="block text-2xl font-bold group-hover:text-[var(--accent)] transition-colors">
                    {value}
                  </strong>

                  <span className="block text-xs font-bold mt-1 text-[var(--text-secondary)]">
                    {label}
                  </span>

                  <small className="block text-[11px] opacity-60 mt-2 leading-relaxed">
                    {detail}
                  </small>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </section>

      {/* =========================================================
          WHY ME / RECRUITER SNAPSHOT
      ========================================================= */}

      <section className="portfolio-section">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="section-intro compact"
        >
          <div className="portfolio-kicker">
            ENGINEERING PROFILE
            <span>/ RECRUITER SNAPSHOT</span>
          </div>

          <h2>
            More than just
            <br />
            <em>framework knowledge.</em>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Smartphone,
              title: 'Mobile App Delivery',
              text: 'Shipped 3 production mobile apps (Fonofy, Delhi Golf Fed, Carenzy) live on Google Play Store & iOS App Store.',
            },
            {
              icon: BriefcaseBusiness,
              title: 'Production Experience',
              text: 'Experience building and shipping production mobile apps, backends, and full-stack enterprise systems.',
            },
            {
              icon: DatabaseZap,
              title: 'Performance Mindset',
              text: 'Hands-on optimization across mobile apps, APIs, databases, caching and ML inference pipelines.',
            },
            {
              icon: Bot,
              title: 'AI & Mobile Engineering',
              text: 'Combines native & cross-platform mobile apps with production-oriented RAG and agentic AI systems.',
            },
          ].map(
            ({
              icon: Icon,
              title,
              text,
            }) => (
              <motion.div
                variants={fadeUp}
                key={title}
                className="apple-card p-6 rounded-3xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon
                      size={21}
                      className="text-[var(--accent)]"
                    />
                  </div>

                  <h3 className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">
                    {title}
                  </h3>

                  <p className="text-sm opacity-70 mt-2 leading-relaxed">
                    {text}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </motion.div>

        {/* Recruiter Fast-Track Callout */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-6 apple-card p-6 md:p-8 rounded-3xl border border-[var(--card-border)] hover:border-[var(--accent)]/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-glow)]/15 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                Recruiter Fast-Track / Product-Based Companies, MNCs, GCCs &amp; Startups
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold">
              Looking for a high-velocity SDE 1 / SWE 1, Full-Stack, Backend, or AI Engineer?
            </h3>
            <p className="text-xs md:text-sm opacity-70 max-w-2xl">
              Production-tested in Java 21, Spring Boot, Node.js, Express, React, Kafka, Qdrant RAG, Agentic AI (LangGraph/Gemini), AWS, and Mobile Development (React Native &amp; Flutter).
              Available immediately with a verified track record of scaling platforms to 50K+ daily transactions and sub-200ms query pipelines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
            <a
              href="https://drive.google.com/file/d/16_xFWEtL5LRA6mamE2wlLHSLALQpTltm/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="button-primary flex items-center gap-2 text-xs md:text-sm py-3 px-6 rounded-xl font-bold shadow-lg shadow-[var(--accent-glow)]/30 hover:scale-105 transition-all"
            >
              <FileText size={16} />
              Open ATS Resume (PDF)
              <ArrowUpRight size={14} />
            </a>

            <a
              href="#contact"
              className="button-quiet flex items-center gap-2 text-xs md:text-sm py-3 px-6 rounded-xl font-bold border border-[var(--card-border)] hover:border-[var(--accent)] transition-all"
            >
              <Mail size={16} />
              Get in Touch
            </a>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          EXPERIENCE
      ========================================================= */}

      <section
        className="portfolio-section experience-section"
        id="experience"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label"
        >
          EXPERIENCE
          <span>/ WHERE I&apos;VE LEARNED TO SHIP</span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: '-100px',
          }}
          variants={staggerContainer}
          className="experience-list"
        >
          {experience.map((job) => (
            <motion.article
              variants={fadeUp}
              className="experience-item group"
              key={job.company}
            >
              <div className="experience-date group-hover:text-[var(--accent)] transition-colors">
                {job.date}
              </div>

              <div className="p-6 md:p-8 -mt-6 rounded-3xl hover:bg-[var(--card-flat)] border border-transparent hover:border-[var(--card-border)] transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="group-hover:text-[var(--accent)] transition-colors">
                      {job.company}
                    </h3>

                    <div className="text-sm font-semibold opacity-70 mt-1">
                      {job.role}
                    </div>

                    <div className="text-xs opacity-50 flex items-center gap-1 mt-2">
                      <MapPin size={12} />
                      {job.location}
                    </div>
                  </div>

                  <BriefcaseBusiness
                    size={21}
                    className="opacity-50"
                  />
                </div>

                <p className="mt-5 mb-5 font-medium">
                  {job.description}
                </p>

                <div className="space-y-3">
                  {job.bullets.map(
                    (bullet, index) => (
                      <div
                        key={index}
                        className="flex gap-3 text-sm leading-relaxed"
                      >
                        <CheckCircle2
                          size={15}
                          className="text-[var(--accent)] mt-1 shrink-0"
                        />

                        <span>{bullet}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] text-[11px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* =========================================================
          PROJECTS
      ========================================================= */}

      <section
        className="portfolio-section work-section"
        id="work"
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: '-100px',
          }}
          variants={fadeUp}
          className="section-intro"
        >
          <div className="portfolio-kicker">
            TECHNICAL PROJECTS
            <span>/ PRODUCTION-MINDED WORK</span>
          </div>

          <h2>
            Things I&apos;ve
            <br />
            <em>made useful.</em>
          </h2>

          <p className="max-w-2xl opacity-70 mt-4">
            Projects designed around real engineering problems:
            retrieval, orchestration, authentication, distributed
            processing, cloud deployment and performance.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: '-100px',
          }}
          variants={staggerContainer}
          className="project-list"
        >
          {projects.map((project) => {
            const Icon = project.icon;

            return (
              <motion.a
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  scale: 1.01,
                }}
                className="project-card relative overflow-hidden group apple-card-flat"
                href={project.href}
                target="_blank"
                rel="noreferrer"
                key={project.title}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="project-top relative z-10">
                  <span className="project-number">
                    {project.number}
                  </span>

                  <Icon
                    size={23}
                    strokeWidth={1.5}
                    className="group-hover:text-[var(--accent)] transition-colors"
                  />

                  <ArrowUpRight
                    className="project-arrow group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    size={18}
                  />
                </div>

                <div className="relative z-10">
                  <div className="project-type">
                    {project.type}
                  </div>

                  <h3 className="group-hover:text-[var(--accent)] transition-colors">
                    {project.title}
                  </h3>

                  <p>{project.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
                    {project.metrics.map(
                      (metric) => (
                        <span
                          key={metric}
                          className="px-2 py-2 rounded-lg bg-[var(--card-flat)] border border-[var(--card-border)] text-[10px] font-bold text-center"
                        >
                          {metric}
                        </span>
                      )
                    )}
                  </div>

                  <div className="stack-badges mt-5">
                    {project.stack.map(
                      (item) => (
                        <span
                          key={item}
                          className="group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <span className="project-link relative z-10">
                  View on GitHub
                  <ArrowUpRight size={14} />
                </span>
              </motion.a>
            );
          })}
        </motion.div>
      </section>

      {/* =========================================================
          SYSTEM DESIGN
      ========================================================= */}

      <section className="portfolio-section my-8 md:my-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="section-intro compact mb-10 md:mb-14"
        >
          <div className="portfolio-kicker mb-3">
            SYSTEM DESIGN
            <span>/ HOW I THINK ABOUT SOFTWARE</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            From request
            <br />
            <em>to reliable system.</em>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
        >
          {architectureItems.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <motion.div
                variants={fadeUp}
                whileHover={{
                  y: -5,
                }}
                key={title}
                className="apple-card p-7 md:p-8 rounded-3xl group relative overflow-hidden flex flex-col justify-between transition-all duration-300 border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)] hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent-glow)] border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                      <Icon
                        size={22}
                        className="text-[var(--accent)]"
                      />
                    </div>

                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {title}
                    </h3>
                  </div>

                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-4 leading-relaxed font-medium opacity-85">
                    {description}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </section>

      {/* =========================================================
          STACK
      ========================================================= */}

      <section
        className="portfolio-section stack-section"
        id="stack"
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="section-intro compact"
        >
          <div className="portfolio-kicker">
            CAPABILITIES
            <span>/ THE ENGINEERING TOOLKIT</span>
          </div>

          <h2>
            Curious by default.
            <br />
            <em>Precise by practice.</em>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="capability-grid apple-card overflow-hidden"
        >
          {capabilities.map(
            ({
              label,
              icon: Icon,
              description,
              items,
            }) => (
              <motion.div
                variants={fadeUp}
                whileHover={{
                  scale: 1.015,
                  zIndex: 10,
                }}
                className="capability group relative"
                key={label}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Icon
                  size={24}
                  className="group-hover:scale-110 transition-transform text-[var(--accent)]"
                />

                <span className="group-hover:text-[var(--accent)] transition-colors">
                  {label}
                </span>

                <p className="text-sm opacity-60 mt-2">
                  {description}
                </p>

                <p className="opacity-90 mt-3">
                  {items}
                </p>
              </motion.div>
            )
          )}
        </motion.div>
      </section>

      {/* =========================================================
          EDUCATION + AWARDS
      ========================================================= */}

      <section className="portfolio-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label"
        >
          EDUCATION & RECOGNITION
          <span>/ FOUNDATION + SIGNAL</span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-5"
        >
          {timeline.map(
            ({
              year,
              title,
              description,
              icon: Icon,
            }) => (
              <motion.article
                variants={fadeUp}
                key={title}
                className="apple-card p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-6 md:items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center shrink-0">
                  <Icon
                    size={27}
                    className="text-[var(--accent)]"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-xs font-bold text-[var(--accent)] mb-2">
                    {year}
                  </div>

                  <h3 className="text-xl font-bold">
                    {title}
                  </h3>

                  <p className="text-sm opacity-70 mt-2">
                    {description}
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="opacity-40"
                />
              </motion.article>
            )
          )}
        </motion.div>
      </section>

      {/* =========================================================
          PRIVATE SYSTEM
      ========================================================= */}

      <motion.section
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.7,
        }}
        className="system-panel rounded-3xl overflow-hidden relative shadow-2xl mb-16"
        id="system"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 pointer-events-none" />

        <div className="relative z-10">
          <div className="portfolio-kicker flex items-center gap-2">
            <Zap
              size={13}
              className="animate-pulse text-amber-300"
            />
            PRIVATE SYSTEM / LIVE
          </div>

          <h2 className="drop-shadow-sm">
            Track the work
            <br />
            <em>behind the work.</em>
          </h2>

          <p>
            My personal dashboard keeps the long game visible.
            Jarvis can turn a sentence into a task, while the
            connected automation layer can carry it into reminders,
            email, calendar or reports.
          </p>
        </div>

        <div className="system-actions relative z-10">
          <a
            href="/dsa-progress"
            className="hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <span>DSA progress</span>

            <strong>
              {stats?.solvedDsaProblems || 0}
              <small>
                {' '}
                / {stats?.totalDsaProblems || 100} solved
              </small>
            </strong>

            <ChevronRight size={16} />
          </a>

          <a
            href="/applications"
            className="hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <span>Applications</span>

            <strong>
              {stats?.totalAppsLogged || 0}
              <small> tracked</small>
            </strong>

            <ChevronRight size={16} />
          </a>

          <button
            onClick={() =>
              openAssistant(
                'Create a task for me and trigger my automation workflow: '
              )
            }
            className="hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <span>Automations</span>

            <strong>
              <Zap size={16} />
              Run with n8n
            </strong>

            <ChevronRight size={16} />
          </button>

          <button
            onClick={() =>
              openAssistant(
                'Give me a concise review of my current progress'
              )
            }
            className="hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <span>Ask Jarvis</span>

            <strong>
              <Sparkles size={16} />
              Open copilot
            </strong>

            <ChevronRight size={16} />
          </button>

          <button
            onClick={openExcel}
            className="hover:-translate-y-1 hover:shadow-xl transition-all col-span-2 md:col-span-1"
          >
            <span>Data layer</span>

            <strong>
              <FileSpreadsheet size={15} />
              Sync Excel
            </strong>

            <ChevronRight size={16} />
          </button>
        </div>
      </motion.section>

      {/* =========================================================
          CONTACT
      ========================================================= */}

      <section
        className="portfolio-section"
        id="contact"
        style={{
          padding: '60px 0 80px',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info, Channels & SLA */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-5 space-y-6"
          >
            <div className="section-intro compact mb-6">
              <div className="portfolio-kicker">
                GET IN TOUCH
                <span>/ ANDROID &amp; IOS MOBILE / FULL-STACK / SDE 1</span>
              </div>

              <h2>
                Let&apos;s build
                <br />
                <em>something great.</em>
              </h2>

              <p className="opacity-75 mt-4 leading-relaxed">
                Hiring for Android &amp; iOS mobile development (React Native, Flutter, Swift),
                backend, full-stack, or AI engineering? Have an interesting problem or looking for someone who ships reliable code?
                Let&apos;s connect.
              </p>
            </div>

            {/* Direct Connect Chips */}
            <div className="space-y-3">
              <a
                href="mailto:aryanchandra3456@gmail.com"
                className="apple-card p-4 rounded-2xl flex items-center justify-between group hover:border-[var(--accent)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                      Direct Email
                    </span>
                    <strong className="text-sm group-hover:text-[var(--accent)] transition-colors">
                      aryanchandra3456@gmail.com
                    </strong>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />
              </a>

              {/* Direct Phone & WhatsApp */}
              <div className="apple-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[var(--accent)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                      Phone &amp; WhatsApp
                    </span>
                    <strong className="text-sm group-hover:text-[var(--accent)] transition-colors">
                      +91 92057 23006
                    </strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href="tel:+919205723006"
                    className="text-xs px-3 py-1.5 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] font-bold hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-1.5 no-underline"
                    title="Call +91 92057 23006"
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>
                  <a
                    href="https://wa.me/919205723006"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5 border border-emerald-500/20 no-underline"
                    title="Chat on WhatsApp (+91 92057 23006)"
                  >
                    <Smartphone size={13} />
                    <span>WhatsApp</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>

              <a
                href="https://www.linkedin.com/in/thearyanchandra/"
                target="_blank"
                rel="noreferrer"
                className="apple-card p-4 rounded-2xl flex items-center justify-between group hover:border-[var(--accent)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                      LinkedIn
                    </span>
                    <strong className="text-sm group-hover:text-[var(--accent)] transition-colors">
                      in/thearyanchandra
                    </strong>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />
              </a>

              <a
                href="https://github.com/TheAryanchandra"
                target="_blank"
                rel="noreferrer"
                className="apple-card p-4 rounded-2xl flex items-center justify-between group hover:border-[var(--accent)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Github size={18} />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                      GitHub
                    </span>
                    <strong className="text-sm group-hover:text-[var(--accent)] transition-colors">
                      github.com/TheAryanchandra
                    </strong>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />
              </a>
            </div>

            {/* Availability Pill & SLA */}
            <div className="p-4 rounded-2xl bg-[var(--card-flat)] border border-[var(--card-border)] space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Available for SDE 1 / SWE 1 / Full-Stack / Backend / AI &amp; Mobile roles</span>
              </div>
              <div className="text-[var(--text-secondary)] flex items-center gap-2 pl-4">
                <Phone size={13} />
                <span>Call / WhatsApp: <a href="tel:+919205723006" className="underline hover:text-[var(--accent)]">+91 92057 23006</a></span>
              </div>
              <div className="text-[var(--text-secondary)] flex items-center gap-2 pl-4">
                <Clock3 size={13} />
                <span>Response SLA: Within 24 hours</span>
              </div>
              <div className="text-[var(--text-secondary)] flex items-center gap-2 pl-4">
                <MapPin size={13} />
                <span>New Delhi, India • Open to Remote & Relocation</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Glassmorphism Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleContactSubmit}
              className="apple-card p-8 md:p-10 rounded-3xl border border-[var(--card-border)] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-glow)] to-transparent opacity-0 group-focus-within:opacity-40 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Send a direct message</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Delivered instantly to my inbox and internal notification queue.
                  </p>
                </div>

                {contactStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3"
                  >
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm">Message Sent Successfully!</strong>
                      <span>Thank you for reaching out. I will respond to your email within 24 hours.</span>
                    </div>
                  </motion.div>
                )}

                {contactStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3"
                  >
                    <Send size={18} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm">Could not send message automatically</strong>
                      <span>Please email me directly at <a href="mailto:aryanchandra3456@gmail.com" className="underline font-bold">aryanchandra3456@gmail.com</a> or call/WhatsApp <a href="tel:+919205723006" className="underline font-bold">+91 92057 23006</a>.</span>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-sm"
                      placeholder="Jane Doe"
                      required
                      disabled={contactStatus === 'sending'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((f) => ({
                          ...f,
                          email: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-sm"
                      placeholder="jane@company.com"
                      required
                      disabled={contactStatus === 'sending'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((f) => ({
                        ...f,
                        message: e.target.value,
                      }))
                    }
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-sm h-36 resize-none"
                    placeholder="Tell me about the role, project, or problem you'd like to discuss..."
                    required
                    disabled={contactStatus === 'sending'}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="button-primary w-full sm:w-auto flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[var(--accent-glow)] transition-all py-3.5 px-8 rounded-xl font-bold border-0 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {contactStatus === 'idle' && (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}

                    {contactStatus === 'sending' && (
                      <>
                        <Zap size={16} className="animate-spin" />
                        Sending...
                      </>
                    )}

                    {contactStatus === 'success' && (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-300" />
                        Delivered!
                      </>
                    )}

                    {contactStatus === 'error' && (
                      <>
                        <Send size={16} />
                        Retry Send
                      </>
                    )}
                  </button>

                  <span className="text-xs text-[var(--text-secondary)] opacity-70">
                    No spam ever. 100% direct and confidential.
                  </span>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="portfolio-footer mt-12 border-t border-[var(--card-border)] pt-8">
        <div>
          <span className="footer-mark shadow-lg">
            AC
          </span>

          <p>
            Building with intention.
            <br />
            Learning in public.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="https://drive.google.com/file/d/16_xFWEtL5LRA6mamE2wlLHSLALQpTltm/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] font-semibold flex items-center gap-1.5"
          >
            <FileText size={15} />
            Resume
          </a>

          <a
            href="https://github.com/TheAryanchandra"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={15} />
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/thearyanchandra/"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={15} />
            LinkedIn
          </a>

          <a href="mailto:aryanchandra3456@gmail.com">
            <Mail size={15} />
            Email
          </a>

          <a href="tel:+919205723006" title="Call or WhatsApp: +91 92057 23006">
            <Phone size={15} />
            +91 92057 23006
          </a>
        </div>

        <a
          className="footer-contact group"
          href="mailto:aryanchandra3456@gmail.com"
        >
          Have a hard problem?
          <br />

          <strong className="group-hover:text-[var(--accent)] transition-colors">
            Let&apos;s talk
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </strong>
        </a>

        <span className="footer-note opacity-70">
          © 2026 Aryan Chandra
        </span>
      </footer>
    </div>
  );
}