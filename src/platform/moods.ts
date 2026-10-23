export type Mood = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

export const moods: Mood[] = [
  { id: 'blij', emoji: '😄', label: 'Blij', color: '#fbbf24' },
  { id: 'rustig', emoji: '🙂', label: 'Rustig', color: '#34d399' },
  { id: 'gewoon', emoji: '😐', label: 'Gewoon', color: '#94a3b8' },
  { id: 'moe', emoji: '😴', label: 'Moe', color: '#a78bfa' },
  { id: 'verdrietig', emoji: '😢', label: 'Verdrietig', color: '#60a5fa' },
  { id: 'boos', emoji: '😠', label: 'Boos', color: '#f87171' },
  { id: 'bang', emoji: '😨', label: 'Bang', color: '#c084fc' },
  { id: 'trots', emoji: '🤩', label: 'Trots', color: '#fb923c' },
];

export function moodById(id: unknown): Mood | undefined {
  return moods.find((mood) => mood.id === id);
}
