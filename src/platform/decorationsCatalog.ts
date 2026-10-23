export type DecorationTemplate = {
  type: string;
  name: string;
  category: 'natuur' | 'piraten' | 'dieren' | 'schatten';
  emoji: string;
  defaultScale: number;
  sound: 'chest' | 'bell' | 'cannon' | 'splash' | 'pop' | 'jig';
  interactiveSaying: string;
};

export type PlacedDecoration = {
  instanceId: string;
  type: string;
  x: number; // percentage 5 - 95
  y: number; // percentage 10 - 90
  scale: number; // 0.7 to 1.5
  rotation: number; // degrees -30 to 30
};

export const DECORATION_TEMPLATES: DecorationTemplate[] = [
  // Natuur
  {
    type: 'palm_tree',
    name: 'Tropische Palmboom',
    category: 'natuur',
    emoji: '🌴',
    defaultScale: 1.1,
    sound: 'splash',
    interactiveSaying: 'De wind ruist zachtjes door de palmbladeren...',
  },
  {
    type: 'double_palm',
    name: 'Kokospalmen',
    category: 'natuur',
    emoji: '🥥',
    defaultScale: 1.0,
    sound: 'pop',
    interactiveSaying: 'Plop! Een kokosnoot valt in het zachte zand!',
  },
  {
    type: 'volcano',
    name: 'Eiland Vulkaan',
    category: 'natuur',
    emoji: '🌋',
    defaultScale: 1.2,
    sound: 'cannon',
    interactiveSaying: 'Rrrrommel! De vulkaan blaast een vrolijke rookwolk!',
  },
  {
    type: 'cactus',
    name: 'Schatzoekers Bloemen',
    category: 'natuur',
    emoji: '🌺',
    defaultScale: 0.9,
    sound: 'pop',
    interactiveSaying: 'Prachtige tropische eilandbloemen!',
  },

  // Piraten & Schepen
  {
    type: 'scheve_schuit',
    name: 'De Scheve Schuit (Piet Piraat)',
    category: 'piraten',
    emoji: '🏴‍☠️',
    defaultScale: 1.3,
    sound: 'bell',
    interactiveSaying: 'Schivermejantjes! Kapitein Piet Piraat en de Scheve Schuit groeten je!',
  },
  {
    type: 'pirate_ship',
    name: 'Piratenschip Galjoen',
    category: 'piraten',
    emoji: '🚢',
    defaultScale: 1.3,
    sound: 'bell',
    interactiveSaying: 'Schip ahoy! Klaar om uit te varen naar nieuwe eilanden!',
  },
  {
    type: 'sail_boat',
    name: 'Het Snelle Zeilschip',
    category: 'piraten',
    emoji: '⛵',
    defaultScale: 1.1,
    sound: 'splash',
    interactiveSaying: 'Volle wind in de zeilen!',
  },
  {
    type: 'cannon',
    name: 'Scheepskanon',
    category: 'piraten',
    emoji: '💥',
    defaultScale: 1.0,
    sound: 'cannon',
    interactiveSaying: 'Boem! Een feestelijk saluutschot voor Kapitein Jaren!',
  },
  {
    type: 'pirate_flag',
    name: 'Piratenschedel Vlag',
    category: 'piraten',
    emoji: '🏴‍☠️',
    defaultScale: 1.0,
    sound: 'jig',
    interactiveSaying: 'Wapper in de zeewind, Kapiteinsvlag!',
  },
  {
    type: 'piraat_jaren_standee',
    name: 'Piraat Jaren op de Uitkijk',
    category: 'piraten',
    emoji: '🧒',
    defaultScale: 1.2,
    sound: 'jig',
    interactiveSaying: 'Ahoy maatjes! Piraat Jaren staat op de uitkijk voor schatten en avontuur!',
  },
  {
    type: 'anchor',
    name: 'Groot Koperen Anker',
    category: 'piraten',
    emoji: '⚓',
    defaultScale: 1.0,
    sound: 'splash',
    interactiveSaying: 'Plons! Het anker ligt stevig in de baai.',
  },
  {
    type: 'lighthouse',
    name: 'De Hoge Vuurtoren',
    category: 'piraten',
    emoji: '🗼',
    defaultScale: 1.2,
    sound: 'bell',
    interactiveSaying: 'Het gouden baken schijnt over de hele oceaan!',
  },
  {
    type: 'campfire',
    name: 'Piraten Kampvuur',
    category: 'piraten',
    emoji: '🔥',
    defaultScale: 0.9,
    sound: 'pop',
    interactiveSaying: 'Gezellig marshmallows roosteren na een lange vaartocht!',
  },

  // Schatten
  {
    type: 'treasure_chest',
    name: 'Gouden Schatkist',
    category: 'schatten',
    emoji: '📦',
    defaultScale: 1.1,
    sound: 'chest',
    interactiveSaying: 'Krrk... De schatkist schittert vol goudstukken!',
  },
  {
    type: 'gold_pile',
    name: 'Stapel Goudstukken',
    category: 'schatten',
    emoji: '🪙',
    defaultScale: 1.0,
    sound: 'chest',
    interactiveSaying: 'Kling-kling! Rijkdom voor het hele eiland!',
  },
  {
    type: 'gem',
    name: 'Blauwe Saffier',
    category: 'schatten',
    emoji: '💎',
    defaultScale: 0.9,
    sound: 'pop',
    interactiveSaying: 'Een glinsterende diamant uit de diepste grot!',
  },
  {
    type: 'crown',
    name: 'De Koningskroon',
    category: 'schatten',
    emoji: '👑',
    defaultScale: 1.0,
    sound: 'jig',
    interactiveSaying: 'Een kroon waardig voor Kapitein Jaren!',
  },

  // Dieren
  {
    type: 'parrot',
    name: 'Papegaai Coco',
    category: 'dieren',
    emoji: '🦜',
    defaultScale: 1.0,
    sound: 'jig',
    interactiveSaying: 'Kraaa! Land in zicht! Goed gedaan Jaren!',
  },
  {
    type: 'crab',
    name: 'Zandkrabbetje',
    category: 'dieren',
    emoji: '🦀',
    defaultScale: 0.9,
    sound: 'pop',
    interactiveSaying: 'Knip-knip! Krabbetje wandelt zijwaarts over het strand.',
  },
  {
    type: 'turtle',
    name: 'Zeeschildpad Sam',
    category: 'dieren',
    emoji: '🐢',
    defaultScale: 1.0,
    sound: 'splash',
    interactiveSaying: 'Rustig zwemmend langs het koraalrif...',
  },
  {
    type: 'whale',
    name: 'Vrolijke Walvis',
    category: 'dieren',
    emoji: '🐳',
    defaultScale: 1.2,
    sound: 'splash',
    interactiveSaying: 'Spuit een grote fontein van water omhoog!',
  },
];

export const DEFAULT_ISLAND_DECORATIONS: PlacedDecoration[] = [
  {
    instanceId: 'dec-1',
    type: 'palm_tree',
    x: 10,
    y: 18,
    scale: 1.1,
    rotation: -5,
  },
  {
    instanceId: 'dec-2',
    type: 'treasure_chest',
    x: 48,
    y: 84,
    scale: 1.1,
    rotation: 0,
  },
  {
    instanceId: 'dec-3',
    type: 'pirate_ship',
    x: 88,
    y: 82,
    scale: 1.2,
    rotation: 4,
  },
  {
    instanceId: 'dec-4',
    type: 'parrot',
    x: 34,
    y: 14,
    scale: 1.0,
    rotation: 6,
  },
  {
    instanceId: 'dec-5',
    type: 'campfire',
    x: 62,
    y: 86,
    scale: 0.9,
    rotation: 0,
  },
  {
    instanceId: 'dec-6',
    type: 'crab',
    x: 28,
    y: 88,
    scale: 0.8,
    rotation: -8,
  },
];

export const PRESET_ISLAND_LAYOUTS: { name: string; icon: string; items: PlacedDecoration[] }[] = [
  {
    name: 'Schatzoekers Paradijs',
    icon: '🏝️',
    items: DEFAULT_ISLAND_DECORATIONS,
  },
  {
    name: 'Piraten Vloot & Fort',
    icon: '🏴‍☠️',
    items: [
      { instanceId: 'p1', type: 'lighthouse', x: 86, y: 16, scale: 1.2, rotation: 0 },
      { instanceId: 'p2', type: 'pirate_ship', x: 14, y: 35, scale: 1.3, rotation: -6 },
      { instanceId: 'p3', type: 'sail_boat', x: 84, y: 78, scale: 1.1, rotation: 8 },
      { instanceId: 'p4', type: 'cannon', x: 42, y: 86, scale: 1.0, rotation: -4 },
      { instanceId: 'p5', type: 'pirate_flag', x: 50, y: 15, scale: 1.0, rotation: 5 },
      { instanceId: 'p6', type: 'gold_pile', x: 58, y: 86, scale: 1.0, rotation: 0 },
    ],
  },
  {
    name: 'Tropische Dierenbaai',
    icon: '🦜',
    items: [
      { instanceId: 'd1', type: 'palm_tree', x: 12, y: 16, scale: 1.2, rotation: -4 },
      { instanceId: 'd2', type: 'double_palm', x: 88, y: 18, scale: 1.1, rotation: 6 },
      { instanceId: 'd3', type: 'parrot', x: 22, y: 14, scale: 1.1, rotation: 0 },
      { instanceId: 'd4', type: 'turtle', x: 15, y: 82, scale: 1.1, rotation: -10 },
      { instanceId: 'd5', type: 'whale', x: 82, y: 84, scale: 1.3, rotation: 5 },
      { instanceId: 'd6', type: 'crab', x: 50, y: 88, scale: 0.9, rotation: 0 },
      { instanceId: 'd7', type: 'gem', x: 44, y: 86, scale: 0.9, rotation: 12 },
    ],
  },
];

const DECORATIONS_STORAGE_KEY = 'je_island_decorations';

export function loadIslandDecorations(): PlacedDecoration[] {
  if (typeof window === 'undefined') return DEFAULT_ISLAND_DECORATIONS;
  try {
    const raw = localStorage.getItem(DECORATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_ISLAND_DECORATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ISLAND_DECORATIONS;
  } catch {
    return DEFAULT_ISLAND_DECORATIONS;
  }
}

export function saveIslandDecorations(items: PlacedDecoration[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DECORATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Kon eilanddecoraties niet opslaan:', err);
  }
}
