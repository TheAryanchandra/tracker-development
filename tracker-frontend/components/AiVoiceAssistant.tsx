'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Paperclip,
  FileText,
  Copy,
  Check,
  Globe,
  Database,
  Eye,
  StopCircle,
  Clock3,
  WifiOff,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchAiModels, getStreamUrl, uploadAiFile, sendAiChat } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  intent?: string;
  actionExecuted?: string | null;
  toolsUsed?: Array<{ tool: string; args?: unknown }>;
  fileAttachment?: {
    name: string;
    type: string;
    previewUrl?: string;
  };
  ts: string;
}

const STORAGE_KEY = 'jarvis_chat_history_v3';
const SESSION_ID = 'session-aryan-tracker';

const RECRUITER_ACTIONS = [
  { label: '👔 Why Hire Aryan?', prompt: "Give me a structured summary of why Aryan Chandra is an exceptional candidate for an SDE-1, Backend, or AI Engineer role, backed by his real projects and numbers." },
  { label: '📄 Candidate Screen Brief', prompt: "Provide a 1-page candidate screen summary of Aryan: education, target roles, location/relocation, notice period, and top 3 achievements." },
  { label: '📱 Fonofy App (10K+)', prompt: "Tell me about Aryan's Fonofy partner mobile app: what does it do, what technologies were used, and its verified 10,000+ Google Play Store traction?" },
  { label: '🛠️ Architecture & Kafka', prompt: "Explain the technical architecture of Aryan's Enterprise RAG Knowledge Copilot: how does it use Java 21, Spring Boot 3, Kafka, and Qdrant to achieve sub-200ms latency?" },
  { label: '⚡ Production SLAs', prompt: "What are Aryan's production reliability metrics? Tell me about the 99.9% uptime SLA and 50,000+ daily transactions on GiantCell commerce." },
  { label: '🎯 LeetCode DSA Mastery', prompt: "Summarize Aryan's DSA problem-solving track record: 420+ solved problems, streak, and key topics mastered." },
  { label: '📅 Schedule Interview', prompt: "How can our recruiting team schedule an interview or get in touch with Aryan immediately?" },
];

const TRACKER_ACTIONS = [
  { label: '📊 Status Report', prompt: "Give me an overview of my current DSA streak, applications, and progress from my tracker." },
  { label: '🌐 Search Web', prompt: "Search the web and tell me the latest news on tech hiring and software engineer market trends." },
  { label: '💼 Find Tech Jobs', prompt: "Search and find live software engineer job openings for me." },
  { label: '📝 Log Daily DSA', prompt: "Log today: I solved 3 DSA problems on Dynamic Programming and sent 2 applications." },
  { label: '🎯 Weak Areas', prompt: "What are my weakest DSA topics in my tracker and what should I solve next?" },
];

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Holographic Avatar Ring ─────────────────────────────────────────────────
function JarvisAvatar({ size = 36, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Outer spinning arc */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ animation: 'jarvisRingSpin 3.5s linear infinite' }}
      >
        <defs>
          <linearGradient id="jRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 2}
          fill="none"
          stroke="url(#jRingGrad)"
          strokeWidth="1.5"
          strokeDasharray={`${size * 1.2} ${size * 2}`}
          strokeLinecap="round"
        />
      </svg>
      {/* Inner glow core */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          inset: 4,
          background: 'linear-gradient(135deg, #f59e0b, #6366f1)',
          boxShadow: '0 0 14px #f59e0b55, 0 0 28px #6366f133',
        }}
      >
        <Bot size={size * 0.38} className="text-white" />
      </div>
      {/* Pulse halo */}
      {pulse && (
        <div
          className="absolute inset-0 rounded-full border-2 border-amber-400/50"
          style={{ animation: 'jarvisPulseHalo 1.4s ease-out infinite' }}
        />
      )}
      <style>{`
        @keyframes jarvisRingSpin { to { transform: rotate(360deg); } }
        @keyframes jarvisPulseHalo {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── DNA Wave Typing Indicator ────────────────────────────────────────────────
function DnaTyping() {
  return (
    <div className="flex items-end gap-[3px] px-4 py-3" style={{ minHeight: 32 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 4,
            background: 'linear-gradient(to top, #f59e0b, #6366f1)',
            animation: `dnaBar 1.1s ease-in-out infinite`,
            animationDelay: `${i * 0.11}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes dnaBar {
          0%, 100% { height: 6px; opacity: 0.4; }
          50% { height: 22px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar() {
  return (
    <div
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-white/10 text-[11px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #374151, #1f2937)', boxShadow: '0 2px 8px #0008' }}
    >
      A
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export const AiVoiceAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [chipCategory, setChipCategory] = useState<'recruiter' | 'tracker'>('recruiter');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [tts, setTts] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [visionProvider, setVisionProvider] = useState('ocr');
  const [visionModel, setVisionModel] = useState('gpt-6-astra');
  const [reasoningEffort, setReasoningEffort] = useState('high');
  const [webSearch, setWebSearch] = useState(false);
  const [visionModels, setVisionModels] = useState<Array<{ id: string; label: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceSessionRef = useRef(false);
  const restartVoiceRef = useRef<number | null>(null);
  const speakingRef = useRef(false);
  const speechRequestRef = useRef(0);
  const voiceUnlockedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const statusTimerRef = useRef<number | null>(null);
  const autoRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);
  const autoRetryCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Init history ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{
          id: 'welcome-0',
          sender: 'ai',
          text: `👋 Greetings! I'm **Jarvis**, Aryan Chandra's autonomous AI engineering copilot.\n\nI have full context on Aryan's production systems, codebase, and career achievements:\n• **Production Mobile Apps:** Shipped **Fonofy Partner App** (10,000+ downloads on Google Play Store, 4.8★)\n• **Distributed Backends:** Java 21, Spring Boot 3, Kafka event pipelines & Qdrant hybrid vector search (sub-200ms P95)\n• **Agentic AI:** Top Builder Award in Google Cloud Agentic Premier League (LangGraph + Cloud Run)\n• **Availability:** Immediate for **SDE-1 / Software Engineering** roles (Delhi NCR, Open to Remote & Relocation)\n\nFeel free to ask me anything about Aryan's technical depth, system design decisions, or request a quick candidate screen brief!`,
          ts: now(),
        }]);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    fetchAiModels().then((data) => {
      const models = data?.providers?.find((p: { id: string }) => p.id === 'kie')?.models || [];
      setVisionModels(models);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const openFromDashboard = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string; openFile?: boolean }>).detail;
      setOpen(true);
      if (detail?.prompt) setInput(detail.prompt);
      if (detail?.openFile) window.setTimeout(() => fileInputRef.current?.click(), 0);
    };
    window.addEventListener('atlas:open-assistant', openFromDashboard);
    return () => window.removeEventListener('atlas:open-assistant', openFromDashboard);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* noop */ }
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusMessage]);

  useEffect(() => {
    if (!loading) { if (statusTimerRef.current) window.clearInterval(statusTimerRef.current); return; }
    startedAtRef.current = Date.now();
    setElapsed(0);
    statusTimerRef.current = window.setInterval(() => {
      if (startedAtRef.current) setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => { if (statusTimerRef.current) window.clearInterval(statusTimerRef.current); };
  }, [loading]);

  // ── Speech recognition ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition as (new () => SpeechRecognition) | undefined
      || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as (new () => SpeechRecognition) | undefined;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e: SpeechRecognitionEvent) => {
      const interim = Array.from(e.results)
        .filter((res) => !res.isFinal)
        .map((res) => res[0].transcript).join('');
      setTranscript(interim);
      if (speakingRef.current && interim.trim()) {
        speechRequestRef.current += 1;
        window.speechSynthesis.cancel();
        speakingRef.current = false;
      }
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const turn = e.results[i][0].transcript.trim();
          if (turn) {
            if (speakingRef.current) { speechRequestRef.current++; window.speechSynthesis.cancel(); speakingRef.current = false; }
            handleSend(turn);
          }
        }
      }
    };
    r.onend = () => {
      if (voiceSessionRef.current && !speakingRef.current) {
        restartVoiceRef.current = window.setTimeout(() => {
          try { (recognitionRef.current as SpeechRecognition)?.start(); setListening(true); } catch { /* noop */ }
        }, 180);
      } else setListening(false);
    };
    r.onerror = () => { setListening(false); setTranscript(''); };
    recognitionRef.current = r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Audio Visualizer ──────────────────────────────────────────────────────
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barH = (dataArray[i] / 255) * canvas.height * 0.85;
        const alpha = 0.4 + (dataArray[i] / 255) * 0.6;
        ctx.fillStyle = `rgba(245,158,11,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barH, barW - 1, barH, 3);
        ctx.fill();
        x += barW + 1.5;
      }
    };
    draw();
  }, []);

  const stopListening = useCallback(() => {
    voiceSessionRef.current = false;
    speakingRef.current = false;
    speechRequestRef.current += 1;
    if (restartVoiceRef.current) window.clearTimeout(restartVoiceRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setListening(false);
    (recognitionRef.current as SpeechRecognition)?.stop();
    microphoneStreamRef.current?.getTracks().forEach(t => t.stop());
    microphoneStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) { alert('Speech Recognition not supported. You can type queries to Jarvis!'); return; }
    try {
      if ('speechSynthesis' in window && !voiceUnlockedRef.current) {
        const probe = new SpeechSynthesisUtterance('');
        probe.volume = 0;
        window.speechSynthesis.speak(probe);
        voiceUnlockedRef.current = true;
      }
      voiceSessionRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      microphoneStreamRef.current = stream;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      try { (recognitionRef.current as SpeechRecognition).start(); } catch { /* noop */ }
      drawVisualizer();
    } catch {
      voiceSessionRef.current = true;
      setListening(true);
      (recognitionRef.current as SpeechRecognition).start();
    }
  }, [drawVisualizer]);

  const unlockVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try { const p = new SpeechSynthesisUtterance(''); p.volume = 0; window.speechSynthesis.speak(p); voiceUnlockedRef.current = true; } catch { /* noop */ }
  }, []);

  const speak = useCallback((text: string) => {
    if ((!tts && !voiceSessionRef.current) || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const requestId = ++speechRequestRef.current;
    window.speechSynthesis.cancel();
    if (voiceSessionRef.current) speakingRef.current = true;
    const clean = text.replace(/```[\s\S]*?```/g, '').replace(/https?:\/\/\S+/g, '').replace(/[*_#`•🔗[\]()]/g, '').replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'en-US'; utt.volume = 1;
    window.speechSynthesis.getVoices();
    const voices = window.speechSynthesis.getVoices();
    const hints = ['microsoft guy online (natural)', 'microsoft guy', 'google us english', 'microsoft david online (natural)', 'microsoft david', 'daniel', 'alex', 'mark', 'guy', 'james', 'aaron', 'george'];
    const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const best = [...en].sort((a, b) => {
      const score = (v: SpeechSynthesisVoice) => { const n = v.name.toLowerCase(); const p = hints.findIndex(h => n.includes(h)); if (p >= 0) return 100 - p; if (/female|zira|samantha|karen|susan/i.test(n)) return 0; return 25; };
      return score(b) - score(a);
    })[0] || voices[0];
    if (best) utt.voice = best;
    utt.rate = 0.96; utt.pitch = 0.9;
    utt.onend = () => { speakingRef.current = false; if (voiceSessionRef.current) { restartVoiceRef.current = window.setTimeout(() => { try { (recognitionRef.current as SpeechRecognition)?.start(); setListening(true); } catch { /* noop */ } }, 220); } };
    utt.onerror = () => { if (requestId !== speechRequestRef.current) return; speakingRef.current = false; setStatusMessage('Voice playback was unavailable.'); window.setTimeout(() => setStatusMessage(null), 3500); };
    window.speechSynthesis.speak(utt);
  }, [tts]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    microphoneStreamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close().catch(() => {});
  }, []);

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) { const url = URL.createObjectURL(file); setFilePreview(url); } else { setFilePreview(null); }
  };
  const removeSelectedFile = () => { setSelectedFile(null); if (filePreview) URL.revokeObjectURL(filePreview); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const handleCopy = (id: string, text: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleClearHistory = () => {
    if (confirm('Clear chat history?')) {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([{ id: 'welcome-0', sender: 'ai', text: 'Chat cleared. Ready for your next request!', ts: now() }]);
    }
  };
  const stopResponse = () => {
    streamRef.current?.close(); streamRef.current = null; setLoading(false); setStatusMessage(null);
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false, text: m.text || 'Response stopped.' } : m));
  };

  // ── Main send ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (customPrompt?: string) => {
    const query = (customPrompt ?? input).trim();
    const fileToSend = selectedFile;
    const previewUrl = filePreview;
    if (!query && !fileToSend) return;
    if (loading) return;
    setLastPrompt(query);
    setConnectionError(false);
    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMsg: Message = {
      id: `u-${Date.now()}`, sender: 'user',
      text: query || (fileToSend ? `Attached ${fileToSend.name}` : ''),
      fileAttachment: fileToSend ? { name: fileToSend.name, type: fileToSend.type, previewUrl: previewUrl || undefined } : undefined,
      ts: now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const aiId = `a-${Date.now()}`;

    // Case A: File upload with OCR
    if (fileToSend) {
      setStatusMessage('📄 Analyzing document with OCR & Gemini Vision...');
      setMessages(prev => [...prev, { id: aiId, sender: 'ai', text: '', streaming: true, ts: now() }]);
      try {
        const res = await uploadAiFile(fileToSend, query, SESSION_ID, { provider: visionProvider, model: visionModel, reasoningEffort, webSearch });
        setStatusMessage(null); setLoading(false);
        if (res?.success) {
          setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: res.reply || 'File processed!', streaming: false } : m));
          speak(res.reply);
        } else {
          setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: `⚠️ Could not process file: ${res?.message || 'Upload error'}`, streaming: false } : m));
        }
      } catch (err: unknown) {
        setStatusMessage(null); setLoading(false);
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: `⚠️ Upload error: ${(err as Error).message}`, streaming: false } : m));
      }
      return;
    }

    // Case B: Streaming agent query
    setMessages(prev => [...prev, { id: aiId, sender: 'ai', text: '', streaming: true, ts: now() }]);
    const url = getStreamUrl(query, SESSION_ID);
    const es = new EventSource(url);
    streamRef.current = es;
    let fullText = '';
    es.onmessage = (event) => {
      let data: { error?: string; token?: string; done?: boolean; intent?: string; actionExecuted?: string | null; toolsUsed?: Array<{ tool: string }> };
      try { data = JSON.parse(event.data); } catch { setConnectionError(true); setStatusMessage('The agent sent an unreadable update.'); return; }
      if (data.error) {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: `⚠️ Error: ${data.error}`, streaming: false } : m));
        es.close(); setLoading(false); setStatusMessage(null); return;
      }
      fullText += data.token || '';
      if (data.token?.includes('Searching live job boards')) setStatusMessage('🔍 Searching live job boards...');
      else if (data.token?.includes('Reading')) setStatusMessage('🌐 Scraping web URLs...');
      else if (data.toolsUsed && data.toolsUsed.length > 0) setStatusMessage(`⚡ Agent used tools: ${data.toolsUsed.map(t => t.tool).join(', ')}`);
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: fullText, streaming: !data.done, intent: data.intent, actionExecuted: data.actionExecuted, toolsUsed: data.toolsUsed } : m));
      if (data.done) { es.close(); setLoading(false); setStatusMessage(null); startedAtRef.current = null; speak(fullText); }
    };
    es.onerror = async () => {
      es.close();
      if (fullText) { setLoading(false); setStatusMessage(null); setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false } : m)); return; }
      setStatusMessage('⚡ Connecting via backup AI channel...');
      try {
        const res = await sendAiChat(query, SESSION_ID);
        setLoading(false); setStatusMessage(null);
        if (res?.success && res.reply) { setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: res.reply, streaming: false } : m)); speak(res.reply); return; }
      } catch { /* noop */ }
      setLoading(false); setConnectionError(true); setStatusMessage(null);
      const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const errorText = isLocal
        ? '🔌 Local backend went quiet — make sure the Node server is running on port 5000, then hit Retry.'
        : "Hey, I just woke up from a power nap 😴 — Render puts me to sleep after a few minutes of quiet. I'll auto-retry in a moment. You can also hit **Retry** to bring me back instantly.";
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: errorText, streaming: false } : m));
      if (!isLocal) {
        if (autoRetryTimerRef.current) clearTimeout(autoRetryTimerRef.current);
        if (autoRetryCountdownRef.current) clearInterval(autoRetryCountdownRef.current);
        const RETRY = 18;
        setAutoRetryCountdown(RETRY);
        autoRetryCountdownRef.current = setInterval(() => {
          setAutoRetryCountdown(prev => { if (prev === null || prev <= 1) { if (autoRetryCountdownRef.current) clearInterval(autoRetryCountdownRef.current); autoRetryCountdownRef.current = null; return null; } return prev - 1; });
        }, 1000);
        autoRetryTimerRef.current = setTimeout(() => {
          setAutoRetryCountdown(null);
          if (autoRetryCountdownRef.current) clearInterval(autoRetryCountdownRef.current);
          autoRetryCountdownRef.current = null;
          autoRetryTimerRef.current = null;
          setConnectionError(false);
          setMessages(prev => prev.filter(m => m.id !== aiId));
          handleSend(query);
        }, RETRY * 1000);
      }
    };
  }, [input, selectedFile, filePreview, loading, speak, visionProvider, visionModel, reasoningEffort, webSearch]);

  const retryLastPrompt = useCallback(() => {
    if (autoRetryTimerRef.current) { clearTimeout(autoRetryTimerRef.current); autoRetryTimerRef.current = null; }
    if (autoRetryCountdownRef.current) { clearInterval(autoRetryCountdownRef.current); autoRetryCountdownRef.current = null; }
    setAutoRetryCountdown(null); setConnectionError(false);
    if (lastPrompt && !loading) handleSend(lastPrompt);
  }, [handleSend, lastPrompt, loading]);

  // ─────────────────────────────────────────────────────────────────────────
  // JSX — Humanoid Jarvis UI
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────── */}
      <button
        className="jarvis-trigger group"
        onClick={() => { unlockVoice(); setOpen(o => !o); }}
        title="Open Jarvis AI Copilot"
        aria-label={open ? 'Close Jarvis' : 'Open Jarvis'}
        aria-expanded={open}
      >
        {open ? <X size={19} className="transition-transform group-hover:rotate-90 duration-300" /> : (
          <JarvisAvatar size={34} pulse={loading} />
        )}
      </button>

      {/* ── Main Panel ──────────────────────────────────────────────────── */}
      {open && (
        <div
          className="jarvis-panel flex flex-col shadow-2xl overflow-hidden"
          role="dialog" aria-modal="false" aria-label="Jarvis AI Copilot"
          style={{
            background: 'linear-gradient(180deg, #0d0d1c 0%, #07070f 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >

          {/* ── HEADER ────────────────────────────────────────────────── */}
          <div
            className="relative flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: 'linear-gradient(90deg, #0f0f22 0%, #13132a 50%, #0f0f22 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b55, #6366f155, transparent)' }} />

            <JarvisAvatar size={38} pulse={loading} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white tracking-wide">Jarvis</span>
                <span className="text-[10px] text-zinc-500 font-medium">Agentic Copilot</span>
                {/* Status pill */}
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border"
                  style={{
                    borderColor: loading ? '#f59e0b44' : '#22c55e44',
                    color: loading ? '#fbbf24' : '#4ade80',
                    background: loading ? '#f59e0b0d' : '#22c55e0d',
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  {loading ? 'Thinking…' : 'Live'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-600 mt-0.5 font-medium">
                <span className="flex items-center gap-0.5"><Globe size={8} /> Web</span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-0.5"><Eye size={8} /> Vision</span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-0.5"><Database size={8} /> Memory</span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-0.5"><Zap size={8} /> ReAct</span>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ color: '#555', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                title="Clear History"
              >
                <Trash2 size={12} />
              </button>
              <button
                onClick={() => setTts(t => {
                  const next = !t;
                  if (next) unlockVoice();
                  if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) { speechRequestRef.current++; window.speechSynthesis.cancel(); speakingRef.current = false; }
                  return next;
                })}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ color: tts ? '#f59e0b' : '#555' }}
                title={tts ? 'Mute Speech' : 'Enable Speech'}
              >
                {tts ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ color: '#555' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* ── PERSONA TABS + QUICK CHIPS ─────────────────────────────── */}
          <div className="flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a0a16' }}>
            <div className="flex items-end gap-0 px-3 pt-2">
              {[
                { key: 'recruiter' as const, label: '👔 Recruiter & CTO', color: '#f59e0b' },
                { key: 'tracker' as const, label: '⚙️ My Workspace', color: '#6366f1' },
              ].map(({ key, label, color }) => {
                const active = chipCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setChipCategory(key)}
                    className="px-3 py-1.5 text-[10px] font-bold transition-all duration-200 rounded-t-lg border-b-2 mr-1"
                    style={active
                      ? { color, borderColor: color, background: `${color}12` }
                      : { color: '#444', borderColor: 'transparent', background: 'transparent' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {(chipCategory === 'recruiter' ? RECRUITER_ACTIONS : TRACKER_ACTIONS).map(action => {
                const color = chipCategory === 'recruiter' ? '#f59e0b' : '#6366f1';
                return (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.prompt)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150 border"
                    style={{ background: `${color}0a`, borderColor: `${color}22`, color: '#666' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.borderColor = `${color}55`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#666'; (e.currentTarget as HTMLElement).style.borderColor = `${color}22`; }}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── VISION CONTROLS ───────────────────────────────────────── */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-[9px]"
            style={{ background: '#080810', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <select
              value={visionProvider}
              onChange={e => setVisionProvider(e.target.value)}
              className="outline-none cursor-pointer rounded-lg px-2 py-1 text-[9px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
              aria-label="Vision provider"
            >
              <option value="ocr">Local OCR</option>
              <option value="kie">Kie AI Vision</option>
            </select>
            {visionProvider === 'kie' && (
              <>
                <select value={visionModel} onChange={e => setVisionModel(e.target.value)} className="outline-none cursor-pointer rounded-lg px-2 py-1 text-[9px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }} aria-label="Vision model">
                  {(visionModels.length ? visionModels : [{ id: 'gpt-6-astra', label: 'GPT-6 Astra' }]).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <select value={reasoningEffort} onChange={e => setReasoningEffort(e.target.value)} className="outline-none cursor-pointer rounded-lg px-2 py-1 text-[9px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }} aria-label="Reasoning effort">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="xhigh">XHigh</option>
                </select>
                <label className="flex items-center gap-1 cursor-pointer text-zinc-600 hover:text-zinc-400 transition">
                  <input type="checkbox" checked={webSearch} onChange={e => setWebSearch(e.target.checked)} className="w-3 h-3 accent-amber-500" />
                  Web search
                </label>
              </>
            )}
          </div>

          {/* ── MESSAGES ──────────────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
            style={{ background: '#07070f', scrollbarWidth: 'thin', scrollbarColor: '#ffffff08 transparent' }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 group ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="mt-0.5 flex-shrink-0">
                  {msg.sender === 'ai' ? <JarvisAvatar size={28} /> : <UserAvatar />}
                </div>

                <div className={`flex flex-col gap-1 max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* File chip */}
                  {msg.fileAttachment && (
                    <div className="mb-1 px-3 py-2 rounded-xl flex items-center gap-2 text-[11px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }}>
                      {msg.fileAttachment.previewUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={msg.fileAttachment.previewUrl} alt="attachment" className="w-9 h-9 object-cover rounded-lg" />
                        : <FileText size={16} className="text-amber-400" />}
                      <span className="truncate font-medium">{msg.fileAttachment.name}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="relative px-3.5 py-3 text-xs leading-relaxed rounded-2xl"
                    style={msg.sender === 'user' ? {
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#000',
                      borderRadius: '16px 4px 16px 16px',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
                    } : {
                      background: 'linear-gradient(135deg, #16162a 0%, #1a1a30 100%)',
                      color: '#d1d5db',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px 16px 16px 16px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {msg.sender === 'ai' ? (
                      <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed space-y-1.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text || (msg.streaming ? '' : '')}
                        </ReactMarkdown>
                        {msg.streaming && <DnaTyping />}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                    )}
                    {/* Copy btn */}
                    {msg.sender === 'ai' && msg.text && !msg.streaming && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-zinc-500" />}
                      </button>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 px-1 text-[9px] font-medium" style={{ color: '#333' }}>
                    <span>{msg.ts}</span>
                    {msg.actionExecuted && <span className="text-emerald-600 flex items-center gap-0.5"><Zap size={9} /> DB Saved</span>}
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && <span className="text-blue-400 flex items-center gap-0.5"><Globe size={9} /> {msg.toolsUsed.length} tool{msg.toolsUsed.length > 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Standalone thinking indicator */}
            {loading && !messages.some(m => m.streaming && m.text.length > 0) && (
              <div className="flex gap-3 items-end">
                <JarvisAvatar size={28} pulse />
                <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #16162a, #1a1a30)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 16px 16px 16px' }}>
                  <DnaTyping />
                </div>
              </div>
            )}

            {/* Status */}
            {statusMessage && (
              <div className={`jarvis-status ${connectionError ? 'is-error' : ''}`} role="status" aria-live="polite">
                {connectionError ? <WifiOff size={13} /> : <Sparkles size={13} className="animate-spin" />}
                <span>{statusMessage}</span>
                {loading && <span className="jarvis-elapsed"><Clock3 size={11} /> {elapsed}s</span>}
                {connectionError && (
                  <button onClick={retryLastPrompt} disabled={loading}>
                    Retry {autoRetryCountdown !== null ? `(${autoRetryCountdown}s)` : ''} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── VOICE TRANSCRIPT ──────────────────────────────────────── */}
          {transcript && (
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 text-[11px] italic" style={{ background: 'rgba(245,158,11,0.05)', borderTop: '1px solid rgba(245,158,11,0.15)', color: '#d97706' }}>
              <Mic size={11} className="animate-pulse flex-shrink-0 text-amber-400" />
              <span className="truncate">&quot;{transcript}&quot;</span>
            </div>
          )}

          {/* ── VOICE VISUALIZER ─────────────────────────────────────── */}
          {listening && (
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2" style={{ background: '#0a0a18', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <canvas ref={canvasRef} width={220} height={22} className="rounded flex-1" />
              <span className="text-[10px] font-bold text-amber-400 animate-pulse whitespace-nowrap flex items-center gap-1">
                <Mic size={10} /> Listening…
              </span>
            </div>
          )}

          {/* ── FILE CHIP ─────────────────────────────────────────────── */}
          {selectedFile && (
            <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2" style={{ background: '#0a0a18', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 truncate text-[11px] text-zinc-500">
                {filePreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={filePreview} alt="thumb" className="w-6 h-6 object-cover rounded" />
                  : <FileText size={13} className="text-amber-400 flex-shrink-0" />}
                <span className="truncate font-medium">{selectedFile.name}</span>
                <span className="text-zinc-700 text-[9px]">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button onClick={removeSelectedFile} className="w-5 h-5 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>
                <X size={10} />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" className="hidden" />

          {/* ── INPUT BAR ─────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-3"
            style={{
              background: 'linear-gradient(90deg, #0d0d1c, #0f0f24, #0d0d1c)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#555' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555'; }}
              title="Attach file for OCR"
            >
              <Paperclip size={14} />
            </button>

            {/* Mic */}
            <button
              onClick={listening ? stopListening : startListening}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition border"
              style={listening
                ? { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#555' }}
              title={listening ? 'Stop listening' : 'Speak to Jarvis'}
            >
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={selectedFile ? 'Add a note or press Send…' : 'Ask Jarvis anything, paste URLs…'}
              className="flex-1 min-w-0 px-3.5 py-2 rounded-xl text-[12px] outline-none transition"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d1d5db',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(245,158,11,0.4)'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              aria-label="Message Jarvis"
            />

            {/* Send / Stop */}
            {loading ? (
              <button
                onClick={stopResponse}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 14px #ef444433' }}
                title="Stop response"
              >
                <StopCircle size={15} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() && !selectedFile}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition disabled:opacity-25"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 18px rgba(245,158,11,0.35)', color: '#000' }}
                title="Send"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiVoiceAssistant;
