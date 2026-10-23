import { useCallback } from 'react';

let fallbackTimer: number | null = null;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'nl-be') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('nl')) ??
    undefined
  );
}

function clearFallbackTimer(): void {
  if (fallbackTimer !== null) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

function speakWithServer(text: string): void {
  void fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Systeemstem antwoordde met ${response.status}`);
    })
    .catch(() => {
      // Laatste redmiddel: probeer toch de browserstem, ook zonder Nederlandse
      // stem. Beter een andere stem dan helemaal geen uitleg.
      speakWithBrowser(text, false);
    });
}

function speakWithBrowser(text: string, fallbackToServer: boolean): void {
  const synth = window.speechSynthesis;
  if (!synth) {
    if (fallbackToServer) speakWithServer(text);
    return;
  }

  clearFallbackTimer();
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'nl-BE';
  utterance.rate = 0.9;
  utterance.pitch = 1.04;

  let started = false;
  utterance.onstart = () => {
    started = true;
    clearFallbackTimer();
  };
  utterance.onend = clearFallbackTimer;
  utterance.onerror = () => {
    clearFallbackTimer();
    if (!started && fallbackToServer) speakWithServer(text);
  };

  try {
    synth.speak(utterance);
  } catch {
    if (fallbackToServer) speakWithServer(text);
    return;
  }

  // Chrome op Linux meldt soms stemmen die daarna stil blijven. Als de
  // browser na 1,8 seconden nog niet begonnen is, neemt de systeemstem over.
  if (fallbackToServer) {
    fallbackTimer = window.setTimeout(() => {
      if (started) return;
      synth.cancel();
      speakWithServer(text);
    }, 1800);
  }
}

export function speak(text: string): void {
  if (typeof window === 'undefined') return;

  if (!('speechSynthesis' in window)) {
    speakWithServer(text);
    return;
  }

  if (!pickVoice()) {
    speakWithServer(text);
    return;
  }

  speakWithBrowser(text, true);
}

export function stopSpeaking(): void {
  clearFallbackTimer();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function useSpeech() {
  return useCallback((text: string) => speak(text), []);
}
