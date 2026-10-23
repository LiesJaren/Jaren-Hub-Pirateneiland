import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameHeader, GameResult, ProgressDots, pickDistractors, shuffle } from './GameParts';
import { SpeechButton } from '../../components/SpeechButton';
import { usePlatform } from '../../platform/PlatformContext';
import { playOops, playSuccess } from '../../platform/sound';

type CountRound = {
  count: number;
  options: number[];
};

function makeRounds(maxNumber = 10): CountRound[] {
  const numbers = maxNumber === 20
    ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]
    : [1, 2, 3, 4, 5, 6, 7];
  return shuffle(numbers)
    .slice(0, 5)
    .map((count) => ({
      count,
      options: shuffle([count, ...pickDistractors(numbers, count, 2)]),
    }));
}

export default function CountGame({ onBack }: { onBack: () => void }) {
  const { addEvent, learningConfig } = usePlatform();
  const [rounds, setRounds] = useState<CountRound[]>(() =>
    makeRounds(learningConfig?.mathMaxNumber ?? 10),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [wrongOptions, setWrongOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedRef = useRef(false);

  const round = rounds[index]!;

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    void addEvent({
      app: 'learning',
      type: 'game.completed',
      payload: {
        game: 'vissentellen',
        score,
        rounds: rounds.length,
        counts: rounds.map((item) => item.count),
      },
      stars: score,
    }).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : 'Sterren bewaren lukte niet.');
    });
  }, [finished, addEvent, score, rounds]);

  function answer(option: number) {
    if (locked) return;

    if (option === round.count) {
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
          setWrongOptions([]);
          setFeedback(null);
          setLocked(false);
        }
      }, 850);
      return;
    }

    playOops();
    setFirstTry(false);
    setFeedback('wrong');
    setWrongOptions((current) => [...current, option]);
  }

  function reset() {
    setRounds(makeRounds());
    setIndex(0);
    setScore(0);
    setFirstTry(true);
    setWrongOptions([]);
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
          eyebrow="Rekenen"
          title="Vissen tellen"
          speech="Goed gedaan! Je hebt de vissen geteld."
          onBack={onBack}
        />
        <GameResult
          title="Vissen tellen klaar"
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
        eyebrow="Rekenen"
        title="Vissen tellen"
        speech="Hoeveel vissen zie je? Tel ze rustig en kies het juiste getal."
        onBack={onBack}
      />
      <ProgressDots current={index + 1} total={rounds.length} />

      <section className="panel game-panel">
        <div className="game-question">
          <p className="eyebrow">Hoeveel vissen zie je?</p>
          <div className="ten-frame" role="img" aria-label="Vissen om te tellen">
            {Array.from({ length: 10 }).map((_, slot) => (
              <span
                key={slot}
                className={slot < round.count ? 'ten-slot filled' : 'ten-slot'}
                aria-hidden="true"
              >
                {slot < round.count ? '🐟' : ''}
              </span>
            ))}
          </div>
          <SpeechButton text="Hoeveel vissen zie je? Tel ze rustig." label="Lees de vraag voor" />
        </div>

        <div className="number-options" role="group" aria-label="Kies het aantal vissen">
          {round.options.map((option) => {
            const wrong = wrongOptions.includes(option);
            const correct = feedback === 'correct' && option === round.count;
            return (
              <button
                key={option}
                type="button"
                className={
                  correct
                    ? 'number-option correct'
                    : wrong
                      ? 'number-option wrong'
                      : 'number-option'
                }
                onClick={() => answer(option)}
                disabled={locked || wrong}
                aria-label={`${option} vissen`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p
          className={
            feedback === 'wrong' ? 'game-feedback wrong' : 'game-feedback'
          }
          aria-live="polite"
        >
          {feedback === 'correct'
            ? 'Goed geteld!'
            : feedback === 'wrong'
              ? 'Bijna! Tel nog eens rustig.'
              : 'Tel de vissen en kies het getal.'}
        </p>
      </section>
    </div>
  );
}
