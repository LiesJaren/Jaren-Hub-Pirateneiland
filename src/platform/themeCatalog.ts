import type { ThemeColors, ThemeConfig, ThemeFont, ThemeLayout, ThemePreset } from './types';

export const THEME_PRESETS: Record<ThemePreset, { name: string; colors: ThemeColors; defaultFont: ThemeFont }> = {
  pirate: {
    name: 'Tropisch Pirateneiland',
    colors: {
      ocean1: '#0284c7', // sky-600
      ocean2: '#0369a1', // sky-700
      accent: '#f59e0b', // amber-500
      sand: '#fef3c7',   // amber-100
      cardBg: '#ffffff',
      textColor: '#0f172a', // slate-900
    },
    defaultFont: 'fredoka',
  },
  deepsea: {
    name: 'Diepzee Avontuur',
    colors: {
      ocean1: '#0f172a', // slate-900
      ocean2: '#0284c7', // sky-600
      accent: '#06b6d4', // cyan-500
      sand: '#e0f2fe',   // sky-100
      cardBg: '#1e293b',
      textColor: '#f8fafc',
    },
    defaultFont: 'jakarta',
  },
  sunset: {
    name: 'Zonsondergang Baai',
    colors: {
      ocean1: '#9333ea', // purple-600
      ocean2: '#e11d48', // rose-600
      accent: '#fbbf24', // amber-400
      sand: '#fff1f2',   // rose-50
      cardBg: '#ffffff',
      textColor: '#3b0764',
    },
    defaultFont: 'storybook',
  },
  blocks: {
    name: 'Blokkenwereld',
    colors: {
      ocean1: '#15803d', // green-700
      ocean2: '#b45309', // amber-700
      accent: '#eab308', // yellow-500
      sand: '#fef08a',   // yellow-200
      cardBg: '#ffffff',
      textColor: '#14532d',
    },
    defaultFont: 'pixel',
  },
  pastel: {
    name: 'Rustig Pastel',
    colors: {
      ocean1: '#38bdf8', // sky-400
      ocean2: '#a78bfa', // violet-400
      accent: '#fb7185', // rose-400
      sand: '#f0fdf4',   // green-50
      cardBg: '#ffffff',
      textColor: '#1e293b',
    },
    defaultFont: 'fredoka',
  },
  custom: {
    name: 'Mijn Eigen Eiland',
    colors: {
      ocean1: '#0ea5e9',
      ocean2: '#0284c7',
      accent: '#f59e0b',
      sand: '#fef3c7',
      cardBg: '#ffffff',
      textColor: '#0f172a',
    },
    defaultFont: 'fredoka',
  },
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: 'default-pirate',
  name: 'Tropisch Pirateneiland',
  preset: 'pirate',
  font: 'fredoka',
  layout: 'map',
  colors: THEME_PRESETS.pirate.colors,
};

const THEME_STORAGE_KEY = 'je_theme_config';
const SAVED_THEMES_KEY = 'je_saved_themes';

export function loadThemeConfig(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME_CONFIG;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
    const preset = parsed.preset && THEME_PRESETS[parsed.preset] ? parsed.preset : 'pirate';
    return {
      id: parsed.id ?? 'active-theme',
      name: parsed.name ?? THEME_PRESETS[preset].name,
      preset,
      font: parsed.font ?? THEME_PRESETS[preset].defaultFont,
      layout: parsed.layout ?? 'map',
      colors: parsed.colors ?? THEME_PRESETS[preset].colors,
    };
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveThemeConfig(config: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    applyThemeToDocument(config);
  } catch (err) {
    console.warn('Kon thema niet opslaan:', err);
  }
}

export function loadSavedThemes(): ThemeConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_THEMES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveThemeToFavorites(theme: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadSavedThemes().filter((t) => t.id !== theme.id);
    const updated = [theme, ...current].slice(0, 10);
    localStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Kon thema niet bewaren in favorieten:', err);
  }
}

export function exportThemeToJSON(theme: ThemeConfig): string {
  return JSON.stringify(
    {
      format: 'jarens-eiland-theme',
      version: 1,
      exportedAt: new Date().toISOString(),
      theme,
    },
    null,
    2,
  );
}

export function exportThemeToCode(theme: ThemeConfig): string {
  const json = JSON.stringify(theme);
  // Base64 encode for easy sharing
  return `JE-THEMA-${btoa(encodeURIComponent(json))}`;
}

export function importThemeFromCode(code: string): ThemeConfig | null {
  try {
    let jsonStr = code.trim();
    if (jsonStr.startsWith('JE-THEMA-')) {
      jsonStr = decodeURIComponent(atob(jsonStr.replace('JE-THEMA-', '')));
    }
    const parsed = JSON.parse(jsonStr);
    const candidate = parsed.theme ? parsed.theme : parsed;
    if (candidate && typeof candidate === 'object' && candidate.colors) {
      return {
        id: `imported-${Date.now()}`,
        name: candidate.name || 'Geïmporteerd Thema',
        preset: candidate.preset || 'custom',
        font: candidate.font || 'fredoka',
        layout: candidate.layout || 'map',
        colors: {
          ocean1: candidate.colors.ocean1 || '#0284c7',
          ocean2: candidate.colors.ocean2 || '#0369a1',
          accent: candidate.colors.accent || '#f59e0b',
          sand: candidate.colors.sand || '#fef3c7',
          cardBg: candidate.colors.cardBg || '#ffffff',
          textColor: candidate.colors.textColor || '#0f172a',
        },
      };
    }
    return null;
  } catch (err) {
    console.warn('Thema importeren mislukt:', err);
    return null;
  }
}

export function applyThemeToDocument(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--je-ocean-1', theme.colors.ocean1);
  root.style.setProperty('--je-ocean-2', theme.colors.ocean2);
  root.style.setProperty('--je-accent', theme.colors.accent);
  root.style.setProperty('--je-sand', theme.colors.sand);
  root.style.setProperty('--je-card-bg', theme.colors.cardBg);
  root.style.setProperty('--je-text', theme.colors.textColor);

  // Font family
  let fontFamily = '"Fredoka", system-ui, sans-serif';
  if (theme.font === 'jakarta') {
    fontFamily = '"Plus Jakarta Sans", system-ui, sans-serif';
  } else if (theme.font === 'storybook') {
    fontFamily = '"Plus Jakarta Sans", serif, system-ui';
  } else if (theme.font === 'pixel') {
    fontFamily = '"VT323", monospace, system-ui';
  }
  root.style.setProperty('--je-font-family', fontFamily);
  document.body.style.fontFamily = fontFamily;
}
