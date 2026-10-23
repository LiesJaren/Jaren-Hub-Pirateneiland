import type { CustomLearningConfig, CustomLetterItem, CustomWordItem } from './types';

export const DEFAULT_LETTERS: CustomLetterItem[] = [
  { letter: 'm', group: 'Kern 1' },
  { letter: 'r', group: 'Kern 1' },
  { letter: 'v', group: 'Kern 1' },
  { letter: 'i', group: 'Kern 1' },
  { letter: 's', group: 'Kern 1' },
  { letter: 'aa', group: 'Kern 1' },
  { letter: 'p', group: 'Kern 1' },
  { letter: 'e', group: 'Kern 1' },
  { letter: 't', group: 'Kern 2' },
  { letter: 'k', group: 'Kern 2' },
  { letter: 'b', group: 'Kern 2' },
  { letter: 'o', group: 'Kern 2' },
];

export const DEFAULT_WORDS: CustomWordItem[] = [
  { id: 'w1', word: 'vis', category: 'Dieren', emoji: '🐟', hint: 'Zwemmen in het water' },
  { id: 'w2', word: 'maan', category: 'Nacht', emoji: '🌙', hint: 'Aan de sterrenhemel' },
  { id: 'w3', word: 'roos', category: 'Natuur', emoji: '🌹', hint: 'Een mooie rode bloem' },
  { id: 'w4', word: 'boot', category: 'Piraten', emoji: '⛵', hint: 'Varen over de golven' },
  { id: 'w5', word: 'zee', category: 'Piraten', emoji: '🌊', hint: 'Het blauwe water' },
  { id: 'w6', word: 'goud', category: 'Piraten', emoji: '🪙', hint: 'Glimt in de kist' },
  { id: 'w7', word: 'zon', category: 'Natuur', emoji: '☀️', hint: 'Warm aan de lucht' },
  { id: 'w8', word: 'kist', category: 'Piraten', emoji: '📦', hint: 'Waar de schat in zit' },
  { id: 'w9', word: 'piraat', category: 'Piraten', emoji: '🏴‍☠️', hint: 'Kapitein op het schip' },
  { id: 'w10', word: 'krab', category: 'Dieren', emoji: '🦀', hint: 'Knipt met zijn scharen' },
];

export const DEFAULT_LEARNING_CONFIG: CustomLearningConfig = {
  activeWords: DEFAULT_WORDS,
  activeLetters: DEFAULT_LETTERS,
  mathMaxNumber: 10,
  allowSubtraction: true,
};

const LEARNING_CONFIG_KEY = 'je_custom_learning_config';

export function loadLearningConfig(): CustomLearningConfig {
  if (typeof window === 'undefined') return DEFAULT_LEARNING_CONFIG;
  try {
    const raw = localStorage.getItem(LEARNING_CONFIG_KEY);
    if (!raw) return DEFAULT_LEARNING_CONFIG;
    const parsed = JSON.parse(raw) as Partial<CustomLearningConfig>;
    return {
      activeWords: Array.isArray(parsed.activeWords) && parsed.activeWords.length > 0
        ? parsed.activeWords
        : DEFAULT_WORDS,
      activeLetters: Array.isArray(parsed.activeLetters) && parsed.activeLetters.length > 0
        ? parsed.activeLetters
        : DEFAULT_LETTERS,
      mathMaxNumber: parsed.mathMaxNumber === 20 ? 20 : 10,
      allowSubtraction: parsed.allowSubtraction ?? true,
    };
  } catch {
    return DEFAULT_LEARNING_CONFIG;
  }
}

export function saveLearningConfig(config: CustomLearningConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEARNING_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Kon leervragen configuratie niet opslaan:', err);
  }
}
