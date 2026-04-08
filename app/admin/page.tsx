'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DraftItem {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
}

interface Book {
  title: string;
  author: string;
  status: 'reading' | 'finished';
  year: number;
  dateFinished?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('');
  const [draftEssays, setDraftEssays] = useState<DraftItem[]>([]);
  const [draftFootnotes, setDraftFootnotes] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  // Books state
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

  async function fetchDrafts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/drafts?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setDraftEssays(data.essays);
        setDraftFootnotes(data.footnotes);
      }
    } catch (e) {
      setStatus(`Failed to load drafts: ${e}`);
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

  function resetBookForm() {
    setBookTitle('');
    setBookAuthor('');
    setBookStatus('reading');
    setBookDateFinished('');
    setBookYear(new Date().getFullYear());
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
      book.dateFinished = bookDateFinished || new Date().toISOString().split('T')[0];
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
      if (res.ok) {
        setStatus(action === 'add' ? 'Book added!' : 'Book updated!');
        resetBookForm();
        await fetchBooks();
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await res.json();
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
      if (res.ok) {
        setStatus('Book deleted');
        await fetchBooks();
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
  }

  async function markAsFinished(index: number) {
    const book = { ...books[index], status: 'finished' as const, dateFinished: new Date().toISOString().split('T')[0] };
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'update', book, index }),
      });
      if (res.ok) {
        setStatus('Marked as finished!');
        await fetchBooks();
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchDrafts();
      fetchBooks();
    }
  }, [authenticated]);

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
        setStatus(`Published! Will be live at ${data.path} in ~1 min`);
        await fetchDrafts();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setPublishing(null);
  }

  if (!authenticated) {
    return (
      <div>
        <h1>Admin</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!password) {
              setStatus('Enter a password');
              return;
            }
            setStatus('Checking...');
            try {
              const res = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
              });
              if (res.ok) {
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <button type="submit" style={buttonStyle}>
            Enter
          </button>
        </form>
        {status && (
          <p style={{ color: status === 'Checking...' ? '#333' : '#c00', marginTop: '0.5rem' }}>
            {status}
          </p>
        )}
      </div>
    );
  }

  const hasDrafts = draftEssays.length > 0 || draftFootnotes.length > 0;

  return (
    <div>
      <h1>Admin</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/write" style={actionButtonStyle}>
          New Essay
        </Link>
        <Link href="/write-footnote" style={actionButtonStyle}>
          New Footnote
        </Link>
      </div>

      <h2>Drafts</h2>

      {loading && <p style={{ color: '#999' }}>Loading...</p>}

      {!loading && !hasDrafts && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No drafts.</p>
      )}

      {draftEssays.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={subheadingStyle}>Essays</h3>
          {draftEssays.map((d) => (
            <div key={d.slug} style={draftRowStyle}>
              <div>
                <span style={{ fontWeight: 500 }}>{d.title}</span>
                <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  {d.date}
                </span>
              </div>
              <button
                onClick={() => publishDraft(d.slug, 'essay')}
                disabled={publishing === d.slug}
                style={{ ...buttonStyle, background: '#000', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {publishing === d.slug ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          ))}
        </div>
      )}

      {draftFootnotes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={subheadingStyle}>Footnotes</h3>
          {draftFootnotes.map((d) => (
            <div key={d.slug} style={draftRowStyle}>
              <div>
                <span style={{ fontWeight: 500 }}>{d.title}</span>
                <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  {d.date}
                </span>
              </div>
              <button
                onClick={() => publishDraft(d.slug, 'footnote')}
                disabled={publishing === d.slug}
                style={{ ...buttonStyle, background: '#000', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {publishing === d.slug ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Books Section */}
      <h2 style={{ marginTop: '2.5rem' }}>
        Books{' '}
        <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 400 }}>
          {books.filter((b) => b.year === new Date().getFullYear() && b.status === 'finished').length} of {booksGoal} in {new Date().getFullYear()}
        </span>
      </h2>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => { resetBookForm(); setShowBookForm(true); }}
          style={actionButtonStyle}
        >
          Add Book
        </button>
      </div>

      {showBookForm && (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={bookStatus}
              onChange={(e) => setBookStatus(e.target.value as 'reading' | 'finished')}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            >
              <option value="reading">Currently Reading</option>
              <option value="finished">Finished</option>
            </select>
            <input
              type="number"
              value={bookYear}
              onChange={(e) => setBookYear(parseInt(e.target.value))}
              style={{ ...inputStyle, marginBottom: 0, width: '100px', flex: 'none' }}
            />
          </div>
          {bookStatus === 'finished' && (
            <input
              type="date"
              value={bookDateFinished}
              onChange={(e) => setBookDateFinished(e.target.value)}
              style={inputStyle}
              placeholder="Date finished"
            />
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={saveBook} disabled={bookSaving} style={{ ...buttonStyle, background: '#000', color: '#fff' }}>
              {bookSaving ? 'Saving...' : editingBookIndex !== null ? 'Update' : 'Add'}
            </button>
            <button onClick={resetBookForm} style={buttonStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {booksLoading && <p style={{ color: '#999' }}>Loading...</p>}

      {!booksLoading && books.filter((b) => b.year === new Date().getFullYear()).length === 0 && !showBookForm && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No books this year.</p>
      )}

      {books
        .map((book, originalIndex) => ({ book, originalIndex }))
        .filter(({ book }) => book.year === new Date().getFullYear())
        .map(({ book, originalIndex }) => (
          <div key={originalIndex} style={draftRowStyle}>
            <div>
              <span style={{ fontWeight: 500 }}>{book.title}</span>
              <span style={{ color: '#666', marginLeft: '0.25rem' }}>— {book.author}</span>
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '3px',
                background: book.status === 'reading' ? '#e8f5e9' : '#f5f5f5',
                color: book.status === 'reading' ? '#2e7d32' : '#666',
              }}>
                {book.status === 'reading' ? 'Reading' : 'Finished'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {book.status === 'reading' && (
                <button
                  onClick={() => markAsFinished(originalIndex)}
                  style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  Finish
                </button>
              )}
              <button
                onClick={() => startEditBook(originalIndex)}
                style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteBook(originalIndex)}
                style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.35rem 0.75rem', color: '#c00' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      {status && (
        <p
          style={{
            color: status.startsWith('Error') || status.startsWith('Failed') ? '#c00' : '#333',
            marginTop: '1rem',
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  marginBottom: '0.75rem',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#fff',
  color: '#000',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#fff',
  color: '#000',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  margin: '0 0 0.5rem 0',
  color: '#666',
};

const draftRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0',
  borderBottom: '1px solid #f0f0f0',
  gap: '0.5rem',
  flexWrap: 'wrap',
};
