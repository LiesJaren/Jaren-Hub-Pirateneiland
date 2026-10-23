import { Volume2 } from 'lucide-react';
import { speak } from '../platform/useSpeech';

type SpeechButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function SpeechButton({
  text,
  label = 'Lees voor',
  className = '',
}: SpeechButtonProps) {
  return (
    <button
      type="button"
      className={`speech-button ${className}`.trim()}
      onClick={() => speak(text)}
      aria-label={label}
      title={label}
    >
      <Volume2 size={22} strokeWidth={2.4} />
    </button>
  );
}
