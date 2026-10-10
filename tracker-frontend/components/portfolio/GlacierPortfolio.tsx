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
} from 'lucide-react';

import './portfolio.css';
import {
  PROFILE,
  METRICS,
  EXPERIENCE,
  PROJECTS,
  APPS,
  SKILL_GROUPS,
  CHAPTERS,
  CANDIDATE_BRIEF,
  projectsUsingSkill,
  Project,
} from './data';
import CoreCanvas from './CoreCanvas';
import SystemLabCanvas, { ArchitectureNode } from './SystemLabCanvas';
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
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);
  const [highlightedProjectIds, setHighlightedProjectIds] = useState<string[]>([]);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);

  // Copilot query state
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>();

  // Sound
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('SDE-1 / Software Engineer');
  const [contactMsg, setContactMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  // Simulated Telemetry counter on load
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 18) + 12;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => setLoadingDone(true), 250);
      }
      setLoadingCount(current);
    }, 45);

    return () => clearInterval(timer);
  }, []);

  // Scroll tracking to feed 3D Canvas chapter & progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

      setScrollProgress(progress);
      setScrolledTop(scrollY > 40);

      // Chapter mapping based on scroll position
      if (progress < 0.14) setActiveChapter(0);
      else if (progress < 0.28) setActiveChapter(1);
      else if (progress < 0.46) setActiveChapter(2);
      else if (progress < 0.64) setActiveChapter(3);
      else if (progress < 0.78) setActiveChapter(4);
      else if (progress < 0.9) setActiveChapter(5);
      else setActiveChapter(6);
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

  // Ambient Web Audio Wind Synthesizer
  const toggleSound = () => {
    if (!soundOn) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const bufSize = ctx.sampleRate * 2;
        const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufSize; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + w * 0.05;
          b1 = 0.96 * b1 + w * 0.1;
          b2 = 0.86 * b2 + w * 0.25;
          out[i] = (b0 + b1 + b2) * 0.12;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuf;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();
        noiseSourceRef.current = source;
        setSoundOn(true);
      } catch {
        /* audio blocked */
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        setSoundOn(false);
      }
    }
  };

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
          <span>Aryan Chandra // SDE-1 Portfolio Engine</span>
          <span>JVM 21 • KRaft • Qdrant</span>
        </div>
        <div className="text-center">
          <div className="nx-loader-count">{loadingCount}%</div>
          <p className="mt-2 text-xs font-mono text-zinc-400">
            Initializing 3D Glacier Shaders & Distributed Mesh…
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

      {/* ── 3. Background 3D Ice Core Canvas ─────────────────────────── */}
      <CoreCanvas chapter={activeChapter} progress={scrollProgress} />
      <div className="nx-vignette" />
      <div className="nx-grain" />

      {/* ── 4. Fixed Top Header Chrome ──────────────────────────────── */}
      <header className={`nx-top ${scrolledTop ? 'scrolled' : ''}`}>
        {/* Brand */}
        <Link href="#hero" className="nx-brand">
          <div className="nx-brand-mark">AC</div>
          <div className="nx-brand-text">
            <b>{PROFILE.shortName}</b>
            <small>Software Engineer // SDE-1</small>
          </div>
        </Link>

        {/* Central Chapter Nav Pills (Desktop) */}
        <nav className="nx-nav">
          {CHAPTERS.map((ch, idx) => (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={activeChapter === idx ? 'active' : ''}
            >
              {ch.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="nx-top-actions">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="nx-btn sm icon ghost"
            title={soundOn ? 'Mute Ambient Glacial Wind' : 'Enable Ambient Sound'}
          >
            {soundOn ? <Volume2 size={15} className="text-sky-300" /> : <VolumeX size={15} />}
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="nx-btn sm ghost flex items-center gap-2"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search size={13} />
            <span className="hide-sm">Quick Search</span>
            <span className="nx-kbd hide-sm">⌘K</span>
          </button>

          {/* Recruiter Drawer Trigger */}
          <button
            onClick={() => setRecruiterOpen(true)}
            className="nx-btn sm amber flex items-center gap-1.5"
          >
            <Briefcase size={13} />
            <span>Recruiter Assessment</span>
          </button>

          {/* Resume PDF */}
          <a
            href={PROFILE.resume}
            target="_blank"
            rel="noreferrer"
            className="nx-btn sm primary flex items-center gap-1.5"
          >
            <Download size={13} />
            <span className="hide-sm">Resume</span>
          </a>
        </div>
      </header>

      {/* ── 5. Fixed Vertical Chapter Rail (Right) ───────────────────── */}
      <nav className="nx-rail" aria-label="Chapter Rail">
        {CHAPTERS.map((ch, idx) => (
          <a
            key={ch.id}
            href={`#${ch.id}`}
            className={activeChapter === idx ? 'active' : ''}
          >
            <span>{ch.label}</span>
            <i />
          </a>
        ))}
      </nav>

      {/* ── 6. Main Scroll Chapters ─────────────────────────────────── */}
      <main className="nx-main">
        {/* ── CHAPTER 01: INTRO / HERO ──────────────────────────────── */}
        <section id="hero" className="nx-section nx-hero">
          <div className="nx-wrap">
            <div className="nx-hero-grid">
              <div>
                <div className="nx-status">
                  <span className="nx-dot" />
                  <span>Immediate Joiner // SDE-1 & Systems Engineering Roles</span>
                </div>

                <h1>
                  <span>ARYAN</span>
                  <span className="l2">CHANDRA</span>
                </h1>

                <div className="nx-role">
                  <span>Specializing in</span>
                  <b>Distributed Java 21, Kafka, & Autonomous AI</b>
                  <span className="nx-caret" />
                </div>

                <p className="nx-lead mt-4">
                  Software engineer with production-proven microservices at scale.
                  Shipped mobile applications to over <strong className="text-white">10,000+ real users</strong> on Google Play Store,
                  maintained <strong className="text-white">99.9% uptime SLA</strong> over 50,000+ daily transactions, and won the
                  Google Cloud Agentic Premier League Top Builder Award.
                </p>

                <div className="nx-hero-cta">
                  <button
                    onClick={() => setRecruiterOpen(true)}
                    className="nx-btn primary"
                  >
                    <span>Recruiter Briefing</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => handleOpenCopilotWithQuery('Screen Aryan as an SDE-1 candidate with his top 3 strengths')}
                    className="nx-btn"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Screen with Jarvis</span>
                  </button>

                  <button
                    onClick={copyCandidateBrief}
                    className="nx-btn ghost"
                    title="Copy 1-page candidate summary"
                  >
                    {copiedBio ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedBio ? 'Copied' : 'Copy Brief'}</span>
                  </button>
                </div>
              </div>

              {/* Side Fast Coordinates Card */}
              <div className="nx-hero-side">
                <div className="nx-panel nx-hero-card">
                  <h3>Candidate Coordinates</h3>
                  <dl className="nx-kv">
                    <dt>Target</dt>
                    <dd className="font-semibold text-sky-300">SDE-1 / SWE-1 / Backend Engineer</dd>
                    <dt>Location</dt>
                    <dd>{PROFILE.location}</dd>
                    <dt>Mobility</dt>
                    <dd className="text-emerald-400">{PROFILE.relocation}</dd>
                    <dt>Education</dt>
                    <dd>{PROFILE.education}</dd>
                    <dt>DSA Solved</dt>
                    <dd className="font-mono text-amber-300">420+ Problems (14-Day Streak)</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Metrics Counter Grid */}
            <div className="nx-metrics">
              {METRICS.map((m, idx) => (
                <div key={idx} className="nx-metric">
                  <div className="nx-metric-v text-sky-200">
                    {m.prefix || ''}{m.value.toLocaleString()}{m.suffix}
                  </div>
                  <div className="nx-metric-l">{m.label}</div>
                  <div className="nx-metric-h">{m.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: EXPERIENCE SIGNALS ────────────────────────── */}
        <section id="experience" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 02</span>
                <h2 className="nx-h2">
                  Proven <em>Production Signals</em>
                </h2>
                <p className="nx-lead">
                  Battle-tested experience across enterprise oil corporations and high-throughput commerce products.
                </p>
              </div>
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

        {/* ── CHAPTER 03: SYSTEM ARCHITECTURE LAB ───────────────────── */}
        <section id="lab" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 03</span>
                <h2 className="nx-h2">
                  Interactive <em>System Lab</em>
                </h2>
                <p className="nx-lead">
                  Explore the 3D distributed mesh powering Aryan's enterprise RAG platform.
                  Adjust throughput load or inject simulated chaos to evaluate resilience.
                </p>
              </div>

              <button
                onClick={() => handleOpenCopilotWithQuery('Explain the Java 21 Kafka architecture in detail')}
                className="nx-btn sm ghost"
              >
                <Sparkles size={13} className="text-sky-300" />
                <span>Ask Architecture Trade-Offs</span>
              </button>
            </div>

            <SystemLabCanvas />
          </div>
        </section>

        {/* ── CHAPTER 04: FEATURED WORK & SHIPPED APPS ──────────────── */}
        <section id="work" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 04</span>
                <h2 className="nx-h2">
                  Featured <em>Production Artifacts</em>
                </h2>
                <p className="nx-lead">
                  Open-source flagships, benchmarked latencies, and consumer apps live on app stores.
                </p>
              </div>
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
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-sans">
                    Shipped Consumer Mobile Apps (10,000+ Installs)
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Production apps on Google Play Store and Apple App Store
                  </p>
                </div>
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

        {/* ── CHAPTER 05: CORE STACK & INTERACTIVE MAPPING ──────────── */}
        <section id="stack" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 05</span>
                <h2 className="nx-h2">
                  Core <em>Technical Matrix</em>
                </h2>
                <p className="nx-lead">
                  Hover or tap any skill to see which production projects and systems rely on it.
                </p>
              </div>

              {activeSkillName && (
                <div className="nx-stack-hint">
                  Active filter: <b>{activeSkillName}</b> (highlighted in projects)
                </div>
              )}
            </div>

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
          </div>
        </section>

        {/* ── CHAPTER 06: DEVELOPER TERMINAL ────────────────────────── */}
        <section id="terminal" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 06</span>
                <h2 className="nx-h2">
                  Interactive <em>CLI Console</em>
                </h2>
                <p className="nx-lead">
                  For engineers and terminal lovers. Run CLI commands to inspect background daemons, DSA streak, and metrics.
                </p>
              </div>
            </div>

            <DevTerminal />
          </div>
        </section>

        {/* ── CHAPTER 07: CONTACT TRANSMISSION ──────────────────────── */}
        <section id="contact" className="nx-section">
          <div className="nx-wrap">
            <div className="nx-sec-head">
              <div>
                <span className="nx-eyebrow">Chapter 07</span>
                <h2 className="nx-h2">
                  Initiate <em>Transmission</em>
                </h2>
                <p className="nx-lead">
                  Open for SDE-1 / Software Engineering / AI Engineer opportunities. Available for immediate onboarding.
                </p>
              </div>
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

            <h3>{activeProjectModal.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {activeProjectModal.problem}
            </p>

            <div className="nx-case">
              <div>
                <h5>Architectural Approach</h5>
                <ol>
                  {activeProjectModal.approach.map((step, idx) => (
                    <li key={idx} className="mb-2">{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h5>Measured Production Impact</h5>
                <ol>
                  {activeProjectModal.impact.map((imp, idx) => (
                    <li key={idx} className="mb-2 font-medium text-emerald-300">{imp}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="nx-tags pt-6 border-t border-[var(--line)] mt-6">
              {activeProjectModal.stack.map((t, idx) => (
                <span key={idx} className="nx-chip">{t}</span>
              ))}
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <a
                href={activeProjectModal.href}
                target="_blank"
                rel="noreferrer"
                className="nx-btn primary"
              >
                <span>View Repository on GitHub</span>
                <ExternalLink size={14} />
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
