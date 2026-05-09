import { getBooks } from '@/lib/books';
import { Metadata } from 'next';
import SiteNav from '../components/SiteNav';

export const metadata: Metadata = {
  title: 'Books — Jack Lynch',
  description: 'Books I\'ve read.',
};

function formatBookDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function BooksPage() {
  const { books } = getBooks();
  const sortedBooks = [...books].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'reading' ? -1 : 1;
    }
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return (b.dateFinished || '').localeCompare(a.dateFinished || '') || a.title.localeCompare(b.title);
  });

  return (
    <main className="public-page-shell">
      <SiteNav />

      <section className="page-hero">
        <h1>Books</h1>
        <p>What I am reading, what I finished, and what stayed with me.</p>
      </section>

      {sortedBooks.length === 0 ? (
        <section className="empty-state">
          <h2>No books yet.</h2>
          <p>Books will appear here once added in admin.</p>
        </section>
      ) : (
        <section className="book-grid">
          {sortedBooks.map((book) => (
            <article key={`${book.title}-${book.author}-${book.year}`} className="book-card">
              <div className="book-card-top">
                <span className={book.status === 'reading' ? 'book-status book-status-reading' : 'book-status'}>
                  {book.status === 'reading' ? 'Reading' : 'Finished'}
                </span>
                <span className="book-year">{book.year}</span>
              </div>
              <h2>{book.title}</h2>
              <p className="book-author">by {book.author}</p>
              <div className="book-card-meta">
                <span>Year: {book.year}</span>
                <span>
                  {book.dateFinished ? `Finished ${formatBookDate(book.dateFinished)}` : 'In progress'}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
