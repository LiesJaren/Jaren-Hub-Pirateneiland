export type BodyPlaceId = 'hoofd' | 'keel' | 'buik' | 'armen' | 'benen' | 'overal';

export type BodyPlace = {
  id: BodyPlaceId;
  emoji: string;
  label: string;
};

export const bodyPlaces: BodyPlace[] = [
  { id: 'hoofd', emoji: '🧠', label: 'In mijn hoofd' },
  { id: 'keel', emoji: '🗣️', label: 'In mijn keel' },
  { id: 'buik', emoji: '🫄', label: 'In mijn buik' },
  { id: 'armen', emoji: '💪', label: 'In mijn armen' },
  { id: 'benen', emoji: '🦵', label: 'In mijn benen' },
  { id: 'overal', emoji: '🌊', label: 'Overal' },
];

export type EmotionSign = {
  place: BodyPlaceId;
  emoji: string;
  title: string;
  text: string;
};

export type EmotionHelp = {
  id: string;
  emoji: string;
  title: string;
  text: string;
};

export type EmotionGuide = {
  intro: string;
  signs: EmotionSign[];
  helps: EmotionHelp[];
  talk: string;
  parentTip: string;
};

export const emotionGuides: Record<string, EmotionGuide> = {
  blij: {
    intro:
      'Blij voelt licht. Je krijgt zin om te lachen, te bewegen of iets moois te delen.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je gedachten voelen licht. Je denkt: dit is fijn!',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt warm of kriebelig, alsof er vlinders in zitten.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen willen zwaaien, knuffelen of iemand vastpakken.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen willen springen, dansen of heel snel lopen.',
      },
    ],
    helps: [
      {
        id: 'delen',
        emoji: '💬',
        title: 'Delen',
        text: 'Vertel aan iemand wat je blij maakt. Samen blij zijn is nog fijner.',
      },
      {
        id: 'bewegen',
        emoji: '🤸',
        title: 'Bewegen',
        text: 'Dans, spring of loop een rondje. Laat je lichaam meedoen.',
      },
      {
        id: 'lachen',
        emoji: '😄',
        title: 'Lachen',
        text: 'Zoek een grapje of lach samen. Lachen lucht op.',
      },
    ],
    talk: 'Ik ben blij omdat ...',
    parentTip:
      'Vraag waar de blijheid vandaan komt. Benoem het samen, dan leert Jaren zijn goede gevoelens herkennen.',
  },
  rustig: {
    intro:
      'Rustig voelt zacht. Je adem gaat langzaam en je hoeft even niets te doen.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je gedachten gaan langzaam. Het is niet druk in je hoofd.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt zacht en ontspannen. Je adem komt diep.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen voelen loom of zwaar. Je hoeft niets vast te houden.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen staan stevig op de grond. Je voelt je stabiel.',
      },
    ],
    helps: [
      {
        id: 'ademen',
        emoji: '🌬️',
        title: 'Ademen',
        text: 'Adem rustig in door je neus en laat je adem langzaam weer gaan.',
      },
      {
        id: 'muziek',
        emoji: '🎵',
        title: 'Muziek',
        text: 'Luister naar een rustig liedje. Laat je gedachten meedrijven.',
      },
      {
        id: 'buiten',
        emoji: '🌳',
        title: 'Buiten',
        text: 'Ga even naar buiten. Kijk naar de lucht of luister naar de vogels.',
      },
      {
        id: 'knuffel',
        emoji: '🫂',
        title: 'Een knuffel',
        text: 'Pak een knuffel of dekentje. Dat mag gewoon even.',
      },
    ],
    talk: 'Ik voel me rustig als ...',
    parentTip:
      'Rust is ook een gevoel. Laat het even duren en onderbreek het niet te snel met een nieuwe vraag.',
  },
  gewoon: {
    intro:
      'Gewoon is niet saai. Het betekent dat er even niets bijzonders is. Dat is oké.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je hoofd is niet vol en niet leeg. Er is ruimte.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt kalm. Er gebeurt niet veel.',
      },
      {
        place: 'overal',
        emoji: '🌊',
        title: 'Overal',
        text: 'Je lichaam voelt gewoon. Niets doet pijn en niets kriebelt.',
      },
    ],
    helps: [
      {
        id: 'bewegen',
        emoji: '🤸',
        title: 'Bewegen',
        text: 'Soms wordt gewoon fijner als je even beweegt of buiten gaat spelen.',
      },
      {
        id: 'water',
        emoji: '💧',
        title: 'Water drinken',
        text: 'Een slok water helpt je lichaam om wakker en fris te blijven.',
      },
      {
        id: 'contact',
        emoji: '👋',
        title: 'Iemand gedag zeggen',
        text: 'Een klein gesprekje kan een gewone dag bijzonder maken.',
      },
    ],
    talk: 'Vandaag voelt gewoon, want ...',
    parentTip:
      'Ook “gewoon” mag je benoemen. Zo leert Jaren dat niet elk moment groot of bijzonder hoeft te zijn.',
  },
  moe: {
    intro:
      'Moe betekent dat je lichaam om rust vraagt. Dat is geen zwakte. Je hebt veel gedaan.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je hoofd voelt vol of duf. Denken gaat langzamer.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen voelen zwaar. Je wilt ze laten hangen.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen voelen moe. Je wilt liever zitten of liggen.',
      },
      {
        place: 'overal',
        emoji: '🌊',
        title: 'Overal',
        text: 'Je hele lichaam zegt: even stoppen, alsjeblieft.',
      },
    ],
    helps: [
      {
        id: 'rusten',
        emoji: '🛏️',
        title: 'Rusten',
        text: 'Ga even liggen of zitten. Je hoeft niets te doen.',
      },
      {
        id: 'water',
        emoji: '💧',
        title: 'Water drinken',
        text: 'Soms helpt een slok water om je weer een beetje wakker te voelen.',
      },
      {
        id: 'buiten',
        emoji: '🌳',
        title: 'Buiten',
        text: 'Een beetje frisse lucht kan je lichaam wakker maken.',
      },
      {
        id: 'verhaal',
        emoji: '📖',
        title: 'Een verhaal',
        text: 'Luister naar een rustig verhaal. Dan mag je hoofd loslaten.',
      },
    ],
    talk: 'Ik ben moe omdat ...',
    parentTip:
      'Moe is een signaal, geen probleem. Help zoeken naar rust in plaats van doorduwen.',
  },
  verdrietig: {
    intro:
      'Verdrietig voelt zwaar. Je kan willen huilen of stil zijn. Dat mag. Tranen helpen soms.',
    signs: [
      {
        place: 'keel',
        emoji: '🗣️',
        title: 'In je keel',
        text: 'Je keel voelt dik. Praten lukt even niet zo goed.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt leeg of doet een beetje pijn.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen voelen zwaar. Je wilt je misschien verstoppen.',
      },
      {
        place: 'overal',
        emoji: '🌊',
        title: 'Overal',
        text: 'Het voelt alsof er een zware deken over je heen ligt.',
      },
    ],
    helps: [
      {
        id: 'knuffel',
        emoji: '🫂',
        title: 'Een knuffel',
        text: 'Vraag een knuffel of pak je lievelingsknuffel. Dichtbij iemand voelt goed.',
      },
      {
        id: 'praten',
        emoji: '💬',
        title: 'Praten',
        text: 'Vertel wat er gebeurd is. Je hoeft het niet alleen te dragen.',
      },
      {
        id: 'ademen',
        emoji: '🌬️',
        title: 'Ademen',
        text: 'Adem een paar keer rustig in en uit. Je lichaam mag tot rust komen.',
      },
      {
        id: 'alleen',
        emoji: '🌙',
        title: 'Even alleen',
        text: 'Soms wil je even alleen zijn. Zeg het wel, zodat iemand weet waar je bent.',
      },
    ],
    talk: 'Ik ben verdrietig omdat ...',
    parentTip:
      'Blijf dichtbij zonder meteen op te lossen. Benoem het verdriet en laat weten dat het er mag zijn.',
  },
  boos: {
    intro:
      'Boos betekent dat iets niet eerlijk of niet fijn voelt. Je lichaam maakt zich klaar om te reageren.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je hoofd voelt warm. Je gedachten gaan snel.',
      },
      {
        place: 'keel',
        emoji: '🗣️',
        title: 'In je keel',
        text: 'Je wilt schreeuwen of heel hard praten.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt gespannen, alsof er een knoop in zit.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je vuisten ballen zich. Je armen willen duwen of slaan.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen willen stampen of weglopen.',
      },
    ],
    helps: [
      {
        id: 'ademen',
        emoji: '🌬️',
        title: 'Eerst ademen',
        text: 'Adem drie keer rustig. Dan kan je lichaam een beetje afkoelen.',
      },
      {
        id: 'bewegen',
        emoji: '🤸',
        title: 'Bewegen',
        text: 'Stamp 10 keer, schud je armen of loop een rondje. Laat de energie eruit.',
      },
      {
        id: 'praten',
        emoji: '💬',
        title: 'Praten',
        text: 'Zeg wat niet oké was. “Ik ben boos omdat ...” helpt om het uit te leggen.',
      },
      {
        id: 'alleen',
        emoji: '🌙',
        title: 'Even alleen',
        text: 'Zoek een rustig plekje tot je lichaam kalmer is. Kom daarna terug.',
      },
    ],
    talk: 'Ik ben boos omdat ...',
    parentTip:
      'Boos is een grens. Help benoemen wat niet oké was, zonder de boosheid zelf af te keuren.',
  },
  bang: {
    intro:
      'Bang betekent dat je je wilt beschermen. Je lichaam let extra goed op. Dat is handig, maar kan ook vermoeiend zijn.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je hoofd maakt veel gedachten. Je let op alles tegelijk.',
      },
      {
        place: 'keel',
        emoji: '🗣️',
        title: 'In je keel',
        text: 'Je keel voelt droog of je durft even niets te zeggen.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt kriebelig of heeft een knoop.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen voelen stijf. Je wilt je vasthouden of wegduwen.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen willen wegrennen of staan juist stil.',
      },
    ],
    helps: [
      {
        id: 'ademen',
        emoji: '🌬️',
        title: 'Ademen',
        text: 'Adem langzaam in en nog langer uit. Je lichaam krijgt het signaal: het is veilig.',
      },
      {
        id: 'knuffel',
        emoji: '🫂',
        title: 'Een knuffel',
        text: 'Dichtbij iemand zijn helpt je lichaam om te kalmeren.',
      },
      {
        id: 'praten',
        emoji: '💬',
        title: 'Praten',
        text: 'Vertel waar je bang voor bent. Samen kijken maakt het vaak kleiner.',
      },
      {
        id: 'licht',
        emoji: '💡',
        title: 'Een lichtje',
        text: 'Doe een lampje aan of houd iets vertrouwds vast.',
      },
    ],
    talk: 'Ik ben bang voor ...',
    parentTip:
      'Neem de angst serieus. Veiligheid eerst, uitleg later. Kleine stappen zijn beter dan wegduwen.',
  },
  trots: {
    intro:
      'Trots voelt warm en groot. Je hebt iets gedaan dat je belangrijk vindt, ook als het moeilijk was.',
    signs: [
      {
        place: 'hoofd',
        emoji: '🧠',
        title: 'In je hoofd',
        text: 'Je denkt: dat heb ik gedaan! Je hoofd wil rechtop.',
      },
      {
        place: 'buik',
        emoji: '🫄',
        title: 'In je buik',
        text: 'Je buik voelt warm en stevig.',
      },
      {
        place: 'armen',
        emoji: '💪',
        title: 'In je armen',
        text: 'Je armen willen omhoog of iemand high-five geven.',
      },
      {
        place: 'benen',
        emoji: '🦵',
        title: 'In je benen',
        text: 'Je benen staan stevig. Je voelt je groot.',
      },
    ],
    helps: [
      {
        id: 'delen',
        emoji: '💬',
        title: 'Delen',
        text: 'Vertel wat je gedaan hebt. Iemand anders mag trots met je meevoelen.',
      },
      {
        id: 'vieren',
        emoji: '🎉',
        title: 'Vieren',
        text: 'Doe een klein dansje of geef een high-five. Je mag trots zijn.',
      },
      {
        id: 'bewegen',
        emoji: '🤸',
        title: 'Bewegen',
        text: 'Spring even of loop rond. Je lichaam wil de trots kwijt.',
      },
    ],
    talk: 'Ik ben trots omdat ...',
    parentTip:
      'Benoem de inzet, niet alleen het resultaat. “Je hebt doorgezet” is krachtiger dan “Knap!”.',
  },
};

export type ToolId = 'ademen' | '54321' | 'praten' | 'bewegen';

export type CalmTool = {
  id: ToolId;
  emoji: string;
  title: string;
  text: string;
};

export const calmTools: CalmTool[] = [
  {
    id: 'ademen',
    emoji: '🌬️',
    title: 'Ademen',
    text: 'Adem rustig in en uit. Volg de bel.',
  },
  {
    id: '54321',
    emoji: '🖐️',
    title: '5-4-3-2-1',
    text: 'Kom terug in het nu met je zintuigen.',
  },
  {
    id: 'praten',
    emoji: '💬',
    title: 'Praten',
    text: 'Zeg wat je voelt met een zin.',
  },
  {
    id: 'bewegen',
    emoji: '🤸',
    title: 'Bewegen',
    text: 'Laat de energie eruit.',
  },
];

export const intensityOptions = [
  {
    value: 1 as const,
    emoji: '🫧',
    label: 'Een beetje',
    text: 'Het is er, maar niet zo groot.',
  },
  {
    value: 2 as const,
    emoji: '🌊',
    label: 'Veel',
    text: 'Ik voel het duidelijk.',
  },
  {
    value: 3 as const,
    emoji: '🌪️',
    label: 'Heel veel',
    text: 'Het neemt bijna alles in.',
  },
];

export type Intensity = 1 | 2 | 3;

export function guideFor(moodId: string): EmotionGuide {
  return emotionGuides[moodId] ?? emotionGuides.gewoon;
}
