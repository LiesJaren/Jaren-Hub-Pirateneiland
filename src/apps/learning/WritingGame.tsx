import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameHeader, GameResult, ProgressDots, shuffle } from './GameParts';
import { WordWithLetter } from './LetterWord';
import { LETTERS, type LetterEntry } from './letterData';
import { SpeechButton } from '../../components/SpeechButton';
import { usePlatform } from '../../platform/PlatformContext';
import { playOops, playSuccess } from '../../platform/sound';

function makeRounds(): LetterEntry[] {
  return shuffle(LETTERS).slice(0, 5);
}

export default function WritingGame({ onBack }: { onBack: () => void }) {
  const { addEvent } = usePlatform();
  const [rounds, setRounds] = useState<LetterEntry[]>(makeRounds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const target = rounds[index]!;

  useEffect(() => {
    if (finished) return;
    setValue('');
    setFeedback(null);
    setLocked(false);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [index, finished]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    void addEvent({
      app: 'learning',
      type: 'game.completed',
      payload: {
        game: 'lettertypen',
        score,
        rounds: rounds.length,
        letters: rounds.map((item) => item.letter),
      },
      stars: score,
    }).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : 'Sterren bewaren lukte niet.');
    });
  }, [finished, addEvent, score, rounds]);

  function correct() {
    playSuccess();
    setFeedback('correct');
    setLocked(true);
    if (firstTry) setScore((current) => current + 1);
    window.setTimeout(() => {
      if (index === rounds.length - 1) {
        setFinished(true);
        void confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.65 },
          colors: ['#fbbf24', '#34d399', '#38bdf8', '#f472b6'],
        });
      } else {
        setIndex((current) => current + 1);
        setFirstTry(true);
      }
    }, 800);
  }

  function wrong() {
    playOops();
    setFirstTry(false);
    setFeedback('wrong');
    setLocked(true);
    window.setTimeout(() => {
      setValue('');
      setFeedback(null);
      setLocked(false);
      inputRef.current?.focus();
    }, 750);
  }

  function onChange(next: string) {
    if (locked) return;
    const clean = next
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .slice(0, target.letter.length);
    setValue(clean);

    if (clean.length === target.letter.length) {
      if (clean === target.letter) correct();
      else wrong();
    }
  }

  function reset() {
    setRounds(makeRounds());
    setIndex(0);
    setScore(0);
    setFirstTry(true);
    setValue('');
    setFeedback(null);
    setLocked(false);
    setFinished(false);
    setError(null);
    savedRef.current = false;
  }

  if (finished) {
    return (
      <div className="app-page game-page">
        <GameHeader
          eyebrow="Schrijven"
          title="Typ de letter"
          speech="Goed gedaan! Je hebt de letters getypt."
          onBack={onBack}
        />
        <GameResult
          title="Typ de letter klaar"
          score={score}
          total={rounds.length}
          onAgain={reset}
          onBack={onBack}
        >
          {error && <p className="form-error">{error}</p>}
        </GameResult>
      </div>
    );
  }

  return (
    <div className="app-page game-page">
      <GameHeader
        eyebrow="Schrijven"
        title="Typ de letter"
        speech="Typ de letter die je ziet. Gebruik het toetsenbord."
        onBack={onBack}
      />
      <ProgressDots current={index + 1} total={rounds.length} />

      <section className="panel game-panel">
        <div className="game-question">
          <p className="eyebrow">Typ deze letter</p>
          <div className="big-letter" aria-live="polite">
            {target.letter}
          </div>
          <p className="letter-word">
            <span aria-hidden="true">{target.emoji}</span>{' '}
            <WordWithLetter word={target.word} letter={target.letter} />
          </p>
          <SpeechButton text={target.speech} label="Hoor de letter" />
        </div>

        <div className="typing-area">
          <label htmlFor="letter-input" className="typing-label">
            Typ de letter
          </label>
          <input
            ref={inputRef}
            id="letter-input"
            className={
              feedback === 'correct'
                ? 'letter-input correct'
                : feedback === 'wrong'
                  ? 'letter-input wrong'
                  : 'letter-input'
            }
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={target.letter.length}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="text"
            aria-label={`Typ de letter ${target.letter}`}
            disabled={locked}
          />
          <p className="typing-hint">Gebruik het toetsenbord. Je hoeft alleen de letter te typen.</p>
        </div>

        <p
          className={
            feedback === 'wrong' ? 'game-feedback wrong' : 'game-feedback'
          }
          aria-live="polite"
        >
          {feedback === 'correct'
            ? 'Goed getypt!'
            : feedback === 'wrong'
              ? 'Bijna! Kijk goed en probeer nog eens.'
              : 'Typ de letter die je hierboven ziet.'}
        </p>
      </section>
    </div>
  );
}
