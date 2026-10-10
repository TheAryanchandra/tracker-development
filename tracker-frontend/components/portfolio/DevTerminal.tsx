'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles } from 'lucide-react';
import { PROFILE, METRICS, PROJECTS, CANDIDATE_BRIEF } from './data';

interface CommandOutput {
  id: string;
  command: string;
  output: React.ReactNode;
}

const COMMAND_SUGGESTIONS = [
  'help',
  'cat bio.md',
  'system-design',
  'dsa',
  'metrics',
  'hire aryan',
  'clear',
];

export default function DevTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      command: 'systemctl status aryan-chandra.service',
      output: (
        <div>
          <span className="p">● aryan-chandra.service - Software Engineer (SDE-1 / AI Systems)</span>
          <br />
          &nbsp;&nbsp;Loaded: loaded (/etc/systemd/system/sde1.service; enabled)
          <br />
          &nbsp;&nbsp;Active: <span className="p">active (running)</span>; Immediate Joiner
          <br />
          &nbsp;&nbsp;Stack: Java 21, Spring Boot 3, Kafka, LangGraph, React Native, Qdrant
          <br />
          &nbsp;&nbsp;Type <span className="c">help</span> to view all commands.
        </div>
      ),
    },
  ]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const runCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    const cmd = raw.toLowerCase();
    let out: React.ReactNode = null;

    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'help') {
      out = (
        <div>
          <span className="c">Available terminal commands:</span>
          <br />
          &nbsp;&nbsp;• <span className="y">cat bio.md</span> / <span className="y">bio</span> : Candidate summary & credentials
          <br />
          &nbsp;&nbsp;• <span className="y">system-design</span> : Overview of distributed RAG & Kafka architecture
          <br />
          &nbsp;&nbsp;• <span className="y">dsa</span> : LeetCode 420+ streak and topic mastery
          <br />
          &nbsp;&nbsp;• <span className="y">metrics</span> : Real-world production telemetry & SLAs
          <br />
          &nbsp;&nbsp;• <span className="y">projects</span> : Flagship deployed production systems
          <br />
          &nbsp;&nbsp;• <span className="y">hire aryan</span> : Contact transmission & candidate coordinates
          <br />
          &nbsp;&nbsp;• <span className="y">clear</span> : Clear screen
        </div>
      );
    } else if (cmd === 'cat bio.md' || cmd === 'bio') {
      out = (
        <pre className="text-zinc-300 whitespace-pre-wrap font-mono">
          {CANDIDATE_BRIEF}
        </pre>
      );
    } else if (cmd === 'system-design' || cmd === 'architecture') {
      out = (
        <div>
          <span className="c">Enterprise RAG Knowledge Copilot:</span>
          <br />
          &nbsp;&nbsp;1. Ingestion: Apache Kafka event-stream decouples heavy document OCR & chunking.
          <br />
          &nbsp;&nbsp;2. Retrieval: Qdrant hybrid vector index (HNSW dense + BM25 sparse) fused via RRF.
          <br />
          &nbsp;&nbsp;3. Concurrency: Java 21 Project Loom virtual threads handles sub-200ms P95 latency.
          <br />
          &nbsp;&nbsp;4. Security: Netty-based API Gateway with stateless JWT token bucket rate limiting.
        </div>
      );
    } else if (cmd === 'dsa' || cmd === 'leetcode') {
      out = (
        <div>
          <span className="p">LeetCode & Striver SDE Sheet Mastery:</span>
          <br />
          &nbsp;&nbsp;• Total Solved: <strong>420+ Problems</strong>
          <br />
          &nbsp;&nbsp;• Current Active Streak: <strong>14 Days</strong>
          <br />
          &nbsp;&nbsp;• Core Topics: Dynamic Programming, Graph BFS/DFS, Trees, Sliding Window, Heap/Trie.
        </div>
      );
    } else if (cmd === 'metrics') {
      out = (
        <div className="grid grid-cols-2 gap-2 my-1">
          {METRICS.map((m, i) => (
            <div key={i} className="p-2 rounded bg-white/5 border border-white/10">
              <span className="text-sky-300 font-bold">{m.prefix || ''}{m.value}{m.suffix}</span> — {m.label} ({m.hint})
            </div>
          ))}
        </div>
      );
    } else if (cmd === 'projects') {
      out = (
        <div>
          {PROJECTS.map((p) => (
            <div key={p.id} className="mb-2">
              <span className="y">[{p.id.toUpperCase()}]</span> <strong>{p.title}</strong> — {p.oneLiner}
              <br />
              <span className="text-zinc-500 text-xs">Stack: {p.stack.join(', ')}</span>
            </div>
          ))}
        </div>
      );
    } else if (cmd === 'hire aryan' || cmd === 'contact') {
      out = (
        <div>
          <span className="p">⚡ Direct Candidate Pipeline:</span>
          <br />
          &nbsp;&nbsp;• Email: <a href={`mailto:${PROFILE.email}`} className="text-sky-300 underline">{PROFILE.email}</a>
          <br />
          &nbsp;&nbsp;• Phone: <a href={`tel:${PROFILE.phoneRaw}`} className="text-sky-300 underline">{PROFILE.phone}</a>
          <br />
          &nbsp;&nbsp;• Resume: <a href={PROFILE.resume} target="_blank" rel="noreferrer" className="text-sky-300 underline">View PDF</a>
          <br />
          &nbsp;&nbsp;• Availability: Immediate Joiner (Open to Relocation & Remote)
        </div>
      );
    } else {
      out = (
        <span className="e">
          command not found: {raw}. Type <span className="c">help</span> for supported commands.
        </span>
      );
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: raw,
        output: out,
      },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input);
    }
  };

  return (
    <div className="nx-panel nx-term">
      {/* Terminal Title Bar */}
      <div className="nx-term-bar flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-mono text-zinc-400">aryan@glacier-node:~ (bash)</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">x86_64 // Project Loom JVM</div>
      </div>

      {/* Terminal Scroll Body */}
      <div ref={bodyRef} className="nx-term-body">
        {history.map((h) => (
          <div key={h.id} className="mb-3">
            <div className="flex items-center gap-2 text-zinc-400 font-mono">
              <span className="text-sky-400">aryan@glacier-node:~$</span>
              <span className="text-white font-semibold">{h.command}</span>
            </div>
            <div className="mt-1 pl-4 border-l border-zinc-700/60 font-mono text-xs">
              {h.output}
            </div>
          </div>
        ))}

        {/* Live Input Prompt */}
        <div className="nx-term-in mt-2">
          <span className="text-sky-400 font-mono text-sm">aryan@glacier-node:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help', 'dsa', 'metrics', or 'system-design'..."
            autoComplete="off"
            spellCheck={false}
          />
          <CornerDownLeft size={13} className="text-zinc-500" />
        </div>
      </div>

      {/* Quick Clickable Command Pills */}
      <div className="nx-term-sugg">
        <span className="text-zinc-500 text-[11px] font-mono flex items-center gap-1">
          <Sparkles size={11} /> Quick commands:
        </span>
        {COMMAND_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => runCommand(sug)}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 hover:bg-sky-400/10 hover:text-sky-300 text-zinc-400 border border-white/5 transition"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
}
