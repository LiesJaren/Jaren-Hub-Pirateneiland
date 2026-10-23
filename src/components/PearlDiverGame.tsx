import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, X, Play, RotateCcw } from 'lucide-react';
import { playCoin, playPop, playSuccess, playSplash, playOops } from '../platform/sound';

interface PearlDiverGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardStars: (stars: number) => void;
  childName: string;
}

type FallingItem = {
  id: number;
  x: number;
  y: number;
  type: 'pearl' | 'coin' | 'star' | 'jellyfish';
  speed: number;
  emoji: string;
  points: number;
  size: number;
};

export function PearlDiverGame({ isOpen, onClose, onRewardStars, childName }: PearlDiverGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerX, setPlayerX] = useState(50); // percentage 0 - 100
  const [earnedStars, setEarnedStars] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const playerXRef = useRef<number>(50);

  playerXRef.current = playerX;

  // Start spel
  const startGame = useCallback(() => {
    playSuccess();
    setScore(0);
    setTimeLeft(30);
    setEarnedStars(0);
    itemsRef.current = [];
    setGameState('playing');
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen || gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerX((prev) => Math.max(8, prev - 7));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerX((prev) => Math.min(92, prev + 7));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, onClose]);

  // Touch & Mouse direct position tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(8, Math.min(92, (x / rect.width) * 100));
    setPlayerX(pct);
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Game over trigger
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      setGameState('gameover');
      playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // Bereken beloning: 1 ster per 10 punten, max 3 sterren
      const starsAwarded = score >= 25 ? 3 : score >= 12 ? 2 : score >= 4 ? 1 : 1;
      setEarnedStars(starsAwarded);
      onRewardStars(starsAwarded);
    }
  }, [gameState, timeLeft, score, onRewardStars]);

  // Game loop (physics, spawns, collisions)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isRunning = true;

    const gameLoop = (timestamp: number) => {
      if (!isRunning) return;

      // Spawn falling item every 600ms
      if (timestamp - lastSpawnRef.current > 550) {
        lastSpawnRef.current = timestamp;
        const rand = Math.random();
        let type: FallingItem['type'] = 'pearl';
        let emoji = '⚪';
        let points = 1;

        if (rand < 0.45) {
          type = 'pearl';
          emoji = '⚪';
          points = 1;
        } else if (rand < 0.75) {
          type = 'coin';
          emoji = '🪙';
          points = 2;
        } else if (rand < 0.88) {
          type = 'star';
          emoji = '⭐';
          points = 3;
        } else {
          type = 'jellyfish';
          emoji = '🪼';
          points = -1;
        }

        itemsRef.current.push({
          id: nextIdRef.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: -5,
          type,
          emoji,
          points,
          speed: Math.random() * 0.7 + 0.9,
          size: 32,
        });
      }

      // Move items and check collision with player basket at y ≈ 82%
      const playerCurrentX = playerXRef.current;
      const remaining: FallingItem[] = [];

      for (const item of itemsRef.current) {
        item.y += item.speed;

        // Collision check
        const inYZone = item.y >= 75 && item.y <= 88;
        const inXZone = Math.abs(item.x - playerCurrentX) < 11;

        if (inYZone && inXZone) {
          // Gevangen!
          if (item.points > 0) {
            playCoin();
            setScore((s) => s + item.points);
          } else {
            playOops();
            setScore((s) => Math.max(0, s - 1));
          }
          continue; // item verdwijnt
        }

        if (item.y < 105) {
          remaining.push(item);
        }
      }

      itemsRef.current = remaining;
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Parel Duiker Minigame"
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-sky-900 to-indigo-950 border-4 border-amber-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Top bar met score, timer en sluitknop */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-sky-950/80 border-b border-sky-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤿</span>
            <span className="font-extrabold text-amber-300 text-sm sm:text-base">
              Kapitein {childName}'s Parelduiker
            </span>
          </div>

          <div className="flex items-center gap-3">
            {gameState === 'playing' && (
              <>
                <div className="px-3 py-1 bg-amber-400/20 border border-amber-400 rounded-full font-black text-amber-300 text-sm flex items-center gap-1">
                  <span>🪙</span> {score}
                </div>
                <div className="px-3 py-1 bg-sky-800 rounded-full font-bold text-xs text-sky-200">
                  ⏱️ {timeLeft}s
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                playPop();
                onClose();
              }}
              className="p-1.5 text-sky-300 hover:text-white hover:bg-sky-800/80 rounded-full transition-colors"
              aria-label="Sluit minigame"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Speelveld Canvas Container */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          className="relative w-full h-[360px] sm:h-[420px] bg-gradient-to-b from-sky-800 via-sky-900 to-indigo-950 overflow-hidden cursor-crosshair select-none touch-none"
        >
          {/* Geanimeerde onderwater achtergrond elementen */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-amber-900/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-4 text-3xl opacity-40 pointer-events-none">🪸</div>
          <div className="absolute bottom-3 right-6 text-3xl opacity-40 pointer-events-none">🐚</div>
          <div className="absolute bottom-4 left-1/3 text-2xl opacity-30 pointer-events-none">🌿</div>

          {gameState === 'intro' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-sky-950/60 backdrop-blur-xs">
              <span className="text-6xl mb-3 animate-bounce">🤿</span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mb-2">
                Parel-Duikers Geheime Spel!
              </h3>
              <p className="text-sm sm:text-base text-sky-200 max-w-sm mb-6 font-medium">
                Vang zoveel mogelijk glinsterende parels ⚪ en gouden munten 🪙 met je duiknet! Pas op voor de kwallen 🪼!
              </p>
              <button
                type="button"
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-lg rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                <Play size={22} fill="currentColor" /> Start Duiktocht!
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {/* Vallende items */}
              {itemsRef.current.map((item) => (
                <div
                  key={item.id}
                  className="absolute text-2xl sm:text-3xl transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-none filter drop-shadow-md"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                >
                  {item.emoji}
                </div>
              ))}

              {/* Jarens Duikmand / Duikboot speler */}
              <div
                className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-75 pointer-events-none flex flex-col items-center"
                style={{ left: `${playerX}%` }}
              >
                <div className="w-16 h-8 bg-amber-400 border-2 border-amber-200 rounded-b-2xl shadow-lg flex items-center justify-center text-lg">
                  🧺
                </div>
                <div className="text-xs font-black text-amber-200 mt-1 uppercase tracking-wider bg-sky-950/70 px-2 py-0.5 rounded-md">
                  Jaren
                </div>
              </div>

              {/* Touch stuurknoppen onderaan voor tablets/touchscreens */}
              <div className="absolute inset-x-0 bottom-1 flex justify-between px-4 pointer-events-auto sm:hidden">
                <button
                  type="button"
                  onPointerDown={() => setPlayerX((prev) => Math.max(8, prev - 12))}
                  className="w-14 h-12 bg-sky-800/80 active:bg-sky-700 border border-sky-600 rounded-xl font-black text-2xl flex items-center justify-center"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onPointerDown={() => setPlayerX((prev) => Math.min(92, prev + 12))}
                  className="w-14 h-12 bg-sky-800/80 active:bg-sky-700 border border-sky-600 rounded-xl font-black text-2xl flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
            </>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-sky-950/85 backdrop-blur-xs animate-in zoom-in-95">
              <span className="text-6xl mb-2">🏆</span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
                Geweldig Geduikt!
              </h3>
              <p className="text-lg font-bold text-sky-100 mb-4">
                Je hebt <span className="text-amber-400 font-black text-xl">{score}</span> punten verzameld!
              </p>

              {/* Sterren beloning banner */}
              <div className="flex items-center gap-2 p-3 bg-amber-400/20 border-2 border-amber-400 rounded-2xl mb-6">
                <Sparkles size={24} className="text-amber-400 animate-spin" />
                <span className="text-sm sm:text-base font-extrabold text-amber-200">
                  +{earnedStars} Gouden Sterren bijgeschreven op je balans!
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={startGame}
                  className="flex items-center gap-2 px-5 py-3 bg-sky-700 hover:bg-sky-600 font-bold rounded-xl text-sm transition-colors"
                >
                  <RotateCcw size={18} /> Nog eens spelen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    onClose();
                  }}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black rounded-xl text-sm transition-transform active:scale-95"
                >
                  Terug naar het Eiland
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
