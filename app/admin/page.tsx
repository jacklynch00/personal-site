'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectAdmin from './ProjectAdmin';

const ADMIN_PASSWORD_STORAGE_KEY = 'jack-admin-password';

interface ContentItem {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
  archived?: boolean;
}

interface Book {
  title: string;
  author: string;
  status: 'reading' | 'finished';
  year: number;
  dateFinished?: string;
}

function currentDate() {
  return new Date().toISOString().split('T')[0];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('');
  const [essays, setEssays] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [booksGoal, setBooksGoal] = useState(12);
  const [booksLoading, setBooksLoading] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookIndex, setEditingBookIndex] = useState<number | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookStatus, setBookStatus] = useState<'reading' | 'finished'>('reading');
  const [bookDateFinished, setBookDateFinished] = useState('');
  const [bookYear, setBookYear] = useState(new Date().getFullYear());
  const [bookSaving, setBookSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearBooks = books.filter((book) => book.year === currentYear);
  const finishedThisYear = yearBooks.filter((book) => book.status === 'finished').length;
  const draftCount = essays.filter((item) => item.draft).length;

  async function verifyPassword(candidate: string) {
    const res = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: candidate }),
    });
    return res.ok;
  }

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/content?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setEssays(data.essays);
      }
    } catch (e) {
      setStatus(`Failed to load content: ${e}`);
    }
    setLoading(false);
  }

  async function fetchBooks() {
    setBooksLoading(true);
    try {
      const res = await fetch(`/api/books?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setBooksGoal(data.goal || 12);
      }
    } catch (e) {
      setStatus(`Failed to load books: ${e}`);
    }
    setBooksLoading(false);
  }

  useEffect(() => {
    if (authenticated) {
      fetchContent();
      fetchBooks();
    }
  }, [authenticated]);

  useEffect(() => {
    const savedPassword = window.localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);
    if (!savedPassword) return;

    let canceled = false;
    setStatus('Restoring saved session...');
    verifyPassword(savedPassword)
      .then((ok) => {
        if (canceled) return;
        if (ok) {
          setPassword(savedPassword);
          setAuthenticated(true);
          setStatus('');
        } else {
          window.localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
          setStatus('');
        }
      })
      .catch(() => {
        if (!canceled) setStatus('');
      });

    return () => {
      canceled = true;
    };
  }, []);

  function resetBookForm() {
    setBookTitle('');
    setBookAuthor('');
    setBookStatus('reading');
    setBookDateFinished('');
    setBookYear(currentYear);
    setShowBookForm(false);
    setEditingBookIndex(null);
  }

  function startEditBook(index: number) {
    const book = books[index];
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookStatus(book.status);
    setBookDateFinished(book.dateFinished || '');
    setBookYear(book.year);
    setEditingBookIndex(index);
    setShowBookForm(true);
  }

  async function saveBook() {
    if (!bookTitle || !bookAuthor) {
      setStatus('Title and author are required');
      return;
    }

    setBookSaving(true);
    const book: Book = {
      title: bookTitle,
      author: bookAuthor,
      status: bookStatus,
      year: bookYear,
    };
    if (bookStatus === 'finished') {
      book.dateFinished = bookDateFinished || currentDate();
    }

    const action = editingBookIndex !== null ? 'update' : 'add';
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action,
          book,
          index: editingBookIndex !== null ? editingBookIndex : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus(action === 'add' ? 'Book added' : 'Book updated');
        resetBookForm();
        await fetchBooks();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setBookSaving(false);
  }

  async function deleteBook(index: number) {
    if (!confirm(`Delete "${books[index].title}"?`)) return;
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'delete', index }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('Book deleted');
        await fetchBooks();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
  }

  async function markAsFinished(index: number) {
    const book = { ...books[index], status: 'finished' as const, dateFinished: currentDate() };
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'update', book, index }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('Marked as finished');
        await fetchBooks();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
  }

  async function publishDraft(slug: string, type: 'essay' | 'footnote') {
    setPublishing(slug);
    try {
      const res = await fetch('/api/publish-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, slug, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Published. Live at ${data.path} in about a minute.`);
        await fetchContent();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setPublishing(null);
  }

  async function toggleArchive(slug: string, type: 'essay' | 'footnote', archived: boolean) {
    setArchiving(slug);
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, slug, type, archived }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(archived ? 'Archived' : 'Unarchived');
        await fetchContent();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setArchiving(null);
  }

  if (!authenticated) {
    return (
      <main className="admin-login">
        <section className="admin-login-card">
          <p className="admin-kicker">Jack Lynch</p>
          <h1>Admin dashboard</h1>
          <p>Manage writing, projects, reading, and the public build archive.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!password) {
                setStatus('Enter a password');
                return;
              }
              setStatus('Checking...');
              try {
                const ok = await verifyPassword(password);
                if (ok) {
                  window.localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
                  setStatus('');
                  setAuthenticated(true);
                } else {
                  setStatus('Wrong password');
                }
              } catch {
                setStatus('Failed to verify password');
              }
            }}
          >
            <label className="admin-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            <button className="admin-button admin-button-primary" type="submit">Enter dashboard</button>
          </form>
          {status && <p className={status === 'Checking...' ? 'admin-status' : 'admin-status admin-status-error'}>{status}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">Jack Admin</Link>
        <nav>
          <a href="#projects">Projects</a>
          <a href="#writing">Writing</a>
          <a href="#books">Books</a>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">View site</Link>
          <Link href="/projects">Project log</Link>
          <button
            className="admin-sidebar-button"
            onClick={() => {
              window.localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
              setAuthenticated(false);
              setPassword('');
              setStatus('');
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Control room</p>
            <h1>Admin dashboard</h1>
            <p>Publish ideas, track builds, refresh revenue, and keep the site alive.</p>
          </div>
          <div className="admin-quick-actions">
            <Link className="admin-button admin-button-primary" href="/write">New essay</Link>
          </div>
        </header>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Essays</span>
            <strong>{essays.length}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Books {currentYear}</span>
            <strong>{finishedThisYear}/{booksGoal}</strong>
          </div>
        </section>

        {status && <p className={status.startsWith('Error') || status.startsWith('Failed') ? 'admin-status admin-status-error' : 'admin-status'}>{status}</p>}

        <ProjectAdmin password={password} />

        <section id="writing" className="admin-card">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Publishing queue</p>
              <h2>Writing</h2>
              <p>Review drafts, edit published pieces, and archive old posts.</p>
            </div>
            <div className="admin-quick-actions">
              <Link className="admin-button admin-button-primary" href="/write">New essay</Link>
            </div>
          </div>

          {loading && <p className="admin-muted">Loading writing...</p>}
          {!loading && essays.length === 0 && (
            <div className="admin-empty">
              <h3>No writing yet</h3>
              <p>Start with an essay.</p>
            </div>
          )}

          <ContentList
            title="Essays"
            items={essays}
            editBase="/write"
            type="essay"
            publishing={publishing}
            archiving={archiving}
            onPublish={publishDraft}
            onArchive={toggleArchive}
          />
        </section>

        <section id="books" className="admin-card">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Reading tracker</p>
              <h2>Books</h2>
              <p>{finishedThisYear} finished out of {booksGoal} in {currentYear}.</p>
            </div>
            <button className="admin-button admin-button-primary" onClick={() => { resetBookForm(); setShowBookForm(true); }}>
              Add book
            </button>
          </div>

          {showBookForm && (
            <div className="admin-form-panel">
              <div className="admin-form-title">
                <div>
                  <h3>{editingBookIndex === null ? 'Add book' : 'Edit book'}</h3>
                  <p>Keep the public reading log current.</p>
                </div>
                <button className="admin-button admin-button-ghost" onClick={resetBookForm}>Close</button>
              </div>
              <div className="admin-field-grid">
                <label className="admin-field">
                  <span>Title</span>
                  <input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Author</span>
                  <input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} />
                </label>
              </div>
              <div className="admin-field-grid">
                <label className="admin-field">
                  <span>Status</span>
                  <select value={bookStatus} onChange={(e) => setBookStatus(e.target.value as 'reading' | 'finished')}>
                    <option value="reading">Currently reading</option>
                    <option value="finished">Finished</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Year</span>
                  <input type="number" value={bookYear} onChange={(e) => setBookYear(parseInt(e.target.value))} />
                </label>
                {bookStatus === 'finished' && (
                  <label className="admin-field">
                    <span>Date finished</span>
                    <input type="date" value={bookDateFinished} onChange={(e) => setBookDateFinished(e.target.value)} />
                  </label>
                )}
              </div>
              <div className="admin-form-actions">
                <button className="admin-button admin-button-primary" onClick={saveBook} disabled={bookSaving}>
                  {bookSaving ? 'Saving...' : editingBookIndex === null ? 'Add book' : 'Save book'}
                </button>
                <button className="admin-button admin-button-ghost" onClick={resetBookForm}>Cancel</button>
              </div>
            </div>
          )}

          {booksLoading && <p className="admin-muted">Loading books...</p>}
          {!booksLoading && yearBooks.length === 0 && !showBookForm && (
            <div className="admin-empty">
              <h3>No books this year</h3>
              <p>Add the current read or log a finished book.</p>
            </div>
          )}

          <div className="admin-table">
            {books
              .map((book, originalIndex) => ({ book, originalIndex }))
              .filter(({ book }) => book.year === currentYear)
              .map(({ book, originalIndex }) => (
                <div key={`${book.title}-${originalIndex}`} className="admin-table-row">
                  <div className="admin-row-main">
                    <div className="admin-row-title">
                      <strong>{book.title}</strong>
                      <span className="admin-muted-inline">by {book.author}</span>
                      <span className={book.status === 'reading' ? 'admin-pill admin-pill-live' : 'admin-pill'}>
                        {book.status === 'reading' ? 'Reading' : 'Finished'}
                      </span>
                    </div>
                    <p>{book.dateFinished ? `Finished ${book.dateFinished}` : `${book.year}`}</p>
                  </div>
                  <div className="admin-row-actions">
                    {book.status === 'reading' && (
                      <button className="admin-button admin-button-small" onClick={() => markAsFinished(originalIndex)}>Finish</button>
                    )}
                    <button className="admin-button admin-button-small" onClick={() => startEditBook(originalIndex)}>Edit</button>
                    <button className="admin-button admin-button-small admin-button-danger" onClick={() => deleteBook(originalIndex)}>Delete</button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ContentList({
  title,
  items,
  editBase,
  type,
  publishing,
  archiving,
  onPublish,
  onArchive,
}: {
  title: string;
  items: ContentItem[];
  editBase: string;
  type: 'essay' | 'footnote';
  publishing: string | null;
  archiving: string | null;
  onPublish: (slug: string, type: 'essay' | 'footnote') => void;
  onArchive: (slug: string, type: 'essay' | 'footnote', archived: boolean) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="admin-subsection">
      <h3>{title}</h3>
      <div className="admin-table">
        {items.map((item) => (
          <div key={item.slug} className="admin-table-row">
            <div className="admin-row-main">
              <div className="admin-row-title">
                <strong>{item.title}</strong>
                <span className="admin-muted-inline">{item.date}</span>
                {item.draft && <span className="admin-pill admin-pill-featured">Draft</span>}
                {item.archived && <span className="admin-pill">Archived</span>}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`${editBase}?slug=${item.slug}`} className="admin-button admin-button-small">Edit</Link>
              {item.draft && (
                <button className="admin-button admin-button-small admin-button-primary" onClick={() => onPublish(item.slug, type)} disabled={publishing === item.slug}>
                  {publishing === item.slug ? 'Publishing...' : 'Publish'}
                </button>
              )}
              {!item.draft && !item.archived && (
                <button className="admin-button admin-button-small" onClick={() => onArchive(item.slug, type, true)} disabled={archiving === item.slug}>
                  {archiving === item.slug ? 'Archiving...' : 'Archive'}
                </button>
              )}
              {item.archived && (
                <button className="admin-button admin-button-small" onClick={() => onArchive(item.slug, type, false)} disabled={archiving === item.slug}>
                  {archiving === item.slug ? 'Unarchiving...' : 'Unarchive'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
