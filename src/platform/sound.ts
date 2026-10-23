// Web Audio API Synthesizer voor Jarens Piraten-Eiland
// Werkt 100% offline zonder externe audiobestanden

let audioContext: AudioContext | null = null;
let soundMuted = false;

export function isSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('je_sound_muted');
    if (saved !== null) soundMuted = saved === 'true';
  }
  return soundMuted;
}

export function toggleSoundMuted(): boolean {
  soundMuted = !soundMuted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('je_sound_muted', String(soundMuted));
  }
  if (!soundMuted) playPop();
  return soundMuted;
}

function context(): AudioContext | null {
  if (typeof window === 'undefined' || soundMuted) return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = 'sine',
): void {
  const ctx = context();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + start);
    oscillator.stop(ctx.currentTime + start + duration + 0.02);
  } catch {
    // Negeer eventuele autoplay restricties
  }
}

// 1. Standaard klik en pop
export function playPop(): void {
  tone(520, 0, 0.08, 0.05, 'triangle');
  tone(780, 0.04, 0.1, 0.04, 'triangle');
}

// 2. Gouden muntje rinkelen
export function playCoin(): void {
  tone(987.77, 0, 0.12, 0.08, 'sine'); // B5
  tone(1318.51, 0.06, 0.22, 0.09, 'triangle'); // E6
}

// 3. Schatkist openen (krakend hout + goudglans)
export function playChestOpen(): void {
  tone(180, 0, 0.15, 0.06, 'sawtooth');
  tone(340, 0.08, 0.18, 0.05, 'triangle');
  tone(659.25, 0.2, 0.2, 0.07, 'sine');
  tone(880, 0.3, 0.28, 0.08, 'sine');
  tone(1174.66, 0.4, 0.35, 0.07, 'sine');
}

// 4. Piraten scheepsbel
export function playShipBell(): void {
  tone(880, 0, 0.45, 0.09, 'sine');
  tone(1760, 0, 0.35, 0.04, 'sine');
  tone(880, 0.2, 0.5, 0.09, 'sine');
  tone(1760, 0.2, 0.4, 0.04, 'sine');
}

// 5. Kanon (plop / boem)
export function playCannon(): void {
  const ctx = context();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Negeer
  }
}

// 6. Succes & Overwinning Fanfare
export function playSuccess(): void {
  tone(523.25, 0, 0.14, 0.07); // C5
  tone(659.25, 0.09, 0.14, 0.07); // E5
  tone(783.99, 0.18, 0.16, 0.08); // G5
  tone(1046.5, 0.28, 0.32, 0.09); // C6
}

// 7. Foutje / Oeps
export function playOops(): void {
  tone(220, 0, 0.18, 0.05, 'sine');
  tone(174.61, 0.12, 0.24, 0.05, 'sine');
}

// 8. Waterplons (voor dolfijn / schatduiken)
export function playSplash(): void {
  tone(600, 0, 0.1, 0.05, 'sine');
  tone(450, 0.05, 0.15, 0.06, 'triangle');
  tone(300, 0.1, 0.2, 0.04, 'sine');
}

// 9. Vrolijk piratenwijsje
export function playPirateJig(): void {
  const notes = [
    { f: 587.33, d: 0.12 }, // D5
    { f: 659.25, d: 0.12 }, // E5
    { f: 698.46, d: 0.16 }, // F5
    { f: 587.33, d: 0.14 }, // D5
    { f: 880.0, d: 0.28 },  // A5
  ];
  let delay = 0;
  for (const n of notes) {
    tone(n.f, delay, n.d, 0.07, 'triangle');
    delay += n.d * 0.9;
  }
}
