import type { ComponentType } from 'react';

export type AppManifest = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  order: number;
  component: ComponentType;
};

export type PlatformEvent = {
  id: number;
  app: string;
  type: string;
  payload: Record<string, unknown>;
  stars: number;
  created_at: string;
};

export type PublicSettings = {
  childName: string;
  theme: string;
  platformName: string;
};

export type Summary = {
  stars: number;
  earnedStars: number;
  plannerStars: number;
  events: number;
  checkins: number;
  games: number;
  recent: PlatformEvent[];
  settings: PublicSettings;
};

export type ParentSummary = Summary & {
  parent: {
    pinIsDefault: boolean;
  };
};

export type NewEvent = {
  app: string;
  type: string;
  payload?: Record<string, unknown>;
  stars?: number;
};

// --- AVATAR & SCHATKAMER TYPES ---
export type AvatarCategory = 'hat' | 'face' | 'companion' | 'outfit' | 'ship';
export type AvatarMode = 'piraat-jaren' | 'piet-en-jaren' | 'custom';

export type AvatarItem = {
  id: string;
  name: string;
  category: AvatarCategory;
  emoji: string;
  cost: number;
  description: string;
  unlockedByDefault?: boolean;
};

export type AvatarConfig = {
  mode: AvatarMode;   // 'piraat-jaren' (standaard), 'piet-en-jaren', of 'custom'
  hat: string;        // ID van hoed
  face: string;       // ID van ooglap/gezicht
  companion: string;  // ID van schoudermaatje
  outfit: string;     // ID van kleding
  ship: string;       // ID van schip
  unlockedIds: string[];
};

// --- FAMILIE BELONINGEN TYPES ---
export type FamilyReward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  description: string;
  claimedCount?: number;
};

// --- THEMA & UITERLIJK TYPES ---
export type ThemePreset = 'pirate' | 'deepsea' | 'sunset' | 'blocks' | 'pastel' | 'custom';
export type ThemeFont = 'fredoka' | 'jakarta' | 'storybook' | 'pixel';
export type ThemeLayout = 'map' | 'grid' | 'strip';

export type ThemeColors = {
  ocean1: string;
  ocean2: string;
  accent: string;
  sand: string;
  cardBg: string;
  textColor: string;
};

export type ThemeConfig = {
  id: string;
  name: string;
  preset: ThemePreset;
  font: ThemeFont;
  layout: ThemeLayout;
  colors: ThemeColors;
};

// --- VERHAALMODUS TYPES ---
export type StoryChoice = {
  id: string;
  text: string;
  nextSceneId: string;
  emoji?: string;
};

export type StoryScene = {
  id: string;
  title: string;
  illustration: string;
  text: string;
  soundCue?: 'bell' | 'chest' | 'splash' | 'jig';
  starsReward?: number;
  choices: StoryChoice[];
};

export type StoryAdventure = {
  id: string;
  title: string;
  description: string;
  coverEmoji: string;
  startSceneId: string;
  scenes: Record<string, StoryScene>;
};

// --- LEERWERELD AANPASBAARHEID ---
export type CustomWordItem = {
  id: string;
  word: string;
  category: string;
  emoji?: string;
  hint?: string;
};

export type CustomLetterItem = {
  letter: string;
  group: string; // bijv 'Kern 1' of 'Extra'
};

export type CustomLearningConfig = {
  activeWords: CustomWordItem[];
  activeLetters: CustomLetterItem[];
  mathMaxNumber: number; // 10 of 20
  allowSubtraction: boolean;
};
