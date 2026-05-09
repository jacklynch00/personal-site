import Link from 'next/link';
import RaceExperience from './RaceExperience';

export const metadata = {
  title: 'Race Mode — Jack Lynch',
  description: 'An F1-inspired mini-game for exploring Jack Lynch\'s site.',
};

export default function RacePage() {
  return (
    <main className="race-page">
      <div className="race-topbar">
        <Link href="/" className="race-back">Back to site</Link>
        <div>
          <strong>Race Mode</strong>
          <span>Arrow keys / WASD to drive. Stop in a pit box to open it.</span>
        </div>
      </div>
      <RaceExperience />
    </main>
  );
}
