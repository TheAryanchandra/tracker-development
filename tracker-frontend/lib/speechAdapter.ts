/**
 * Modular Speech Adapter for Jarvis AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a unified interface for speech synthesis & recognition:
 *   1. Local/Browser Web Speech API (zero-config, free default)
 *   2. Kokoro TTS (Open-source weights via optional HTTP microservice)
 *   3. Whisper.cpp (Open-source speech-to-text via optional endpoint)
 *
 * Automatic fallback: If Kokoro or Whisper are unreachable, seamlessly falls
 * back to native browser speech synthesis and recognition.
 */

export interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  onAudioData?: (analyser: AnalyserNode) => void;
}

export interface SpeechRecognitionResultLike {
  transcript: string;
  isFinal: boolean;
}

class SpeechAdapter {
  private activeAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private kokoroUrl: string = process.env.NEXT_PUBLIC_KOKORO_TTS_URL || '';
  private whisperUrl: string = process.env.NEXT_PUBLIC_WHISPER_URL || '';

  /**
   * Stop any active audio playback or speech synthesis
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  /**
   * Synthesize text to speech
   * Tries Kokoro TTS first if configured, then falls back to browser speechSynthesis.
   */
  public async speak(text: string, options: SpeechSynthesisOptions = {}): Promise<void> {
    this.stopSpeaking();
    if (!text || typeof window === 'undefined') return;

    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`•🔗[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // 1. Try Kokoro TTS if microservice URL configured
    if (this.kokoroUrl) {
      try {
        const audioUrl = await this.synthesizeKokoro(cleanText);
        if (audioUrl) {
          await this.playAudioUrl(audioUrl, options);
          return;
        }
      } catch (err) {
        console.warn('[SpeechAdapter] Kokoro TTS failed, falling back to browser speech:', err);
      }
    }

    // 2. Browser SpeechSynthesis Fallback
    this.speakBrowser(cleanText, options);
  }

  /**
   * Browser SpeechSynthesis implementation
   */
  private speakBrowser(cleanText: string, options: SpeechSynthesisOptions): void {
    if (!('speechSynthesis' in window)) {
      options.onError?.(new Error('SpeechSynthesis not supported on this browser'));
      return;
    }

    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.rate = options.rate ?? 0.98;
    utt.pitch = options.pitch ?? 0.95;
    utt.volume = options.volume ?? 1;

    // Select natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const hints = [
      'natural', 'guy', 'david', 'george', 'daniel', 'alex', 'james', 'google us english'
    ];
    const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const preferredVoice = enVoices.find(v => hints.some(h => v.name.toLowerCase().includes(h))) || enVoices[0];
    if (preferredVoice) utt.voice = options.voice || preferredVoice;

    utt.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utt.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utt.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utt;
    window.speechSynthesis.speak(utt);
  }

  /**
   * Kokoro Open-Weight TTS Microservice Caller
   */
  private async synthesizeKokoro(text: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${this.kokoroUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: text,
        model: 'kokoro-82m',
        voice: 'am_michael',
        response_format: 'mp3',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Kokoro error HTTP ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  private playAudioUrl(url: string, options: SpeechSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.activeAudio = audio;
      this.isSpeaking = true;
      options.onStart?.();

      audio.onended = () => {
        this.isSpeaking = false;
        this.activeAudio = null;
        options.onEnd?.();
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = (e) => {
        this.isSpeaking = false;
        this.activeAudio = null;
        options.onError?.(e);
        URL.revokeObjectURL(url);
        reject(e);
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Whisper.cpp Audio Transcription (with browser fallback handled in UI)
   */
  public async transcribeWhisper(audioBlob: Blob): Promise<string | null> {
    if (!this.whisperUrl) return null;

    const formData = new FormData();
    formData.append('file', audioBlob, 'speech.wav');
    formData.append('model', 'whisper-base');

    const res = await fetch(`${this.whisperUrl}/inference`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`Whisper.cpp HTTP ${res.status}`);
    const data = await res.json();
    return data.text?.trim() || null;
  }
}

export const speechAdapter = new SpeechAdapter();
