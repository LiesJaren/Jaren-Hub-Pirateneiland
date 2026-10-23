import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Palette,
  RefreshCw,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { playPop, playSuccess } from '../../platform/sound';
import { THEME_PRESETS } from '../../platform/themeCatalog';
import { useTheme } from '../../platform/ThemeContext';
import type { ThemeFont, ThemeLayout, ThemePreset } from '../../platform/types';

export default function ThemeStudioApp() {
  const {
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
  } = useTheme();

  const [copied, setCopied] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyCode = () => {
    playSuccess();
    const code = exportCode();
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    playSuccess();
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarens-eiland-thema-${theme.preset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importInput.trim()) return;
    const ok = importTheme(importInput);
    if (ok) {
      playSuccess();
      setImportStatus('Het thema is succesvol geladen!');
      setImportInput('');
    } else {
      setImportStatus('Ongeldige code of bestand. Controleer de invoer.');
    }
  };

  const handleSaveTheme = () => {
    if (!customName.trim()) return;
    playSuccess();
    saveCurrentThemeAs(customName);
    setCustomName('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in">
      <PageHeader
        title="Thema & Uiterlijk Studio"
        subtitle="Pas de kleuren, lettertypen en lay-out aan, sla je favorieten op en deel ze met anderen!"
        icon="🎨"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Linker paneel: Instellingen */}
        <div className="md:col-span-8 space-y-6">
          {/* 1. Voorgedefinieerde Eiland Thema's */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Palette size={20} className="text-amber-500" />
                <span>Kies een Eiland-Thema</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  resetToDefault();
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw size={12} /> Standaard
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'pirate', name: 'Tropisch Piraat', emoji: '🏴‍☠️' },
                  { id: 'deepsea', name: 'Diepzee Avontuur', emoji: '🌊' },
                  { id: 'sunset', name: 'Zonsondergang Baai', emoji: '🌅' },
                  { id: 'blocks', name: 'Blokkenwereld', emoji: '🧱' },
                  { id: 'pastel', name: 'Rustig Pastel', emoji: '🌸' },
                  { id: 'custom', name: 'Eigen Kleuren', emoji: '✨' },
                ] as const
              ).map((preset) => {
                const isSelected = theme.preset === preset.id;
                const colors = THEME_PRESETS[preset.id].colors;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setPreset(preset.id as ThemePreset);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{preset.emoji}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: colors.ocean1 }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: colors.accent }}
                        />
                      </div>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Lettertypen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Kies een Lettertype
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'fredoka', name: 'Vrolijk Rond', style: 'font-sans' },
                { id: 'jakarta', name: 'Helder Modern', style: 'font-sans' },
                { id: 'storybook', name: 'Verhalenboek', style: 'font-serif' },
                { id: 'pixel', name: 'Pixel Retro', style: 'font-mono' },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    playPop();
                    setFont(font.id as ThemeFont);
                  }}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    theme.font === font.id
                      ? 'border-amber-400 bg-amber-50 font-black shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xl block mb-1">Aa</span>
                  <span className="text-xs font-bold block">{font.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Kaartlay-out Stijl */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Weergave van het Starteiland
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'map',
                  name: 'Schatkaart Pad',
                  icon: '🗺️',
                  desc: 'Interactieve perkamenten schatkaart met zeilpaden',
                },
                {
                  id: 'grid',
                  name: 'Grote Eilandtegels',
                  icon: '🏝️',
                  desc: 'Overzichtelijk raster met extra grote knoppen',
                },
                {
                  id: 'strip',
                  name: 'Horizontale Baai',
                  icon: '⛵',
                  desc: 'Gelijkmatige route langs alle eilanden',
                },
              ].map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => {
                    playPop();
                    setLayout(layout.id as ThemeLayout);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    theme.layout === layout.id
                      ? 'border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-3xl block mb-2">{layout.icon}</span>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    {layout.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">
                    {layout.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Aangepaste Kleuren Kiezers */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Eigen Kleuren Afstemmen
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'ocean1', label: 'Bovenste Oceaan' },
                { key: 'ocean2', label: 'Diepe Zee' },
                { key: 'accent', label: 'Gouden Accent' },
                { key: 'sand', label: 'Zandstrand' },
              ].map((col) => (
                <div key={col.key} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">
                    {col.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors[col.key as keyof typeof theme.colors]}
                      onChange={(e) => setColor(col.key as any, e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
                    />
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {theme.colors[col.key as keyof typeof theme.colors]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rechter paneel: Opslaan, Delen & Importeren */}
        <div className="md:col-span-4 space-y-6">
          {/* Live Preview Card */}
          <div
            className="rounded-3xl p-5 border-2 shadow-lg space-y-3"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.ocean1}, ${theme.colors.ocean2})`,
              color: '#ffffff',
            }}
          >
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Live Preview
            </span>
            <h4 className="text-xl font-black">{theme.name}</h4>
            <div
              className="p-3 rounded-2xl text-xs font-bold shadow-sm"
              style={{
                backgroundColor: theme.colors.cardBg,
                color: theme.colors.textColor,
              }}
            >
              Kapitein Jaren vaart over het eiland!
              <div
                className="mt-2 py-1 px-3 rounded-xl text-center font-black"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#0f172a',
                }}
              >
                Gouden Schatknop
              </div>
            </div>
          </div>

          {/* Thema Opslaan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900">
              Sla dit thema op
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Bijv. Jarens Droombaai"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleSaveTheme}
                className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Opslaan
              </button>
            </div>
            {savedSuccess && (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Opgeslagen in je favorieten!
              </p>
            )}

            {savedThemes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 block mb-1.5">
                  Jouw Opgeslagen Thema's:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {savedThemes.map((saved) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => {
                        playPop();
                        loadSavedTheme(saved);
                      }}
                      className="w-full text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between"
                    >
                      <span>{saved.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">Laad</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exporteren & Delen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Share2 size={16} className="text-sky-600" />
              <span>Deel Thema met Anderen</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Kopieer de themacode of download het JSON-bestand om het op een andere laptop of tablet in te laden.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs rounded-xl transition-all shadow-sm"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Code Gekopieerd!' : 'Kopieer Deelcode'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                <Download size={15} />
                <span>Download Thema (.json)</span>
              </button>
            </div>
          </div>

          {/* Importeren */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Upload size={16} className="text-emerald-600" />
              <span>Importeer Thema</span>
            </h4>

            <textarea
              rows={2}
              placeholder="Plak hier een JE-THEMA-... code of JSON"
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />

            <button
              type="button"
              onClick={handleImport}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-colors"
            >
              Toepassen
            </button>

            {importStatus && (
              <p className="text-xs font-bold text-slate-600">{importStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
