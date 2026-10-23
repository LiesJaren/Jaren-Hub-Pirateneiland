import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  applyThemeToDocument,
  DEFAULT_THEME_CONFIG,
  exportThemeToCode,
  exportThemeToJSON,
  importThemeFromCode,
  loadSavedThemes,
  loadThemeConfig,
  saveThemeConfig,
  saveThemeToFavorites,
  THEME_PRESETS,
} from './themeCatalog';
import type {
  ThemeColors,
  ThemeConfig,
  ThemeFont,
  ThemeLayout,
  ThemePreset,
} from './types';

type ThemeContextValue = {
  theme: ThemeConfig;
  setPreset: (preset: ThemePreset) => void;
  setFont: (font: ThemeFont) => void;
  setLayout: (layout: ThemeLayout) => void;
  setColor: (key: keyof ThemeColors, color: string) => void;
  saveCurrentThemeAs: (name: string) => void;
  loadSavedTheme: (theme: ThemeConfig) => void;
  exportJSON: () => string;
  exportCode: () => string;
  importTheme: (codeOrJSON: string) => boolean;
  savedThemes: ThemeConfig[];
  resetToDefault: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => loadThemeConfig());
  const [savedThemes, setSavedThemes] = useState<ThemeConfig[]>(() => loadSavedThemes());

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setPreset = useCallback((preset: ThemePreset) => {
    const presetData = THEME_PRESETS[preset];
    if (!presetData) return;
    setTheme((prev) => {
      const next: ThemeConfig = {
        ...prev,
        preset,
        name: presetData.name,
        colors: { ...presetData.colors },
        font: preset === 'custom' ? prev.font : presetData.defaultFont,
      };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const setFont = useCallback((font: ThemeFont) => {
    setTheme((prev) => {
      const next: ThemeConfig = { ...prev, font };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const setLayout = useCallback((layout: ThemeLayout) => {
    setTheme((prev) => {
      const next: ThemeConfig = { ...prev, layout };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const setColor = useCallback((key: keyof ThemeColors, color: string) => {
    setTheme((prev) => {
      const next: ThemeConfig = {
        ...prev,
        preset: 'custom',
        name: 'Aangepast Eiland',
        colors: {
          ...prev.colors,
          [key]: color,
        },
      };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const saveCurrentThemeAs = useCallback((name: string) => {
    setTheme((prev) => {
      const saved: ThemeConfig = {
        ...prev,
        id: `theme-${Date.now()}`,
        name: name.trim() || prev.name,
      };
      saveThemeConfig(saved);
      saveThemeToFavorites(saved);
      setSavedThemes(loadSavedThemes());
      return saved;
    });
  }, []);

  const loadSavedTheme = useCallback((target: ThemeConfig) => {
    setTheme(target);
    saveThemeConfig(target);
  }, []);

  const exportJSON = useCallback(() => exportThemeToJSON(theme), [theme]);
  const exportCode = useCallback(() => exportThemeToCode(theme), [theme]);

  const importTheme = useCallback((codeOrJSON: string) => {
    const imported = importThemeFromCode(codeOrJSON);
    if (imported) {
      setTheme(imported);
      saveThemeConfig(imported);
      saveThemeToFavorites(imported);
      setSavedThemes(loadSavedThemes());
      return true;
    }
    return false;
  }, []);

  const resetToDefault = useCallback(() => {
    setTheme(DEFAULT_THEME_CONFIG);
    saveThemeConfig(DEFAULT_THEME_CONFIG);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setPreset,
        setFont,
        setLayout,
        setColor,
        saveCurrentThemeAs,
        loadSavedTheme,
        exportJSON,
        exportCode,
        importTheme,
        savedThemes,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
