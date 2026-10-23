import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Send,
  X,
  Sparkles,
  Ship,
  Anchor,
  Compass,
  Smile,
  Mic,
  RotateCcw,
} from 'lucide-react';
import { playCannon, playShipBell, playPop, playPirateJig } from '../platform/sound';
import { useSpeech } from '../platform/useSpeech';
import { JarenAvatar } from './JarenAvatar';

type Message = {
  id: string;
  sender: 'user' | 'piet';
  text: string;
  timestamp: Date;
};

type CrewMember = {
  id: string;
  name: string;
  role: string;
  icon: string;
  prompt: string;
  description: string;
};

const CREW_MEMBERS: CrewMember[] = [
  {
    id: 'piet',
    name: 'Piet Piraat',
    role: 'Kapitein',
    icon: '🏴‍☠️',
    prompt: 'Ahoy Kapitein Piet Piraat! Vertel me eens over jouw schip de Scheve Schuit!',
    description: 'De dappere kapitein met zijn verrekijker en zwarte hoed.',
  },
  {
    id: 'berend',
    name: 'Berend Brokkenpap',
    role: 'Scheepskok',
    icon: '🍲',
    prompt: 'Wat kookt Berend Brokkenpap vandaag in de kombuis voor ons piraten?',
    description: 'De kok die de allerlekkerste brokkenpap en scheepsbeschuit bakt.',
  },
  {
    id: 'stien',
    name: 'Stien Struis',
    role: 'Stuurvrouw',
    icon: '💪',
    prompt: 'Hoe sterk is Stien Struis? Kan zij het hele schip optillen?',
    description: 'De oersterke stuurvrouw die elk stormachtig anker binnenhaalt.',
  },
  {
    id: 'steven',
    name: 'Steven Stil',
    role: 'Matroos',
    icon: '🤫',
    prompt: 'Wat gebaart Steven Stil naar ons? Waar wijst hij naartoe?',
    description: 'De matroos die nooit praat maar alles met grappige gebaren laat zien.',
  },
];

const QUICK_QUESTIONS = [
  '🏴‍☠️ Vertel een grappige piratengrap!',
  '🗺️ Waar ligt de verborgen schat begraven?',
  '⛵ Hoe hijs ik de zeilen van de Scheve Schuit?',
  '🪙 Wat kan ik doen met al mijn gouden sterren?',
  '🦜 Wat is de lievelingskoek van je papegaai?',
];

interface PietPiraatModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName?: string;
}

export function PietPiraatModal({ isOpen, onClose, childName = 'Jaren' }: PietPiraatModalProps) {
  const speak = useSpeech();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'piet',
      text: `Ahoy maatje ${childName}! Schivermejantjes, welkom aan boord van de Scheve Schuit! Wat wil je weten over het piratenleven of mijn bemanning?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<string>('piet');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      playShipBell();
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    playCannon();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
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

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'Ahoy maatje! De wind waait hard, maar we varen recht vooruit!';

      playPop();

      const pietMsg: Message = {
        id: `piet-${Date.now()}`,
        sender: 'piet',
        text: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, pietMsg]);

      if (autoSpeak) {
        speak(reply);
      }
    } catch (err) {
      console.error('Piet Piraat antwoord fout:', err);
      const fallbackMsg: Message = {
        id: `piet-${Date.now()}`,
        sender: 'piet',
        text: 'Schivermejantjes! Een golf sloeg tegen het roer. Maar wees gerust maatje: koers recht vooruit!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeak) {
        speak(fallbackMsg.text);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCrewClick = (crew: CrewMember) => {
    setSelectedCrew(crew.id);
    playPop();
    void sendMessage(crew.prompt);
  };

  const handleResetChat = () => {
    playPirateJig();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'piet',
        text: `Ahoy maatje ${childName}! We beginnen een nieuw avontuur op de woeste baren! Waar zetten we vandaag koers naartoe?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 border-4 border-amber-500 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Houten Piraten Header */}
        <div className="relative bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-amber-100 px-5 py-3 border-b-4 border-amber-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-amber-950">
              <img
                src="/assets/aistudio/image_4275cd55.png"
                alt="Kapitein Piet & Piraat Jaren"
                className="w-full h-full object-cover object-[50%_35%]"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-amber-200 flex items-center gap-2">
                <span>Kapitein Piet Piraat</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-600/60 text-amber-100 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  De Scheve Schuit
                </span>
              </h2>
              <p className="text-xs text-amber-300 font-semibold">
                Samen met Piraat {childName} &amp; de bemanning aan het roer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-colors ${
                autoSpeak
                  ? 'bg-amber-400 text-sky-950 border-amber-300'
                  : 'bg-amber-950/50 text-amber-200 border-amber-700'
              }`}
              title={autoSpeak ? 'Stem voorlezen staat AAN' : 'Stem voorlezen staat UIT'}
            >
              {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{autoSpeak ? 'Stem Aan' : 'Stem Uit'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-200 border border-amber-700 transition-colors"
              title="Opnieuw beginnen"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-amber-950 hover:bg-red-800 text-amber-100 border border-amber-700 transition-colors"
              title="Sluiten"
            >
              <X size={20} strokeWidth={2.8} />
            </button>
          </div>
        </div>

        {/* Content body: crew strip + chat */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0">
          {/* Linkerpaneel: Bemanningsfoto & Tikbare Figuren */}
          <div className="w-full md:w-80 bg-amber-100/90 border-b-4 md:border-b-0 md:border-r-4 border-amber-300 p-4 flex flex-col gap-3.5 shrink-0 overflow-y-auto">
            {/* Foto van Kapitein Piet & Piraat Jaren */}
            <div className="relative rounded-2xl overflow-hidden border-3 border-amber-500 shadow-md bg-amber-900 group">
              <img
                src="/assets/aistudio/image_4275cd55.png"
                alt="Kapitein Piet en Piraat Jaren op De Scheve Schuit"
                className="w-full h-36 object-cover object-[50%_35%] hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 text-center text-white">
                <p className="text-[11px] font-black tracking-wider text-amber-300 uppercase">
                  Piet &amp; Piraat {childName} aan het roer!
                </p>
              </div>
            </div>

            {/* Afbeelding van de officiële Piet Piraat bemanning */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm bg-amber-900 group">
              <img
                src="/assets/aistudio/image_52b45d3f.png"
                alt="Piet Piraat en zijn bemanning: Stien Struis, Berend Brokkenpap en Steven Stil"
                className="w-full h-28 object-cover object-top hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1 text-center text-white">
                <p className="text-[10px] font-bold text-amber-200">
                  Stien · Berend · Steven · Piet
                </p>
              </div>
            </div>

            {/* Bemanning interactieve knoppen */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                <Anchor size={14} className="text-amber-700" />
                <span>Vraag het aan de crew:</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CREW_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleCrewClick(m)}
                    className={`p-2.5 rounded-2xl border-2 text-left transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-xs ${
                      selectedCrew === m.id
                        ? 'bg-amber-300/90 border-amber-600 shadow-md font-black'
                        : 'bg-white/80 hover:bg-white border-amber-300 font-bold'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">{m.name}</div>
                      <div className="text-[10px] text-amber-800 font-semibold truncate">
                        {m.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Piraten uitspraken / Sfeerbox */}
            <div className="bg-amber-200/70 border-2 border-amber-400 rounded-2xl p-3 text-xs text-amber-950 font-bold">
              <span className="text-base mr-1">💬</span>
              <span className="italic">
                &quot;Schivermejantjes! Koers recht vooruit en alle hens aan dek!&quot;
              </span>
            </div>
          </div>

          {/* Rechterpaneel: Chat & Vragen */}
          <div className="flex-1 flex flex-col justify-between bg-amber-50/70 min-h-0">
            {/* Berichtenlijst */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
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
                    className={`max-w-[85%] rounded-3xl p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-xs border-2 border-sky-400 font-bold'
                        : 'bg-white text-slate-900 rounded-tl-xs border-2 border-amber-400 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
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
                <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm p-3 bg-amber-200/60 rounded-2xl border-2 border-amber-400 w-fit animate-pulse">
                  <span className="text-2xl animate-spin">🧭</span>
                  <span>Piet kijkt door zijn verrekijker naar de sterren...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Snelle vraag suggesties */}
            <div className="p-3 bg-amber-100/90 border-t-2 border-amber-300">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-900 mb-2">
                ⚡ Tik een snelle piratenvraag:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 border-2 border-amber-300 hover:border-amber-500 text-xs font-bold whitespace-nowrap shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Tekstinvoer en verzendknop */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(inputText);
              }}
              className="p-3 bg-white border-t-3 border-amber-400 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Vraag iets aan Kapitein Piet Piraat...`}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-amber-50/60 border-2 border-amber-300 focus:border-amber-500 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold text-sm sm:text-base focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sky-950 font-black rounded-2xl shadow-md border-2 border-amber-400 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Vuur af!</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
