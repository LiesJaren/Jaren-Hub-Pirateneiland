import { useState } from 'react';
import { ExternalLink, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../platform/PlatformContext';
import { StarBadge } from '../../components/StarBadge';
import { playPop } from '../../platform/sound';

export const LIVE_PLANNER_URL =
  'https://familie-planner-22okt2026.vercel.app/?planner=403b870e-29af-4350-b313-ec37bfaaddcc';

export default function PlannerApp() {
  const navigate = useNavigate();
  const { stars, refresh } = usePlatform();
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => {
    playPop();
    setLoading(true);
    setIframeKey((k) => k + 1);
    void refresh();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] sm:h-[calc(100vh-76px)] w-full bg-slate-900 overflow-hidden relative">
      {/* Handige bovenbalk boven de planner */}
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 bg-slate-950 text-white border-b border-slate-800 shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            onClick={() => {
              playPop();
              navigate('/');
            }}
            aria-label="Terug naar het eiland"
          >
            <Home size={16} strokeWidth={2.6} />
            <span>Eiland</span>
          </button>

          <span className="font-extrabold text-xs sm:text-sm text-slate-200 hidden sm:inline-flex items-center gap-1.5">
            <span>⚓</span> Familieplanner
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            title="Herlaad planner"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Herladen</span>
          </button>

          <StarBadge stars={stars} />

          <a
            href={LIVE_PLANNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-xs"
            title="Open de familieplanner in een nieuw venster"
          >
            <span>Open Volledig</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Embedded Live FamiliePlanner Frame */}
      <div className="relative flex-1 w-full h-full bg-slate-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-700 z-10">
            <span className="text-4xl mb-3 animate-bounce">⚓</span>
            <p className="font-extrabold text-sm sm:text-base text-slate-800">
              Jouw familieplanner wordt geladen...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Verbonden met Mama Lieselot, Papa en Jaren
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={LIVE_PLANNER_URL}
          title="Familieplanner van Jaren"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          allow="clipboard-write; fullscreen"
        />
      </div>
    </div>
  );
}
