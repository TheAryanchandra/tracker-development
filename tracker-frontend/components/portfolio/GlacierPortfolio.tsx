'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Terminal,
  Download,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Search,
  Code2,
  Layers,
  Zap,
  X,
  Smartphone,
  Trophy,
  Server,
  ShieldCheck,
  Cpu,
  Database,
  Users,
  Menu,
} from 'lucide-react';

import './portfolio.css';
import {
  PROFILE,
  METRICS,
  EXPERIENCE,
  PROJECTS,
  APPS,
  SKILL_GROUPS,
  ENGINEERING_PRINCIPLES,
  CHAPTERS,
  CANDIDATE_BRIEF,
  projectsUsingSkill,
  Project,
} from './data';
import CoreCanvas from './CoreCanvas';
import InteractiveArchitectureLab from './InteractiveArchitectureLab';
import DevTerminal from './DevTerminal';
import RecruiterDrawer from './RecruiterDrawer';
import CommandPalette from './CommandPalette';
import GlacierCopilot from './GlacierCopilot';
import { submitContactForm } from '@/lib/api';

export default function GlacierPortfolio() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolledTop, setScrolledTop] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  // Drawers & Modals
  const [recruiterOpen, setRecruiterOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);
  const [highlightedProjectIds, setHighlightedProjectIds] = useState<string[]>([]);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);

  // Sound
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('SDE-1 / Software Engineer');
  const [contactMsg, setContactMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  // Telemetry counter on initial page load
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 14;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => setLoadingDone(true), 250);
      }
      setLoadingCount(current);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  // Scroll tracking to feed chapter indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

      setScrollProgress(progress);
      setScrolledTop(scrollY > 40);

      if (progress < 0.16) setActiveChapter(0);
      else if (progress < 0.32) setActiveChapter(1);
      else if (progress < 0.52) setActiveChapter(2);
      else if (progress < 0.72) setActiveChapter(3);
      else if (progress < 0.88) setActiveChapter(4);
      else setActiveChapter(5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener: Cmd/Ctrl+K for palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyCandidateBrief = () => {
    navigator.clipboard.writeText(CANDIDATE_BRIEF);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 3000);
  };

  const handleOpenCopilotWithQuery = (query?: string) => {
    window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt: query } }));
  };

  const navigateToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSkillHover = (skill: string) => {
    setActiveSkillName(skill);
    const related = projectsUsingSkill(skill);
    setHighlightedProjectIds(related);
  };

  const handleSkillLeave = () => {
    setActiveSkillName(null);
    setHighlightedProjectIds([]);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setSubmitting(true);
    try {
      await submitContactForm({
        name: `${contactName} [${contactRole}]`,
        email: contactEmail,
        message: contactMsg,
      });
      setSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nx">
      {/* ── 1. Telemetry Loader Overlay ────────────────────────────── */}
      <div className={`nx-loader ${loadingDone ? 'done' : ''}`}>
        <div className="nx-loader-row">
          <span>Aryan Chandra // SDE-1 Production Systems</span>
          <span>Java 21 • Kafka • Qdrant</span>
        </div>
        <div className="text-center">
          <div className="nx-loader-count">{loadingCount}%</div>
          <p className="mt-2 text-xs font-mono text-zinc-400">
            Initializing 3D Distributed Mesh & Architecture Runtime…
          </p>
        </div>
        <div className="nx-loader-bar">
          <span style={{ width: `${loadingCount}%` }} />
        </div>
      </div>

      {/* ── 2. Top Interactive Progress Bar ─────────────────────────── */}
      <div
        className="nx-progress"
        style={{ width: `${Math.round(scrollProgress * 100)}%` }}
      />

      {/* ── 3. Fixed Top Header Chrome ─────────────────────────────── */}
      <header className={`nx-top ${scrolledTop ? 'scrolled' : ''}`}>
        {/* Brand Left */}
        <Link href="#hero" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-sky-400/40 flex items-center justify-center font-bold text-sm text-sky-300 shadow-md group-hover:border-sky-300 transition">
            AC
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider font-sans uppercase">
              ARYAN CHANDRA
            </div>
            <div className="text-[10px] text-zinc-400 font-sans">Software Engineer</div>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          {CHAPTERS.map((ch, idx) => (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                activeChapter === idx
                  ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeChapter === idx && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />}
              <span>{ch.label}</span>
            </a>
          ))}
        </nav>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCmdOpen(true)}
            className="nx-btn sm ghost flex items-center gap-2"
            title="Quick Search (Ctrl+K)"
          >
            <Search size={13} />
            <span className="hidden lg:inline text-xs">⌘K</span>
          </button>

          <button
            onClick={() => setRecruiterOpen(true)}
            className="nx-btn sm amber hidden sm:flex items-center gap-1.5"
          >
            <Briefcase size={13} />
            <span>Recruiter Assessment</span>
          </button>

          {/* Resume Pill */}
          <a
            href={PROFILE.resume}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-400/20 to-sky-300/30 border border-sky-400/50 text-sky-200 text-xs font-semibold backdrop-blur-md shadow-lg shadow-sky-500/10 hover:border-sky-300 transition"
          >
            <Download size={13} />
            <span>Resume</span>
          </a>

          {/* Compact Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-zinc-300 hover:text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 p-4 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-2 z-50">
            {CHAPTERS.map((ch, idx) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeChapter === idx
                    ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {ch.label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRecruiterOpen(true);
                }}
                className="w-full nx-btn sm amber flex items-center justify-center gap-1.5"
              >
                <Briefcase size={13} />
                <span>Recruiter Assessment</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 4. Main Scroll Chapters ─────────────────────────────────── */}
      <main className="nx-main">
        {/* ── CHAPTER 01: INTRO / HERO (MINIMALIST SPLIT LAYOUT) ─────── */}
        <section id="hero" className="nx-section pt-16 sm:pt-20 pb-6">
          <div className="nx-wrap">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* LEFT COLUMN: HERO TEXT & ACTIONS */}
              <div className="lg:col-span-5 space-y-6">
                {/* Small Top Label */}
                <div className="text-[11px] font-mono tracking-widest text-sky-400 font-semibold uppercase">
                  SOFTWARE ENGINEER · BACKEND · APPLIED AI
                </div>

                {/* Availability Indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available for SDE-1 / Software Engineering Roles</span>
                </div>

                {/* Headline: ARYAN CHANDRA */}
                <div className="space-y-0.5">
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase font-sans leading-none">
                    ARYAN
                  </h1>
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tight nx-stroke-text uppercase font-sans leading-none">
                    CHANDRA
                  </h1>
                </div>

                {/* Supporting Statement */}
                <div className="text-lg sm:text-xl font-bold text-sky-200/90 font-sans tracking-tight">
                  &ldquo;Building reliable systems. Shipping useful AI.&rdquo;
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-lg">
                  Specialized in high-throughput backend architecture, distributed systems, full-stack products, and production AI engineering. Architected platforms serving 50,000+ daily transactions with 99.9% uptime.
                </p>

                {/* Action Buttons: Primary CTA + Secondary CTA + GitHub / LinkedIn */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#projects"
                    className="px-5 py-3 rounded-2xl bg-sky-300 hover:bg-sky-200 text-slate-950 font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-sky-400/25"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center">
                      <ArrowUpRight size={13} />
                    </div>
                    <span>Explore Projects</span>
                  </a>

                  <a
                    href={PROFILE.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-white font-semibold text-sm flex items-center gap-2 transition backdrop-blur-md"
                  >
                    <Download size={15} />
                    <span>Download Resume</span>
                  </a>

                  {/* GitHub & LinkedIn Direct Links */}
                  <a
                    href={PROFILE.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                    title="GitHub Profile"
                  >
                    <Github size={16} />
                  </a>

                  <a
                    href={PROFILE.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                    title="LinkedIn Profile"
                  >
                    <Linkedin size={16} />
                  </a>

                  <button
                    onClick={copyCandidateBrief}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                    title="Copy 1-page candidate summary"
                  >
                    {copiedBio ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: 3D DISTRIBUTED SYSTEMS TOPOLOGY */}
              <div className="lg:col-span-7 relative min-h-[460px] lg:min-h-[580px] flex items-center justify-center">
                {/* Top-Right Indicator from Screenshot: 01 / INTRO */}
                <div className="absolute top-2 right-4 z-10 flex items-center gap-2.5 text-xs font-mono text-zinc-400">
                  <span>01 / INTRO</span>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  </div>
                </div>

                {/* 3D Core Canvas (Pedestals + Central Glowing Core + Laser Pulses) */}
                <CoreCanvas chapter={activeChapter} progress={scrollProgress} />
              </div>
            </div>

            {/* ── BOTTOM METRICS BAR (EXACT MATCH FROM SCREENSHOT) ───── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10">
              {/* Metric 1: 99.9% Uptime + Sine Wave Sparkline */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                    99.9%
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">uptime</div>
                </div>
                {/* SVG Smooth Sine Wave Sparkline */}
                <svg width="100" height="34" viewBox="0 0 100 34" fill="none">
                  <path
                    d="M2 24 C 20 2, 35 32, 55 12 C 72 -4, 85 24, 98 14"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Metric 2: 50K+ Daily Transactions + Mini Bar Chart */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                    50K+
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">daily transactions</div>
                </div>
                {/* SVG Mini Bar Chart */}
                <svg width="80" height="34" viewBox="0 0 80 34" fill="none">
                  <rect x="6" y="20" width="8" height="14" rx="2" fill="#38bdf8" opacity="0.4" />
                  <rect x="22" y="14" width="8" height="20" rx="2" fill="#38bdf8" opacity="0.6" />
                  <rect x="38" y="8" width="8" height="26" rx="2" fill="#38bdf8" opacity="0.8" />
                  <rect x="54" y="2" width="8" height="32" rx="2" fill="#38bdf8" />
                </svg>
              </div>

              {/* Metric 3: 10K+ Real Users + Overlapping User Circles */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                    10K+
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">real users</div>
                </div>
                {/* SVG Overlapping Circles */}
                <div className="flex items-center -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-sky-500/30 flex items-center justify-center text-[10px] text-sky-200 font-bold">
                    4.8★
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-200 font-bold">
                    App
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-200 font-bold">
                    Play
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: EXPERIENCE SIGNALS ────────────────────────── */}
        <section id="experience" className="nx-section py-14 sm:py-16 border-t border-white/10">
          <div className="nx-wrap space-y-8">
            <div>
              <span className="nx-eyebrow">02 / Experience</span>
              <h2 className="nx-h2">
                Verified <em>Production Signals</em>
              </h2>
              <p className="nx-lead">
                Battle-tested engineering across enterprise fuel corporations and high-throughput healthcare commerce products.
              </p>
            </div>

            <div className="nx-timeline">
              {EXPERIENCE.map((exp, idx) => (
                <div key={idx} className="nx-panel nx-exp">
                  <div>
                    <div className="nx-exp-org">{exp.org}</div>
                    <div className="nx-exp-role">{exp.role}</div>
                    <div className="nx-exp-kind">{exp.kind}</div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{exp.summary}</p>
                    <ul>
                      {exp.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>

                    <div className="nx-tags">
                      {exp.stack.map((s, sIdx) => (
                        <span key={sIdx} className="nx-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: SIGNATURE 2D SYSTEMS ARCHITECTURE LAB ──────── */}
        <section id="systems" className="nx-section py-14 sm:py-16 border-t border-white/10 bg-slate-950/40">
          <div className="nx-wrap space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="nx-eyebrow">03 / Systems Lab</span>
                <h2 className="nx-h2">
                  Interactive <em>Architecture Map</em>
                </h2>
                <p className="nx-lead">
                  Explore how requests travel through the API gateway, Kafka event partitions, Java 21 Project Loom fibers, and the RAG semantic vector retrieval pipeline.
                </p>
              </div>

              <button
                onClick={() => handleOpenCopilotWithQuery('Explain the Java 21 Virtual Threads and Kafka architecture in detail')}
                className="nx-btn sm ghost flex items-center gap-1.5"
              >
                <Sparkles size={13} className="text-sky-300" />
                <span>Ask Jarvis Architecture Trade-Offs</span>
              </button>
            </div>

            {/* Interactive 2D Architecture Component */}
            <InteractiveArchitectureLab />
          </div>
        </section>

        {/* ── CHAPTER 04: FEATURED PROJECTS & SHIPPED CONSUMER APPS ──── */}
        <section id="projects" className="nx-section py-14 sm:py-16 border-t border-white/10">
          <div className="nx-wrap space-y-10">
            <div>
              <span className="nx-eyebrow">04 / Projects</span>
              <h2 className="nx-h2">
                Production Artifacts & <em>Case Studies</em>
              </h2>
              <p className="nx-lead">
                Verified systems with public GitHub codebases, benchmarked P95 latencies, and real consumer traction.
              </p>
            </div>

            {/* Flagship Projects Grid */}
            <div className="nx-work">
              {PROJECTS.map((proj) => {
                const isHighlighted = highlightedProjectIds.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => setActiveProjectModal(proj)}
                    className={`nx-panel nx-proj ${isHighlighted ? 'border-sky-400/80 shadow-sky-500/20 shadow-lg' : ''}`}
                  >
                    <div
                      className="nx-proj-glow"
                      style={{ background: proj.accent }}
                    />

                    <div className="nx-proj-top">
                      <span>{proj.kicker}</span>
                      {proj.award && (
                        <span className="nx-award">
                          <Trophy size={11} /> {proj.award}
                        </span>
                      )}
                    </div>

                    <h3>{proj.title}</h3>
                    <p>{proj.oneLiner}</p>

                    <div className="nx-proj-impact">
                      {proj.impact.map((imp, iIdx) => (
                        <span key={iIdx} className="nx-chip hot">
                          {imp}
                        </span>
                      ))}
                    </div>

                    <div className="nx-tags pt-2">
                      {proj.stack.map((tech, tIdx) => (
                        <span key={tIdx} className="nx-chip">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="nx-proj-cta pt-3">
                      <span>Inspect Architectural Trade-offs</span>
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipped Mobile Apps Sub-Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-sans text-white">
                  Shipped Mobile Ecosystem (10,000+ Downloads)
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Consumer apps live on Google Play Store and Apple App Store
                </p>
              </div>

              <div className="nx-apps">
                {APPS.map((app, idx) => (
                  <div key={idx} className="nx-panel nx-app">
                    <div className="nx-app-head">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {app.store}
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        ★ {app.rating}
                      </span>
                    </div>

                    <div className="nx-app-dl text-sky-300">{app.downloads}</div>
                    <h4>{app.name}</h4>
                    <p>{app.desc}</p>

                    <div className="nx-tags mt-auto pt-2">
                      {app.tech.map((t, ti) => (
                        <span key={ti} className="nx-chip">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                      >
                        <span>View on Store</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 05: TECHNICAL STACK & PRINCIPLES ───────────────── */}
        <section id="stack" className="nx-section py-14 sm:py-16 border-t border-white/10">
          <div className="nx-wrap space-y-10">
            <div>
              <span className="nx-eyebrow">05 / Stack & Principles</span>
              <h2 className="nx-h2">
                Core <em>Technical Matrix</em>
              </h2>
              <p className="nx-lead">
                Hover or tap any skill to see which production projects and systems rely on it.
              </p>
            </div>

            {/* Skill Matrix */}
            <div className="nx-stack">
              {SKILL_GROUPS.map((group) => (
                <div key={group.id} className="nx-panel nx-skill-group">
                  <h4>{group.label}</h4>
                  <div className="nx-tags">
                    {group.skills.map((skill, sIdx) => {
                      const isHovered = activeSkillName === skill;
                      return (
                        <button
                          key={sIdx}
                          onMouseEnter={() => handleSkillHover(skill)}
                          onMouseLeave={handleSkillLeave}
                          onClick={() => handleSkillHover(skill)}
                          className={`nx-chip btn ${isHovered ? 'hot' : ''}`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Engineering Principles */}
            <div className="space-y-6 pt-8">
              <div>
                <h3 className="text-2xl font-bold font-sans text-white">
                  Engineering Principles & System Design
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Architectural rules applied across Aryan's microservices and applied AI platforms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ENGINEERING_PRINCIPLES.map((ep) => (
                  <div key={ep.num} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                      <span>PRINCIPLE // {ep.num}</span>
                      <span className="text-zinc-500">{ep.summary}</span>
                    </div>
                    <h4 className="text-lg font-bold font-sans text-white">{ep.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Terminal */}
            <div className="space-y-4 pt-8">
              <div>
                <h3 className="text-xl font-bold font-sans text-white">Developer CLI Console</h3>
                <p className="text-xs font-mono text-zinc-400">
                  Interactive bash interface to run diagnostic queries on candidate credentials
                </p>
              </div>
              <DevTerminal />
            </div>
          </div>
        </section>

        {/* ── CHAPTER 06: CONTACT TRANSMISSION ──────────────────────── */}
        <section id="contact" className="nx-section py-14 sm:py-16 border-t border-white/10">
          <div className="nx-wrap space-y-8">
            <div>
              <span className="nx-eyebrow">06 / Contact</span>
              <h2 className="nx-h2">
                Initiate <em>Transmission</em>
              </h2>
              <p className="nx-lead">
                Open for Software Engineer / SDE-1 / AI Engineer roles. Available immediately for interviews.
              </p>
            </div>

            <div className="nx-contact">
              {/* Direct coordinates */}
              <div className="nx-panel nx-contact-card">
                <div>
                  <span className="nx-eyebrow">Coordinates</span>
                  <a href={`mailto:${PROFILE.email}`} className="nx-big-mail mt-2 block">
                    {PROFILE.email}
                  </a>
                </div>

                <div className="space-y-3 font-mono text-xs text-zinc-300 pt-4">
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-emerald-400 shrink-0" />
                    <span>{PROFILE.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={15} className="text-amber-400 shrink-0" />
                    <span>{PROFILE.location} ({PROFILE.relocation})</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-wrap gap-2.5">
                  <a
                    href={PROFILE.github}
                    target="_blank"
                    rel="noreferrer"
                    className="nx-btn sm ghost flex items-center gap-1.5"
                  >
                    <Github size={14} />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={PROFILE.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="nx-btn sm ghost flex items-center gap-1.5"
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={PROFILE.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="nx-btn sm primary flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Resume PDF</span>
                  </a>
                </div>
              </div>

              {/* Functional Transmission Form */}
              <form onSubmit={handleContactSubmit} className="nx-panel nx-contact-card">
                <div className="nx-field">
                  <label>Your Name & Title</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Engineering Manager / Recruiter"
                  />
                </div>

                <div className="nx-field">
                  <label>Work Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>

                <div className="nx-field">
                  <label>Role Scope</label>
                  <select
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                  >
                    <option value="SDE-1 / Software Engineer">SDE-1 / Software Engineer</option>
                    <option value="Backend Engineer (Java/Spring/Kafka)">Backend Engineer (Java/Spring/Kafka)</option>
                    <option value="Full-Stack Engineer (React/Node)">Full-Stack Engineer (React/Node)</option>
                    <option value="AI / LLM Systems Engineer">AI / LLM Systems Engineer</option>
                  </select>
                </div>

                <div className="nx-field">
                  <label>Message / Opportunity Details</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Discuss SDE-1 opening, team stack, or interview schedule..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="nx-btn primary w-full mt-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-950" />
                      <span>Transmission Recorded Successfully</span>
                    </>
                  ) : submitting ? (
                    <span>Sending Transmission…</span>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="nx-footer">
          <div>
            Aryan Chandra © 2026 // Engineered with Next.js 14, Three.js, & Jarvis Multi-Model Copilot
          </div>
          <div className="flex gap-4">
            <a href={PROFILE.github} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
            <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
            <a href={PROFILE.resume} target="_blank" rel="noreferrer" className="hover:text-white">Resume</a>
          </div>
        </footer>
      </main>

      {/* ── 7. Project Case Study Modal ─────────────────────────────── */}
      {activeProjectModal && (
        <div className="nx-modal-bg" onClick={() => setActiveProjectModal(null)}>
          <div className="nx-panel nx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="nx-eyebrow">{activeProjectModal.kicker}</span>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="nx-btn sm icon ghost"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-sans text-white mt-1">
              {activeProjectModal.title}
            </h3>

            {/* Problem & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-rose-300 uppercase tracking-wider">
                  The Problem
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeProjectModal.problem}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-sky-300 uppercase tracking-wider">
                  Engineered Solution
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeProjectModal.solution}
                </p>
              </div>
            </div>

            {/* Contribution & Architecture */}
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider">
                  My Contribution & Scope
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeProjectModal.contribution}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-indigo-300 uppercase tracking-wider">
                  System Architecture Pipeline
                </div>
                <p className="text-xs font-mono text-zinc-200 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                  {activeProjectModal.architecture}
                </p>
              </div>
            </div>

            {/* Engineering Decisions & Measured Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-purple-300 uppercase tracking-wider">
                  Critical Engineering Decisions
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeProjectModal.decisions}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-emerald-300 uppercase tracking-wider">
                  Verified Production Impact
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-200/90 font-mono">
                  {activeProjectModal.impact.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Stack Tags */}
            <div className="nx-tags pt-4 border-t border-[var(--line)] mt-4">
              {activeProjectModal.stack.map((t, idx) => (
                <span key={idx} className="nx-chip">{t}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap justify-end gap-3">
              {activeProjectModal.demoUrl && (
                <a
                  href={activeProjectModal.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="nx-btn sm ghost flex items-center gap-1.5"
                >
                  <span>Launch Live Demo</span>
                  <ExternalLink size={13} />
                </a>
              )}
              <a
                href={activeProjectModal.href}
                target="_blank"
                rel="noreferrer"
                className="nx-btn sm primary flex items-center gap-1.5"
              >
                <span>View on GitHub</span>
                <Github size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Recruiter Briefing Drawer ────────────────────────────── */}
      <RecruiterDrawer
        open={recruiterOpen}
        onClose={() => setRecruiterOpen(false)}
        onOpenCopilot={handleOpenCopilotWithQuery}
      />

      {/* ── 9. Command Palette Modal ────────────────────────────────── */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onOpenRecruiter={() => setRecruiterOpen(true)}
        onOpenCopilot={handleOpenCopilotWithQuery}
        onNavigateSection={navigateToChapter}
      />

      {/* ── 10. Upgraded Glacier Copilot (Jarvis) ───────────────────── */}
      <GlacierCopilot />
    </div>
  );
}
