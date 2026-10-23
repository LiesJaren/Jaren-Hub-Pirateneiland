import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Send,
  Anchor,
  Compass,
  Ship,
  Sparkles,
  Award,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { usePlatform } from '../../platform/PlatformContext';
import {
  playCannon,
  playShipBell,
  playPop,
  playPirateJig,
  playChestOpen,
} from '../../platform/sound';
import { useSpeech } from '../../platform/useSpeech';
import { JarenAvatar } from '../../components/JarenAvatar';

type Message = {
  id: string;
  sender: 'user' | 'piet';
  text: string;
  timestamp: Date;
};

type CrewBio = {
  id: string;
  name: string;
  role: string;
  icon: string;
  catchphrase: string;
  description: string;
  question: string;
};

const CREW: CrewBio[] = [
  {
    id: 'piet',
    name: 'Piet Piraat',
    role: 'Kapitein',
    icon: '🏴‍☠️',
    catchphrase: 'Schivermejantjes! Koers recht vooruit!',
    description: 'De slimme kapitein van de Scheve Schuit. Hij leidt elk avontuur met zijn verrekijker.',
    question: 'Piet, hoe word ik net zo dapper als jij?',
  },
  {
    id: 'berend',
    name: 'Berend Brokkenpap',
    role: 'Scheepskok',
    icon: '🍲',
    catchphrase: 'Wie lust er een dampende kom brokkenpap?',
    description: 'De goedlachse kok. Zijn scheepsbeschuit is zo hard als kanonskogels, maar zijn pap is heerlijk!',
    question: 'Wat is het geheime ingrediënt in Berends brokkenpap?',
  },
  {
    id: 'stien',
    name: 'Stien Struis',
    role: 'Stuurvrouw',
    icon: '💪',
    catchphrase: 'Geen storm krijgt Stien Struis klein!',
    description: 'De sterkste vrouw van alle zeven zeeën. Ze stuurt de Scheve Schuit veilig door elke storm.',
    question: 'Stien, kun jij een reuzenzeemonster aan?',
  },
  {
    id: 'steven',
    name: 'Steven Stil',
    role: 'Matroos',
    icon: '🤫',
    catchphrase: '... (beeldt een schatkist uit met zijn handen!)',
    description: 'Praat nooit een woord, maar met zijn mimiek en handen begrijpt iedereen hem meteen.',
    question: 'Wat gebaart Steven Stil als er piratengevaar dreigt?',
  },
];

const PIRATE_SHOUTS = [
  { label: 'Schivermejantjes!', sound: 'cannon' },
  { label: 'Ahoy maatjes!', sound: 'bell' },
  { label: 'Koers recht vooruit!', sound: 'bell' },
  { label: 'Alle hens aan dek!', sound: 'cannon' },
  { label: 'Volle kracht vooruit!', sound: 'jig' },
];

export default function PietPiraatApp() {
  const { childName, earnStars } = usePlatform();
  const speak = useSpeech();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'piet',
      text: `Ahoy maatje ${childName}! Welkom aan boord van de Scheve Schuit! Schivermejantjes, wat fijn dat je er bent. Vraag me gerust alles over onze reizen, de bemanning of het vinden van gouden sterren!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    playCannon();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/piet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Ahoy maatje! De Scheve Schuit vaart dapper door!';

      playPop();

      const pietMsg: Message = {
        id: `p-${Date.now()}`,
        sender: 'piet',
        text: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, pietMsg]);

      // Als Jaren voor het eerst praat, verdien 2 piratensterren!
      if (!rewardClaimed && messages.length >= 2) {
        setRewardClaimed(true);
        earnStars(2, 'Gepraat met Kapitein Piet Piraat!');
        playChestOpen();
      }

      if (autoSpeak) {
        speak(reply);
      }
    } catch (err) {
      console.error(err);
      const fallbackReply =
        'Schivermejantjes! Er sloeg wat zeewater over het dek, maar kapitein Piet staat paraat! Koers recht vooruit!';
      setMessages((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          sender: 'piet',
          text: fallbackReply,
          timestamp: new Date(),
        },
      ]);
      if (autoSpeak) speak(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  const handleShoutClick = (shout: (typeof PIRATE_SHOUTS)[0]) => {
    if (shout.sound === 'cannon') playCannon();
    else if (shout.sound === 'bell') playShipBell();
    else playPirateJig();

    speak(shout.label);
    void sendMessage(`Kapitein Piet, roep eens luid mee: "${shout.label}"!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-12 select-none">
      {/* Kapiteins Banner met Scheve Schuit & Bemanning */}
      <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border-4 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-amber-100 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-amber-700/80 text-amber-200 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/40">
            <Ship size={15} />
            <span>Studio 100 · De Scheve Schuit</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-200 tracking-tight">
            Kapitein Piet Piraat
          </h1>

          <p className="text-sm sm:text-base text-amber-200/90 font-medium max-w-2xl">
            Ahoy maatje {childName}! Ga aan boord van het beroemdste piratenschip ter wereld.
            Stel al je vragen aan Kapitein Piet, ontdek de geheimen van zijn bemanning en verdien
            gouden sterren!
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
            {PIRATE_SHOUTS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleShoutClick(s)}
                className="px-3 py-1.5 rounded-xl bg-amber-800/90 hover:bg-amber-700 text-amber-200 border border-amber-600 text-xs font-black shadow-xs hover:scale-105 active:scale-95 transition-all"
                title={`Roep: ${s.label}`}
              >
                📢 {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bemanningsposter Afbeelding: Piet Piraat & Piraat Jaren */}
        <div className="relative w-full max-w-sm shrink-0 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl bg-black/40 group">
          <img
            src="/assets/aistudio/image_4275cd55.png"
            alt="Kapitein Piet Piraat en Piraat Jaren op De Scheve Schuit"
            className="w-full h-56 object-cover object-[50%_35%] group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 text-center">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>🏴‍☠️</span>
              <span>Kapitein Piet & Piraat Jaren</span>
            </span>
          </div>
        </div>
      </div>

      {/* Twee Kolommen: Crew Paspoorten & Interactieve Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Linkerkolom: Crew Paspoorten (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* De Scheve Schuit Crew Poster */}
          <div className="rounded-2xl overflow-hidden border-3 border-amber-400 shadow-md bg-amber-950">
            <img
              src="/assets/aistudio/image_52b45d3f.png"
              alt="Bemanning van De Scheve Schuit"
              className="w-full h-40 object-cover object-top hover:scale-105 transition-transform duration-300"
            />
            <div className="bg-amber-900/90 px-3 py-1.5 text-center text-[11px] font-black text-amber-200 uppercase tracking-wider">
              Stien · Berend · Steven · Piet
            </div>
          </div>

          <div className="bg-white/90 border-3 border-amber-300 rounded-3xl p-5 shadow-md">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Anchor size={18} className="text-amber-600" />
              <span>De Bemanning van de Scheve Schuit</span>
            </h2>

            <div className="space-y-3">
              {CREW.map((member) => (
                <div
                  key={member.id}
                  className="bg-amber-50/80 hover:bg-amber-100/90 border-2 border-amber-300/80 hover:border-amber-500 rounded-2xl p-3.5 transition-all shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0 p-1.5 bg-white rounded-xl border border-amber-300 shadow-xs">
                      {member.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-black text-slate-900">{member.name}</h3>
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-1">
                        {member.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          void sendMessage(member.question);
                        }}
                        className="mt-2 text-xs font-black text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-3 py-1 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <span>💬 Vraag: &quot;{member.question}&quot;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Piraten Beloning Kaart */}
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 border-3 border-amber-500 rounded-3xl p-4 shadow-md text-sky-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🪙</span>
              <div>
                <h4 className="text-sm font-black">Piraten Beloning</h4>
                <p className="text-xs font-semibold">Praat met Kapitein Piet en verdien sterren!</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-950 text-amber-300 text-xs font-black rounded-xl">
              +2 ⭐
            </span>
          </div>
        </div>

        {/* Rechterkolom: Live AI Piraten Chat (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 border-4 border-amber-400 rounded-3xl shadow-xl flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-amber-500 text-sky-950 px-5 py-3 border-b-3 border-amber-600 flex items-center justify-between font-black">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏴‍☠️</span>
              <div>
                <h3 className="text-sm sm:text-base font-black">Kapitein Piet Piraat Live</h3>
                <p className="text-[11px] font-bold text-amber-900">
                  Antwoordt altijd vrolijk &amp; avontuurlijk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-1 transition-colors border ${
                  autoSpeak
                    ? 'bg-amber-950 text-amber-300 border-amber-900'
                    : 'bg-white/80 text-slate-800 border-amber-300'
                }`}
                title={autoSpeak ? 'Stem voorlezen AAN' : 'Stem voorlezen UIT'}
              >
                {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="hidden sm:inline">{autoSpeak ? 'Voorlezen Aan' : 'Voorlezen Uit'}</span>
              </button>
            </div>
          </div>

          {/* Chat Berichten Scrollbox */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-amber-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'piet' && (
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-2xl shadow-sm shrink-0">
                    🏴‍☠️
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-sm sm:text-base leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-white rounded-tr-xs border-2 border-sky-600 font-bold'
                      : 'bg-white text-slate-900 rounded-tl-xs border-2 border-amber-400 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        msg.sender === 'user' ? 'text-sky-100' : 'text-amber-700'
                      }`}
                    >
                      {msg.sender === 'user' ? `🏴‍☠️ Piraat ${childName}` : '🏴‍☠️ Kapitein Piet Piraat'}
                    </span>

                    {msg.sender === 'piet' && (
                      <button
                        type="button"
                        onClick={() => speak(msg.text)}
                        className="p-1 text-amber-800 hover:text-amber-950 rounded hover:bg-amber-100 transition-colors"
                        title="Lees nogmaals voor"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {msg.sender === 'user' && (
                  <JarenAvatar size="sm" className="shrink-0 mt-1" />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm p-3.5 bg-amber-100 rounded-2xl border-2 border-amber-400 w-fit animate-pulse">
                <span className="text-2xl animate-spin">🧭</span>
                <span>Piet Piraat denkt na met zijn bemanning...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Snelle vraag bubbles */}
          <div className="p-3 bg-amber-100/70 border-t-2 border-amber-300">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                '🏴‍☠️ Vertel een piratengrap!',
                '🍲 Wat eet de bemanning vanavond?',
                '🗺️ Hoe vind ik de schat?',
                '⚓ Wat zingen piraten bij storm?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-300 text-xs font-bold whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Invoerformulier */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(inputText);
            }}
            className="p-3.5 bg-white border-t-3 border-amber-400 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Typ hier jouw vraag aan Piet Piraat..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-amber-50/60 border-2 border-amber-300 focus:border-amber-500 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold text-sm sm:text-base focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sky-950 font-black rounded-2xl shadow-md border-2 border-amber-500 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Vuur af!</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
