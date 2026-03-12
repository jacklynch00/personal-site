import Image from 'next/image';
import Link from 'next/link';
import { getEssays } from '@/lib/essays';

export default async function Home() {
  const essays = await getEssays();

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
        <p>Software developer based in Columbus, Ohio. Building things on the web.</p>
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
    </>
  );
}
