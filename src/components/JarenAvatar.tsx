import React from 'react';
import { usePlatform } from '../platform/PlatformContext';
import { AVATAR_ITEMS, JAREN_PIRATE_IMAGE } from '../platform/avatarCatalog';
import type { AvatarMode } from '../platform/types';

export type JarenAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';

interface JarenAvatarProps {
  size?: JarenAvatarSize;
  className?: string;
  shape?: 'rounded' | 'circle';
  showBadge?: boolean;
  overrideMode?: AvatarMode;
  alt?: string;
  onClick?: () => void;
  title?: string;
}

const SIZE_MAP: Record<JarenAvatarSize, { box: string; badge: string; text: string }> = {
  xs: { box: 'w-7 h-7', badge: 'text-[9px] -bottom-1 -right-1', text: 'text-sm' },
  sm: { box: 'w-9 h-9', badge: 'text-[10px] -bottom-1 -right-1', text: 'text-base' },
  md: { box: 'w-12 h-12', badge: 'text-xs -bottom-1 -right-1', text: 'text-xl' },
  lg: { box: 'w-16 h-16', badge: 'text-sm -bottom-1 -right-1.5', text: 'text-3xl' },
  xl: { box: 'w-24 h-24', badge: 'text-base -bottom-1 -right-2', text: 'text-5xl' },
  '2xl': { box: 'w-32 h-32', badge: 'text-lg -bottom-2 -right-2', text: 'text-6xl' },
  hero: { box: 'w-44 h-44 sm:w-48 sm:h-48', badge: 'text-xl -bottom-2 -right-2', text: 'text-7xl' },
};

export function JarenAvatar({
  size = 'md',
  className = '',
  shape = 'rounded',
  showBadge = true,
  overrideMode,
  alt = 'Piraat Jaren avatar',
  onClick,
  title,
}: JarenAvatarProps) {
  const { avatarConfig, childName } = usePlatform();
  const currentMode: AvatarMode = overrideMode ?? avatarConfig.mode ?? 'piraat-jaren';

  const equippedHat = AVATAR_ITEMS.find((i) => i.id === avatarConfig.hat);
  const equippedFace = AVATAR_ITEMS.find((i) => i.id === avatarConfig.face);
  const equippedCompanion = AVATAR_ITEMS.find((i) => i.id === avatarConfig.companion);
  const equippedShip = AVATAR_ITEMS.find((i) => i.id === avatarConfig.ship);

  const sizeCfg = SIZE_MAP[size];
  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl sm:rounded-3xl';
  const computedTitle = title ?? `Kapitein ${childName} avatar`;

  return (
    <div
      onClick={onClick}
      title={computedTitle}
      className={`relative shrink-0 select-none ${sizeCfg.box} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Container met piraten-gouden rand */}
      <div
        className={`w-full h-full ${roundedClass} overflow-hidden bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-[3px] shadow-md ring-2 ring-amber-500/50 flex items-center justify-center`}
      >
        <div className={`w-full h-full ${roundedClass} overflow-hidden bg-sky-950 relative flex items-center justify-center`}>
          {/* OPTIE 1: Piraat Jaren (close-up op Jaren met piratenhoed, lach & zwaard) */}
          {currentMode === 'piraat-jaren' && (
            <img
              src={JAREN_PIRATE_IMAGE}
              alt={alt}
              className="w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: '72% 38%',
                transform: 'scale(1.75)',
                transformOrigin: '72% 38%',
              }}
              loading="eager"
            />
          )}

          {/* OPTIE 2: Piet Piraat & Jaren Duo op De Scheve Schuit */}
          {currentMode === 'piet-en-jaren' && (
            <img
              src={JAREN_PIRATE_IMAGE}
              alt="Kapitein Piet & Piraat Jaren samen op de Scheve Schuit"
              className="w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: '50% 36%',
                transform: 'scale(1.15)',
                transformOrigin: '50% 36%',
              }}
              loading="eager"
            />
          )}

          {/* OPTIE 3: Schatkamer Dress-up Custom Emoji Avatar */}
          {currentMode === 'custom' && (
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-600">
              <span className="text-xl sm:text-2xl filter drop-shadow">
                {equippedShip?.emoji ?? '🪵'}
              </span>
              <div className={`relative ${sizeCfg.text} filter drop-shadow z-10`}>
                🧒
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6em]">
                  {equippedHat?.emoji ?? '🏴‍☠️'}
                </div>
                <div className="absolute top-1 right-0 text-[0.45em]">
                  {equippedFace?.emoji ?? '👁️'}
                </div>
                <div className="absolute -top-1 -right-3 text-[0.45em]">
                  {equippedCompanion?.emoji ?? '🦜'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optionele Badge (Piratenschedel / Kapiteinsster) */}
      {showBadge && (
        <span
          className={`absolute ${sizeCfg.badge} bg-amber-400 text-sky-950 rounded-full border border-amber-600 shadow-xs flex items-center justify-center p-0.5 leading-none pointer-events-none`}
        >
          {currentMode === 'piraat-jaren' ? '🏴‍☠️' : currentMode === 'piet-en-jaren' ? '⚓' : '⭐'}
        </span>
      )}
    </div>
  );
}
