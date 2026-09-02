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
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Globe,
  Database,
  Search,
  RefreshCw,
  Eye,
  StopCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getStreamUrl, uploadAiFile } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  intent?: string;
  actionExecuted?: string | null;
  toolsUsed?: Array<{ tool: string; args?: any }>;
  fileAttachment?: {
    name: string;
    type: string;
    previewUrl?: string;
  };
  ts: string;
}

// Bump the local transcript version so stale runtime-error bubbles from the
// broken scraper build are not shown as if they were new responses.
const STORAGE_KEY = 'jarvis_chat_history_v3';
const SESSION_ID = `session-aryan-tracker`;

const QUICK_ACTIONS = [
  { label: '📊 Status Report', prompt: 'Give me an overview of my current DSA streak, applications, and progress from my tracker.' },
  { label: '🌐 Search Web', prompt: 'Search the web and tell me the latest news on tech hiring and software engineer market trends.' },
  { label: '💼 Find Tech Jobs', prompt: 'Search and find live software engineer job openings for me.' },
  { label: '📝 Log Daily DSA', prompt: 'Log today: I solved 3 DSA problems on Dynamic Programming and sent 2 applications.' },
  { label: '🎯 Weak Areas', prompt: 'What are my weakest DSA topics in my tracker and what should I solve next?' },
];

export const AiVoiceAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [tts, setTts] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceSessionRef = useRef(false);
  const restartVoiceRef = useRef<number | null>(null);
  const speakingRef = useRef(false);

  // Initialize and load persistent history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: 'welcome-0',
            sender: 'ai',
            text: `👋 Hey Aryan! I'm **Jarvis**, your continuous AI copilot.

I'm equipped with **live internet web search**, **Google Sheets live sync**, **OCR for uploaded images/documents**, and direct database actions. 

You can talk to me about anything, upload screenshots of LeetCode/job descriptions, or tell me to log your daily progress!`,
            ts: now(),
          },
        ]);
      }
    } catch {
      // Fallback
    }
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

  // Save conversation turns to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
      } catch {}
    }
  }, [messages]);

  // Auto-scroll on new tokens/messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusMessage]);

  // Speech Recognition Init
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    // Keep interim results visible while Android Chrome is listening.
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e: any) => {
      const interim = Array.from(e.results)
        .filter((res: any) => !res.isFinal)
        .map((res: any) => res[0].transcript).join('');
      setTranscript(interim);
      // Barge-in: a new spoken phrase immediately interrupts the current TTS reply.
      if (speakingRef.current && interim.trim()) {
        window.speechSynthesis.cancel();
        speakingRef.current = false;
      }
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        if (e.results[i].isFinal) {
          const turn = e.results[i][0].transcript.trim();
          if (turn) handleSend(turn);
        }
      }
    };
    r.onend = () => {
      if (voiceSessionRef.current && !speakingRef.current) {
        restartVoiceRef.current = window.setTimeout(() => {
          try { recognitionRef.current?.start(); setListening(true); } catch {}
        }, 180);
      } else setListening(false);
    };
    r.onerror = () => {
      setListening(false);
      setTranscript('');
    };
    recognitionRef.current = r;
  }, []);

  // Audio Visualizer Canvas
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
        ctx.fillStyle = `rgba(218, 119, 86, ${alpha})`;
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
    if (restartVoiceRef.current) window.clearTimeout(restartVoiceRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setListening(false);
    recognitionRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not supported in this browser. You can type queries to Jarvis!');
      return;
    }
    try {
      voiceSessionRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      recognitionRef.current.start();
      drawVisualizer();
    } catch {
      voiceSessionRef.current = true;
      setListening(true);
      recognitionRef.current.start();
    }
  }, [drawVisualizer]);

  // Voice synthesis
  const speak = useCallback(
    (text: string) => {
      if ((!tts && !voiceSessionRef.current) || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      if (voiceSessionRef.current) {
        speakingRef.current = true;
      }
      const clean = text.replace(/[*_#`•🔗[\]()]/g, '').replace(/\n/g, '. ');
      const utt = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const maleVoiceHints = ['david', 'mark', 'guy', 'daniel', 'alex', 'james', 'aaron', 'george', 'microsoft david', 'google us english'];
      const best =
        voices.find((v) => v.lang.startsWith('en') && maleVoiceHints.some((hint) => v.name.toLowerCase().includes(hint))) ||
        voices.find((v) => v.lang.startsWith('en') && !/female|zira|samantha|karen|susan/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (best) utt.voice = best;
      utt.rate = 1.05;
      utt.pitch = 0.92;
      utt.onend = () => {
        speakingRef.current = false;
        if (voiceSessionRef.current) {
          restartVoiceRef.current = window.setTimeout(() => {
            try { recognitionRef.current?.start(); setListening(true); } catch {}
          }, 220);
        }
      };
      window.speechSynthesis.speak(utt);
    },
    [tts]
  );

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Copy message to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear history
  const handleClearHistory = () => {
    if (confirm('Clear chat history?')) {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([
        {
          id: 'welcome-0',
          sender: 'ai',
          text: `Chat cleared. Ready for your next request, Aryan!`,
          ts: now(),
        },
      ]);
    }
  };

  const stopResponse = () => {
    streamRef.current?.close();
    streamRef.current = null;
    setLoading(false);
    setStatusMessage(null);
    setMessages((prev) => prev.map((message) => (
      message.streaming ? { ...message, streaming: false, text: message.text || 'Response stopped.' } : message
    )));
  };

  // Main Send Function (handles file OCR upload + real-time streaming)
  const handleSend = useCallback(
    async (customPrompt?: string) => {
      const query = (customPrompt ?? input).trim();
      const fileToSend = selectedFile;
      const previewUrl = filePreview;

      if (!query && !fileToSend) return;
      // Let a new voice turn barge in and replace a slow/in-flight answer.
      if (loading) {
        streamRef.current?.close();
        streamRef.current = null;
        setLoading(false);
      }

      // Reset inputs
      setInput('');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: query || (fileToSend ? `Attached ${fileToSend.name}` : ''),
        fileAttachment: fileToSend
          ? {
              name: fileToSend.name,
              type: fileToSend.type,
              previewUrl: previewUrl || undefined,
            }
          : undefined,
        ts: now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const aiId = `a-${Date.now()}`;

      // Case A: File upload with OCR
      if (fileToSend) {
        setStatusMessage('📄 Analyzing document with OCR & Gemini Vision...');
        setMessages((prev) => [
          ...prev,
          { id: aiId, sender: 'ai', text: '', streaming: true, ts: now() },
        ]);

        try {
          const res = await uploadAiFile(fileToSend, query, SESSION_ID);
          setStatusMessage(null);
          setLoading(false);

          if (res?.success) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? {
                      ...m,
                      text: res.reply || 'File processed and stored in memory!',
                      streaming: false,
                    }
                  : m
              )
            );
            speak(res.reply);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? {
                      ...m,
                      text: `⚠️ Could not process file: ${res?.message || 'Upload error'}`,
                      streaming: false,
                    }
                  : m
              )
            );
          }
        } catch (err: any) {
          setStatusMessage(null);
          setLoading(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    text: `⚠️ Upload error: ${err.message}`,
                    streaming: false,
                  }
                : m
            )
          );
        }
        return;
      }

      // Case B: Streaming Agent Query
      setMessages((prev) => [
        ...prev,
        { id: aiId, sender: 'ai', text: '', streaming: true, ts: now() },
      ]);

      const url = getStreamUrl(query, SESSION_ID);
      const es = new EventSource(url);
      streamRef.current = es;
      let fullText = '';

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    text: `⚠️ Error: ${data.error}`,
                    streaming: false,
                  }
                : m
            )
          );
          es.close();
          setLoading(false);
          setStatusMessage(null);
          return;
        }

        fullText += data.token || '';

        // Detect tool status
        if (data.token?.includes('Searching live job boards')) {
          setStatusMessage('🔍 Searching live job boards (RemoteOK, Remotive)...');
        } else if (data.token?.includes('Reading')) {
          setStatusMessage('🌐 Scraping web URLs...');
        } else if (data.toolsUsed && data.toolsUsed.length > 0) {
          setStatusMessage(`⚡ Agent used tools: ${data.toolsUsed.map((t: any) => t.tool).join(', ')}`);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  text: fullText,
                  streaming: !data.done,
                  intent: data.intent,
                  actionExecuted: data.actionExecuted,
                  toolsUsed: data.toolsUsed,
                }
              : m
          )
        );

        if (data.done) {
          es.close();
          setLoading(false);
          setStatusMessage(null);
          speak(fullText);
        }
      };

      es.onerror = () => {
        es.close();
        setLoading(false);
        setStatusMessage(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  text: fullText || '⚡ Connection interrupted. Please ensure backend is active on port 5000.',
                  streaming: false,
                }
              : m
          )
        );
      };
    },
    [input, selectedFile, filePreview, loading, speak]
  );

  return (
    <>
      {/* ── Floating Action Button ────────────────────────────── */}
      <button
        className="jarvis-trigger group"
        onClick={() => setOpen((o) => !o)}
        title="Open Jarvis AI Copilot"
      >
        {open ? (
          <X size={20} className="transition group-hover:rotate-90" />
        ) : (
          <Bot size={22} className="transition group-hover:scale-110" />
        )}
      </button>

      {/* ── Chatbot Window ─────────────────────────────────────── */}
      {open && (
        <div className="jarvis-panel flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--card-border)] flex items-center justify-between gap-3 bg-[var(--card-flat)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 dark:from-indigo-600 dark:to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  Jarvis Agentic Copilot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] font-medium flex items-center gap-1">
                  <span>Web Search</span> • <span>Vision OCR</span> • <span>Memory</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Clear Chat History"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setTts((t) => !t)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                title={tts ? 'Mute Speech Voice' : 'Enable Speech Voice'}
              >
                {tts ? <Volume2 size={14} className="text-amber-700 dark:text-amber-400" /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestions */}
          <div className="px-3 py-2 border-b border-[var(--card-border)] flex items-center gap-1.5 overflow-x-auto bg-black/[0.01] dark:bg-white/[0.01] scrollbar-none">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.prompt)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--card-flat)] hover:bg-amber-500/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] hover:border-amber-500/30 whitespace-nowrap transition duration-150 flex-shrink-0 cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } gap-1 group`}
              >
                {/* User file preview if uploaded */}
                {msg.fileAttachment && (
                  <div className="mb-1 p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--card-border)] flex items-center gap-2 max-w-[85%] text-xs">
                    {msg.fileAttachment.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.fileAttachment.previewUrl}
                        alt="attachment"
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <FileText size={18} className="text-amber-700 dark:text-indigo-400" />
                    )}
                    <span className="truncate font-medium text-[var(--text-secondary)]">
                      {msg.fileAttachment.name}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3 text-xs leading-relaxed max-w-[90%] relative ${
                    msg.sender === 'user'
                      ? 'bg-amber-700 dark:bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm backdrop-blur-md'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text || (msg.streaming ? '...' : '')}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}

                  {/* Copy Button */}
                  {msg.sender === 'ai' && msg.text && !msg.streaming && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[var(--text-secondary)]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>

                {/* Subtitle Details */}
                <div className="flex items-center gap-2 px-1 text-[10px] text-[var(--text-tertiary)] font-medium">
                  <span>{msg.ts}</span>
                  {msg.actionExecuted && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap size={10} /> Saved to Database
                    </span>
                  )}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <span className="text-blue-500 flex items-center gap-1">
                      <Globe size={10} /> Tools used ({msg.toolsUsed.length})
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Live Status Indicator */}
            {statusMessage && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 animate-pulse">
                <Sparkles size={13} className="animate-spin" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Voice transcript preview */}
          {transcript && (
            <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 italic flex items-center gap-2">
              <Mic size={12} className="animate-pulse" /> &quot;{transcript}&quot;
            </div>
          )}

          {/* Voice Visualizer */}
          {listening && (
            <div className="px-3.5 py-2 bg-black/5 dark:bg-black/40 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
              <canvas ref={canvasRef} width={260} height={22} className="rounded" />
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold animate-pulse whitespace-nowrap">
                Listening...
              </span>
            </div>
          )}

          {/* File Attachment Chip */}
          {selectedFile && (
            <div className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.03] border-t border-[var(--card-border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate text-xs text-[var(--text-secondary)]">
                {filePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={filePreview} alt="thumb" className="w-6 h-6 object-cover rounded" />
                ) : (
                  <FileText size={14} className="text-amber-600" />
                )}
                <span className="truncate font-medium">{selectedFile.name}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                onClick={removeSelectedFile}
                className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
            className="hidden"
          />

          {/* Input Area */}
          <div className="p-3 border-t border-[var(--card-border)] flex items-center gap-2 bg-[var(--card-flat)]">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] transition"
              title="Upload image / document for OCR"
            >
              <Paperclip size={15} />
            </button>

            {/* Mic Button */}
            <button
              onClick={listening ? stopListening : startListening}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                listening
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                  : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
              }`}
              title={listening ? 'Stop listening' : 'Speak to Jarvis'}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={selectedFile ? 'Add notes for this file or press Send...' : 'Ask Jarvis anything, paste URLs, or give commands...'}
              className="flex-1 bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] placeholder-gray-400 rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500 dark:focus:border-indigo-500 transition"
            />

            {/* Send / stop control */}
            {loading ? (
              <button onClick={stopResponse} className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md transition flex-shrink-0" title="Stop response" aria-label="Stop response">
                <StopCircle size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() && !selectedFile}
                className="w-9 h-9 rounded-xl bg-amber-700 dark:bg-indigo-600 hover:bg-amber-600 dark:hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition flex-shrink-0 cursor-pointer"
                title="Send message"
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

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default AiVoiceAssistant;
