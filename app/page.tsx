import Image from 'next/image';
import Link from 'next/link';
import { getEssays } from '@/lib/essays';
import { getFootnotes } from '@/lib/footnotes';
import { getBooks } from '@/lib/books';

function formatBookDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function Home() {
  const essays = await getEssays();
  const footnotes = await getFootnotes();
  const { goal, books } = getBooks();

  const currentYear = new Date().getFullYear();
  const yearBooks = books.filter((b) => b.year === currentYear);
  const currentlyReading = yearBooks.find((b) => b.status === 'reading') || null;
  const finishedBooks = yearBooks
    .filter((b) => b.status === 'finished')
    .sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
  const finishedCount = finishedBooks.length;

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

      <section>
        <div className="reading-header">
          <h2>Reading</h2>
          <span className="reading-progress">{currentYear} · {finishedCount} of {goal}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min((finishedCount / goal) * 100, 100)}%` }}
          />
        </div>

        {currentlyReading && (
          <>
            <p className="book-label">Now reading</p>
            <p className="book-entry">
              {currentlyReading.title} <span className="book-author">— {currentlyReading.author}</span>
            </p>
          </>
        )}

        {finishedBooks.length > 0 && (
          <>
            <p className="book-label">Finished</p>
            <ul className="essay-list">
              {finishedBooks.map((book, i) => (
                <li key={i}>
                  <span>{book.title} <span className="book-author">— {book.author}</span></span>
                  <span className="essay-date">{book.dateFinished ? formatBookDate(book.dateFinished) : ''}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {!currentlyReading && finishedBooks.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>No books yet this year.</p>
        )}

        <Link href="/books" className="section-link">View past years →</Link>
      </section>
    </>
  );
}
