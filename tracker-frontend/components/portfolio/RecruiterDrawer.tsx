'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Briefcase,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import {
  PROFILE,
  CANDIDATE_BRIEF,
  ROLE_PRESETS,
  computeFit,
  FIT_VOCAB,
} from './data';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenCopilot?: (query?: string) => void;
}

export default function RecruiterDrawer({ open, onClose, onOpenCopilot }: Props) {
  const [copied, setCopied] = useState(false);
  const [selectedRolePreset, setSelectedRolePreset] = useState<string>('Backend SDE-1');
  const [jdText, setJdText] = useState(ROLE_PRESETS['Backend SDE-1']);

  if (!open) return null;

  const fitResult = computeFit(jdText);

  const copyBrief = () => {
    navigator.clipboard.writeText(CANDIDATE_BRIEF);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const applyPreset = (presetName: string) => {
    setSelectedRolePreset(presetName);
    setJdText(ROLE_PRESETS[presetName] || '');
  };

  return (
    <>
      <div className="nx-drawer-bg" onClick={onClose} />
      <div className="nx-drawer">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans">Recruiter & HR Briefing</h3>
              <p className="text-xs font-mono text-zinc-400">Aryan Chandra // SDE-1 Candidate Assessment</p>
            </div>
          </div>
          <button onClick={onClose} className="nx-btn sm icon ghost" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Quick Candidate Snapshot Card */}
        <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-[var(--line)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold">
              Candidate Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Immediate Joiner
            </span>
          </div>

          <div className="nx-facts">
            <div className="nx-fact">
              <b>{PROFILE.name}</b>
              <span>{PROFILE.title} (SDE-1 / SWE-1)</span>
            </div>
            <div className="nx-fact">
              <b>{PROFILE.education}</b>
              <span>420+ LeetCode DSA Solved</span>
            </div>
            <div className="nx-fact">
              <b>Delhi NCR, India</b>
              <span>Open to Remote & Global Relocation</span>
            </div>
            <div className="nx-fact">
              <b>10,000+ Downloads</b>
              <span>Shipped Mobile Store Apps</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button onClick={copyBrief} className="nx-btn sm primary flex-1">
              {copied ? <Check size={14} className="text-emerald-950" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy 1-Page Summary'}</span>
            </button>
            <a
              href={PROFILE.resume}
              target="_blank"
              rel="noreferrer"
              className="nx-btn sm ghost flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Resume PDF</span>
            </a>
          </div>
        </div>

        {/* Live JD Fit Analyzer */}
        <div className="nx-drawer-sec">
          <div className="flex items-center justify-between mb-3">
            <h5>Role-Fit Matcher (Algorithmic Analysis)</h5>
            <span className="text-xs font-mono text-emerald-400 font-bold">{fitResult.score}% Match</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            Select a target profile or paste your company's Job Description to verify Aryan's hands-on production evidence.
          </p>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.keys(ROLE_PRESETS).map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  selectedRolePreset === preset
                    ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* JD Input textarea */}
          <textarea
            rows={3}
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              setSelectedRolePreset('');
            }}
            placeholder="Paste your job description requirements here (e.g. Java, Kafka, Spring Boot, React, Vector Search)..."
            className="w-full text-xs font-mono p-3 rounded-xl bg-black/40 border border-[var(--line)] text-zinc-200 focus:outline-none focus:border-sky-400 transition"
          />

          {/* Matched Evidence List */}
          <div className="mt-3 space-y-1.5">
            <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Verified Match Evidence:</span>
              <span className="text-sky-400 font-bold">{fitResult.matched.length} Skills Found</span>
            </div>

            <div className="nx-match max-h-52 overflow-y-auto pr-1">
              {fitResult.matched.map((m, i) => (
                <div key={i}>
                  <b>{m.label}</b>
                  <span>{m.evidence}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ask Jarvis Specific Screening Questions */}
        <div className="nx-drawer-sec">
          <h5>Instant AI Screener</h5>
          <p className="text-xs text-zinc-400 mb-3">
            Ask Jarvis to answer recruiter screening queries backed by Aryan's real codebase:
          </p>
          <div className="flex flex-col gap-2">
            {[
              'Screen Aryan as an SDE-1 candidate with top 3 strengths',
              'Explain his sub-200ms Java 21 Kafka architecture',
              'What makes him ready for high-throughput product companies?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  onOpenCopilot?.(q);
                }}
                className="text-left text-xs p-2.5 rounded-xl bg-white/[0.02] border border-[var(--line)] hover:border-sky-400/50 hover:bg-sky-400/5 text-zinc-300 transition flex items-center justify-between group"
              >
                <span>"{q}"</span>
                <Sparkles size={13} className="text-sky-400 opacity-60 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Direct Contact Coordinates */}
        <div className="nx-drawer-sec">
          <h5>Direct Contact Coordinates</h5>
          <div className="space-y-2 text-xs font-mono text-zinc-300">
            <a
              href={`mailto:${PROFILE.email}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition"
            >
              <Mail size={14} className="text-sky-400" />
              <span>{PROFILE.email}</span>
            </a>
            <a
              href={`tel:${PROFILE.phoneRaw}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition"
            >
              <Phone size={14} className="text-emerald-400" />
              <span>{PROFILE.phone}</span>
            </a>
            <div className="flex items-center gap-2 p-2 text-zinc-400">
              <MapPin size={14} className="text-amber-400" />
              <span>{PROFILE.location} ({PROFILE.relocation})</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
