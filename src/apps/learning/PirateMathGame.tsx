import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameHeader, GameResult, ProgressDots, shuffle } from './GameParts';
import { SpeechButton } from '../../components/SpeechButton';
import { usePlatform } from '../../platform/PlatformContext';
import { playOops, playSuccess } from '../../platform/sound';

type Mode = 'plus' | 'min' | 'mix';
type Round = { a: number; b: number; op: '+' | '-'; answer: number; options: number[] };

function makeRounds(mode: Mode, max: number): Round[] {
  return Array.from({ length: 8 }, (_, i) => {
    const op = mode === 'mix' ? (i % 2 === 0 ? '+' : '-') : mode === 'plus' ? '+' : '-';
    const a = Math.floor(Math.random() * (max + 1));
    const b = op === '+' ? Math.floor(Math.random() * (max - a + 1)) : Math.floor(Math.random() * (a + 1));
    const answer = op === '+' ? a + b : a - b;
    const candidates = shuffle(Array.from({ length: max + 1 }, (_, n) => n).filter(n => n !== answer)).slice(0, 3);
    return { a, b, op, answer, options: shuffle([answer, ...candidates]) };
  });
}

export default function PirateMathGame({ onBack }: { onBack: () => void }) {
  const { addEvent, learningConfig } = usePlatform();
  const [mode, setMode] = useState<Mode>('mix');
  const [max, setMax] = useState(10);
  const [rounds, setRounds] = useState<Round[]>(() => makeRounds('mix', 10));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [wrong, setWrong] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = useRef(false);
  const round = rounds[index]!;

  useEffect(() => {
    if (!finished || saved.current) return;
    saved.current = true;
    void addEvent({
      app: 'learning',
      type: 'game.completed',
      payload: { game: 'piratenrekenen', mode, max, score, rounds: rounds.length },
      stars: score,
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sterren bewaren lukte niet.'));
  }, [finished, addEvent, mode, max, score, rounds.length]);

  function restart(nextMode = mode, nextMax = max) {
    setMode(nextMode);
    setMax(nextMax);
    setRounds(makeRounds(nextMode, nextMax));
    setIndex(0); setScore(0); setFirstTry(true); setWrong([]);
    setFeedback(null); setLocked(false); setFinished(false); setError(null); saved.current = false;
  }

  function answer(n: number) {
    if (locked || wrong.includes(n)) return;
    if (n !== round.answer) {
      playOops(); setWrong(items => [...items, n]); setFirstTry(false); setFeedback('wrong'); return;
    }
    playSuccess(); setFeedback('correct'); setLocked(true);
    if (firstTry) setScore(s => s + 1);
    window.setTimeout(() => {
      if (index === rounds.length - 1) {
        setFinished(true);
        void confetti({ particleCount: 100, spread: 75, origin: { y: 0.65 } });
      } else {
        setIndex(i => i + 1); setWrong([]); setFirstTry(true); setFeedback(null); setLocked(false);
      }
    }, 850);
  }

  return <div className="app-page game-page">
    <GameHeader eyebrow="Leerwereld · Rekenen" title="🏴‍☠️ Piratenrekenen" speech="Welkom bij Piratenrekenen! Los de sommen op en verdien sterren." onBack={onBack} />
    <section className="panel game-panel">
      <p className="eyebrow">Kies jouw piratenmissie</p>
      <div className="number-options" role="group" aria-label="Soort sommen">
        {([['plus','➕ Optellen'],['min','➖ Aftrekken'],['mix','⚓ Allebei']] as const).map(([value,label]) =>
          <button key={value} type="button" className={mode === value ? 'number-option correct' : 'number-option'} style={{fontSize:'1rem',minWidth:'6rem'}} onClick={() => restart(value,max)}>{label}</button>)}
      </div>
      <div className="number-options" role="group" aria-label="Moeilijkheid">
        {[10,20].map(n => <button key={n} type="button" className={max === n ? 'number-option correct' : 'number-option'} style={{fontSize:'1rem'}} onClick={() => restart(mode,n)}>Tot {n}</button>)}
      </div>
    </section>
    {finished ? <GameResult title="Piratenmissie geslaagd!" score={score} total={rounds.length} onAgain={() => restart()} onBack={onBack}>{error && <p className="form-error">{error}</p>}</GameResult> :
    <>
      <ProgressDots current={index + 1} total={rounds.length} />
      <section className="panel game-panel">
        <div className="game-question">
          <p className="eyebrow">Los de som op</p>
          <h2 style={{fontSize:'clamp(2.5rem, 10vw, 4.5rem)',textAlign:'center',margin:'1rem 0'}}>{round.a} {round.op} {round.b} = ?</h2>
          <SpeechButton text={`${round.a} ${round.op === '+' ? 'plus' : 'min'} ${round.b}. Hoeveel is dat?`} label="Lees de som voor" />
        </div>
        <div className="number-options" role="group" aria-label="Kies het juiste antwoord">
          {round.options.map(n => <button key={n} type="button" className={feedback === 'correct' && n === round.answer ? 'number-option correct' : wrong.includes(n) ? 'number-option wrong' : 'number-option'} disabled={locked || wrong.includes(n)} onClick={() => answer(n)}>{n}</button>)}
        </div>
        <p className={feedback === 'wrong' ? 'game-feedback wrong' : 'game-feedback'} aria-live="polite">{feedback === 'correct' ? 'Goed gedaan, piraat! ⭐' : feedback === 'wrong' ? 'Probeer nog eens, je kunt het!' : 'Kies het juiste antwoord om sterren te verdienen.'}</p>
      </section>
    </>}
  </div>;
}
