import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Check,
  Home,
  Minus,
  Plus,
  RefreshCw,
  RotateCw,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import {
  DECORATION_TEMPLATES,
  DEFAULT_ISLAND_DECORATIONS,
  loadIslandDecorations,
  PRESET_ISLAND_LAYOUTS,
  saveIslandDecorations,
  type DecorationTemplate,
  type PlacedDecoration,
} from '../../platform/decorationsCatalog';
import { usePlatform } from '../../platform/PlatformContext';
import {
  playChestOpen,
  playCoin,
  playPop,
  playShipBell,
  playSplash,
  playSuccess,
  playCannon,
  playPirateJig,
} from '../../platform/sound';
import { useSpeech } from '../../platform/useSpeech';

export default function IslandDecoratorApp() {
  const navigate = useNavigate();
  const { childName } = usePlatform();
  const speak = useSpeech();

  const [decorations, setDecorations] = useState<PlacedDecoration[]>(() =>
    loadIslandDecorations(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [saveToast, setSaveToast] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragInfoRef = useRef<{
    instanceId: string;
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    isDragging: boolean;
  } | null>(null);

  // Geluid afspelen bij template
  const playSoundForTemplate = (tpl: DecorationTemplate) => {
    switch (tpl.sound) {
      case 'chest':
        playChestOpen();
        break;
      case 'bell':
        playShipBell();
        break;
      case 'cannon':
        playCannon();
        break;
      case 'splash':
        playSplash();
        break;
      case 'jig':
        playPirateJig();
        break;
      default:
        playPop();
    }
  };

  // Nieuwe decoratie toevoegen aan het eiland
  const handleAddDecoration = (tpl: DecorationTemplate) => {
    playSoundForTemplate(tpl);
    const newId = `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Willekeurige startpositie nabij het midden
    const offsetX = Math.floor(Math.random() * 40) + 30;
    const offsetY = Math.floor(Math.random() * 40) + 30;

    const newItem: PlacedDecoration = {
      instanceId: newId,
      type: tpl.type,
      x: offsetX,
      y: offsetY,
      scale: tpl.defaultScale,
      rotation: 0,
    };

    setDecorations((prev) => {
      const next = [...prev, newItem];
      saveIslandDecorations(next);
      return next;
    });
    setSelectedId(newId);
  };

  // Pointer Down op geplaatste decoratie (start verslepen)
  const handleItemPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    instanceId: string,
  ) => {
    e.stopPropagation();
    setSelectedId(instanceId);

    const targetItem = decorations.find((d) => d.instanceId === instanceId);
    if (!targetItem) return;

    dragInfoRef.current = {
      instanceId,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: targetItem.x,
      startElemY: targetItem.y,
      isDragging: false,
    };

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
  };

  // Pointer Move (verslepen over het canvas)
  const handleItemPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current || !canvasRef.current) return;
    const { instanceId, startX, startY, startElemX, startElemY } = dragInfoRef.current;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - startX) / rect.width) * 100;
    const deltaY = ((e.clientY - startY) / rect.height) * 100;

    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      dragInfoRef.current.isDragging = true;
    }

    const nextX = Math.max(5, Math.min(95, startElemX + deltaX));
    const nextY = Math.max(8, Math.min(92, startElemY + deltaY));

    setDecorations((prev) =>
      prev.map((d) =>
        d.instanceId === instanceId
          ? { ...d, x: Math.round(nextX * 10) / 10, y: Math.round(nextY * 10) / 10 }
          : d,
      ),
    );
  };

  // Pointer Up (einde verslepen)
  const handleItemPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current) return;
    const { isDragging, instanceId } = dragInfoRef.current;

    if (!isDragging) {
      // Tikje zonder slepen: interactief geluidje en spraak!
      const item = decorations.find((d) => d.instanceId === instanceId);
      if (item) {
        const tpl = DECORATION_TEMPLATES.find((t) => t.type === item.type);
        if (tpl) {
          playSoundForTemplate(tpl);
          speak(tpl.interactiveSaying);
        }
      }
    } else {
      saveIslandDecorations(decorations);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    dragInfoRef.current = null;
  };

  // Verwijderen
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    playPop();
    setDecorations((prev) => {
      const next = prev.filter((d) => d.instanceId !== selectedId);
      saveIslandDecorations(next);
      return next;
    });
    setSelectedId(null);
  };

  // Schaal aanpassen
  const handleScaleSelected = (delta: number) => {
    if (!selectedId) return;
    playPop();
    setDecorations((prev) => {
      const next = prev.map((d) =>
        d.instanceId === selectedId
          ? { ...d, scale: Math.max(0.6, Math.min(1.8, Math.round((d.scale + delta) * 10) / 10)) }
          : d,
      );
      saveIslandDecorations(next);
      return next;
    });
  };

  // Draaien
  const handleRotateSelected = () => {
    if (!selectedId) return;
    playPop();
    setDecorations((prev) => {
      const next = prev.map((d) => {
        if (d.instanceId !== selectedId) return d;
        let rot = d.rotation + 15;
        if (rot > 30) rot = -30;
        return { ...d, rotation: rot };
      });
      saveIslandDecorations(next);
      return next;
    });
  };

  // Preset toepassen
  const handleApplyPreset = (presetItems: PlacedDecoration[], name: string) => {
    playSuccess();
    setDecorations([...presetItems]);
    saveIslandDecorations([...presetItems]);
    setSelectedId(null);
    speak(`Layout "${name}" geladen!`);
  };

  // Leegmaken
  const handleClearAll = () => {
    playPop();
    setDecorations([]);
    saveIslandDecorations([]);
    setSelectedId(null);
  };

  // Opslaan & Klaar
  const handleSaveAndDone = () => {
    playSuccess();
    saveIslandDecorations(decorations);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {}
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      navigate('/');
    }, 1200);
  };

  const selectedItem = decorations.find((d) => d.instanceId === selectedId);
  const selectedTemplate = selectedItem
    ? DECORATION_TEMPLATES.find((t) => t.type === selectedItem.type)
    : null;

  const filteredTemplates =
    selectedCategory === 'alle'
      ? DECORATION_TEMPLATES
      : DECORATION_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in select-none">
      <PageHeader
        title="Eiland-Bouwer & Versieren"
        subtitle="Sleep palmbomen, schatkisten, schepen en dieren op het eiland en bouw jouw droomwereld!"
        icon="🏝️"
      />

      {/* Top Actieknoppen */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl transition-all"
          >
            <Home size={16} />
            <span>Terug naar Schatkaart</span>
          </button>

          {/* Preset templates */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-xs font-bold text-slate-500">Klaarzetten:</span>
            {PRESET_ISLAND_LAYOUTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset.items, preset.name)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1"
                title={`Kies layout ${preset.name}`}
              >
                <span>{preset.icon}</span>
                <span className="hidden md:inline">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl transition-colors"
            title="Eiland helemaal leegmaken"
          >
            Leegmaken
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(DEFAULT_ISLAND_DECORATIONS, 'Standaard')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
            title="Herstel naar standaard eiland"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Standaard</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndDone}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            {saveToast ? <Check size={16} /> : <Sparkles size={16} />}
            <span>{saveToast ? 'Opgeslagen! 🎉' : 'Opslaan & Bekijken'}</span>
          </button>
        </div>
      </div>

      {/* --- LIVE INTERACTIEF EILAND CANVAS --- */}
      <div className="relative w-full">
        <div
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className="relative w-full h-[460px] sm:h-[540px] bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden cursor-pointer"
        >
          {/* Perkament & water textuur */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Tropisch eiland SVG achtergrond */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {/* Zandstrand eiland vorm in het midden */}
            <path
              d="M 120 480 C 180 320, 320 200, 520 210 C 720 220, 880 340, 890 490 C 890 560, 200 580, 120 480 Z"
              fill="#fef08a"
              opacity="0.75"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            {/* Groene heuvels in het midden van het eiland */}
            <path
              d="M 280 430 C 340 310, 480 270, 640 290 C 740 310, 780 420, 720 450 C 580 480, 340 470, 280 430 Z"
              fill="#86efac"
              opacity="0.6"
            />
          </svg>

          {/* Instructie banner in de hoek */}
          <div className="absolute top-4 left-4 bg-sky-950/80 backdrop-blur-xs text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full pointer-events-none shadow-sm flex items-center gap-1.5">
            <span>✨</span>
            <span>Sleep elementen over het eiland om ze te plaatsen!</span>
          </div>

          {/* Aantal geplaatste items */}
          <div className="absolute top-4 right-4 bg-white/90 text-slate-800 text-xs font-extrabold px-3 py-1.5 rounded-full pointer-events-none shadow-sm border border-slate-200">
            {decorations.length} items geplaatst
          </div>

          {/* GEPLAATSTE DECORATIES */}
          {decorations.map((item) => {
            const tpl = DECORATION_TEMPLATES.find((t) => t.type === item.type);
            const isSelected = item.instanceId === selectedId;

            return (
              <div
                key={item.instanceId}
                onPointerDown={(e) => handleItemPointerDown(e, item.instanceId)}
                onPointerMove={handleItemPointerMove}
                onPointerUp={handleItemPointerUp}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 cursor-grab active:cursor-grabbing select-none touch-none group ${
                  isSelected ? 'z-30' : 'z-20'
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`,
                }}
              >
                {/* Glow ring als geselecteerd */}
                {isSelected && (
                  <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-amber-500 bg-amber-400/20 animate-pulse pointer-events-none" />
                )}

                <div className="text-4xl sm:text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                  {item.type === 'piraat_jaren_standee' ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-amber-950 pointer-events-none">
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

          {/* ZWEVEND BEDIENINGSPANEEL VOOR HET GESELECTEERDE ITEM */}
          {selectedItem && selectedTemplate && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-2xl flex items-center gap-2 sm:gap-3 animate-in zoom-in-95 text-slate-800"
            >
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                <span className="text-2xl">{selectedTemplate.emoji}</span>
                <span className="text-xs font-black hidden sm:inline text-slate-900">
                  {selectedTemplate.name}
                </span>
              </div>

              {/* Schaal aanpassen */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleScaleSelected(-0.15)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold"
                  title="Kleiner maken"
                >
                  <Minus size={14} />
                </button>
                <span className="text-[11px] font-black px-1 text-slate-600">
                  {Math.round(selectedItem.scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => handleScaleSelected(0.15)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold"
                  title="Groter maken"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Draaien */}
              <button
                type="button"
                onClick={handleRotateSelected}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Draaien"
              >
                <RotateCw size={15} />
              </button>

              {/* Geluidje testen */}
              <button
                type="button"
                onClick={() => {
                  playSoundForTemplate(selectedTemplate);
                  speak(selectedTemplate.interactiveSaying);
                }}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                title="Geluidje testen"
              >
                <Volume2 size={15} />
              </button>

              {/* Verwijderen */}
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                title="Verwijder van eiland"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- INVENTARIS / PALET VAN DECORATIES ONDERAAN --- */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Kies Decoraties voor Kapitein {childName}'s Eiland
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tik op een item om het direct op het eiland te plaatsen.
            </p>
          </div>

          {/* Categorie filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'alle', label: 'Alles' },
              { id: 'natuur', label: 'Natuur 🌴' },
              { id: 'piraten', label: 'Piraten 🏴‍☠️' },
              { id: 'schatten', label: 'Schatten 🪙' },
              { id: 'dieren', label: 'Dieren 🦜' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playPop();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template items raster */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 pt-2 max-h-56 overflow-y-auto p-1">
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.type}
              type="button"
              onClick={() => handleAddDecoration(tpl)}
              className="p-3 bg-slate-50 hover:bg-amber-50 active:scale-95 border-2 border-slate-200 hover:border-amber-400 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-xs">
                {tpl.emoji}
              </span>
              <span className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">
                {tpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
