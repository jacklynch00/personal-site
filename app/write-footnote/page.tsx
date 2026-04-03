'use client';

import { useState } from 'react';

interface TopicLink {
  title: string;
  url: string;
}

interface Topic {
  prompt: string;
  category: string;
  links: TopicLink[];
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

export default function WriteFootnotePage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setTitle('');
    setContent('');
    setStatus('');
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
      <h1>Write a Footnote</h1>
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
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {topic.links.map((link, j) => (
                          <a
                            key={j}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.8rem', color: '#666' }}
                          >
                            {link.title}
                          </a>
                        ))}
                      </div>
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {selectedTopic.links.map((link, j) => (
                <a
                  key={j}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8rem', color: '#666' }}
                >
                  {link.title}
                </a>
              ))}
            </div>
            <button
              onClick={() => setSelectedTopic(null)}
              style={{ ...linkButtonStyle, fontSize: '0.8rem', color: '#999' }}
            >
              ← Pick a different topic
            </button>
          </div>

          <input
            type="text"
            placeholder="Give your footnote a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, fontWeight: 600, fontSize: '1.1rem' }}
            autoFocus
          />

          <textarea
            placeholder="Write your thoughts... Keep it to a few paragraphs. Don't overthink it."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: '30vh',
              lineHeight: '1.6',
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

const topicCardStyle: React.CSSProperties = {
  padding: '1rem',
  border: '1px solid #eee',
  borderRadius: '4px',
};
