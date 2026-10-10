'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Download,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getStreamUrl, sendAiChat } from '@/lib/api';
import { PROFILE, CANDIDATE_BRIEF } from './data';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  ts: string;
}

const RECRUITER_QUICK_ACTIONS = [
  {
    label: '👔 Candidate Screen Summary',
    prompt: 'Give me a 1-page candidate screen brief of Aryan: education, top production achievements, target roles, and notice period.',
  },
  {
    label: '⚡ Java 21 & Kafka Architecture',
    prompt: 'Explain the technical architecture of Aryan\'s Enterprise RAG Knowledge Copilot: how does it use Java 21 virtual threads, Kafka, and Qdrant to achieve sub-200ms P95 latency?',
  },
  {
    label: '📱 Fonofy App (10K+ Installs)',
    prompt: 'Tell me about Aryan\'s Fonofy Partners mobile app on the Google Play Store: what does it do and what were his engineering contributions?',
  },
  {
    label: '🎯 420+ LeetCode DSA Mastery',
    prompt: 'Summarize Aryan\'s DSA track record: 420+ solved problems, active streak, and key algorithm topics mastered.',
  },
  {
    label: '🛡️ 99.9% Production SLA & Commerce',
    prompt: 'Tell me about the GiantCell healthcare commerce platform handling 50,000+ daily transactions with 99.9% uptime SLA.',
  },
];

const ENGINEERING_QUICK_ACTIONS = [
  {
    label: '🛠️ Why Java 21 Virtual Threads?',
    prompt: 'Why choose Java 21 Project Loom virtual threads over traditional reactive WebFlux for high concurrency RAG retrieval?',
  },
  {
    label: '🔍 Hybrid Vector Search Trade-Offs',
    prompt: 'How does dense vector search (HNSW) combine with sparse BM25 lexical search in Qdrant, and why is Reciprocal Rank Fusion used?',
  },
  {
    label: '🤖 LangGraph Multi-Agent Engine',
    prompt: 'How did Aryan implement the LangGraph state graph for Stadium Pulse that won the Google Cloud Agentic Premier League Top Builder Award?',
  },
];

function getSmartFallbackReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('screen') || q.includes('hire') || q.includes('candidate') || q.includes('summary') || q.includes('brief')) {
    return `✦ **Candidate Screen Brief — Aryan Chandra**:\n\n• **Immediate Joiner:** Available immediately for **SDE-1 / Software Engineering** roles (Delhi NCR, Open to Remote & Relocation).\n• **Production Mobile Impact:** Shipped **Fonofy Partner App** with **10,000+ Google Play Store downloads** (4.8★ rating).\n• **Enterprise Distributed Systems:** Architected RAG Copilot with **Java 21 virtual threads, Spring Boot 3, Kafka streams**, and **Qdrant hybrid vector search** (sub-200ms P95 latency).\n• **Award Winner:** Top Builder Award in **Google Cloud Agentic Premier League** (LangGraph multi-agent systems on Cloud Run).\n• **Algorithmic Mastery:** **420+ LeetCode DSA** problems solved across LeetCode & Striver SDE sheet.\n• **High-Throughput Production:** Maintained **99.9% uptime SLA** across 50,000+ daily transactions on GiantCell commerce.\n\n[Download Resume (PDF)](${PROFILE.resume}) | Contact: ${PROFILE.email}`;
  }
  if (q.includes('kafka') || q.includes('java') || q.includes('spring') || q.includes('architecture') || q.includes('rag')) {
    return `✦ **Enterprise RAG Knowledge Architecture**:\n\n• **Runtime:** Java 21 with Project Loom virtual threads for high concurrency without threadpool starvation.\n• **Framework:** Spring Boot 3 + Spring AI with JWT-secured RBAC API Gateway.\n• **Decoupled Ingestion:** Event-driven Apache Kafka clusters isolate document embedding & chunking from query traffic.\n• **Hybrid Retrieval:** Qdrant combines dense geometric embeddings (HNSW) with sparse lexical keywords (BM25), fused via Reciprocal Rank Fusion.\n• **Latency:** Verified sub-200ms P95 latency in production benchmarks.`;
  }
  if (q.includes('fonofy') || q.includes('mobile') || q.includes('download') || q.includes('app')) {
    return `✦ **Fonofy Partners Mobile Ecosystem**:\n\n• **10,000+ Live Downloads** on Google Play Store with a **4.8★ user rating**.\n• **Stack:** React Native, Node.js, Express, MongoDB, REST APIs.\n• **Core Features:** Automated hardware diagnostics, algorithmic trade-in pricing, live inventory synchronization, and order fulfillment across India.`;
  }
  if (q.includes('dsa') || q.includes('leetcode') || q.includes('streak')) {
    return `✦ **DSA & Algorithmic Excellence**:\n\n• **420+ Problems Solved** across LeetCode and the Striver SDE Sheet.\n• **Active Streak:** 14 consecutive active days.\n• **Core Strengths:** Dynamic Programming, Graph Traversal (BFS/DFS), Binary Trees, Sliding Window, Heap, and System Design fundamentals.`;
  }
  return `👋 Greetings! I am **Jarvis**, Aryan Chandra's autonomous AI engineering copilot.\n\nI have complete verified context on Aryan's production systems:\n• **10,000+ Play Store Downloads** (Fonofy Partners App)\n• **Enterprise Backends:** Java 21, Spring Boot 3, Kafka & Qdrant (sub-200ms P95)\n• **Award Winner:** Google Cloud Agentic Premier League (LangGraph + Cloud Run)\n• **High-Throughput SLA:** 50K+ daily transactions, 99.9% uptime over 24 months.\n\nAsk me any system design question or request a candidate screening summary!`;
}

interface Props {
  initialOpen?: boolean;
  onClose?: () => void;
}

export default function GlacierCopilot({ initialOpen = false, onClose }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [wide, setWide] = useState(false);
  const [persona, setPersona] = useState<'recruiter' | 'engineering'>('recruiter');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-0',
      sender: 'ai',
      text: `👋 Greetings! I'm **Jarvis**, Aryan Chandra's engineering & candidate copilot.\n\nI'm loaded with verified context on Aryan's production codebases, architectures, and career achievements:\n• **Production Mobile Impact:** **10,000+ downloads** on Google Play Store (Fonofy Partner App, 4.8★)\n• **Distributed Systems:** Java 21 virtual threads, Spring Boot 3, Kafka & Qdrant (sub-200ms P95)\n• **Google Cloud Award:** Top Builder Award in Agentic Premier League\n• **Availability:** Immediate joiner for **SDE-1 / Software Engineering** roles\n\nHow can I help you evaluate Aryan's fit today?`,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const streamRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Notify 3D canvas of copilot thinking state
  const notifyThinking = (isThinking: boolean) => {
    window.dispatchEvent(new CustomEvent('copilot:state', { detail: { thinking: isThinking } }));
  };

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) {
        setTimeout(() => handleSendMessage(detail.prompt), 100);
      }
    };

    window.addEventListener('atlas:open-assistant', handleOpen);
    return () => window.removeEventListener('atlas:open-assistant', handleOpen);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech synthesis
  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*_#`•🔗[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    if (!clean) return;
    const utter = new SpeechSynthesisUtterance(clean.slice(0, 320));
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  };

  // Speech recognition
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert('Speech recognition is not supported in this browser. You can type queries to Jarvis!');
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';

    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
        handleSendMessage(transcript);
      }
    };

    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptText = (customPrompt ?? input).trim();
    if (!promptText || loading) return;

    setInput('');
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = `a-${Date.now()}`;
    const aiPlaceholder: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      streaming: true,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setLoading(true);
    notifyThinking(true);

    let streamAccumulator = '';

    try {
      // 1. Try real-time SSE stream from backend
      const url = getStreamUrl(promptText, 'session-recruiter');
      const es = new EventSource(url);
      streamRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.token) {
            streamAccumulator += data.token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, text: streamAccumulator, streaming: !data.done } : m
              )
            );
          }
          if (data.done) {
            es.close();
            setLoading(false);
            notifyThinking(false);
            speakText(streamAccumulator);
          }
        } catch {
          // ignore parsing error
        }
      };

      es.onerror = async () => {
        es.close();
        if (streamAccumulator) {
          setLoading(false);
          notifyThinking(false);
          return;
        }

        // 2. Fallback to POST /ai/chat
        try {
          const res = await sendAiChat(promptText, 'session-recruiter');
          if (res?.success && res.reply) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, text: res.reply, streaming: false } : m
              )
            );
            setLoading(false);
            notifyThinking(false);
            speakText(res.reply);
            return;
          }
        } catch {
          // failover to local fallback
        }

        // 3. Guaranteed instant local humanoid response
        const fallbackText = getSmartFallbackReply(promptText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: fallbackText, streaming: false } : m
          )
        );
        setLoading(false);
        notifyThinking(false);
        speakText(fallbackText);
      };
    } catch {
      const fallbackText = getSmartFallbackReply(promptText);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, text: fallbackText, streaming: false } : m
        )
      );
      setLoading(false);
      notifyThinking(false);
      speakText(fallbackText);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    if (confirm('Reset conversation?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: 'Conversation reset. How can I help you evaluate Aryan today?',
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Orbital Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="cp-launch group"
          title="Open Jarvis AI Copilot"
        >
          <div className="cp-orb" />
          <div className="text-left">
            <span className="text-white font-bold text-xs">Jarvis Copilot</span>
            <small>Ask about Aryan's Code</small>
          </div>
        </button>
      )}

      {/* Main Copilot Docked Panel */}
      {open && (
        <div className={`cp-panel ${wide ? 'wide' : ''}`}>
          {/* Header */}
          <div className="cp-head">
            <div className={`cp-orb sm ${loading ? 'busy' : ''}`} />
            <div className="cp-head-t">
              <b>
                <span>Jarvis AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {loading ? 'Thinking…' : 'Online'}
                </span>
              </b>
              <small>Aryan Chandra // Engineering Copilot</small>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`cp-icon ${soundEnabled ? 'on' : ''}`}
                title={soundEnabled ? 'Mute Voice' : 'Enable Voice'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={resetChat}
                className="cp-icon"
                title="Reset Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setWide(!wide)}
                className="cp-icon hidden md:grid"
                title={wide ? 'Compact View' : 'Expand View'}
              >
                {wide ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}
                className="cp-icon"
                title="Close Copilot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Persona Tabs */}
          <div className="cp-persona">
            <button
              onClick={() => setPersona('recruiter')}
              className={persona === 'recruiter' ? 'on' : ''}
            >
              👔 Recruiter & CTO Screening
            </button>
            <button
              onClick={() => setPersona('engineering')}
              className={persona === 'engineering' ? 'on' : ''}
            >
              ⚙️ Architecture & Deep-Dive
            </button>
          </div>

          {/* Scrollable Message History */}
          <div className="cp-body">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={m.id} className={`cp-msg ${isAi ? 'ai' : 'user'}`}>
                  {isAi && (
                    <div className="w-6 h-6 rounded-lg bg-sky-400/20 text-sky-300 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                  )}

                  <div className="cp-bubble">
                    <div className="cp-md">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                      {m.streaming && <span className="cp-cursor" />}
                    </div>

                    <div className="cp-meta">
                      <span>{m.ts}</span>
                      {isAi && m.text && !m.streaming && (
                        <button
                          onClick={() => copyText(m.id, m.text)}
                          className={copiedId === m.id ? 'on' : ''}
                          title="Copy Answer"
                        >
                          {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && !messages.some((m) => m.streaming && m.text) && (
              <div className="cp-msg ai">
                <div className="w-6 h-6 rounded-lg bg-sky-400/20 text-sky-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} />
                </div>
                <div className="cp-thinking">
                  <div className="cp-step run">Querying Aryan's code repositories & RAG vector index…</div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="cp-ctx">
            <span className="cp-ctx-label">Suggested:</span>
            {(persona === 'recruiter' ? RECRUITER_QUICK_ACTIONS : ENGINEERING_QUICK_ACTIONS).map(
              (act, i) => (
                <button key={i} onClick={() => handleSendMessage(act.prompt)}>
                  {act.label}
                </button>
              )
            )}
          </div>

          {/* Footer Input Form */}
          <div className="cp-foot">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="cp-input"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask about Aryan's code, architecture, or credentials..."
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`cp-mic ${listening ? 'on' : ''}`}
                title={listening ? 'Stop Listening' : 'Speak to Jarvis'}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="cp-send"
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="cp-disclaimer">
              Powered by Jarvis Multi-Model Engine (Gemini / Claude / Loom RAG)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
