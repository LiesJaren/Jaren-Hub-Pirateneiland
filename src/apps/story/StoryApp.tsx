import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  BookOpen,
  Home,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { usePlatform } from '../../platform/PlatformContext';
import {
  playChestOpen,
  playPop,
  playShipBell,
  playSplash,
  playPirateJig,
  playSuccess,
} from '../../platform/sound';
import {
  DEFAULT_PIRATE_ADVENTURE,
  loadAllAdventures,
} from '../../platform/storyCatalog';
import { useSpeech } from '../../platform/useSpeech';
import type { StoryAdventure, StoryScene } from '../../platform/types';

export default function StoryApp() {
  const navigate = useNavigate();
  const { childName, earnStars } = usePlatform();
  const speak = useSpeech();

  const [adventures] = useState<StoryAdventure[]>(() => loadAllAdventures());
  const [selectedAdventure, setSelectedAdventure] = useState<StoryAdventure>(
    DEFAULT_PIRATE_ADVENTURE,
  );
  const [currentSceneId, setCurrentSceneId] = useState<string>(
    DEFAULT_PIRATE_ADVENTURE.startSceneId,
  );
  const [history, setHistory] = useState<string[]>([DEFAULT_PIRATE_ADVENTURE.startSceneId]);
  const [claimedScenes, setClaimedScenes] = useState<string[]>([]);

  const currentScene: StoryScene | undefined = selectedAdventure.scenes[currentSceneId];

  // Geluidseffect afspelen bij veranderen van scène
  useEffect(() => {
    if (!currentScene) return;

    if (currentScene.soundCue === 'bell') playShipBell();
    else if (currentScene.soundCue === 'chest') playChestOpen();
    else if (currentScene.soundCue === 'splash') playSplash();
    else if (currentScene.soundCue === 'jig') playPirateJig();

    // Eventuele sterrenbeloning uitdelen
    if (
      currentScene.starsReward &&
      !claimedScenes.includes(currentScene.id)
    ) {
      setClaimedScenes((prev) => [...prev, currentScene.id]);
      earnStars(currentScene.starsReward, `Verhaal ontdekking: ${currentScene.title}`);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  }, [currentScene, claimedScenes, earnStars]);

  const handleMakeChoice = (nextSceneId: string, choiceText: string) => {
    playPop();
    speak(choiceText);
    setCurrentSceneId(nextSceneId);
    setHistory((prev) => [...prev, nextSceneId]);
  };

  const handleRestart = () => {
    playPop();
    setCurrentSceneId(selectedAdventure.startSceneId);
    setHistory([selectedAdventure.startSceneId]);
  };

  const handlePrevious = () => {
    if (history.length <= 1) return;
    playPop();
    const nextHistory = [...history];
    nextHistory.pop();
    const prevScene = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);
    setCurrentSceneId(prevScene);
  };

  if (!currentScene) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-slate-600">Er ging iets mis met het verhaal.</p>
        <button
          type="button"
          onClick={handleRestart}
          className="mt-4 px-4 py-2 bg-amber-400 text-sky-950 font-bold rounded-xl"
        >
          Opnieuw beginnen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in">
      {/* Top navigatie en terugkeer-knop */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-200 shadow-sm transition-all"
        >
          <Home size={18} className="text-amber-500" />
          <span>Terug naar het Eiland</span>
        </button>

        {adventures.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Verhaal:</span>
            <select
              value={selectedAdventure.id}
              onChange={(e) => {
                const adv = adventures.find((a) => a.id === e.target.value);
                if (adv) {
                  setSelectedAdventure(adv);
                  setCurrentSceneId(adv.startSceneId);
                  setHistory([adv.startSceneId]);
                }
              }}
              className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
            >
              {adventures.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.coverEmoji} {a.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Verhaalkaart Boek */}
      <div className="bg-gradient-to-b from-amber-50 to-amber-100/90 border-4 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-slate-800">
        {/* Decoratieve hoekjes */}
        <div className="absolute top-3 left-4 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
          <BookOpen size={14} /> Hoofdstuk {history.length}
        </div>

        {/* Belonings badge indien sterren verdiend */}
        {currentScene.starsReward ? (
          <div className="absolute top-3 right-4 px-3.5 py-1 bg-amber-400 border border-amber-500 rounded-full font-black text-xs text-sky-950 flex items-center gap-1.5 shadow-sm animate-bounce">
            <Sparkles size={14} /> +{currentScene.starsReward} Sterren!
          </div>
        ) : null}

        {/* Grote Scène Illustratie */}
        <div className="my-6 text-center">
          <div className="text-6xl sm:text-7xl filter drop-shadow-md select-none inline-block p-4 bg-white/60 rounded-3xl border-2 border-amber-200">
            {currentScene.illustration}
          </div>
        </div>

        {/* Titel & Voorleestekst */}
        <div className="space-y-4 max-w-2xl mx-auto text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
              {currentScene.title}
            </h2>

            <button
              type="button"
              onClick={() => speak(`${currentScene.title}. ${currentScene.text}`)}
              className="inline-flex items-center gap-1.5 self-center sm:self-auto px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl transition-colors shrink-0"
              title="Lees dit hoofdstuk voor"
            >
              <Volume2 size={16} />
              <span>Voorlezen</span>
            </button>
          </div>

          <p className="text-base sm:text-lg text-amber-900 font-medium leading-relaxed">
            {currentScene.text}
          </p>
        </div>

        {/* Keuzes Sectie */}
        <div className="mt-8 pt-6 border-t-2 border-amber-200/80">
          <h3 className="text-center font-black text-sm uppercase tracking-wider text-amber-800 mb-4">
            Wat doet Kapitein {childName} nu?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {currentScene.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleMakeChoice(choice.nextSceneId, choice.text)}
                className="p-4 bg-white hover:bg-amber-200/70 active:scale-95 border-2 border-amber-300 hover:border-amber-400 rounded-2xl shadow-sm text-left flex items-start gap-3 transition-all group"
              >
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {choice.emoji ?? '👉'}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-amber-950 leading-snug">
                  {choice.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ondernavigatie in het boek */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-amber-200 text-xs font-bold text-amber-800">
          {history.length > 1 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-200/70 transition-colors"
            >
              <ArrowLeft size={16} /> Vorige pagina
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-200/70 transition-colors ml-auto"
          >
            <RotateCcw size={14} /> Opnieuw beginnen
          </button>
        </div>
      </div>
    </div>
  );
}
