import React, { useEffect, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { FamilyMember } from '../types/family';
import { MemberAvatar, isImageAvatar } from './MemberAvatar';
import { soundEffects } from '../utils/audio';

interface MemberEditModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

const AVATAR_EMOJIS = [
  '👨', '👩', '👦', '👧', '👶', '🧑', '🧒', '👴', '👵',
  '🦸', '🦸‍♂️', '🦸‍♀️', '🧚', '🐱', '🐶', '🐼', '🦊', '🐰',
  '⭐', '🌟', '⚽', '🎒', '🦄', '🚀',
];

const COLOR_SWATCHES = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b',
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

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  isOpen,
  member,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ouder' | 'kind'>('kind');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [avatar, setAvatar] = useState('👦');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!member || !isOpen) return;
    setName(member.name);
    setRole(member.role);
    setAge(member.age ? String(member.age) : '');
    setColor(member.color || '#f59e0b');
    setAvatar(member.avatar || (member.role === 'ouder' ? '👨' : '👦'));
    setError(null);
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleImageFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Kies een afbeeldingsbestand (jpg, png, webp).');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      setAvatar(await fileToCompressedDataUrl(file));
      soundEffects.playSuccessChime();
    } catch {
      setError('Deze foto kon niet worden verwerkt. Probeer een kleinere afbeelding.');
    } finally {
      setIsBusy(false);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Geef het gezinslid een naam.');
      return;
    }
    soundEffects.playSuccessChime();
    onSave({
      ...member,
      name: name.trim(),
      role,
      age: age.trim() ? Math.max(0, parseInt(age, 10) || 0) : undefined,
      color,
      avatar: avatar.trim() || (role === 'ouder' ? '👨' : '👦'),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Gezinslid bewerken"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
          <div>
            <h2 className="text-lg font-black text-slate-900">Gezinslid bewerken</h2>
            <p className="text-xs text-slate-600">Naam, kleur en avatar aanpassen.</p>
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

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border-4 border-white shadow-md overflow-hidden shrink-0"
              style={{ backgroundColor: color }}
            >
              <MemberAvatar
                avatar={avatar}
                name={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-slate-900 truncate">
                {name || 'Naam'}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {role === 'ouder' ? 'Ouder' : `Kind${age ? ` (${age} jaar)` : ''}`}
              </p>
            </div>
          </div>

          {/* Name + role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-black text-slate-700">Naam</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-amber-500"
                placeholder="Bijv. Jaren"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-700">Rol</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as 'ouder' | 'kind')}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="ouder">Ouder</option>
                <option value="kind">Kind</option>
              </select>
            </label>
          </div>

          {role === 'kind' && (
            <label className="block">
              <span className="text-xs font-black text-slate-700">Leeftijd</span>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="mt-1 w-full sm:w-32 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-amber-500"
                placeholder="6"
              />
            </label>
          )}

          {/* Color */}
          <div>
            <span className="text-xs font-black text-slate-700">Kleur</span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                    color.toLowerCase() === swatch.toLowerCase()
                      ? 'border-slate-900 scale-110 shadow-md'
                      : 'border-white shadow-sm hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Kleur ${swatch}`}
                />
              ))}
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-2 rounded-xl cursor-pointer">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="w-5 h-5 rounded border-0 bg-transparent p-0 cursor-pointer"
                />
                Eigen
              </label>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <span className="text-xs font-black text-slate-700">Avatar</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                    avatar === emoji
                      ? 'border-amber-500 bg-amber-50 scale-105'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div
              ref={pasteAreaRef}
              tabIndex={0}
              onPaste={handlePaste}
              className="mt-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center focus:outline-none focus:border-amber-400"
            >
              <p className="text-xs font-bold text-slate-600">
                Eigen foto: kies een bestand of plak een afbeelding (Ctrl+V)
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  Foto kiezen
                </button>
                {isImageAvatar(avatar) && (
                  <button
                    type="button"
                    onClick={() => setAvatar(role === 'ouder' ? '👨' : '👦')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-black text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Foto verwijderen
                  </button>
                )}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                De foto wordt automatisch verkleind, zodat de app snel blijft.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleImageFile(event.target.files?.[0])}
              />
            </div>

            {isImageAvatar(avatar) && (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                <ImageIcon className="w-3.5 h-3.5" /> Eigen foto actief
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-200"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black shadow-md disabled:opacity-60"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Opslaan
          </button>
        </div>
      </form>
    </div>
  );
};
