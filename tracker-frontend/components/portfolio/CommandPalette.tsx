'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  Briefcase,
  Bot,
  Layers,
  Terminal,
  Mail,
  Copy,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { PROFILE, CANDIDATE_BRIEF } from './data';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenRecruiter: () => void;
  onOpenCopilot: (prompt?: string) => void;
  onNavigateSection: (id: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  group: 'Navigation' | 'Recruiter Actions' | 'Interactive Tools';
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  action: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  onOpenRecruiter,
  onOpenCopilot,
  onNavigateSection,
}: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const ITEMS: CommandItem[] = [
    {
      id: 'brief',
      title: 'Candidate Screen Summary',
      subtitle: 'Copy 1-page recruiter brief to clipboard',
      group: 'Recruiter Actions',
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(CANDIDATE_BRIEF);
        onClose();
      },
    },
    {
      id: 'recruiter',
      title: 'Open Role-Fit Matcher',
      subtitle: 'Paste JD to calculate exact candidate match %',
      group: 'Recruiter Actions',
      icon: Briefcase,
      action: () => {
        onClose();
        onOpenRecruiter();
      },
    },
    {
      id: 'resume',
      title: 'Download Resume (PDF)',
      subtitle: 'Open verified Google Drive resume link',
      group: 'Recruiter Actions',
      icon: FileText,
      action: () => {
        window.open(PROFILE.resume, '_blank');
        onClose();
      },
    },
    {
      id: 'jarvis',
      title: 'Ask Jarvis AI Copilot',
      subtitle: 'Screen Aryan with interactive conversational AI',
      group: 'Interactive Tools',
      icon: Bot,
      action: () => {
        onClose();
        onOpenCopilot('Screen Aryan as an SDE-1 candidate with top 3 strengths');
      },
    },
    {
      id: 'nav-lab',
      title: '3D System Architecture Lab',
      subtitle: 'Interact with Kafka, Loom, & Qdrant nodes',
      group: 'Navigation',
      icon: Layers,
      action: () => {
        onClose();
        onNavigateSection('lab');
      },
    },
    {
      id: 'nav-exp',
      title: 'Experience Signals',
      subtitle: 'Ta Rule Technologies & IOCL production impact',
      group: 'Navigation',
      icon: Briefcase,
      action: () => {
        onClose();
        onNavigateSection('experience');
      },
    },
    {
      id: 'nav-work',
      title: 'Flagship Projects & Shipped Apps',
      subtitle: '10,000+ downloads & Google Cloud award winner',
      group: 'Navigation',
      icon: Code2,
      action: () => {
        onClose();
        onNavigateSection('work');
      },
    },
    {
      id: 'nav-term',
      title: 'Developer Terminal',
      subtitle: 'Interactive bash CLI with custom commands',
      group: 'Interactive Tools',
      icon: Terminal,
      action: () => {
        onClose();
        onNavigateSection('terminal');
      },
    },
    {
      id: 'nav-contact',
      title: 'Initiate Contact Transmission',
      subtitle: 'Email, phone, and direct interview scheduling',
      group: 'Navigation',
      icon: Mail,
      action: () => {
        onClose();
        onNavigateSection('contact');
      },
    },
  ];

  const filtered = ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="nx-cmd-bg" onClick={onClose}>
      <div className="nx-panel nx-cmd" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center px-4 border-b border-[var(--line)]">
          <Search size={18} className="text-zinc-500 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, projects, architectures, or candidate credentials... (ESC to close)"
            className="w-full py-4 text-sm font-sans bg-transparent text-white focus:outline-none"
          />
        </div>

        <div className="nx-cmd-list">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              No commands matching "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`nx-cmd-item ${isSelected ? 'on' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-400/20 text-sky-300' : 'bg-white/5 text-zinc-400'}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-left">{item.title}</div>
                    <div className="text-xs text-zinc-400 text-left">{item.subtitle}</div>
                  </div>
                  <small>{item.group}</small>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
