import { useState } from 'react';
import { Sparkles, X, Volume2 } from 'lucide-react';
import { playPop, playSuccess } from '../platform/sound';
import { useSpeech } from '../platform/useSpeech';
import { JarenAvatar } from './JarenAvatar';

interface BottleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
}

const PIRATE_JOKES = [
  {
    question: 'Wat is het lievelingseten van een hongerige piraat?',
    answer: 'Kraai-ennest-soep met scheepsbeschuit! 🥣',
  },
  {
    question: 'Waarom dragen piraten altijd een ooglapje?',
    answer: 'Zodat ze in het donkere scheepsruim meteen scherp kunnen zien! 👁️',
  },
  {
    question: 'Wat roept een piraat als hij een lekker ijsje ziet?',
    answer: 'Schip Ahoy! IJshoorn in zicht! 🍦',
  },
  {
    question: 'Wat is de lievelingsletter van een piraat?',
    answer: 'Je denkt de RRRR... maar zijn hart ligt bij de ZEEEE! 🌊',
  },
  {
    question: 'Hoe groeten piraten elkaar in de ochtend?',
    answer: 'Goeie morgen, schatzoeker! Tijd om de zeilen te hijsen! ⛵',
  },
];

const COMPLIMENTS = [
  'Je bent een superkapitein die al ontzettend goed kan leren!',
  'Wist je dat jouw glimlach het hele eiland doet stralen?',
  'Goed bezig vandaag! Elke taak die je afrondt maakt je sterker.',
  'Papegaai Coco is supertrots op hoe dapper je bent!',
  'Je bent een echte meester-verkenner op jouw eigen eiland!',
];

export function BottleMessageModal({ isOpen, onClose, childName }: BottleMessageModalProps) {
  const [jokeIndex, setJokeIndex] = useState(0);
  const [complimentIndex, setComplimentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const speak = useSpeech();

  if (!isOpen) return null;

  const currentJoke = PIRATE_JOKES[jokeIndex % PIRATE_JOKES.length];
  const currentCompliment = COMPLIMENTS[complimentIndex % COMPLIMENTS.length];

  const fullText = `Flessenpost voor Kapitein ${childName}! ${currentCompliment}. Piratenraadsel: ${currentJoke.question} ... ${currentJoke.answer}`;

  const nextMessage = () => {
    playPop();
    setJokeIndex((prev) => prev + 1);
    setComplimentIndex((prev) => prev + 1);
    setRevealed(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Aangespoelde Flessenpost"
    >
      <div className="relative w-full max-w-md bg-amber-50 border-4 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 transform transition-all scale-100 overflow-hidden">
        {/* Perkament achtergrond patroon */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-300/40 rounded-full blur-lg pointer-events-none" />

        {/* Sluitknop */}
        <button
          type="button"
          onClick={() => {
            playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-amber-900/60 hover:text-amber-900 hover:bg-amber-200/50 rounded-full transition-colors"
          aria-label="Sluit flessenpost"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* Flessenpost Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl filter drop-shadow-md" role="img" aria-label="Fles">
            🍾
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Aangespoeld op het strand!
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950">
              Geheime Flessenpost
            </h3>
          </div>
        </div>

        {/* Boodschap Perkament */}
        <div className="bg-amber-100/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <JarenAvatar size="sm" showBadge={false} />
            <p className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
              Voor Kapitein <span className="text-amber-600 underline font-black">{childName}</span>:
            </p>
          </div>
          <p className="text-sm sm:text-base text-amber-900 font-medium italic">
            "{currentCompliment}"
          </p>

          <hr className="border-amber-200" />

          {/* Piraten Raadsel */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wide">
              <Sparkles size={14} className="text-amber-500" /> Piratenmopje:
            </span>
            <p className="text-sm sm:text-base font-semibold text-slate-900 mt-1">
              {currentJoke.question}
            </p>

            {revealed ? (
              <div className="mt-2.5 p-3 bg-amber-200/60 border border-amber-300 rounded-xl text-amber-950 font-bold text-sm sm:text-base animate-in zoom-in-95">
                {currentJoke.answer}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playSuccess();
                  setRevealed(true);
                }}
                className="mt-2 text-xs sm:text-sm font-bold text-amber-700 bg-amber-200/80 hover:bg-amber-300/80 px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Tik om het antwoord te zien! 🏴‍☠️
              </button>
            )}
          </div>
        </div>

        {/* Actieknoppen */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => speak(fullText)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-200 text-amber-900 hover:bg-amber-300 text-xs sm:text-sm font-bold transition-colors"
            title="Voorlezen"
          >
            <Volume2 size={18} />
            <span>Voorlezen</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={nextMessage}
              className="px-4 py-2.5 rounded-xl bg-amber-200/90 text-amber-900 hover:bg-amber-300 font-bold text-xs sm:text-sm transition-colors"
            >
              Nog een fles!
            </button>
            <button
              type="button"
              onClick={() => {
                playPop();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Bedankt!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
