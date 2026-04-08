import Link from 'next/link';
import { getBooks, getAllYears } from '@/lib/books';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Books — Jack Lynch',
  description: 'Books I\'ve read.',
};

function formatBookDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function BooksPage() {
  const { goal, books } = getBooks();
  const years = getAllYears();

  return (
    <article>
      <Link href="/" className="back-link">← Jack Lynch</Link>
      <h1>Books</h1>

      {years.length === 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No books yet.</p>
      )}

      {years.map((year) => {
        const yearBooks = books.filter((b) => b.year === year);
        const finished = yearBooks.filter((b) => b.status === 'finished');
        const reading = yearBooks.find((b) => b.status === 'reading');

        return (
          <section key={year}>
            <div className="reading-header">
              <h2>{year}</h2>
              <span className="reading-progress">{finished.length} of {goal}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min((finished.length / goal) * 100, 100)}%` }}
              />
            </div>

            {reading && (
              <>
                <p className="book-label">Now reading</p>
                <p className="book-entry">
                  {reading.title} <span className="book-author">— {reading.author}</span>
                </p>
              </>
            )}

            {finished.length > 0 && (
              <>
                <p className="book-label">Finished</p>
                <ul className="essay-list">
                  {finished
                    .sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''))
                    .map((book, i) => (
                      <li key={i}>
                        <span>{book.title} <span className="book-author">— {book.author}</span></span>
                        <span className="essay-date">{book.dateFinished ? formatBookDate(book.dateFinished) : ''}</span>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </section>
        );
      })}
    </article>
  );
}
