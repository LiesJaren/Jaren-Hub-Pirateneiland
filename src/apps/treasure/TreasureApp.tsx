import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  Lock,
  Music,
  ShoppingBag,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { AVATAR_ITEMS } from '../../platform/avatarCatalog';
import { usePlatform } from '../../platform/PlatformContext';
import {
  playChestOpen,
  playCoin,
  playPop,
  playShipBell,
  playCannon,
  playPirateJig,
  playSplash,
  playSuccess,
} from '../../platform/sound';
import { useSpeech } from '../../platform/useSpeech';
import type { AvatarCategory, AvatarMode } from '../../platform/types';
import { JarenAvatar } from '../../components/JarenAvatar';

export default function TreasureApp() {
  const {
    stars,
    childName,
    avatarConfig,
    setAvatarMode,
    equipAvatarItem,
    unlockAvatarItem,
    familyRewards,
    claimFamilyReward,
  } = usePlatform();
  const speak = useSpeech();

  const [activeTab, setActiveTab] = useState<'avatar' | 'rewards' | 'soundboard'>('avatar');
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory>('hat');

  // Huidig uitgeruste items ophalen voor live avatar preview
  const equippedHat = AVATAR_ITEMS.find((i) => i.id === avatarConfig.hat);
  const equippedFace = AVATAR_ITEMS.find((i) => i.id === avatarConfig.face);
  const equippedCompanion = AVATAR_ITEMS.find((i) => i.id === avatarConfig.companion);
  const equippedOutfit = AVATAR_ITEMS.find((i) => i.id === avatarConfig.outfit);
  const equippedShip = AVATAR_ITEMS.find((i) => i.id === avatarConfig.ship);

  const categoryItems = AVATAR_ITEMS.filter((i) => i.category === selectedCategory);

  const handleSoundboardPlay = (type: string, title: string) => {
    switch (type) {
      case 'bell':
        playShipBell();
        break;
      case 'cannon':
        playCannon();
        break;
      case 'coin':
        playCoin();
        break;
      case 'chest':
        playChestOpen();
        break;
      case 'jig':
        playPirateJig();
        break;
      case 'splash':
        playSplash();
        break;
      default:
        playPop();
    }
    speak(title);
  };

  const handleClaimReward = (rewardId: string, title: string) => {
    const success = claimFamilyReward(rewardId);
    if (success) {
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {}
      speak(`Gefeliciteerd ${childName}! Je hebt de beloning "${title}" verdiend! Vraag het maar aan papa of mama.`);
    } else {
      speak(`Je hebt nog niet genoeg sterren voor deze beloning. Blijf lekker taken afronden!`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in">
      <PageHeader
        title="Piraten Schatkamer"
        subtitle="Pas Kapitein Jaren aan, wissel beloningen in en speel met geluidjes!"
        icon="🪙"
      />

      {/* Navigatietabbladen */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-sky-950/20 backdrop-blur-sm border border-sky-300/30 rounded-2xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            playPop();
            setActiveTab('avatar');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'avatar'
              ? 'bg-amber-400 text-sky-950 shadow-md transform scale-[1.02]'
              : 'text-sky-900 hover:bg-sky-200/50'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Outfits</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playPop();
            setActiveTab('rewards');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'rewards'
              ? 'bg-amber-400 text-sky-950 shadow-md transform scale-[1.02]'
              : 'text-sky-900 hover:bg-sky-200/50'
          }`}
        >
          <Award size={18} />
          <span>Beloningen</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playPop();
            setActiveTab('soundboard');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'soundboard'
              ? 'bg-amber-400 text-sky-950 shadow-md transform scale-[1.02]'
              : 'text-sky-900 hover:bg-sky-200/50'
          }`}
        >
          <Music size={18} />
          <span>Soundboard</span>
        </button>
      </div>

      {/* --- TAB 1: AVATAR OUTFITS & DRESS-UP --- */}
      {activeTab === 'avatar' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Linker kolom: Live Kapitein Jaren Preview & Avatar Mode Keuze */}
          <div className="md:col-span-5 bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-3 left-4 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-200 px-2.5 py-1 rounded-full">
              Jouw Avatar
            </div>

            <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-400/30 border border-amber-400 rounded-full text-amber-900 font-black text-sm">
              <span>⭐</span> {stars}
            </div>

            {/* Avatar Modus Keuzeknoppen */}
            <div className="w-full flex items-center justify-center gap-1.5 p-1 bg-amber-200/80 rounded-2xl mb-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  setAvatarMode('piraat-jaren');
                  speak('Piraat Jaren avatar gekozen! Jij bent de kapitein!');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
                  (avatarConfig.mode ?? 'piraat-jaren') === 'piraat-jaren'
                    ? 'bg-amber-500 text-white shadow-sm scale-102'
                    : 'text-amber-950 hover:bg-amber-300/60'
                }`}
                title="Piraat Jaren foto avatar"
              >
                🏴‍☠️ Piraat Jaren
              </button>

              <button
                type="button"
                onClick={() => {
                  setAvatarMode('piet-en-jaren');
                  speak('Piet en Jaren duo avatar gekozen!');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
                  avatarConfig.mode === 'piet-en-jaren'
                    ? 'bg-amber-500 text-white shadow-sm scale-102'
                    : 'text-amber-950 hover:bg-amber-300/60'
                }`}
                title="Kapitein Piet & Jaren samen"
              >
                ⛵ Piet & Jaren
              </button>

              <button
                type="button"
                onClick={() => {
                  setAvatarMode('custom');
                  speak('Schatkamer verkleed modus!');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
                  avatarConfig.mode === 'custom'
                    ? 'bg-amber-500 text-white shadow-sm scale-102'
                    : 'text-amber-950 hover:bg-amber-300/60'
                }`}
                title="Zelf samenstellen met hoeden & schepen"
              >
                🎨 Verkleed
              </button>
            </div>

            {/* Avatar Visual Display */}
            <div className="relative my-2 flex items-center justify-center">
              <JarenAvatar
                size="hero"
                shape="rounded"
                className="transform hover:scale-105 transition-transform"
              />
            </div>

            <div className="mt-2">
              <span className="inline-block text-[11px] font-black uppercase text-amber-800 bg-amber-200/90 px-3 py-0.5 rounded-full border border-amber-300">
                {(avatarConfig.mode ?? 'piraat-jaren') === 'piraat-jaren'
                  ? '🏴‍☠️ Officiële Foto Avatar: Piraat Jaren'
                  : avatarConfig.mode === 'piet-en-jaren'
                  ? '⛵ Duo Avatar: Piet & Jaren'
                  : '🎨 Zelf Gemaakte Piraten Avatar'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
              Kapitein {childName}
            </h3>

            <p className="text-xs sm:text-sm text-amber-800 font-medium">
              {(avatarConfig.mode ?? 'piraat-jaren') === 'piraat-jaren'
                ? 'Aan het roer met piratenhoed & zwaard!'
                : avatarConfig.mode === 'piet-en-jaren'
                ? 'Samen met Kapitein Piet op De Scheve Schuit!'
                : `${equippedOutfit?.name} · ${equippedHat?.name}`}
            </p>

            <button
              type="button"
              onClick={() => {
                playSuccess();
                if ((avatarConfig.mode ?? 'piraat-jaren') === 'piraat-jaren') {
                  speak(`Ahoy maatjes! Ik ben Piraat ${childName}, kapitein van de Scheve Schuit!`);
                } else if (avatarConfig.mode === 'piet-en-jaren') {
                  speak(`Schivermejantjes! Kapitein Piet en Piraat ${childName} kiezen het ruime sop!`);
                } else {
                  speak(`Ahoy! Hier is Kapitein ${childName} op ${equippedShip?.name}!`);
                }
              }}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <Volume2 size={16} /> Stel Kapitein Voor!
            </button>
          </div>

          {/* Rechter kolom: Items Kiezers */}
          <div className="md:col-span-7 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col">
            {/* Categorie tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'hat', label: 'Hoeden', icon: '🎩' },
                { id: 'face', label: 'Gezicht', icon: '👁️' },
                { id: 'companion', label: 'Maatjes', icon: '🦜' },
                { id: 'outfit', label: 'Kleding', icon: '🦺' },
                { id: 'ship', label: 'Schepen', icon: '⛵' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playPop();
                    setSelectedCategory(cat.id as AvatarCategory);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[380px] p-1">
              {categoryItems.map((item) => {
                const isUnlocked = avatarConfig.unlockedIds.includes(item.id);
                const isEquipped = avatarConfig[item.category] === item.id;
                const canAfford = stars >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-amber-400 bg-amber-50/90 shadow-md ring-2 ring-amber-400/30'
                        : isUnlocked
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50/70 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
                        {isEquipped ? (
                          <span className="px-2 py-0.5 bg-amber-400 text-sky-950 text-xs font-black rounded-md flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> Aan
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-xs font-bold text-slate-400">Bezit</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center gap-1">
                            <Lock size={12} /> {item.cost} ⭐
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3">
                      {isUnlocked ? (
                        <button
                          type="button"
                          disabled={isEquipped}
                          onClick={() => equipAvatarItem(item.category, item.id)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                            isEquipped
                              ? 'bg-amber-200 text-amber-900 cursor-default'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isEquipped ? 'Uitgerust' : 'Aandoen'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => unlockAvatarItem(item.id, item.cost)}
                          className={`w-full py-2 px-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-sky-950 shadow-sm'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles size={14} /> Ontgrendel ({item.cost} ⭐)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: FAMILIE SCHATKIST BELONINGEN --- */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="bg-amber-100/80 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🎁</span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-amber-950">
                  De Familie Beloningen Schatkist
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 font-medium">
                  Spaar je gouden sterren en wissel ze in voor leuke dingen thuis!
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-white rounded-2xl border border-amber-300 shadow-sm text-amber-900 font-black text-base flex items-center gap-2 shrink-0">
              <span>Jouw saldo:</span>
              <span className="text-xl text-amber-500">⭐ {stars}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyRewards.map((reward) => {
              const canAfford = stars >= reward.cost;

              return (
                <div
                  key={reward.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{reward.emoji}</span>
                      <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs rounded-full">
                        {reward.cost} Sterren
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                      {reward.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {reward.description}
                    </p>

                    {reward.claimedCount ? (
                      <p className="text-xs font-bold text-emerald-600 mt-2">
                        Al {reward.claimedCount}x ingewisseld! 🎉
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleClaimReward(reward.id, reward.title)}
                    className={`mt-4 w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-sky-950 shadow-md active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={16} />
                    {canAfford ? 'Nu Inwisselen!' : `Nog ${reward.cost - stars} sterren nodig`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: PIRATEN SOUNDBOARD --- */}
      {activeTab === 'soundboard' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="text-center max-w-md mx-auto">
            <span className="text-5xl mb-2 inline-block">🔊</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Het Vrolijke Piraten Soundboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Tik op de knoppen om scheepsgeluiden te laten klinken!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { type: 'bell', title: 'Scheepsbel', emoji: '🔔', desc: 'Bim-bam!' },
              { type: 'cannon', title: 'Kanon Plop', emoji: '💥', desc: 'Boem!' },
              { type: 'coin', title: 'Goudstuk', emoji: '🪙', desc: 'Kling-kling!' },
              { type: 'chest', title: 'Schatkist', emoji: '📦', desc: 'Kraak & glans!' },
              { type: 'splash', title: 'Zeesplash', emoji: '💦', desc: 'Plons!' },
              { type: 'jig', title: 'Piratenlied', emoji: '🎶', desc: 'Vrolijk deuntje' },
            ].map((snd) => (
              <button
                key={snd.type}
                type="button"
                onClick={() => handleSoundboardPlay(snd.type, snd.title)}
                className="p-5 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 hover:border-amber-400 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:translate-y-0 text-center flex flex-col items-center justify-center group"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {snd.emoji}
                </span>
                <span className="font-black text-slate-900 text-sm">{snd.title}</span>
                <span className="text-xs text-amber-800 font-bold mt-0.5">{snd.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
