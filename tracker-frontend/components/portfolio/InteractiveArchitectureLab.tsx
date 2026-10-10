'use client';

import React, { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Server,
  Zap,
  Radio,
  FileCode,
  ShieldCheck,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export type ArchView = 'backend' | 'rag';

interface ArchNode {
  id: string;
  label: string;
  category: 'gateway' | 'compute' | 'queue' | 'cache' | 'storage' | 'ai' | 'client';
  sublabel: string;
  tech: string;
  protocol: string;
  status: 'production' | 'verified';
  latency: string;
  throughput: string;
  summary: string;
  inputs: string[];
  outputs: string[];
  tradeoffs: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const BACKEND_NODES: Record<string, ArchNode> = {
  clients: {
    id: 'clients',
    label: 'Clients & Consumers',
    category: 'client',
    sublabel: 'Web (Next.js 14) · Mobile (React Native)',
    tech: 'Next.js 14, React Native, Axios, WS',
    protocol: 'HTTPS / WSS / gRPC',
    status: 'production',
    latency: 'Client-side',
    throughput: '10,000+ app users',
    summary: 'Cross-platform merchant and consumer applications. Shipped on Google Play Store (Fonofy, 4.8★).',
    inputs: ['User gestures', 'Device camera / diagnostics', 'Trade-in submissions'],
    outputs: ['JSON REST requests', 'Bi-directional WebSocket frames'],
    tradeoffs: 'Client-side JWT storage in secure keychain/storage; optimistic UI updates for instant feedback with backend rollback on failure.',
    icon: Server,
  },
  gateway: {
    id: 'gateway',
    label: 'API Gateway & Ingress',
    category: 'gateway',
    sublabel: 'Netty SSL Termination · JWT RBAC',
    tech: 'Spring Cloud Gateway / Express Netty',
    protocol: 'REST / HTTP/2',
    status: 'production',
    latency: '1.2ms P95',
    throughput: '48,000 req/s',
    summary: 'Stateless ingress gateway with cryptographic asymmetric JWT verification, token-bucket rate limiting, and CORS headers.',
    inputs: ['Public HTTPS requests from clients'],
    outputs: ['Validated internal RPC calls with X-User-Id headers'],
    tradeoffs: 'Validates JWT signatures at edge to protect downstream services from unauthorized traffic. Token bucket prevents denial-of-service.',
    icon: ShieldCheck,
  },
  services: {
    id: 'services',
    label: 'Spring Boot 3 & Node.js Core',
    category: 'compute',
    sublabel: 'Java 21 Project Loom · Microservices',
    tech: 'Java 21 Virtual Threads, Spring Boot 3, Express',
    protocol: 'Internal REST / Spring AI',
    status: 'production',
    latency: '18ms P95',
    throughput: '42,500 ops/s',
    summary: 'Domain services handling commerce, order validation, RAG context assembly, and telemetry ingestion.',
    inputs: ['Internal REST requests from Gateway', 'Kafka consumer triggers'],
    outputs: ['Database queries', 'Kafka event emissions', 'JSON responses'],
    tradeoffs: 'Java 21 virtual threads handle blocking I/O without OS thread exhaustion, avoiding the complexity and stacktrace loss of reactive Mono/Flux.',
    icon: Cpu,
  },
  kafka: {
    id: 'kafka',
    label: 'Apache Kafka Event Bus',
    category: 'queue',
    sublabel: 'KRaft Quorum · 3 Partitions',
    tech: 'Apache Kafka 3.6, Spring Kafka',
    protocol: 'Binary TCP / SASL',
    status: 'production',
    latency: '3.8ms P95',
    throughput: '120,000 ev/s',
    summary: 'Event-driven backbone decoupling heavy document parsing, order processing, and telemetry from user-facing request threads.',
    inputs: ['Order created events', 'Document ingestion triggers', 'Telemetry streams'],
    outputs: ['Partition-balanced event records to consumer groups'],
    tradeoffs: 'Partitioning by tenant ID preserves ordering while scaling horizontally. Dead-letter queues (DLQ) catch poisoned payloads without pipeline lockup.',
    icon: Radio,
  },
  workers: {
    id: 'workers',
    label: 'Background Workers & Telemetry',
    category: 'compute',
    sublabel: 'Async Consumers · Event Handlers',
    tech: 'Node.js Cluster / Java Consumers',
    protocol: 'Kafka Consumer Group',
    status: 'production',
    latency: 'Async / 45ms P95',
    throughput: '50,000 txns/day',
    summary: 'Dedicated async workers for invoice generation, payment reconciliation (Razorpay/Paytm), and OCR ingestion.',
    inputs: ['Kafka topic streams'],
    outputs: ['PostgreSQL audit records', 'Redis cache invalidations', 'Notification broadcasts'],
    tradeoffs: 'Idempotent consumer keys prevent duplicate billing or indexing if a network failure triggers consumer group rebalancing.',
    icon: Zap,
  },
  redis: {
    id: 'redis',
    label: 'Redis Sentinel L2 Cache',
    category: 'cache',
    sublabel: 'In-Memory Hot Platter · Locks',
    tech: 'Redis 7, Sentinel failover',
    protocol: 'RESP protocol',
    status: 'production',
    latency: '0.4ms P95',
    throughput: '98.4% Hit Rate',
    summary: 'Hot session caching, rate-limit buckets, distributed mutex locks for inventory updates, and cached vector search embeddings.',
    inputs: ['Key lookups', 'Distributed lock acquisitions'],
    outputs: ['Cached JSON payloads', 'Lock tokens'],
    tradeoffs: 'TTL jitter on expiration prevents cache stampede (thundering herd). Distributed Redis locks ensure atomic inventory decrements.',
    icon: Database,
  },
  database: {
    id: 'database',
    label: 'PostgreSQL & MongoDB Cluster',
    category: 'storage',
    sublabel: 'ACID Transactions · Read Replicas',
    tech: 'PostgreSQL 16, MongoDB Atlas 7.0',
    protocol: 'Postgres wire / Mongo wire',
    status: 'production',
    latency: '5.6ms P95',
    throughput: '99.9% Uptime SLA',
    summary: 'PostgreSQL manages relational transactional commerce & audits; MongoDB stores flexible application logs, conversational memory, and user profiles.',
    inputs: ['SQL queries & mutations', 'Mongoose documents'],
    outputs: ['Committed ACID records', 'Audit logs'],
    tradeoffs: 'Read replicas handle reporting and analytics queries; primary instances remain dedicated to low-latency transactional writes.',
    icon: Layers,
  },
};

const RAG_NODES: Record<string, ArchNode> = {
  chat_ui: {
    id: 'chat_ui',
    label: 'Jarvis Conversational UI',
    category: 'client',
    sublabel: 'Next.js 14 · Web Audio · Speech API',
    tech: 'Next.js 14, Web Audio API, SpeechSynthesis',
    protocol: 'HTTPS / EventSource (SSE)',
    status: 'production',
    latency: 'Instant UI render',
    throughput: 'Real-time multi-turn',
    summary: 'Interactive AI copilot with speech recognition, text-to-speech visualizer, syntax-highlighted code rendering, and suggested candidate screening prompts.',
    inputs: ['User voice/text prompts', 'File/resume attachments'],
    outputs: ['HTTP POST query', 'SSE connection request'],
    tradeoffs: 'Server-Sent Events (SSE) used over WebSockets for chat completion: lighter weight, automatic reconnection, and native browser streaming support.',
    icon: Bot,
  },
  agent_orch: {
    id: 'agent_orch',
    label: 'Agent Orchestrator & Safety',
    category: 'compute',
    sublabel: 'Intent Classification · Tool Selection',
    tech: 'Node.js Express / LangGraph state loop',
    protocol: 'In-process memory store',
    status: 'production',
    latency: '8ms intent routing',
    throughput: '100% guarded',
    summary: 'Classifies user intent (Candidate Screening, Architecture Deep-Dive, Project Query, or Action), selects verified tools, and enforces prompt injection defense.',
    inputs: ['User prompt string', 'Session history context'],
    outputs: ['Augmented system prompt', 'Selected tool execution request'],
    tradeoffs: 'Fast regex/heuristic classifier runs first to handle greetings and tracker queries in sub-5ms without incurring unnecessary LLM token cost.',
    icon: ShieldCheck,
  },
  ingestion: {
    id: 'ingestion',
    label: 'Document Ingestion Pipeline',
    category: 'compute',
    sublabel: 'OCR · Chunker · Sanitizer',
    tech: 'Tesseract OCR, pdf-parse, Recursive Chunker',
    protocol: 'Multipart / disk storage',
    status: 'production',
    latency: '350ms parse time',
    throughput: 'PDF, DOCX, TXT, Images',
    summary: 'Extracts clean text from uploaded resumes, system specs, and images; normalizes text into 500-token chunks with 50-token overlap.',
    inputs: ['Uploaded PDF / Markdown / image files'],
    outputs: ['Sanitized document chunks with source metadata'],
    tradeoffs: 'Recursive character splitting prevents cutting code blocks or sentences mid-thought, preserving contextual coherence for embedding retrieval.',
    icon: FileCode,
  },
  embeddings: {
    id: 'embeddings',
    label: 'Dense Embedding Generator',
    category: 'ai',
    sublabel: 'Xenova all-MiniLM-L6-v2 / OpenAI',
    tech: 'ONNX in-process (@xenova/transformers) / Gemini Embed',
    protocol: 'Zero-cost local ONNX / API',
    status: 'production',
    latency: '24ms / chunk',
    throughput: '384-dim dense vectors',
    summary: 'Converts text chunks and query strings into high-dimensional semantic vector embeddings for geometric similarity matching.',
    inputs: ['Normalized text chunk strings'],
    outputs: ['384-dimensional normalized float vectors'],
    tradeoffs: 'In-process ONNX model allows zero-cost offline embeddings with zero external API key requirements or rate limits.',
    icon: Sparkles,
  },
  qdrant_vector: {
    id: 'qdrant_vector',
    label: 'Hybrid Vector Retrieval Index',
    category: 'storage',
    sublabel: 'Qdrant HNSW + BM25 Lexical',
    tech: 'Qdrant / MongoDB Atlas Vector Search',
    protocol: 'gRPC / JSON wire',
    status: 'production',
    latency: '18ms P95',
    throughput: 'Top-K semantic matches',
    summary: 'Hybrid search engine combining geometric dense vector cosine distance with sparse BM25 lexical keyword ranking, fused via Reciprocal Rank Fusion.',
    inputs: ['Query embedding vector', 'Keywords string'],
    outputs: ['Top-5 relevance-scored document chunks with citations'],
    tradeoffs: 'Pure vector search struggles with exact technical jargon or part numbers; hybrid fusion guarantees both semantic meaning and keyword accuracy.',
    icon: Database,
  },
  llm_gateway: {
    id: 'llm_gateway',
    label: 'Multi-Model LLM Gateway',
    category: 'ai',
    sublabel: 'Gemini 2.5 Flash · Claude · Local Loom',
    tech: 'Google Generative AI, Anthropic API, Humanoid Engine',
    protocol: 'HTTPS streaming API',
    status: 'production',
    latency: 'Sub-200ms TTFT',
    throughput: 'Failover resilience',
    summary: 'Streams grounded responses assembled from retrieved vector context, session history, and system instructions. Automatically fails over if any provider limits out.',
    inputs: ['Retrieved RAG context', 'System instructions', 'User query'],
    outputs: ['Grounded streaming tokens with markdown citations'],
    tradeoffs: 'Strict system prompt prevents hallucinations by constraining the model to verified portfolio facts and project documentation.',
    icon: Bot,
  },
};

export default function InteractiveArchitectureLab() {
  const [activeView, setActiveView] = useState<ArchView>('backend');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('services');

  const nodes = activeView === 'backend' ? BACKEND_NODES : RAG_NODES;
  const activeNode = nodes[selectedNodeId] || (activeView === 'backend' ? BACKEND_NODES.services : RAG_NODES.agent_orch);

  const selectNode = (id: string) => {
    if (nodes[id]) setSelectedNodeId(id);
  };

  const handleTabChange = (view: ArchView) => {
    setActiveView(view);
    setSelectedNodeId(view === 'backend' ? 'services' : 'agent_orch');
  };

  return (
    <div className="w-full space-y-6">
      {/* View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('backend')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
              activeView === 'backend'
                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 shadow-lg shadow-sky-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Server size={14} />
            <span>1. Distributed Backend Architecture (Java 21 · Kafka · Loom)</span>
          </button>

          <button
            onClick={() => handleTabChange('rag')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
              activeView === 'rag'
                ? 'bg-purple-400/20 text-purple-300 border border-purple-400/40 shadow-lg shadow-purple-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles size={14} />
            <span>2. Applied AI & RAG Pipeline (Embeddings · Qdrant · Jarvis)</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400 px-3 py-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-sky-400 inline-block" /> Synchronous REST
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-amber-400 inline-block border-dashed" /> Async Kafka Event
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-emerald-400 inline-block" /> Storage / Cache
          </span>
        </div>
      </div>

      {/* Main Diagram Area + Node Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Architecture Map (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950/80 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top Status */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activeView === 'backend'
                  ? 'LIVE BACKEND TOPOLOGY // 50K+ DAILY TRANSACTIONS'
                  : 'RAG SEMANTIC PIPELINE // HYBRID RETRIEVAL'}
              </span>
            </div>
            <span>Click any node to inspect trade-offs</span>
          </div>

          {/* Interactive Flow Nodes Layout */}
          {activeView === 'backend' ? (
            <div className="space-y-6">
              {/* Row 1: Clients & Ingress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={BACKEND_NODES.clients}
                  isSelected={selectedNodeId === 'clients'}
                  onClick={() => selectNode('clients')}
                />
                <NodeButton
                  node={BACKEND_NODES.gateway}
                  isSelected={selectedNodeId === 'gateway'}
                  onClick={() => selectNode('gateway')}
                />
              </div>

              {/* Connecting Flow Indicator */}
              <div className="flex justify-center items-center gap-2 py-1 text-[11px] font-mono text-sky-400/80">
                <span className="w-12 h-px bg-sky-400/40" />
                <span>REST / HTTPS (SSL Terminated)</span>
                <span className="w-12 h-px bg-sky-400/40" />
              </div>

              {/* Row 2: Compute Core (Java 21 Loom) */}
              <div className="w-full">
                <NodeButton
                  node={BACKEND_NODES.services}
                  isSelected={selectedNodeId === 'services'}
                  onClick={() => selectNode('services')}
                  featured={true}
                />
              </div>

              {/* Connecting Bifurcation: Async Kafka vs Sync Cache */}
              <div className="grid grid-cols-2 text-center text-[10px] font-mono py-1">
                <span className="text-amber-400 flex items-center justify-center gap-1">
                  <span>⚡ Async Event Emission</span>
                </span>
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <span>🔒 Atomic Cache Read/Write</span>
                </span>
              </div>

              {/* Row 3: Kafka & Redis Platter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={BACKEND_NODES.kafka}
                  isSelected={selectedNodeId === 'kafka'}
                  onClick={() => selectNode('kafka')}
                />
                <NodeButton
                  node={BACKEND_NODES.redis}
                  isSelected={selectedNodeId === 'redis'}
                  onClick={() => selectNode('redis')}
                />
              </div>

              {/* Row 4: Workers & ACID Database */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={BACKEND_NODES.workers}
                  isSelected={selectedNodeId === 'workers'}
                  onClick={() => selectNode('workers')}
                />
                <NodeButton
                  node={BACKEND_NODES.database}
                  isSelected={selectedNodeId === 'database'}
                  onClick={() => selectNode('database')}
                />
              </div>
            </div>
          ) : (
            /* AI & RAG Pipeline Layout */
            <div className="space-y-6">
              {/* Row 1: Chat UI & Orchestrator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={RAG_NODES.chat_ui}
                  isSelected={selectedNodeId === 'chat_ui'}
                  onClick={() => selectNode('chat_ui')}
                />
                <NodeButton
                  node={RAG_NODES.agent_orch}
                  isSelected={selectedNodeId === 'agent_orch'}
                  onClick={() => selectNode('agent_orch')}
                  featured={true}
                />
              </div>

              {/* Connecting Flow */}
              <div className="flex justify-center items-center gap-2 py-1 text-[11px] font-mono text-purple-400/80">
                <span className="w-12 h-px bg-purple-400/40" />
                <span>Intent Validated → RAG Semantic Path</span>
                <span className="w-12 h-px bg-purple-400/40" />
              </div>

              {/* Row 2: Ingestion & Embeddings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={RAG_NODES.ingestion}
                  isSelected={selectedNodeId === 'ingestion'}
                  onClick={() => selectNode('ingestion')}
                />
                <NodeButton
                  node={RAG_NODES.embeddings}
                  isSelected={selectedNodeId === 'embeddings'}
                  onClick={() => selectNode('embeddings')}
                />
              </div>

              {/* Row 3: Qdrant Vector Search & LLM Multi-Model Gateway */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NodeButton
                  node={RAG_NODES.qdrant_vector}
                  isSelected={selectedNodeId === 'qdrant_vector'}
                  onClick={() => selectNode('qdrant_vector')}
                />
                <NodeButton
                  node={RAG_NODES.llm_gateway}
                  isSelected={selectedNodeId === 'llm_gateway'}
                  onClick={() => selectNode('llm_gateway')}
                  featured={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Node Deep-Dive Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-950/90 border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold">
              Engineering Deep-Dive
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {activeNode.status.toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold font-sans text-white">{activeNode.label}</h3>
            <p className="text-xs font-mono text-sky-300 mt-0.5">{activeNode.sublabel}</p>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{activeNode.summary}</p>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-500 block text-[10px]">P95 Latency</span>
              <span className="text-emerald-400 font-bold">{activeNode.latency}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-500 block text-[10px]">Throughput</span>
              <span className="text-sky-300 font-bold">{activeNode.throughput}</span>
            </div>
          </div>

          {/* Architectural Trade-Off */}
          <div className="p-3.5 rounded-2xl bg-sky-500/[0.06] border border-sky-400/20 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <AlertCircle size={12} /> Architectural Decision & Trade-Off:
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed">{activeNode.tradeoffs}</p>
          </div>

          {/* I/O Contracts */}
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Inputs:</span>
              <ul className="list-disc pl-4 text-zinc-300 text-[11px] space-y-0.5">
                {activeNode.inputs.map((inItem, idx) => (
                  <li key={idx}>{inItem}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Outputs:</span>
              <ul className="list-disc pl-4 text-zinc-300 text-[11px] space-y-0.5">
                {activeNode.outputs.map((outItem, idx) => (
                  <li key={idx}>{outItem}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Stack: <strong className="text-white">{activeNode.tech}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeButton({
  node,
  isSelected,
  onClick,
  featured = false,
}: {
  node: ArchNode;
  isSelected: boolean;
  onClick: () => void;
  featured?: boolean;
}) {
  const Icon = node.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative border flex items-start gap-3.5 ${
        isSelected
          ? 'bg-sky-400/[0.12] border-sky-400 shadow-xl shadow-sky-500/20'
          : featured
          ? 'bg-slate-900/90 border-sky-400/30 hover:border-sky-400/60 hover:bg-slate-900'
          : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
      }`}
    >
      <div
        className={`p-2.5 rounded-xl shrink-0 ${
          isSelected
            ? 'bg-sky-400 text-slate-950'
            : featured
            ? 'bg-sky-400/20 text-sky-300'
            : 'bg-white/5 text-zinc-400'
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm text-white truncate">{node.label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 shrink-0">
            {node.latency}
          </span>
        </div>
        <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">{node.sublabel}</p>
        <div className="text-[11px] text-zinc-500 font-mono mt-2 truncate">
          Tech: {node.tech}
        </div>
      </div>
    </button>
  );
}
