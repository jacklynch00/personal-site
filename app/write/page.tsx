'use client';

import { useState, useEffect } from 'react';

interface Draft {
  title: string;
  slug: string;
  content: string;
  savedAt: string;
}

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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [status, setStatus] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('essay-drafts');
    if (saved) setDrafts(JSON.parse(saved));
  }, []);

  function saveDraft() {
    if (!title.trim()) {
      setStatus('Enter a title first');
      return;
    }
    const slug = slugify(title);
    const draft: Draft = { title, slug, content, savedAt: new Date().toISOString() };
    const updated = drafts.filter((d) => d.slug !== slug);
    updated.unshift(draft);
    setDrafts(updated);
    localStorage.setItem('essay-drafts', JSON.stringify(updated));
    setStatus('Draft saved');
    setTimeout(() => setStatus(''), 2000);
  }

  function loadDraft(draft: Draft) {
    setTitle(draft.title);
    setContent(draft.content);
    setStatus(`Loaded: ${draft.title}`);
    setTimeout(() => setStatus(''), 2000);
  }

  function deleteDraft(slug: string) {
    const updated = drafts.filter((d) => d.slug !== slug);
    setDrafts(updated);
    localStorage.setItem('essay-drafts', JSON.stringify(updated));
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
        // Remove from drafts
        const slug = slugify(title);
        const updated = drafts.filter((d) => d.slug !== slug);
        setDrafts(updated);
        localStorage.setItem('essay-drafts', JSON.stringify(updated));
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
          onSubmit={(e) => {
            e.preventDefault();
            setAuthenticated(true);
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
        <button onClick={saveDraft} style={buttonStyle}>
          Save Draft
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

      {drafts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Drafts</h2>
          {drafts.map((d) => (
            <div key={d.slug} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => loadDraft(d)} style={{ ...linkButtonStyle }}>
                {d.title}
              </button>
              <span style={{ color: '#999', fontSize: '0.8rem' }}>
                {new Date(d.savedAt).toLocaleDateString()}
              </span>
              <button onClick={() => deleteDraft(d.slug)} style={{ ...linkButtonStyle, color: '#c00' }}>
                delete
              </button>
            </div>
          ))}
        </div>
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
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};
