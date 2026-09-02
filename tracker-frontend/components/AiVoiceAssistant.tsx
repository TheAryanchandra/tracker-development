'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Mic, MicOff, Send, X, Volume2, VolumeX, Zap, Sparkles } from 'lucide-react';
import { getStreamUrl } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  intent?: string;
  actionExecuted?: string | null;
  ts: string;
}

const SESSION_ID = `session-${Date.now()}`;

const QUICK_ACTIONS = [
  { label: '📊 Status Report', prompt: "Give me an overview of my current DSA streak, applications, and progress." },
  { label: '💼 Find Tech Jobs', prompt: 'Search and find recent fullstack and backend software engineer jobs for me.' },
  { label: '📝 Log Daily DSA', prompt: 'Log today I solved 3 DSA questions on Dynamic Programming and did 2 job applications.' },
  { label: '🎯 Weak Areas', prompt: 'What are my weakest DSA topics and what should I focus on next?' },
];

export const AiVoiceAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      sender: 'ai',
      text: "Jarvis active. I'm connected to your live database, learned preferences, and real-time job feeds. How can I help you today?",
      ts: now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [tts, setTts] = useState(true);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition Init
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e: any) => {
      const t = Array.from(e.results)
        .map((res: any) => res[0].transcript)
        .join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setTranscript('');
        handleSend(t);
        stopListening();
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
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
    setListening(false);
    recognitionRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. You can still type queries to Jarvis!');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      setListening(true);
      recognitionRef.current.start();
    }
  }, [drawVisualizer]);

  const speak = useCallback(
    (text: string) => {
      if (!tts || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`•🔗]/g, '').replace(/\n/g, '. ');
      const utt = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const best =
        voices.find(
          (v) =>
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Siri')) &&
            v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (best) utt.voice = best;
      utt.rate = 1.05;
      utt.pitch = 1.0;
      window.speechSynthesis.speak(utt);
    },
    [tts]
  );

  const handleSend = useCallback(
    async (customPrompt?: string) => {
      const query = (customPrompt ?? input).trim();
      if (!query || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: query,
        ts: now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const aiId = `a-${Date.now()}`;
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
                    text: '⚠️ Could not reach Jarvis server. Please verify backend is active on port 5000.',
                    streaming: false,
                  }
                : m
            )
          );
          es.close();
          setLoading(false);
          return;
        }

        fullText += data.token || '';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  text: fullText,
                  streaming: !data.done,
                  intent: data.intent,
                  actionExecuted: data.actionExecuted,
                }
              : m
          )
        );

        if (data.done) {
          es.close();
          setLoading(false);
          speak(fullText);
          if (data.actionExecuted) {
            setTimeout(() => window.location.reload(), 1800);
          }
        }
      };

      es.onerror = () => {
        es.close();
        setLoading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  text: '⚡ Connection interrupted. Please ensure backend is active on port 5000.',
                  streaming: false,
                }
              : m
          )
        );
      };
    },
    [input, loading, speak]
  );

  return (
    <>
      {/* ── Floating Action Trigger ────────────────────────────── */}
      <button
        className="jarvis-trigger group"
        onClick={() => setOpen((o) => !o)}
        title="Open Jarvis AI Assistant"
      >
        {open ? (
          <X size={20} className="transition group-hover:rotate-90" />
        ) : (
          <Bot size={22} className="transition group-hover:scale-110" />
        )}
      </button>

      {/* ── Claude-Themed Jarvis Window ─────────────────────────── */}
      {open && (
        <div className="jarvis-panel">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--card-border)] flex items-center justify-between gap-3 bg-[var(--card-flat)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 dark:from-indigo-600 dark:to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  Jarvis Copilot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] font-medium">
                  RAG · Cross-Session Memory · Real-time Jobs
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTts((t) => !t)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                title={tts ? 'Mute speech voice' : 'Enable speech voice'}
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

          {/* Quick Actions Pills */}
          <div className="px-3 py-2 border-b border-[var(--card-border)] flex items-center gap-1.5 overflow-x-auto bg-black/[0.01] dark:bg-white/[0.01]">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.prompt)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--card-flat)] hover:bg-amber-500/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] hover:border-amber-500/30 whitespace-nowrap transition duration-150 flex-shrink-0"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } gap-1`}
              >
                <div
                  className={`p-3 text-xs leading-relaxed max-w-[88%] ${
                    msg.sender === 'user'
                      ? 'bg-amber-700 dark:bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm backdrop-blur-md whitespace-pre-wrap'
                  }`}
                >
                  {msg.text ||
                    (msg.streaming ? (
                      <span className="text-[var(--text-tertiary)] italic flex items-center gap-1.5">
                        <Sparkles size={11} className="animate-spin text-amber-700 dark:text-amber-400" />
                        Thinking...
                      </span>
                    ) : (
                      ''
                    ))}
                </div>

                <div className="flex items-center gap-2 px-1 text-[10px] text-[var(--text-tertiary)] font-medium">
                  <span>{msg.ts}</span>
                  {msg.actionExecuted && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap size={10} /> Saved to Database
                    </span>
                  )}
                  {msg.intent && msg.sender === 'ai' && !msg.actionExecuted && (
                    <span className="text-[var(--text-tertiary)]">
                      ({msg.intent.toLowerCase().replace('_', ' ')})
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Transcript live preview */}
          {transcript && (
            <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 italic flex items-center gap-2">
              <Mic size={12} className="animate-pulse" /> &quot;{transcript}&quot;
            </div>
          )}

          {/* Audio Visualizer Bar */}
          {listening && (
            <div className="px-3.5 py-2 bg-black/5 dark:bg-black/40 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
              <canvas ref={canvasRef} width={260} height={22} className="rounded" />
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold animate-pulse whitespace-nowrap">
                Listening...
              </span>
            </div>
          )}

          {/* Input Control Area */}
          <div className="p-3 border-t border-[var(--card-border)] flex items-center gap-2 bg-[var(--card-flat)]">
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

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask anything or speak to Jarvis..."
              className="flex-1 bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] placeholder-gray-400 rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500 dark:focus:border-indigo-500 transition"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-amber-700 dark:bg-indigo-600 hover:bg-amber-600 dark:hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
