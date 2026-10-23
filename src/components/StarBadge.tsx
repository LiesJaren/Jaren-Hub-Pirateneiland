import { Star } from 'lucide-react';
import { useSpeech } from '../platform/useSpeech';

export function StarBadge({ stars }: { stars: number }) {
  const speak = useSpeech();
  const label = stars === 1 ? 'ster' : 'sterren';

  return (
    <button
      type="button"
      className="star-badge"
      onClick={() => speak(`Je hebt ${stars} ${label}.`)}
      aria-label={`Je hebt ${stars} ${label}. Tik om te horen.`}
    >
      <Star className="star-badge-icon" size={20} strokeWidth={2.6} />
      <span className="star-badge-number" key={stars}>
        {stars}
      </span>
    </button>
  );
}
