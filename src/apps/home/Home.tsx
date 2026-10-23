import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Hammer,
  MapPin,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { BottleMessageModal } from '../../components/BottleMessageModal';
import { PearlDiverGame } from '../../components/PearlDiverGame';
import {
  DECORATION_TEMPLATES,
  loadIslandDecorations,
  type PlacedDecoration,
} from '../../platform/decorationsCatalog';
import { usePlatform } from '../../platform/PlatformContext';
import {
  playChestOpen,
  playPop,
  playShipBell,
  playSplash,
  playCannon,
  playPirateJig,
} from '../../platform/sound';
import { useTheme } from '../../platform/ThemeContext';
import { useSpeech } from '../../platform/useSpeech';

import { PietPiraatModal } from '../../components/PietPiraatModal';
import { JarenAvatar } from '../../components/JarenAvatar';

type IslandDestination = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  color: string;
  border: string;
  to: string;
  mapCoords: { x: number; y: number };
};

const ISLANDS: IslandDestination[] = [
  {
    id: 'piet',
    title: 'De Scheve Schuit',
    subtitle: 'Praat met Kapitein Piet Piraat & crew',
    icon: '🏴‍☠️',
    badge: 'Piet Piraat',
    color: 'from-amber-600 to-amber-800',
    border: 'border-amber-500',
    to: '/piet',
    mapCoords: { x: 50, y: 76 },
  },
  {
    id: 'planner',
    title: 'De Planner Haven',
    subtitle: 'Agenda, routines & boodschappen',
    icon: '⚓',
    badge: 'Dagplanning',
    color: 'from-blue-500 to-sky-600',
    border: 'border-blue-400',
    to: '/planner',
    mapCoords: { x: 18, y: 22 },
  },
  {
    id: 'learning',
    title: 'Schatzoekers Leren',
    subtitle: 'Letters, woorden & vissen tellen',
    icon: '🏝️',
    badge: 'Groep 3 / VLL',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400',
    to: '/leren',
    mapCoords: { x: 78, y: 20 },
  },
  {
    id: 'treasure',
    title: 'Piraten Schatkamer',
    subtitle: 'Avatar outfits, beloningen & soundboard',
    icon: '🪙',
    badge: 'Schatten',
    color: 'from-amber-400 to-yellow-500',
    border: 'border-amber-400',
    to: '/schatkamer',
    mapCoords: { x: 50, y: 48 },
  },
  {
    id: 'decorator',
    title: 'Eiland-Bouwer',
    subtitle: 'Versier jouw eiland met palmen & schepen',
    icon: '🛠️',
    badge: 'Bouwen',
    color: 'from-teal-500 to-emerald-600',
    border: 'border-teal-400',
    to: '/versieren',
    mapCoords: { x: 50, y: 22 },
  },
  {
    id: 'story',
    title: 'Piraten Avontuur',
    subtitle: 'Kies-je-eigen-verhaal & ontdekkingen',
    icon: '📖',
    badge: 'Verhaal',
    color: 'from-violet-500 to-purple-600',
    border: 'border-purple-400',
    to: '/verhaal',
    mapCoords: { x: 22, y: 74 },
  },
  {
    id: 'checkin',
    title: 'Het Logboek',
    subtitle: 'Hoe voel je je en hoeveel energie?',
    icon: '🌅',
    badge: 'Dagcheck',
    color: 'from-orange-500 to-amber-500',
    border: 'border-orange-400',
    to: '/dagcheck',
    mapCoords: { x: 76, y: 72 },
  },
  {
    id: 'emotions',
    title: 'Het Emotie Kompas',
    subtitle: 'Gevoelens gids & rustgevende bellen',
    icon: '🧭',
    badge: 'Gevoel',
    color: 'from-rose-500 to-pink-600',
    border: 'border-pink-400',
    to: '/gevoelens',
    mapCoords: { x: 88, y: 46 },
  },
  {
    id: 'theme',
    title: 'Thema Studio',
    subtitle: 'Kleuren, lettertypen & delen',
    icon: '🎨',
    badge: 'Studio',
    color: 'from-fuchsia-500 to-pink-500',
    border: 'border-fuchsia-400',
    to: '/thema',
    mapCoords: { x: 12, y: 48 },
  },
];

export function Home() {
  const navigate = useNavigate();
  const { childName, stars, earnStars } = usePlatform();
  const { theme } = useTheme();
  const speak = useSpeech();

  // Geplaatste eilandversieringen
  const [decorations] = useState<PlacedDecoration[]>(() => loadIslandDecorations());

  // Easter eggs staten
  const [bottleOpen, setBottleOpen] = useState(false);
  const [minigameOpen, setMinigameOpen] = useState(false);
  const [pietOpen, setPietOpen] = useState(false);
  const [dolphinSplash, setDolphinSplash] = useState(false);

  const handleDolphinClick = () => {
    if (dolphinSplash) return;
    playSplash();
    setDolphinSplash(true);
    speak('Splasshh! Een vrolijke dolfijn springt door de golven!');
    setTimeout(() => setDolphinSplash(false), 2400);
  };

  const handlePietClick = () => {
    playShipBell();
    setPietOpen(true);
  };

  const handleBottleClick = () => {
    playShipBell();
    setBottleOpen(true);
  };

  const handleMinigameClick = () => {
    playShipBell();
    setMinigameOpen(true);
  };

  const handleDecorationClick = (e: React.MouseEvent, item: PlacedDecoration) => {
    e.stopPropagation();
    const tpl = DECORATION_TEMPLATES.find((t) => t.type === item.type);
    if (!tpl) return;

    if (tpl.sound === 'chest') playChestOpen();
    else if (tpl.sound === 'bell') playShipBell();
    else if (tpl.sound === 'cannon') playCannon();
    else if (tpl.sound === 'splash') playSplash();
    else if (tpl.sound === 'jig') playPirateJig();
    else playPop();

    speak(tpl.interactiveSaying);
  };

  return (
    <div className="hub-home space-y-6 sm:space-y-8 animate-in fade-in pb-12 select-none">
      {/* Easter Egg Modals */}
      <BottleMessageModal
        isOpen={bottleOpen}
        onClose={() => setBottleOpen(false)}
        childName={childName}
      />

      <PearlDiverGame
        isOpen={minigameOpen}
        onClose={() => setMinigameOpen(false)}
        onRewardStars={(s) => earnStars(s, 'Parel-duiker minigame beloning')}
        childName={childName}
      />

      <PietPiraatModal
        isOpen={pietOpen}
        onClose={() => setPietOpen(false)}
        childName={childName}
      />

      {/* Top Welcome Banner met Schatzoeker Status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-xl text-sky-950 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* Avatar Icon */}
          <JarenAvatar
            size="xl"
            onClick={() => navigate('/schatkamer')}
            title="Bekijk de Schatkamer & jouw Avatar!"
          />

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 px-3 py-1 rounded-full border border-amber-600/20">
                Pirateneiland Kaart
              </span>
              <button
                type="button"
                onClick={() =>
                  speak(
                    `Ahoy Kapitein ${childName}! Welkom op jouw Schateiland. Praat met Kapitein Piet Piraat of kies een bestemming op de kaart!`,
                  )
                }
                className="p-1 rounded-lg text-amber-900 hover:bg-amber-400/40 transition-colors"
                title="Lees begroeting voor"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-950 mt-1">
              Ahoy, Kapitein {childName}!
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-0.5">
              Welkom op jouw Schateiland. De Scheve Schuit ligt klaar in de haven!
            </p>
          </div>
        </div>

        {/* Interactieve Actieknoppen & Geheimen */}
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          {/* Praat met Piet Piraat Knop (Belangrijkste nieuwe functie) */}
          <button
            type="button"
            onClick={handlePietClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-amber-100 font-black text-xs sm:text-sm rounded-2xl border-2 border-amber-400 shadow-lg transition-all transform hover:scale-105 active:scale-95 animate-bounce"
            style={{ animationDuration: '4s' }}
            title="Praat met Kapitein Piet Piraat en zijn crew!"
          >
            <span className="text-xl">🏴‍☠️</span>
            <span>Praat met Piet!</span>
          </button>

          {/* Eiland Versieren Knop */}
          <button
            type="button"
            onClick={() => {
              playPop();
              navigate('/versieren');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm transition-all transform hover:scale-105 active:scale-95"
            title="Versier het eiland met palmen, schepen en schatkisten!"
          >
            <Hammer size={17} />
            <span>Versier Eiland</span>
          </button>

          {/* Flessenpost Easter Egg Knop */}
          <button
            type="button"
            onClick={handleBottleClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-50 text-amber-950 font-black text-xs sm:text-sm rounded-2xl border-2 border-amber-400 shadow-sm transition-all transform hover:scale-105 active:scale-95"
            title="Aangespoelde Flessenpost openen!"
          >
            <span className="text-xl">🍾</span>
            <span>Flessenpost</span>
          </button>

          {/* Verborgen Minigame Knop */}
          <button
            type="button"
            onClick={handleMinigameClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-900 hover:bg-sky-800 text-amber-300 font-black text-xs sm:text-sm rounded-2xl border-2 border-sky-700 shadow-sm transition-all transform hover:scale-105 active:scale-95"
            title="Speel het verborgen Parel-Duikerspel!"
          >
            <span className="text-xl">🤿</span>
            <span>Parel-Duiker</span>
          </button>
        </div>
      </div>

      {/* Featured Piet Piraat & Piraat Jaren Scheve Schuit Banner */}
      <div
        onClick={() => {
          playShipBell();
          setPietOpen(true);
        }}
        className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border-4 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xl text-amber-100 flex flex-col md:flex-row items-center justify-between gap-5 cursor-pointer hover:border-amber-300 transition-all hover:shadow-2xl group overflow-hidden"
      >
        <div className="flex items-center gap-4 text-center md:text-left z-10">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-md shrink-0 group-hover:scale-105 transition-transform bg-amber-950">
            <img
              src="/assets/aistudio/image_4275cd55.png"
              alt="Kapitein Piet en Piraat Jaren op De Scheve Schuit"
              className="w-full h-full object-cover object-[50%_35%]"
            />
            <span className="absolute bottom-1 right-1 bg-amber-400 text-sky-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              Piraat Jaren!
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-600/70 text-amber-200 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-400/30">
              <span>🏴‍☠️</span>
              <span>Aan het roer van De Scheve Schuit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
              Kapitein Piet & Piraat Jaren!
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium max-w-xl mt-0.5">
              Kijk eens aan het roer! Piraat Jaren en Kapitein Piet kiezen samen het ruime sop. Tik hier om live met Piet te praten of ga aan boord van het schip!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <Link
            to="/piet"
            onClick={(e) => {
              e.stopPropagation();
              playPop();
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Aan Boord ➔
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePietClick();
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-600 text-amber-100 font-black text-xs sm:text-sm border border-amber-400/50 shadow-md transition-all active:scale-95"
          >
            Praat met Piet 💬
          </button>
        </div>
      </div>

      {/* --- SCHATKAART WEERGAVE MODUS --- */}
      {theme.layout === 'map' ? (
        <div className="relative bg-amber-100/85 border-4 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[560px] flex flex-col justify-between">
          {/* Perkament achtergrond & schatkaart textuur */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Windroos kompas in de hoek */}
          <div
            className="absolute top-4 right-5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-4xl select-none z-10"
            onClick={handleMinigameClick}
            title="Geheim kompas! Tik om te duiken"
          >
            🧭
          </div>

          {/* Interactieve dolfijn in de zee */}
          <div
            onClick={handleDolphinClick}
            className="absolute bottom-6 left-8 text-3xl sm:text-4xl cursor-pointer hover:scale-125 transition-transform select-none z-10"
            title="Tik op de dolfijn!"
          >
            🐬 {dolphinSplash ? <span className="text-sm font-black text-sky-700 ml-1">SPLASH!</span> : null}
          </div>

          {/* Deinend Piratenschip van Piet Piraat: De Scheve Schuit! */}
          <div
            onClick={handlePietClick}
            className="absolute top-1/2 left-8 cursor-pointer hover:scale-125 transition-transform select-none z-20 group"
            title="De Scheve Schuit! Tik om met Piet Piraat te praten"
          >
            <div className="text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
              ⛵
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
              De Scheve Schuit 🏴‍☠️
            </div>
          </div>

          {/* GEPLAATSTE EILANDVERSIERINGEN (UIT DECORATOR MODE) */}
          {decorations.map((item) => {
            const tpl = DECORATION_TEMPLATES.find((t) => t.type === item.type);
            return (
              <div
                key={item.instanceId}
                onClick={(e) => handleDecorationClick(e, item)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 cursor-pointer hover:scale-125 active:scale-95 select-none z-10 group"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`,
                }}
                title={tpl ? `${tpl.name} - Tik om te horen!` : 'Decoratie'}
              >
                <div className="text-3xl sm:text-4xl filter drop-shadow-md">
                  {item.type === 'piraat_jaren_standee' ? (
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-amber-950">
                      <img
                        src="/assets/aistudio/image_4275cd55.png"
                        alt="Piraat Jaren"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: '72% 38%', transform: 'scale(1.75)' }}
                      />
                    </div>
                  ) : (
                    tpl?.emoji ?? '🌴'
                  )}
                </div>
              </div>
            );
          })}

          {/* Schatkaart knooppunten & bestemmingen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20 my-auto pt-6">
            {ISLANDS.map((island) => (
              <Link
                key={island.id}
                to={island.to}
                onClick={() => {
                  playPop();
                  speak(island.title);
                }}
                className="group relative bg-white/95 hover:bg-white border-3 border-amber-300 hover:border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1.5 active:translate-y-0 flex items-center gap-3.5 text-left"
              >
                {/* Icoon cirkel */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${island.color} text-white flex items-center justify-center text-3xl sm:text-4xl shadow-md group-hover:scale-110 transition-transform shrink-0`}
                >
                  {island.icon}
                </div>

                <div className="min-w-0 flex-1">
                  {island.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-block mb-1">
                      {island.badge}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors truncate">
                    {island.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
                    {island.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-amber-800/80 border-t border-amber-300/60 pt-3 z-20">
            <span className="flex items-center gap-1.5">
              <span>🗺️ Schatkaart van Kapitein {childName}</span>
              <span className="text-amber-600">· {decorations.length} versieringen</span>
            </span>
            <Link
              to="/versieren"
              className="text-amber-800 hover:text-amber-950 underline font-black"
            >
              Versier het eiland ➔
            </Link>
          </div>
        </div>
      ) : (
        /* --- STANDAARD RASTER / STRIP WEERGAVE --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ISLANDS.map((island) => (
            <Link
              key={island.id}
              to={island.to}
              onClick={() => {
                playPop();
                speak(island.title);
              }}
              className="group bg-white hover:bg-amber-50/50 border-3 border-slate-200 hover:border-amber-400 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    {island.icon}
                  </span>
                  {island.badge && (
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                      {island.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  {island.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {island.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Ontdekken</span>
                <span>➔</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
