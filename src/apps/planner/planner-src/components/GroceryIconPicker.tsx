import React, { useMemo, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Loader2, Search, Sparkles, Upload, X } from 'lucide-react';
import { ACTIVITY_ICONS } from '../data/iconLibrary';
import { ActivityIcon } from '../types/family';
import { generateIconWithAI } from '../utils/aiIconGenerator';
import { soundEffects } from '../utils/audio';
import { IconVisual } from './IconVisual';

export interface GroceryIconSelection {
  iconEmoji?: string;
  iconImageDataUrl?: string;
  iconImageUrl?: string;
  iconLabel?: string;
  iconId?: string;
}

interface GroceryIconPickerProps {
  isOpen: boolean;
  itemName: string;
  customIcons?: ActivityIcon[];
  current?: GroceryIconSelection;
  onSelect: (selection: GroceryIconSelection) => void;
  onClose: () => void;
}

const FOOD_EMOJIS = [
  '🛒', '🍎', '🍌', '🍇', '🍓', '🍊', '🍋', '🍐', '🍑', '🍒',
  '🥕', '🥦', '🥬', '🍅', '🥒', '🌽', '🥔', '🧅', '🧄', '🫑',
  '🍞', '🥖', '🥐', '🧀', '🥛', '🧈', '🥚', '🍖', '🍗', '🥓',
  '🐟', '🦐', '🍚', '🍝', '🥫', '🍲', '🥣', '🧂', '🍯', '🍫',
  '🍪', '🍰', '🍦', '🍿', '🥤', '☕', '🧃', '🧴', '🧻', '🧼',
];

// Plaatselijk vangnet wanneer er geen AI-sleutel is: herken bekende
// boodschappen en geef er alsnog een passend emoji aan.
const GROCERY_KEYWORDS: Array<[string, string]> = [
  ['melk', '🥛'], ['brood', '🍞'], ['kaas', '🧀'], ['ei', '🥚'],
  ['boter', '🧈'], ['appel', '🍎'], ['banaan', '🍌'], ['aardbei', '🍓'],
  ['tomaat', '🍅'], ['komkommer', '🥒'], ['wortel', '🥕'], ['aardappel', '🥔'],
  ['ui', '🧅'], ['knoflook', '🧄'], ['kip', '🍗'], ['vlees', '🥩'],
  ['vis', '🐟'], ['rijst', '🍚'], ['pasta', '🍝'], ['spaghetti', '🍝'],
  ['soep', '🍲'], ['koffie', '☕'], ['thee', '🍵'], ['sap', '🧃'],
  ['water', '💧'], ['cola', '🥤'], ['chips', '🍿'], ['chocolade', '🍫'],
  ['koek', '🍪'], ['ijs', '🍦'], ['taart', '🍰'], ['yoghurt', '🥣'],
  ['honing', '🍯'], ['zout', '🧂'], ['olie', '🫒'], ['zeep', '🧼'],
  ['wc', '🧻'], ['wasmiddel', '🧴'], ['luier', '👶'], ['hagelslag', '🍫'],
  ['pindakaas', '🥜'], ['noten', '🥜'], ['druiven', '🍇'], ['sinaasappel', '🍊'],
  ['citroen', '🍋'], ['peer', '🍐'], ['perzik', '🍑'], ['kers', '🍒'],
  ['meloen', '🍈'], ['ananas', '🍍'], ['mango', '🥭'], ['avocado', '🥑'],
  ['paprika', '🫑'], ['sla', '🥬'], ['broccoli', '🥦'], ['champignon', '🍄'],
  ['spinazie', '🥬'], ['prei', '🥬'], ['courgette', '🥒'],
];

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 320;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is niet beschikbaar');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL('image/webp', 0.8);
    if (compressed.length > 400_000) {
      throw new Error('De afbeelding is nog te groot na verkleinen');
    }
    return compressed;
  } finally {
    bitmap.close();
  }
}

export const GroceryIconPicker: React.FC<GroceryIconPickerProps> = ({
  isOpen,
  itemName,
  customIcons = [],
  current,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [customEmoji, setCustomEmoji] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<{ emoji: string; label: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiBusy, setIsAiBusy] = useState(false);
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalize = (value: string) =>
    value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizedQuery = normalize(query.trim());
  const allIcons = useMemo(() => [...customIcons, ...ACTIVITY_ICONS], [customIcons]);

  const filteredIcons = useMemo(() => {
    if (!normalizedQuery) return allIcons.slice(0, 60);
    return allIcons
      .filter((icon) => normalize(icon.label).includes(normalizedQuery))
      .slice(0, 60);
  }, [allIcons, normalizedQuery]);

  const filteredEmojis = useMemo(() => {
    if (!normalizedQuery) return FOOD_EMOJIS;
    const matches = allIcons
      .filter((icon) => normalize(icon.label).includes(normalizedQuery) && icon.emoji)
      .map((icon) => icon.emoji);
    return [...new Set([...matches, ...FOOD_EMOJIS])];
  }, [allIcons, normalizedQuery]);

  if (!isOpen) return null;

  const choose = (selection: GroceryIconSelection) => {
    soundEffects.playTap();
    onSelect(selection);
    onClose();
  };

  const handleGenerateWithAI = async () => {
    const prompt = itemName.trim() || query.trim();
    if (!prompt) {
      setAiError('Typ eerst een productnaam of zoekterm.');
      return;
    }
    setIsAiBusy(true);
    setAiError(null);
    try {
      const result = await generateIconWithAI(prompt);
      let emoji = result.emoji;
      let label = result.label;
      if (!emoji || emoji === '🌟') {
        const normalized = normalize(prompt);
        const match = GROCERY_KEYWORDS.find(([keyword]) => normalized.includes(keyword));
        if (match) {
          emoji = match[1];
          label = prompt;
        }
      }
      setAiSuggestion({ emoji, label });
      soundEffects.playSuccessChime();
    } catch {
      setAiError('AI kon nu geen icoon voorstellen. Kies hieronder gerust zelf een icoon.');
    } finally {
      setIsAiBusy(false);
    }
  };

  const handleImageFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPasteError('Kies een afbeeldingsbestand.');
      return;
    }
    setIsImageBusy(true);
    setPasteError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      choose({ iconEmoji: '🛒', iconImageDataUrl: dataUrl, iconLabel: itemName || 'Eigen icoon' });
    } catch {
      setPasteError('Deze afbeelding kon niet worden verwerkt. Probeer een kleinere foto.');
    } finally {
      setIsImageBusy(false);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith('image/')
    );
    if (!imageItem) return;
    event.preventDefault();
    await handleImageFile(imageItem.getAsFile());
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Icoon voor boodschap kiezen"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
          <div>
            <h2 className="text-lg font-black text-slate-900">Icoon voor boodschap</h2>
            <p className="text-xs text-slate-600">
              {itemName
                ? `Kies een icoon of eigen afbeelding voor “${itemName}”.`
                : 'Kies een icoon of eigen afbeelding voor je boodschap.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-white/70"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* AI */}
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/60 p-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <div>
                <p className="text-sm font-black text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Laat AI een icoon kiezen
                </p>
                <p className="text-[11px] text-purple-700">
                  Op basis van de productnaam stelt de AI een herkenbaar icoon voor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleGenerateWithAI()}
                disabled={isAiBusy}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm disabled:opacity-60"
              >
                {isAiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAiBusy ? 'AI denkt na...' : 'AI-icoon voorstellen'}
              </button>
            </div>
            {aiSuggestion && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white border border-purple-200 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-3xl">{aiSuggestion.emoji}</span>
                  <span className="text-sm font-black text-slate-800 truncate">{aiSuggestion.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    choose({ iconEmoji: aiSuggestion.emoji, iconLabel: aiSuggestion.label })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Gebruik
                </button>
              </div>
            )}
            {aiError && <p className="mt-2 text-[11px] font-bold text-rose-600">{aiError}</p>}
            <p className="mt-2 text-[10px] text-purple-700/80">
              Zonder AI-sleutel gebruikt de app een vaste, kindvriendelijke suggestielijst.
            </p>
          </div>

          {/* Search + own emoji */}
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zoek een icoon of product..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={customEmoji}
                onChange={(event) => setCustomEmoji(event.target.value)}
                maxLength={4}
                placeholder="Eigen emoji"
                className="w-28 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-center focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={!customEmoji.trim()}
                onClick={() => choose({ iconEmoji: customEmoji.trim(), iconLabel: itemName })}
                className="px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black disabled:opacity-40"
              >
                Gebruik
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageBusy}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-black text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                title="Kies een eigen foto of afbeelding voor deze boodschap"
              >
                {isImageBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Eigen afbeelding
              </button>
            </div>
          </div>

          {/* Emoji grid */}
          <div>
            <p className="text-xs font-black text-slate-700 mb-2">Boodschappen-iconen</p>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => choose({ iconEmoji: emoji, iconLabel: itemName })}
                  className="aspect-square rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-2xl flex items-center justify-center transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Own + library icons */}
          <div>
            <p className="text-xs font-black text-slate-700 mb-2">
              Eigen afbeeldingen en bibliotheek ({filteredIcons.length})
            </p>
            {filteredIcons.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-3">
                Geen icoon gevonden. Maak er een via Ouderportaal → AI Iconen → Zelf Icoon Ontwerpen.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() =>
                      choose({
                        iconEmoji: icon.emoji,
                        iconImageDataUrl: icon.imageDataUrl,
                        iconImageUrl: icon.imageUrl,
                        iconLabel: icon.label,
                        iconId: icon.id,
                      })
                    }
                    className="p-2 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 flex flex-col items-center gap-1 transition-all"
                    title={icon.label}
                  >
                    <IconVisual
                      emoji={icon.emoji}
                      imageDataUrl={icon.imageDataUrl}
                      imageUrl={icon.imageUrl}
                      className="text-2xl flex items-center justify-center h-8"
                      imageClassName="h-8 w-8 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">
                      {icon.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Own image */}
          <div
            tabIndex={0}
            onPaste={handlePaste}
            className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center focus:outline-none focus:border-emerald-400"
          >
            <p className="text-xs font-bold text-slate-600">
              Eigen afbeelding: kies een bestand of plak een foto (Ctrl+V). Deze verschijnt ook in de print.
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageBusy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {isImageBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Afbeelding kiezen
              </button>
              {current?.iconImageDataUrl && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ImageIcon className="w-3.5 h-3.5" /> Afbeelding actief
                </span>
              )}
            </div>
            {pasteError && <p className="mt-2 text-[11px] font-bold text-rose-600">{pasteError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleImageFile(event.target.files?.[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
