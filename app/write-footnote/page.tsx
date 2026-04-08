'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownEditor from '../components/MarkdownEditor';
import WritingGuideSheet from '../components/WritingGuideSheet';

interface Topic {
  prompt: string;
  category: string;
  context: string;
}

interface OutlineItem {
  id: string;
  text: string;
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

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// Outline Builder
// ---------------------------------------------------------------------------

function OutlineBuilder({
  items,
  onChange,
}: {
  items: OutlineItem[];
  onChange: (items: OutlineItem[]) => void;
}) {
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function addItem() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    onChange([...items, { id: generateId(), text: trimmed }]);
    setNewText('');
    inputRef.current?.focus();
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function updateItem(id: string, text: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...items];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    onChange(reordered);
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666' }}>
          Outline
        </h3>
        {items.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#bbb' }}>
            drag to reorder
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.82rem', color: '#999', margin: '0 0 0.75rem' }}>
        Structure your thinking before you write. What points do you want to hit?
      </p>

      {items.length > 0 && (
        <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem' }}>
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.5rem',
                marginBottom: '0.35rem',
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: '4px',
                cursor: 'grab',
              }}
            >
              <span style={{ color: '#ccc', fontSize: '0.8rem', cursor: 'grab', userSelect: 'none' }}>
                &#x2630;
              </span>
              <span style={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, minWidth: '1.25rem' }}>
                {index + 1}.
              </span>
              <input
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  padding: '0.15rem 0',
                }}
              />
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ccc',
                  fontSize: '1.1rem',
                  padding: '0 0.25rem',
                  lineHeight: 1,
                }}
                aria-label="Remove item"
              >
                &times;
              </button>
            </li>
          ))}
        </ol>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={items.length === 0 ? 'Add your first outline point...' : 'Add another point...'}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          style={{
            ...inputStyle,
            marginBottom: 0,
            flex: 1,
            fontSize: '0.9rem',
          }}
        />
        <button
          type="submit"
          style={{ ...buttonStyle, whiteSpace: 'nowrap' }}
        >
          Add
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WriteFootnotePage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  async function generateTopics() {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/generate-topics');
      const data = await res.json();
      setTopics(data.topics);
      setSelectedTopic(null);
    } catch (e) {
      setStatus(`Failed to generate topics: ${e}`);
    }
    setLoading(false);
  }

  function pickTopic(topic: Topic) {
    setSelectedTopic(topic);
    setOutlineItems([]);
    setTitle('');
    setContent('');
    setStatus('');
  }

  async function saveDraft() {
    if (!title.trim()) {
      setStatus('Enter a title first');
      return;
    }
    setSaving(true);
    setStatus('Saving draft...');

    try {
      const res = await fetch('/api/publish-footnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date: today(),
          content: content.trim(),
          slug: slugify(title),
          prompt: selectedTopic?.prompt || '',
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
      const res = await fetch('/api/publish-footnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date: today(),
          content: content.trim(),
          slug: slugify(title),
          prompt: selectedTopic?.prompt || '',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`Published! Will be live at ${data.path} in ~1 min`);
        setTitle('');
        setContent('');
        setOutlineItems([]);
        setSelectedTopic(null);
        setTopics([]);
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
        <h1>Write a Footnote</h1>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h1 style={{ margin: 0 }}>Write a Footnote</h1>
        <button
          onClick={() => setGuideOpen(true)}
          style={{
            ...buttonStyle,
            fontSize: '0.8rem',
            padding: '0.35rem 0.75rem',
            background: '#fafafa',
            borderColor: '#ddd',
          }}
        >
          Writing Guide
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Generate random topics, pick one that sparks something, and write your thoughts.
      </p>

      {/* Topic Generation */}
      {!selectedTopic && (
        <div>
          <button
            onClick={generateTopics}
            disabled={loading}
            style={{ ...buttonStyle, background: '#000', color: '#fff', marginBottom: '1.5rem' }}
          >
            {loading ? 'Generating...' : topics.length > 0 ? 'Regenerate Topics' : 'Generate Topics'}
          </button>

          {topics.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topics.map((topic, i) => (
                <div key={i} style={topicCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {topic.category}
                      </span>
                      <p style={{ margin: '0.25rem 0 0.5rem', fontWeight: 500, color: '#000' }}>
                        {topic.prompt}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#888', lineHeight: 1.4 }}>
                        {topic.context}
                      </p>
                    </div>
                    <button
                      onClick={() => pickTopic(topic)}
                      style={{ ...buttonStyle, whiteSpace: 'nowrap' }}
                    >
                      Pick this one
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Writing Area */}
      {selectedTopic && (
        <div>
          <div style={{ ...topicCardStyle, marginBottom: '1.5rem', background: '#f9f9f9' }}>
            <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {selectedTopic.category}
            </span>
            <p style={{ margin: '0.25rem 0 0.5rem', fontWeight: 500, color: '#000' }}>
              {selectedTopic.prompt}
            </p>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#888', lineHeight: 1.4 }}>
              {selectedTopic.context}
            </p>
            <button
              onClick={() => setSelectedTopic(null)}
              style={{ ...linkButtonStyle, fontSize: '0.8rem', color: '#999' }}
            >
              &larr; Pick a different topic
            </button>
          </div>

          {/* Outline Builder */}
          <OutlineBuilder items={outlineItems} onChange={setOutlineItems} />

          {/* Divider between outline and writing */}
          {outlineItems.length > 0 && (
            <div style={{ borderTop: '1px solid #eee', marginBottom: '1.5rem' }} />
          )}

          <input
            type="text"
            placeholder="Give your footnote a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, fontWeight: 600, fontSize: '1.1rem' }}
            autoFocus
          />

          <MarkdownEditor
            value={content}
            onChange={setContent}
            password={password}
            minHeight="30vh"
            placeholder="Write your thoughts... Keep it to a few paragraphs. Don't overthink it."
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
        </div>
      )}

      {status && (
        <p style={{ marginTop: '1rem', color: status.startsWith('Error') || status.startsWith('Failed') ? '#c00' : '#333' }}>
          {status}
        </p>
      )}

      {/* Gary Halbert Writing Guide Sheet */}
      <WritingGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />
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

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

const topicCardStyle: React.CSSProperties = {
  padding: '1rem',
  border: '1px solid #eee',
  borderRadius: '4px',
};

