export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

export function formatDateLong(date = new Date()): string {
  return new Intl.DateTimeFormat('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('nl-BE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatWhen(value: string): string {
  const date = new Date(value);
  if (isToday(value)) return `Vandaag om ${formatTime(value)}`;
  return `${new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric',
    month: 'short',
  }).format(date)} om ${formatTime(value)}`;
}
