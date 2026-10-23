import type { AvatarConfig, AvatarItem } from './types';

export const AVATAR_ITEMS: AvatarItem[] = [
  // Hoeden
  {
    id: 'hat-cap',
    name: 'Kapiteinssteek',
    category: 'hat',
    emoji: '🏴‍☠️',
    cost: 0,
    description: 'De klassieke steekhoed van de dappere kapitein!',
    unlockedByDefault: true,
  },
  {
    id: 'hat-bandana',
    name: 'Rode Bandana',
    category: 'hat',
    emoji: '🧣',
    cost: 6,
    description: 'Stoere rode piratenbandana tegen de brandende zon.',
  },
  {
    id: 'hat-sailor',
    name: 'Matrozenbaret',
    category: 'hat',
    emoji: '⚓',
    cost: 10,
    description: 'Nette witte matrozenmuts voor op het voordek.',
  },
  {
    id: 'hat-crown',
    name: 'Gouden Zeekroon',
    category: 'hat',
    emoji: '👑',
    cost: 25,
    description: 'Gevonden in de diepste schatkist op het eiland!',
  },
  {
    id: 'hat-party',
    name: 'Feestpiratenhoed',
    category: 'hat',
    emoji: '🎉',
    cost: 15,
    description: 'Met slingers en toeters voor als je een taak af hebt!',
  },

  // Gezicht / Ogen
  {
    id: 'face-eyepatch',
    name: 'Klassiek Ooglapje',
    category: 'face',
    emoji: '👁️',
    cost: 0,
    description: 'Echte zeerovers kijken altijd scherp met één oog.',
    unlockedByDefault: true,
  },
  {
    id: 'face-glasses',
    name: 'Schatzoekersbril',
    category: 'face',
    emoji: '👓',
    cost: 8,
    description: 'Om zelfs de kleinste gouden muntjes in het zand te zien.',
  },
  {
    id: 'face-monocle',
    name: 'Gouden Monocle',
    category: 'face',
    emoji: '🧐',
    cost: 18,
    description: 'Zeer deftig voor bij het bestuderen van zeekaarten.',
  },
  {
    id: 'face-beard',
    name: 'Schuimbaard',
    category: 'face',
    emoji: '🧔',
    cost: 12,
    description: 'Een stoere kapiteinsbaard vol zeelucht.',
  },

  // Schoudermaatje / Metgezel
  {
    id: 'companion-parrot',
    name: 'Papegaai Coco',
    category: 'companion',
    emoji: '🦜',
    cost: 0,
    description: 'Roept "Land in zicht!" en eet graag crackertjes.',
    unlockedByDefault: true,
  },
  {
    id: 'companion-seagull',
    name: 'Zeemeeuw Sjaak',
    category: 'companion',
    emoji: '🕊️',
    cost: 8,
    description: 'Vliegt voorop om te kijken of er schepen aankomen.',
  },
  {
    id: 'companion-fish',
    name: 'Vliegende Vis Pip',
    category: 'companion',
    emoji: '🐠',
    cost: 14,
    description: 'Springt vrolijk over de boeg van je schip.',
  },
  {
    id: 'companion-crab',
    name: 'Krabbetje Knippie',
    category: 'companion',
    emoji: '🦀',
    cost: 20,
    description: 'Past goed op de sleutel van de schatkist.',
  },

  // Kleding / Outfits
  {
    id: 'outfit-vest',
    name: 'Zeerovershesje',
    category: 'outfit',
    emoji: '🦺',
    cost: 0,
    description: 'Comfortabel om in de touwen van het schip te klimmen.',
    unlockedByDefault: true,
  },
  {
    id: 'outfit-coat',
    name: 'Gouden Kapiteinsjas',
    category: 'outfit',
    emoji: '🧥',
    cost: 18,
    description: 'Met gouden knopen en fluwelen mouwen.',
  },
  {
    id: 'outfit-hawaii',
    name: 'Tropisch Palmenhemd',
    category: 'outfit',
    emoji: '🏝️',
    cost: 12,
    description: 'Lekker luchtig voor een zonnige dag op het strand.',
  },
  {
    id: 'outfit-armor',
    name: 'Ridderpiraat Harnas',
    category: 'outfit',
    emoji: '🛡️',
    cost: 30,
    description: 'Onbreekbaar schild tegen storm en hoge golven.',
  },

  // Schepen
  {
    id: 'ship-raft',
    name: 'Het Snelle Vlot',
    category: 'ship',
    emoji: '🪵',
    cost: 0,
    description: 'Licht, wendbaar en glijdt soepel over de branding.',
    unlockedByDefault: true,
  },
  {
    id: 'ship-schooner',
    name: 'De Zilveren Schoener',
    category: 'ship',
    emoji: '⛵',
    cost: 15,
    description: 'Met twee grote witte zeilen en een glimmende boeg.',
  },
  {
    id: 'ship-galleon',
    name: 'De Gouden Galjoen',
    category: 'ship',
    emoji: '🚢',
    cost: 30,
    description: 'Een machtig schip met vlaggen en een echt kraaiennest.',
  },
  {
    id: 'ship-flying',
    name: 'De Vliegende Hollander',
    category: 'ship',
    emoji: '✨',
    cost: 50,
    description: 'Zweeft zelfs een stukje boven het water door magische wind!',
  },
  {
    id: 'ship-scheveschuit',
    name: 'De Scheve Schuit',
    category: 'ship',
    emoji: '🏴‍☠️',
    cost: 0,
    unlockedByDefault: true,
    description: 'Het legendarische piratenschip van Kapitein Piet en Piraat Jaren!',
  },
  {
    id: 'hat-jaren-tricorn',
    name: 'Jarens Kapiteinssteek',
    category: 'hat',
    emoji: '🏴‍☠️',
    cost: 0,
    unlockedByDefault: true,
    description: 'Stoere bruine zeerovershoed met zilveren doodskop van Piraat Jaren.',
  },
  {
    id: 'outfit-scheveschuit',
    name: 'Scheve Schuit Uniform',
    category: 'outfit',
    emoji: '⚔️',
    cost: 0,
    unlockedByDefault: true,
    description: 'Met zwaard, rood-witte sjerp en stoere kapiteinsgilet!',
  },
];

export const JAREN_PIRATE_IMAGE = '/assets/aistudio/image_4275cd55.png';
export const PIET_CREW_IMAGE = '/assets/aistudio/image_52b45d3f.png';

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  mode: 'piraat-jaren',
  hat: 'hat-jaren-tricorn',
  face: 'face-eyepatch',
  companion: 'companion-parrot',
  outfit: 'outfit-scheveschuit',
  ship: 'ship-scheveschuit',
  unlockedIds: [
    'hat-cap',
    'hat-jaren-tricorn',
    'face-eyepatch',
    'companion-parrot',
    'outfit-vest',
    'outfit-scheveschuit',
    'ship-raft',
    'ship-scheveschuit',
  ],
};

const AVATAR_STORAGE_KEY = 'je_avatar_config';

export function loadAvatarConfig(): AvatarConfig {
  if (typeof window === 'undefined') return DEFAULT_AVATAR_CONFIG;
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!raw) return DEFAULT_AVATAR_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AvatarConfig>;
    return {
      mode: parsed.mode ?? DEFAULT_AVATAR_CONFIG.mode,
      hat: parsed.hat ?? DEFAULT_AVATAR_CONFIG.hat,
      face: parsed.face ?? DEFAULT_AVATAR_CONFIG.face,
      companion: parsed.companion ?? DEFAULT_AVATAR_CONFIG.companion,
      outfit: parsed.outfit ?? DEFAULT_AVATAR_CONFIG.outfit,
      ship: parsed.ship ?? DEFAULT_AVATAR_CONFIG.ship,
      unlockedIds: Array.isArray(parsed.unlockedIds)
        ? Array.from(new Set([...DEFAULT_AVATAR_CONFIG.unlockedIds, ...parsed.unlockedIds]))
        : DEFAULT_AVATAR_CONFIG.unlockedIds,
    };
  } catch {
    return DEFAULT_AVATAR_CONFIG;
  }
}

export function saveAvatarConfig(config: AvatarConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Kon avatar instellingen niet bewaren:', err);
  }
}
