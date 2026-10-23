import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameHeader, GameResult, ProgressDots, pickDistractors, shuffle } from './GameParts';
import { WordWithLetter } from './LetterWord';
import { LETTERS, type LetterEntry } from './letterData';
import { SpeechButton } from '../../components/SpeechButton';
import { usePlatform } from '../../platform/PlatformContext';
import { playOops, playSuccess } from '../../platform/sound';

type LetterRound = {
  target: LetterEntry;
  options: LetterEntry[];
};

function makeRounds(): LetterRound[] {
  return shuffle(LETTERS)
    .slice(0, 5)
    .map((target) => ({
      target,
      options: shuffle([target, ...pickDistractors(LETTERS, target, 2)]),
    }));
}

export default function LetterGame({ onBack }: { onBack: () => void }) {
  const { addEvent } = usePlatform();
  const [rounds, setRounds] = useState<LetterRound[]>(makeRounds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedRef = useRef(false);

  const round = rounds[index]!;
  const target = round.target;

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    void addEvent({
      app: 'learning',
      type: 'game.completed',
      payload: {
        game: 'letterjacht',
        score,
        rounds: rounds.length,
        letters: rounds.map((item) => item.target.letter),
      },
      stars: score,
    }).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : 'Sterren bewaren lukte niet.');
    });
  }, [finished, addEvent, score, rounds]);

  function answer(option: LetterEntry) {
    if (locked) return;

    if (option.letter === target.letter) {
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
    setWrongOptions((current) => [...current, option.letter]);
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
          eyebrow="Lezen"
          title="Letterjacht"
          speech="Goed gedaan! Je hebt de letterjacht afgemaakt."
          onBack={onBack}
        />
        <GameResult
          title="Letterjacht klaar"
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
        eyebrow="Lezen"
        title="Letterjacht"
        speech="Welke letter zie je? Tik op dezelfde letter."
        onBack={onBack}
      />
      <ProgressDots current={index + 1} total={rounds.length} />

      <section className="panel game-panel">
        <div className="game-question">
          <p className="eyebrow">Welke letter is dit?</p>
          <div className="big-letter" aria-live="polite">
            {target.letter}
          </div>
          <p className="letter-word">
            <span aria-hidden="true">{target.emoji}</span>{' '}
            <WordWithLetter word={target.word} letter={target.letter} />
          </p>
          <SpeechButton text={target.speech} label="Hoor de letter" />
        </div>

        <div className="letter-options" role="group" aria-label="Kies dezelfde letter">
          {round.options.map((option) => {
            const wrong = wrongOptions.includes(option.letter);
            const correct = feedback === 'correct' && option.letter === target.letter;
            return (
              <button
                key={option.letter}
                type="button"
                className={
                  correct
                    ? 'letter-option correct'
                    : wrong
                      ? 'letter-option wrong'
                      : 'letter-option'
                }
                onClick={() => answer(option)}
                disabled={locked || wrong}
                aria-label={`Letter ${option.letter}`}
              >
                {option.letter}
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
            ? 'Goed zo!'
            : feedback === 'wrong'
              ? 'Bijna! Probeer nog eens.'
              : 'Tik op de letter die je hierboven ziet.'}
        </p>
      </section>
    </div>
  );
}
