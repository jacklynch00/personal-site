import Link from 'next/link';

export default function RaceButton() {
  return (
    <Link href="/race" className="race-button" aria-label="Open the racing mini-game">
      <span className="race-track">
        <span className="race-car" />
      </span>
      <span>Race mode</span>
    </Link>
  );
}
