import { useEffect, useState } from 'react';
import {
  Compass,
  Home as HomeIcon,
  LockKeyhole,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { appForPath } from '../platform/apps';
import { usePlatform } from '../platform/PlatformContext';
import { isSoundMuted, toggleSoundMuted, playPop } from '../platform/sound';
import { useTheme } from '../platform/ThemeContext';
import { OceanBackground } from './OceanBackground';
import { SpeechButton } from './SpeechButton';
import { StarBadge } from './StarBadge';
import { PietPiraatModal } from './PietPiraatModal';
import { JarenAvatar } from './JarenAvatar';

export function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stars, childName, refresh } = usePlatform();
  const { theme } = useTheme();

  const [muted, setMuted] = useState(() => isSoundMuted());
  const [pietOpen, setPietOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isPlanner = location.pathname === '/planner';
  const currentApp = appForPath(location.pathname);

  useEffect(() => {
    void refresh();
  }, [location.pathname, refresh]);

  const handleToggleSound = () => {
    const nextMuted = toggleSoundMuted();
    setMuted(nextMuted);
  };

  return (
    <div className={isHome ? 'app-shell hub-shell' : 'app-shell'} data-theme={theme.preset}>
      {/* Achtergrond met deinende oceaan en dolfijn */}
      {!isHome && !isPlanner && <OceanBackground />}

      {/* Topbar voor het Starteiland */}
      {isHome && (
        <header className="hub-topbar flex items-center justify-between gap-4 p-4 sm:p-5 max-w-6xl mx-auto w-full z-20">
          <div className="flex items-center gap-3.5">
            <JarenAvatar
              size="lg"
              onClick={() => navigate('/schatkamer')}
              title="Pas jouw avatar aan in de Schatkamer!"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-sky-800">
                Pirateneiland
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Kapitein {childName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors"
              title={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
              aria-label={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div onClick={() => navigate('/schatkamer')} className="cursor-pointer" title="Bekijk jouw munten in de Schatkamer">
              <StarBadge stars={stars} />
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
              onClick={() => {
                playPop();
                navigate('/ouder');
              }}
              aria-label="Voor mama en papa"
            >
              <LockKeyhole size={16} strokeWidth={2.4} />
              <span className="hidden sm:inline">Ouder-Werkplaats</span>
            </button>
          </div>
        </header>
      )}

      {/* Topbar voor de sub-apps */}
      {!isHome && !isPlanner && (
        <header className="topbar flex items-center justify-between gap-4 p-4 max-w-6xl mx-auto w-full z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
              onClick={() => {
                playPop();
                navigate('/');
              }}
              aria-label="Terug naar de schatkaart"
            >
              <HomeIcon size={18} strokeWidth={2.6} />
              <span>Schatkaart</span>
            </button>

            {currentApp && (
              <span className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200">
                <span aria-hidden="true">{currentApp.icon}</span> {currentApp.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                playPop();
                setPietOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sky-950 font-black text-xs shadow-md transition-all active:scale-95"
              title="Praat met Kapitein Piet Piraat!"
            >
              <span>🏴‍☠️</span>
              <span className="hidden sm:inline">Piet Piraat</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors"
              title={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div onClick={() => navigate('/schatkamer')} className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" title="Bekijk Schatkamer & Avatar">
              <JarenAvatar size="sm" showBadge={false} />
              <StarBadge stars={stars} />
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all"
              onClick={() => {
                playPop();
                navigate('/ouder');
              }}
              aria-label="Voor mama en papa"
            >
              <LockKeyhole size={16} strokeWidth={2.4} />
              <span className="hidden sm:inline">Ouders</span>
            </button>
          </div>
        </header>
      )}

      {/* Globale Piet Piraat Modal */}
      <PietPiraatModal
        isOpen={pietOpen}
        onClose={() => setPietOpen(false)}
        childName={childName}
      />

      <main
        className={isPlanner ? 'planner-page' : isHome ? 'page hub-page' : 'page'}
        key={location.pathname}
      >
        <Outlet />
      </main>
    </div>
  );
}
