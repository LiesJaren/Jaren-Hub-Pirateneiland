export function WordWithLetter({ word, letter }: { word: string; letter: string }) {
  const index = word.indexOf(letter);
  if (index === -1) return <>{word}</>;
  return (
    <>
      {word.slice(0, index)}
      <mark>{letter}</mark>
      {word.slice(index + letter.length)}
    </>
  );
}
