import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Check,
  Download,
  Gamepad2,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import {
  changeParentPin,
  getParentSession,
  getParentSummary,
  parentLogin,
  parentLogout,
  saveParentSettings,
} from '../../platform/api';
import { formatWhen } from '../../platform/format';
import { moodById } from '../../platform/moods';
import { usePlatform } from '../../platform/PlatformContext';
import { playPop, playSuccess } from '../../platform/sound';
import type {
  CustomWordItem,
  FamilyReward,
  ParentSummary,
  PlatformEvent,
} from '../../platform/types';

export default function ParentPage() {
  const {
    childName,
    stars,
    earnStars,
    spendStars,
    learningConfig,
    updateLearningConfig,
    familyRewards,
    addCustomReward,
    removeCustomReward,
    refresh,
  } = usePlatform();

  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ParentSummary | null>(null);

  // Tab in werkplaats
  const [activeTab, setActiveTab] = useState<
    'progress' | 'learning' | 'routines' | 'rewards' | 'settings'
  >('progress');

  // Nieuwe woord toevoegen state
  const [newWord, setNewWord] = useState('');
  const [newWordCategory, setNewWordCategory] = useState('School');
  const [newWordEmoji, setNewWordEmoji] = useState('⭐');
  const [newWordHint, setNewWordHint] = useState('');

  // Nieuwe beloning toevoegen state
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(15);
  const [newRewardEmoji, setNewRewardEmoji] = useState('🎁');
  const [newRewardDesc, setNewRewardDesc] = useState('');

  // PIN wijzigen state
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Kindnaam state
  const [nameInput, setNameInput] = useState(childName);
  const [nameSaved, setNameSaved] = useState(false);

  // Handmatige sterren
  const [customStarsAmount, setCustomStarsAmount] = useState(5);

  const checkSession = useCallback(async () => {
    try {
      const { authenticated } = await getParentSession();
      setAuthenticated(authenticated);
      if (authenticated) {
        const nextSummary = await getParentSummary();
        setSummary(nextSummary);
      }
    } catch {
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      await parentLogin(pin);
      playSuccess();
      setAuthenticated(true);
      setPin('');
      const nextSummary = await getParentSummary();
      setSummary(nextSummary);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    playPop();
    await parentLogout();
    setAuthenticated(false);
    setSummary(null);
  }

  async function handlePinChange(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinMessage('PIN moet 4 tot 8 cijfers zijn.');
      return;
    }
    try {
      await changeParentPin(newPin);
      playSuccess();
      setPinMessage('PIN succesvol gewijzigd!');
      setNewPin('');
      setTimeout(() => setPinMessage(null), 3000);
    } catch (err) {
      setPinMessage(err instanceof Error ? err.message : 'Wijzigen mislukt.');
    }
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      await saveParentSettings({ childName: nameInput.trim() });
      playSuccess();
      setNameSaved(true);
      void refresh();
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      //
    }
  }

  // Woord toevoegen
  const handleAddWord = (e: FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    playSuccess();
    const item: CustomWordItem = {
      id: `w-${Date.now()}`,
      word: newWord.trim().toLowerCase(),
      category: newWordCategory.trim() || 'Algemeen',
      emoji: newWordEmoji.trim() || '📝',
      hint: newWordHint.trim() || undefined,
    };
    updateLearningConfig({
      ...learningConfig,
      activeWords: [item, ...learningConfig.activeWords],
    });
    setNewWord('');
    setNewWordHint('');
  };

  const handleRemoveWord = (wordId: string) => {
    playPop();
    updateLearningConfig({
      ...learningConfig,
      activeWords: learningConfig.activeWords.filter((w) => w.id !== wordId),
    });
  };

  // Beloning toevoegen
  const handleAddReward = (e: FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;
    playSuccess();
    const reward: FamilyReward = {
      id: `rew-${Date.now()}`,
      title: newRewardTitle.trim(),
      cost: Math.max(1, newRewardCost),
      emoji: newRewardEmoji.trim() || '🎁',
      description: newRewardDesc.trim() || 'Zelf ingestelde gezinsbeloning.',
    };
    addCustomReward(reward);
    setNewRewardTitle('');
    setNewRewardDesc('');
  };

  // Back-up downloaden
  const handleDownloadBackup = () => {
    playSuccess();
    const fullBackup = {
      format: 'jarens-eiland-full-backup',
      version: 2,
      exportedAt: new Date().toISOString(),
      childName,
      stars,
      learningConfig,
      familyRewards,
      plannerData: {
        events: localStorage.getItem('fp_events'),
        members: localStorage.getItem('fp_members'),
        routines: localStorage.getItem('fp_custom_routines'),
        groceries: localStorage.getItem('fp_groceries'),
      },
    };
    const json = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarens-eiland-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Back-up herstellen
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.learningConfig) updateLearningConfig(parsed.learningConfig);
        if (parsed.plannerData) {
          if (parsed.plannerData.events) localStorage.setItem('fp_events', parsed.plannerData.events);
          if (parsed.plannerData.members) localStorage.setItem('fp_members', parsed.plannerData.members);
          if (parsed.plannerData.routines) localStorage.setItem('fp_custom_routines', parsed.plannerData.routines);
          if (parsed.plannerData.groceries) localStorage.setItem('fp_groceries', parsed.plannerData.groceries);
        }
        playSuccess();
        alert('Back-up is succesvol hersteld!');
        window.location.reload();
      } catch {
        alert('Ongeldig back-up bestand.');
      }
    };
    reader.readAsText(file);
  };

  // --- PIN SCHERM ---
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 animate-in fade-in">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
            🔒
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Ouder-Werkplaats
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Beveiligd voor mama en papa om leervragen, taken en beloningen aan te passen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="pin-input" className="sr-only">
                PIN-code
              </label>
              <input
                id="pin-input"
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="Voer PIN-code in"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Standaard PIN: <span className="font-bold text-slate-600">2706</span>
              </p>
            </div>

            {loginError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 py-2 px-3 rounded-xl border border-rose-200">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-sky-950 font-black rounded-2xl shadow-md transition-all active:scale-95"
            >
              {loading ? 'Bezig met openen...' : 'Open Werkplaats'}
            </button>
          </form>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 pt-2"
          >
            <ArrowLeft size={14} /> Terug naar het Eiland
          </Link>
        </div>
      </div>
    );
  }

  // --- HOOFD OUDER-WERKPLAATS ---
  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md inline-block mb-1">
            Beheerderspaneel
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Ouder-Werkplaats van {childName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Beheer alle leervragen, taken, routines, beloningen en maak back-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all"
          >
            <ArrowLeft size={16} /> Naar het Eiland
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Uitloggen"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Navigatietabs in de werkplaats */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'progress', label: 'Voortgang & Sterren', icon: Activity },
          { id: 'learning', label: 'Leervragen & Woorden', icon: BookOpen },
          { id: 'rewards', label: 'Beloningen Schatkist', icon: Award },
          { id: 'settings', label: 'Systeem & Back-up', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playPop();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: VOORTGANG & STERRENBEHEER --- */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-sm text-center">
              <span className="text-3xl mb-1 block">⭐</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Huidig Saldo</span>
              <p className="text-3xl font-black text-amber-500 mt-1">{stars} Munten</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-center">
              <span className="text-3xl mb-1 block">🎒</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Leerspellen Gespeeld</span>
              <p className="text-3xl font-black text-slate-800 mt-1">{summary?.games ?? 0}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-center">
              <span className="text-3xl mb-1 block">🌅</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Dagchecks Ingevuld</span>
              <p className="text-3xl font-black text-slate-800 mt-1">{summary?.checkins ?? 0}</p>
            </div>
          </div>

          {/* Snel Sterren Toekennen / Corrigeren */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Snel Gouden Sterren Toekennen of Aanpassen
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Geef {childName} direct een beloning voor een goede daad thuis, of pas het saldo aan.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => earnStars(1, 'Extra ster van ouder')}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs"
              >
                +1 Ster
              </button>
              <button
                type="button"
                onClick={() => earnStars(5, '5 Sterren bonus van ouder')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs"
              >
                +5 Sterren Bonus! ⭐
              </button>
              <button
                type="button"
                onClick={() => earnStars(10, '10 Sterren superprestatie')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs"
              >
                +10 Superprestatie 🏆
              </button>
              <button
                type="button"
                onClick={() => spendStars(1, 'Correctie door ouder')}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors ml-auto"
              >
                -1 Ster (Correctie)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: LEERVRAAG & WOORDEN BEHEERDER --- */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          {/* Nieuw woordje toevoegen formulier */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              <span>Nieuw Woordje Toevoegen voor {childName}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Voeg woorden toe die {childName} momenteel op school leert (bijv. Veilig Leren Lezen). Deze verschijnen direct in de Schrijf- en Typ-games!
            </p>

            <form onSubmit={handleAddWord} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Woordje (bijv. 'boot')
                </label>
                <input
                  type="text"
                  placeholder="Typ het woordje"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Categorie
                </label>
                <input
                  type="text"
                  placeholder="Bijv. Kern 2"
                  value={newWordCategory}
                  onChange={(e) => setNewWordCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newWordEmoji}
                  onChange={(e) => setNewWordEmoji(e.target.value)}
                  className="w-full text-center px-3 py-2 text-base border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Hint (optioneel)
                </label>
                <input
                  type="text"
                  placeholder="Bijv. Vaart op water"
                  value={newWordHint}
                  onChange={(e) => setNewWordHint(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end">
                <button
                  type="submit"
                  disabled={!newWord.trim()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={16} /> Woord Toevoegen
                </button>
              </div>
            </form>
          </div>

          {/* Huidige Woordenlijst */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center justify-between">
              <span>Actieve Woordenlijst ({learningConfig.activeWords.length} woorden)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {learningConfig.activeWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{word.emoji ?? '📝'}</span>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{word.word}</p>
                      <p className="text-[11px] text-slate-500 truncate">{word.category}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveWord(word.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    title="Verwijder dit woord"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rekeninstellingen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Rekenmoeilijkheid (zoWISo blok 1 / groep 3)
            </h4>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold text-slate-700">
                <input
                  type="radio"
                  name="mathMax"
                  checked={learningConfig.mathMaxNumber === 10}
                  onChange={() =>
                    updateLearningConfig({ ...learningConfig, mathMaxNumber: 10 })
                  }
                  className="w-4 h-4 text-amber-500"
                />
                <span>Rekenen tot 10</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold text-slate-700">
                <input
                  type="radio"
                  name="mathMax"
                  checked={learningConfig.mathMaxNumber === 20}
                  onChange={() =>
                    updateLearningConfig({ ...learningConfig, mathMaxNumber: 20 })
                  }
                  className="w-4 h-4 text-amber-500"
                />
                <span>Rekenen tot 20 (voor gevorderden)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold text-slate-700 ml-auto">
                <input
                  type="checkbox"
                  checked={learningConfig.allowSubtraction}
                  onChange={(e) =>
                    updateLearningConfig({
                      ...learningConfig,
                      allowSubtraction: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span>Ook minsommen (-) toelaten</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: BELONINGEN BEHEERDER --- */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus size={20} className="text-amber-500" />
              <span>Nieuwe Familiebeloning Toevoegen</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Bepaal zelf welke beloningen {childName} in de Piraten Schatkamer kan inwisselen met zijn gouden sterren.
            </p>

            <form onSubmit={handleAddReward} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Titel van de beloning
                </label>
                <input
                  type="text"
                  placeholder="Bijv. Naar de kinderboerderij"
                  value={newRewardTitle}
                  onChange={(e) => setNewRewardTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Kosten (sterren)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={newRewardCost}
                  onChange={(e) => setNewRewardCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black border border-slate-300 rounded-xl text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newRewardEmoji}
                  onChange={(e) => setNewRewardEmoji(e.target.value)}
                  className="w-full text-center px-3 py-2 text-base border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Beschrijving
                </label>
                <input
                  type="text"
                  placeholder="Gezellig met het gezin"
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end">
                <button
                  type="submit"
                  disabled={!newRewardTitle.trim()}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-sky-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={16} /> Beloning Toevoegen
                </button>
              </div>
            </form>
          </div>

          {/* Huidige Beloningenlijst */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{reward.emoji}</span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full">
                      ⭐ {reward.cost}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">{reward.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {reward.claimedCount ? `Al ${reward.claimedCount}x ingewisseld` : 'Nog niet geclaimd'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomReward(reward.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Verwijder beloning"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: SYSTEEM & BACK-UP --- */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Naam van het kind */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
              Naam van het Kind
            </h4>
            <form onSubmit={handleSaveName} className="flex items-center gap-3 max-w-md">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Opslaan
              </button>
            </form>
            {nameSaved && (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Naam succesvol opgeslagen!
              </p>
            )}
          </div>

          {/* Ouder PIN wijzigen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <KeyRound size={18} className="text-amber-500" />
              <span>Ouder-PIN Wijzigen</span>
            </h4>
            <form onSubmit={handlePinChange} className="flex items-center gap-3 max-w-md">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="Nieuwe PIN (4-8 cijfers)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl"
              />
              <button
                type="submit"
                disabled={!newPin}
                className="px-4 py-2 bg-amber-500 text-sky-950 font-black text-xs rounded-xl hover:bg-amber-400 transition-colors"
              >
                Wijzig PIN
              </button>
            </form>
            {pinMessage && (
              <p className="text-xs font-bold text-slate-700">{pinMessage}</p>
            )}
          </div>

          {/* Volledige Back-up downloaden & herstellen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Download size={18} className="text-sky-600" />
              <span>Volledige Gezinsback-up (Downloaden &amp; Herstellen)</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sla alle agenda-afspraken, gemaakte routines, leervragen, verdiende sterren en beloningen in één veilig JSON-bestand op.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all"
              >
                <Download size={16} />
                <span>Download Volledige Back-up (.json)</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-slate-300">
                <Upload size={16} />
                <span>Herstel Back-up Bestand</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
