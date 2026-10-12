// Web Speech API & Web Audio Voice Engine for JARVIS
// Fully client-side, zero latency, works on iPhone (Safari/iOS) and all desktop browsers

export interface VoiceSettings {
  voiceURI?: string;
  rate: number;
  pitch: number;
  fullSpeech: boolean; // false = first 2-3 sentences for brevity, true = read complete answer
  soundEffects: boolean;
}

class JarvisVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private voiceEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private settings: VoiceSettings = {
    rate: 1.05,
    pitch: 1.0,
    fullSpeech: true,
    soundEffects: true,
  };
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      // Load preferences from localStorage
      const savedEnabled = localStorage.getItem('jarvis_voice_enabled');
      this.voiceEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;

      const savedSettings = localStorage.getItem('jarvis_voice_settings');
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } catch {
          // ignore
        }
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarvis_voice_enabled', String(enabled));
    }
    if (!enabled && this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
    if (enabled && this.settings.soundEffects) {
      this.playBeep('ready');
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...partial };
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarvis_voice_settings', JSON.stringify(this.settings));
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    return all.filter((v) => v.lang.startsWith('es') || v.lang.startsWith('en'));
  }

  public subscribe(cb: (speaking: boolean) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  /**
   * High-tech subtle audio cues for Tony Stark JARVIS feel
   */
  public playBeep(type: 'ready' | 'listen' | 'action' | 'stop') {
    if (typeof window === 'undefined' || !this.settings.soundEffects) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'listen') {
        // Futuristic double chirp up
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'ready') {
        // Arc reactor startup hum
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'action') {
        // High confirmation ping
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1046.5, now + 0.06);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else {
        // Mute/stop chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Ignore web audio errors
    }
  }

  /**
   * Speak a text message cleanly in natural Spanish.
   * Cleans markdown (removes **, #, links, code blocks) and expands abbreviations
   * so speech sounds organic, natural, and fluid like Tony Stark's JARVIS.
   */
  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth || !this.voiceEnabled || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synth.cancel();

      // Clean markdown, symbols and abbreviations
      let cleanText = text
        .replace(/```[\s\S]*?```/g, ' Código de modificación ejecutado. ') // remove large code blocks
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*#_~]/g, '') // remove markdown marks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .replace(/https?:\/\/\S+/g, '') // urls
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // emojis
        .replace(/(\d+)\s*€/g, '$1 euros')
        .replace(/€\s*(\d+)/g, '$1 euros')
        .replace(/(\d+)\s*km/gi, '$1 kilómetros')
        .replace(/(\d+)\s*min/gi, '$1 minutos')
        .replace(/(\d+)\s*kcal/gi, '$1 calorías')
        .replace(/(\d+)\s*%/g, '$1 por ciento')
        .replace(/➔/g, 'a')
        .replace(/•/g, ', ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      // If user requested brief speech, truncate to first 2-3 sentences
      let spokenText = cleanText;
      if (!this.settings.fullSpeech) {
        const sentences = cleanText.split(/(?<=[.!?])\s+/);
        spokenText = sentences.slice(0, 3).join(' ');
      }

      // Safeguard max character limit per utterance for browser speech synthesis stability
      if (spokenText.length > 500) {
        spokenText = spokenText.slice(0, 500) + '...';
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = this.settings.rate || 1.05;
      utterance.pitch = this.settings.pitch || 1.0;

      // Select highest quality Spanish voice available
      const voices = this.synth.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (this.settings.voiceURI) {
        selectedVoice = voices.find((v) => v.voiceURI === this.settings.voiceURI);
      }

      if (!selectedVoice) {
        // Preference order: Argentine Spanish (Fran's dialect) -> Natural Neural Spanish -> Google Español -> Generic ES
        selectedVoice =
          voices.find((v) => v.lang === 'es-AR') ||
          voices.find(
            (v) =>
              v.lang.startsWith('es') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Jorge') ||
                v.name.includes('Diego') ||
                v.name.includes('Mónica') ||
                v.name.includes('Helena'))
          ) ||
          voices.find((v) => v.lang.startsWith('es'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'es-ES';
      }

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        this.notify(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        // Ignore canceled errors which happen on new requests
        if ((e as any).error !== 'interrupted' && (e as any).error !== 'canceled') {
          console.warn('Speech synthesis utterance error:', e);
        }
        this.notify(false);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.notify(false);
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
      if (this.settings.soundEffects) {
        this.playBeep('stop');
      }
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const jarvisVoice = new JarvisVoiceEngine();
