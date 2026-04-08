'use client';

import { useState } from 'react';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function WritePage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function saveDraft() {
    if (!title.trim()) {
      setStatus('Enter a title first');
      return;
    }
    setSaving(true);
    setStatus('Saving draft...');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date: today(),
          content: content.trim(),
          slug: slugify(title),
          draft: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Draft saved to server');
        setTimeout(() => setStatus(''), 2000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setSaving(false);
  }

  async function publish() {
    if (!title.trim() || !content.trim()) {
      setStatus('Need a title and content');
      return;
    }
    setPublishing(true);
    setStatus('Publishing...');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date: today(),
          content: content.trim(),
          slug: slugify(title),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`Published! Will be live at ${data.path} in ~1 min`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed: ${e}`);
    }
    setPublishing(false);
  }

  if (!authenticated) {
    return (
      <div>
        <h1>Write</h1>
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
        {status && <p style={{ color: status === 'Checking...' ? '#333' : '#c00', marginTop: '0.5rem' }}>{status}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Write</h1>

      <input
        type="text"
        placeholder="Essay title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ ...inputStyle, fontWeight: 600, fontSize: '1.1rem' }}
      />

      <textarea
        placeholder="Write your essay in Markdown..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          ...inputStyle,
          minHeight: '50vh',
          lineHeight: '1.6',
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={saveDraft} disabled={saving} style={buttonStyle}>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={publish}
          disabled={publishing}
          style={{ ...buttonStyle, background: '#000', color: '#fff' }}
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {status && <p style={{ color: status.startsWith('Error') || status.startsWith('Failed') ? '#c00' : '#333' }}>{status}</p>}
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
