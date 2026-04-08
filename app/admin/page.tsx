'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentItem {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('');
  const [essays, setEssays] = useState<ContentItem[]>([]);
  const [footnotes, setFootnotes] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/content?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setEssays(data.essays);
        setFootnotes(data.footnotes);
      }
    } catch (e) {
      setStatus(`Failed to load content: ${e}`);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchContent();
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
        await fetchContent();
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

      {loading && <p style={{ color: '#999' }}>Loading...</p>}

      {!loading && essays.length === 0 && footnotes.length === 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No content yet.</p>
      )}

      {essays.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Essays</h2>
          {essays.map((item) => (
            <div key={item.slug} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500 }}>{item.title}</span>
                <span style={{ color: '#999', fontSize: '0.85rem', flexShrink: 0 }}>
                  {item.date}
                </span>
                {item.draft && (
                  <span style={draftBadgeStyle}>draft</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link
                  href={`/write?slug=${item.slug}`}
                  style={{ ...smallButtonStyle, textDecoration: 'none' }}
                >
                  Edit
                </Link>
                {item.draft && (
                  <button
                    onClick={() => publishDraft(item.slug, 'essay')}
                    disabled={publishing === item.slug}
                    style={{ ...smallButtonStyle, background: '#000', color: '#fff' }}
                  >
                    {publishing === item.slug ? 'Publishing...' : 'Publish'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {footnotes.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Footnotes</h2>
          {footnotes.map((item) => (
            <div key={item.slug} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500 }}>{item.title}</span>
                <span style={{ color: '#999', fontSize: '0.85rem', flexShrink: 0 }}>
                  {item.date}
                </span>
                {item.draft && (
                  <span style={draftBadgeStyle}>draft</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link
                  href={`/write-footnote?slug=${item.slug}`}
                  style={{ ...smallButtonStyle, textDecoration: 'none' }}
                >
                  Edit
                </Link>
                {item.draft && (
                  <button
                    onClick={() => publishDraft(item.slug, 'footnote')}
                    disabled={publishing === item.slug}
                    style={{ ...smallButtonStyle, background: '#000', color: '#fff' }}
                  >
                    {publishing === item.slug ? 'Publishing...' : 'Publish'}
                  </button>
                )}
              </div>
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

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: '0 0 0.75rem 0',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0',
  borderBottom: '1px solid #f0f0f0',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

const smallButtonStyle: React.CSSProperties = {
  padding: '0.35rem 0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#fff',
  color: '#000',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontFamily: 'inherit',
};

const draftBadgeStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  padding: '0.15rem 0.4rem',
  borderRadius: '3px',
  background: '#f5f5f5',
  color: '#999',
  border: '1px solid #eee',
  flexShrink: 0,
};
