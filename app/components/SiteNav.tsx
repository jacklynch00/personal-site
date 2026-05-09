import Image from 'next/image';
import Link from 'next/link';

type SiteNavProps = {
  className?: string;
};

export default function SiteNav({ className = '' }: SiteNavProps) {
  return (
    <nav className={['site-nav', 'racer-site-nav', className].filter(Boolean).join(' ')}>
      <Link href="/" className="wordmark">Jack Lynch</Link>
      <span className="nav-race-lane" aria-hidden="true">
        <span className="nav-race-track" />
        <span className="nav-race-car-wrap">
          <span className="nav-race-smoke nav-race-smoke-one" />
          <span className="nav-race-smoke nav-race-smoke-two" />
          <span className="nav-race-smoke nav-race-smoke-three" />
          <Image
            src="/racecar.png"
            alt=""
            width={56}
            height={56}
            className="nav-race-car"
          />
        </span>
      </span>
      <div className="site-nav-links">
        <Link href="/projects">Projects</Link>
        <Link href="/essays">Essays</Link>
        <Link href="/books">Books</Link>
      </div>
    </nav>
  );
}
