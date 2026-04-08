'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DraftItem {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('');
  const [draftEssays, setDraftEssays] = useState<DraftItem[]>([]);
  const [draftFootnotes, setDraftFootnotes] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

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

  useEffect(() => {
    if (authenticated) fetchDrafts();
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
