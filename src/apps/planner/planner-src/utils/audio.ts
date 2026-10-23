// Web Audio API synthesizer for playful, instantaneous audio feedback
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playSuccessChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  }

  playStarChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [783.99, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.41);
      });
    } catch {}
  }

  playVictoryFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Fanfare: C5, E5, G5, high C6 chord
      const chords = [
        { time: 0, notes: [523.25, 659.25], dur: 0.12 },
        { time: 0.14, notes: [523.25, 659.25], dur: 0.12 },
        { time: 0.28, notes: [523.25, 659.25], dur: 0.12 },
        { time: 0.45, notes: [523.25, 659.25, 783.99, 1046.5], dur: 0.6 },
      ];

      chords.forEach(({ time, notes, dur }) => {
        const chordStart = ctx.currentTime + time;
        notes.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, chordStart);

          gain.gain.setValueAtTime(0.15, chordStart);
          gain.gain.exponentialRampToValueAtTime(0.001, chordStart + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(chordStart);
          osc.stop(chordStart + dur);
        });
      });
    } catch {}
  }

  playFanfare(): void {
    this.playVictoryFanfare();
  }
}

export const soundEffects = new SoundSynthesizer();

let huidigeUtterance: SpeechSynthesisUtterance | null = null;
let spraakTimer: number | null = null;

function stopSpraakTimer(): void {
  if (spraakTimer !== null) {
    window.clearTimeout(spraakTimer);
    spraakTimer = null;
  }
}

function spreekMetBrowser(tekst: string, onEnd?: () => void): void {
  const synth = window.speechSynthesis;
  if (!synth) {
    if (onEnd) onEnd();
    return;
  }

  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(tekst);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.95; // Friendly, slightly deliberate pacing for 6yo child
    utterance.pitch = 1.05;

    // Try finding a Dutch voice
    const voices = synth.getVoices();
    const nlVoice = voices.find((v) => v.lang.startsWith('nl') || v.lang.includes('NL'));
    if (nlVoice) {
      utterance.voice = nlVoice;
    }

    let finished = false;
    let started = false;
    let startTimer: number | null = null;

    const clearStartTimer = () => {
      if (startTimer !== null) {
        window.clearTimeout(startTimer);
        startTimer = null;
      }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      clearStartTimer();
      stopSpraakTimer();
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      started = true;
      clearStartTimer();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    // Houd een referentie vast; Chrome kan de utterance anders opruimen.
    huidigeUtterance = utterance;

    stopSpraakTimer();
    // Vangnet voor browsers die onend/onerror niet (tijdig) afvuren.
    spraakTimer = window.setTimeout(finish, Math.max(4000, tekst.length * 140));

    // Sommige Chrome-installaties melden wel stemmen, maar blijven stil.
    // Start de browserstem niet binnen 1,8 seconde, gebruik dan de systeemstem.
    startTimer = window.setTimeout(() => {
      if (finished || started) return;
      finished = true;
      startTimer = null;
      stopSpraakTimer();
      try {
        synth.cancel();
      } catch {}
      spreekViaSysteemstem(tekst, onEnd);
    }, 1800);

    synth.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
}

function spreekViaSysteemstem(tekst: string, onEnd?: () => void): void {
  // Stop een eventueel nog lopende browserstem.
  window.speechSynthesis?.cancel();

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    stopSpraakTimer();
    if (onEnd) onEnd();
  };

  stopSpraakTimer();
  // `spd-say` speelt op de achtergrond; schat de duur voor de UI-terugkoppeling.
  spraakTimer = window.setTimeout(finish, Math.max(1500, Math.min(20000, tekst.length * 90)));

  void fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: tekst }),
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Systeemstem antwoordde met HTTP ${response.status}`);
    })
    .catch((error) => {
      console.warn('Systeemstem niet beschikbaar; probeer de browserstem:', error);
      stopSpraakTimer();
      // Alleen terugvallen als de browser inmiddels wel stemmen heeft.
      if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
        spreekMetBrowser(tekst, finish);
      } else {
        finish();
      }
    });
}

/**
 * Spreekt een Nederlands bericht uit.
 *
 * Heeft de browser een spraakstem, dan gebruiken we die. Heeft de browser er
 * geen (bijvoorbeeld Chrome/Electron op Linux), dan laat de lokale server de
 * Nederlandse systeemstem via Speech Dispatcher spreken.
 */
export function spreekBericht(tekst: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  const synth = window.speechSynthesis;
  if (synth && synth.getVoices().length > 0) {
    spreekMetBrowser(tekst, onEnd);
    return;
  }

  spreekViaSysteemstem(tekst, onEnd);
}
