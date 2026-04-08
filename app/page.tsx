import Image from 'next/image';
import Link from 'next/link';
import { getEssays } from '@/lib/essays';
import { getFootnotes } from '@/lib/footnotes';

export default async function Home() {
  const essays = await getEssays();
  const footnotes = await getFootnotes();

  return (
    <>
      <header>
        <Image
          src="/avatar.jpg"
          alt="Jack Lynch"
          width={128}
          height={128}
          className="avatar"
        />
        <h1>Jack Lynch</h1>
        <p>Software developer based in New York City. Building things on the web.</p>
        <p className="social-links">
          <a href="https://twitter.com/jack_lynch00">Twitter</a>
          {' · '}
          <a href="https://linkedin.com/in/0-jack-lynch">LinkedIn</a>
          {' · '}
          <a href="https://www.instagram.com/jack_lynch00">Instagram</a>
        </p>
      </header>

      {essays.length > 0 && (
        <section>
          <h2>Essays</h2>
          <ul className="essay-list">
            {essays.map((essay) => (
              <li key={essay.slug}>
                <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
                <span className="essay-date">{essay.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Footnotes</h2>
        <p className="section-description">Quick thoughts on random topics. Less polished, more exploratory.</p>
        {footnotes.length > 0 ? (
          <ul className="essay-list">
            {footnotes.map((fn) => (
              <li key={fn.slug}>
                <Link href={`/footnotes/${fn.slug}`}>{fn.title}</Link>
                <span className="essay-date">{fn.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Coming soon.</p>
        )}
        <Link href="/footnotes" className="section-link">View all footnotes →</Link>
      </section>
    </>
  );
}
