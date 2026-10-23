import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { SpeechButton } from '../../components/SpeechButton';

export function GameHeader({
  eyebrow,
  title,
  speech,
  onBack,
}: {
  eyebrow: string;
  title: string;
  speech: string;
  onBack: () => void;
}) {
  return (
    <header className="game-header">
      <button type="button" className="home-button" onClick={onBack}>
        <ArrowLeft size={19} /> Leerwereld
      </button>
      <div className="game-header-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <SpeechButton text={speech} />
    </header>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="progress-dots" aria-label={`Vraag ${current} van ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={
            index < current - 1
              ? 'progress-dot done'
              : index === current - 1
                ? 'progress-dot active'
                : 'progress-dot'
          }
        />
      ))}
    </div>
  );
}

export function GameResult({
  title,
  score,
  total,
  onAgain,
  onBack,
  children,
}: {
  title: string;
  score: number;
  total: number;
  onAgain: () => void;
  onBack: () => void;
  children?: ReactNode;
}) {
  const message =
    score === total
      ? 'Alles goed! Wat een ster ben jij!'
      : score >= Math.ceil(total / 2)
        ? 'Knap gedaan! Je bent goed op weg.'
        : 'Goed geoefend. Volgende keer gaat het nog beter.';

  return (
    <div className="panel celebration-panel">
      <div className="celebration-mascot">
        <Mascot size={160} />
      </div>
      <div className="game-result-copy">
        <p className="eyebrow">Spelletje klaar</p>
        <h2>{title}</h2>
        <p>{message}</p>
        {children}
        <div className="result-stars" aria-label={`${score} van ${total} sterren`}>
          {Array.from({ length: total }).map((_, index) => (
            <span key={index} className={index < score ? 'result-star filled' : 'result-star'}>
              ★
            </span>
          ))}
        </div>
        <p className="result-label">
          {score} van {total} sterren
        </p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={onAgain}>
            <RefreshCw size={17} /> Nog eens
          </button>
          <button type="button" className="secondary-button" onClick={onBack}>
            Terug naar de Leerwereld <ArrowRight size={17} />
          </button>
          <Link to="/" className="text-link">
            Naar het eiland
          </Link>
        </div>
      </div>
    </div>
  );
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[random]] = [copy[random]!, copy[index]!];
  }
  return copy;
}

export function pickDistractors<T>(all: T[], target: T, count = 2): T[] {
  return shuffle(all.filter((item) => item !== target)).slice(0, count);
}
