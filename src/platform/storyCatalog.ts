import type { StoryAdventure } from './types';

export const DEFAULT_PIRATE_ADVENTURE: StoryAdventure = {
  id: 'geheim-van-schateiland',
  title: 'Het Geheim van Schateiland',
  description: 'Kapitein Jaren vindt een mysterieuze schatkaart aangespoeld in het zand. Waar leidt het avontuur naartoe?',
  coverEmoji: '🗺️',
  startSceneId: 'strand-start',
  scenes: {
    'strand-start': {
      id: 'strand-start',
      title: 'De Aangespoelde Fles',
      illustration: '🏝️🌊🍾',
      text: 'De zon schijnt warm op het eiland. Terwijl de golven zachtjes ruisen, ziet Kapitein Jaren iets glinsteren tussen de schelpen: een glazen fles met een perkamenten schatkaart erin! Op de kaart staat een groot rood kruis.',
      soundCue: 'splash',
      choices: [
        {
          id: 'kies-grot',
          text: 'Verken het donkere grottenpad achter de palmbomen',
          nextSceneId: 'fluistergrot',
          emoji: '🦇',
        },
        {
          id: 'kies-vuurtoren',
          text: 'Klim naar de hoge vuurtoren om over de zee te kijken',
          nextSceneId: 'vuurtoren-top',
          emoji: '🗼',
        },
      ],
    },
    'fluistergrot': {
      id: 'fluistergrot',
      title: 'De Fluisterende Grot',
      illustration: '🕯️💎🦇',
      text: 'In de koele grot weerkaatst het geluid van waterdruppels: tik... tik... tik. Aan de wand fonkelen blauwe kristallen! Voor je zie je een stenen poort met drie vreemde letters ingekerfd: M - A - N.',
      soundCue: 'bell',
      choices: [
        {
          id: 'kies-woord',
          text: 'Spreek het geheime woord "MAAN" uit om de poort te openen',
          nextSceneId: 'schatkamer-vondst',
          emoji: '🌙',
        },
        {
          id: 'kies-fakkel',
          text: 'Steek een gouden fakkel aan om een zijgang te inspecteren',
          nextSceneId: 'ondergrondse-waterval',
          emoji: '🔥',
        },
      ],
    },
    'vuurtoren-top': {
      id: 'vuurtoren-top',
      title: 'De Hoge Vuurtoren',
      illustration: '🗼🦜🔭',
      text: 'Bovenin de vuurtoren waait een frisse zeewind. Papegaai Coco strijkt neer op je schouder en krast: "Kijk door de grote koperen kijker, Kapitein!" Door de lens zie je een zandbank waar dolfijnen vrolijk rondspringen bij een oud scheepswrak.',
      soundCue: 'splash',
      choices: [
        {
          id: 'kies-wrak',
          text: 'Pak het snelle vlot en vaar naar het geheimzinnige wrak',
          nextSceneId: 'schip-wrak',
          emoji: '⛵',
        },
        {
          id: 'kies-licht',
          text: 'Draai aan het grote vuurtorenrad om het gouden licht aan te steken',
          nextSceneId: 'vuurtoren-feest',
          emoji: '💡',
        },
      ],
    },
    'ondergrondse-waterval': {
      id: 'ondergrondse-waterval',
      title: 'De Kristalwaterval',
      illustration: '🌊✨💎',
      text: 'Achter het gordijn van vallend water staat een eeuwenoude houten kist met koperen beslag. Er hangt een label aan: "Voor de dapperste ontdekker van Jarens Eiland"!',
      soundCue: 'chest',
      starsReward: 3,
      choices: [
        {
          id: 'kies-open-kist',
          text: 'Open de kist met de gouden scheepssleutel!',
          nextSceneId: 'grote-finale',
          emoji: '🔑',
        },
      ],
    },
    'schip-wrak': {
      id: 'schip-wrak',
      title: 'Het Geheime Piratenschip',
      illustration: '🏴‍☠️🚢🪙',
      text: 'Het schip ligt rustig in het ondiepe turquoise water. Op het dek vind je een schatkist vol glanzende munten, een echte kapiteinsjas en een briefje van Kapitein Roodbaard: "Goed gevaren, Jaren!"',
      soundCue: 'chest',
      starsReward: 3,
      choices: [
        {
          id: 'kies-schip-feest',
          text: 'Hijsen die zeilen en terugvaren naar de haven!',
          nextSceneId: 'grote-finale',
          emoji: '🎉',
        },
      ],
    },
    'schatkamer-vondst': {
      id: 'schatkamer-vondst',
      title: 'De Poort Gaat Open!',
      illustration: '🚪✨👑',
      text: 'Met een diep gezoem schuiven de stenen deuren open. Een warme gouden gloed verlicht een prachtige kamer vol kronen, edelstenen en vrolijke zeeschelpen.',
      soundCue: 'jig',
      starsReward: 4,
      choices: [
        {
          id: 'kies-feest',
          text: 'Vier de overwinning met alle eilandbewoners!',
          nextSceneId: 'grote-finale',
          emoji: '🎊',
        },
      ],
    },
    'vuurtoren-feest': {
      id: 'vuurtoren-feest',
      title: 'Het Gouden Licht',
      illustration: '✨🗼🌟',
      text: 'Het gouden baken schijnt over de hele oceaan! Alle schepen in de verte toeteren vrolijk ter ere van Kapitein Jaren. Uit het kraaiennest regent het glinsterende sterren!',
      soundCue: 'bell',
      starsReward: 3,
      choices: [
        {
          id: 'kies-verder',
          text: 'Klim naar beneden voor het grote piratenbanket!',
          nextSceneId: 'grote-finale',
          emoji: '🥞',
        },
      ],
    },
    'grote-finale': {
      id: 'grote-finale',
      title: 'Eilandfeest & Beloning!',
      illustration: '🏆🦜🏴‍☠️✨',
      text: 'Hoera! Het hele eiland viert feest. Papegaai Coco zingt een piratenlied en je hebt bewezen een echte meester-verkenner te zijn. Je verdient de gouden Ontdekkers-Medaille!',
      soundCue: 'jig',
      starsReward: 5,
      choices: [
        {
          id: 'herstart-verhaal',
          text: 'Lees het avontuur opnieuw en maak andere keuzes',
          nextSceneId: 'strand-start',
          emoji: '🔄',
        },
      ],
    },
  },
};

const STORIES_STORAGE_KEY = 'je_custom_adventures';

export function loadAllAdventures(): StoryAdventure[] {
  if (typeof window === 'undefined') return [DEFAULT_PIRATE_ADVENTURE];
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    if (!raw) return [DEFAULT_PIRATE_ADVENTURE];
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length > 0) {
      return [DEFAULT_PIRATE_ADVENTURE, ...list.filter((a) => a.id !== DEFAULT_PIRATE_ADVENTURE.id)];
    }
    return [DEFAULT_PIRATE_ADVENTURE];
  } catch {
    return [DEFAULT_PIRATE_ADVENTURE];
  }
}

export function saveCustomAdventures(adventures: StoryAdventure[]): void {
  if (typeof window === 'undefined') return;
  try {
    const customOnly = adventures.filter((a) => a.id !== DEFAULT_PIRATE_ADVENTURE.id);
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.warn('Kon verhalen niet opslaan:', err);
  }
}
