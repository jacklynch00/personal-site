'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MarkdownEditor from '../components/MarkdownEditor';

interface TopicLink {
  title: string;
  url: string;
}

interface Topic {
  prompt: string;
  category: string;
  links: TopicLink[];
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
// Gary Halbert / Boron Letters Writing Guide (side sheet)
// ---------------------------------------------------------------------------

function WritingGuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 999,
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(28rem, 90vw)',
          background: '#fff',
          borderLeft: '1px solid #e5e5e5',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms ease',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '2rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Writing Guide</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#999' }}>
              Gary Halbert &amp; The Boron Letters
            </p>
          </div>
          <button onClick={onClose} style={{ ...sheetCloseStyle }} aria-label="Close">
            &times;
          </button>
        </div>

        <GuideSection title="The #1 Rule">
          Write like you&rsquo;re talking to one person. Not an audience. One real human
          being sitting across from you. If your writing sounds like &ldquo;writing,&rdquo;
          rewrite it.
        </GuideSection>

        <GuideSection title="AIDA Framework">
          <strong>A</strong>ttention &mdash; Open with something that grabs them by the collar.
          A bold claim, a surprising fact, a question they can&rsquo;t ignore.<br />
          <strong>I</strong>nterest &mdash; Make them care. Tell a story. Connect to something
          they already feel.<br />
          <strong>D</strong>esire &mdash; Show them the payoff. Paint the picture of what
          they&rsquo;ll get, feel, or understand.<br />
          <strong>A</strong>ction &mdash; Tell them what to do next. Even in essays, give the
          reader a takeaway to act on.
        </GuideSection>

        <GuideSection title="Start With Movement">
          Halbert opened every day with a walk. Start your writing with momentum too.
          Your first sentence should <em>move</em>. No throat-clearing. No &ldquo;In this post
          I will discuss...&rdquo; Jump in.
        </GuideSection>

        <GuideSection title="Short Is Strong">
          Short sentences hit harder.<br />
          Short paragraphs get read.<br />
          One idea per paragraph. If a sentence doesn&rsquo;t earn its place, cut it.
          Halbert said: &ldquo;The purpose of the first sentence is to get you to read the
          second sentence.&rdquo;
        </GuideSection>

        <GuideSection title="Be Specific, Not Clever">
          &ldquo;He lost 14 pounds in 21 days&rdquo; beats &ldquo;He lost a lot of weight fast.&rdquo;
          Specifics create belief. Vague language creates doubt. Use real numbers, real
          names, real details.
        </GuideSection>

        <GuideSection title="Emotion First, Logic Second">
          People decide with emotion and justify with logic. Lead with how something
          <em>feels</em>. Then back it up with evidence. The Boron Letters: &ldquo;What matters
          is what the reader feels is true.&rdquo;
        </GuideSection>

        <GuideSection title="The Bucket Brigade">
          Use transitional hooks to keep the reader sliding down the page:<br />
          <em>&ldquo;Here&rsquo;s the thing...&rdquo;</em><br />
          <em>&ldquo;But it gets worse...&rdquo;</em><br />
          <em>&ldquo;Now, here&rsquo;s the kicker...&rdquo;</em><br />
          <em>&ldquo;Think about it:&rdquo;</em><br />
          These are greased slides. They kill the urge to stop reading.
        </GuideSection>

        <GuideSection title="Write Ugly First">
          Your first draft should be fast, messy, and alive. Don&rsquo;t edit while you
          write &mdash; that kills momentum. Halbert wrote copy by hand to stay
          connected to the words. Get it out, then clean it up.
        </GuideSection>

        <GuideSection title="The Starving Crowd Principle">
          The most important element isn&rsquo;t your writing &mdash; it&rsquo;s whether your
          reader is hungry for what you&rsquo;re saying. Write about things people
          already care about. Meet them where they are, then take them somewhere new.
        </GuideSection>

        <GuideSection title="Use &lsquo;You&rsquo; More Than &lsquo;I&rsquo;">
          Make the reader the hero. Every sentence should feel like it&rsquo;s
          about <em>them</em>, not you. Even when telling a personal story, connect it
          back: &ldquo;You&rsquo;ve probably felt this too.&rdquo;
        </GuideSection>

        <GuideSection title="The Halbert Structure">
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
            <li>Open with a hook (story, question, bold claim)</li>
            <li>Establish the problem / tension</li>
            <li>Share your take &mdash; the insight, the angle</li>
            <li>Give proof (story, example, data)</li>
            <li>Deliver the payoff &mdash; what they walk away with</li>
            <li>End with a punch, not a whimper</li>
          </ol>
        </GuideSection>

        <GuideSection title="Close Strong">
          The last line lingers. End with a line worth remembering. A question that
          haunts. A statement that reframes everything. Never end with
          &ldquo;Thanks for reading.&rdquo;
        </GuideSection>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic', margin: 0 }}>
            &ldquo;If you want to be a good writer, you have to do one thing above all
            others: read a lot and write a lot.&rdquo; &mdash; Gary Halbert
          </p>
        </div>
      </div>
    </>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', lineHeight: '1.55', color: '#444', margin: 0 }}>
        {children}
      </p>
    </div>
  );
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
  return (
    <Suspense>
      <WriteFootnotePageInner />
    </Suspense>
  );
}

function WriteFootnotePageInner() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');

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
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (authenticated && editSlug) {
      loadExisting();
    }
  }, [authenticated, editSlug]);

  async function loadExisting() {
    setLoadingContent(true);
    try {
      const res = await fetch(
        `/api/content/${editSlug}?type=footnote&password=${encodeURIComponent(password)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setOriginalSlug(data.slug);
        setOriginalDate(data.date);
        setEditPrompt(data.prompt || null);
      } else {
        setStatus('Failed to load footnote');
      }
    } catch (e) {
      setStatus(`Failed to load footnote: ${e}`);
    }
    setLoadingContent(false);
  }

  const isEditing = !!originalSlug;

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

    const slug = isEditing ? originalSlug : slugify(title);
    const date = isEditing ? originalDate! : today();
    const prompt = isEditing ? (editPrompt || '') : (selectedTopic?.prompt || '');

    try {
      const res = await fetch('/api/publish-footnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date,
          content: content.trim(),
          slug,
          prompt,
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

    const slug = isEditing ? originalSlug : slugify(title);
    const date = isEditing ? originalDate! : today();
    const prompt = isEditing ? (editPrompt || '') : (selectedTopic?.prompt || '');

    try {
      const res = await fetch('/api/publish-footnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title: title.trim(),
          date,
          content: content.trim(),
          slug,
          prompt,
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
        <h1>{editSlug ? 'Edit Footnote' : 'Write a Footnote'}</h1>
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

  if (loadingContent) {
    return (
      <div>
        <h1>Edit Footnote</h1>
        <p style={{ color: '#999' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h1 style={{ margin: 0 }}>{isEditing ? 'Edit Footnote' : 'Write a Footnote'}</h1>
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
      {!isEditing && (
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Generate random topics, pick one that sparks something, and write your thoughts.
        </p>
      )}

      {/* Topic Generation (hidden when editing) */}
      {!isEditing && !selectedTopic && (
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
      {(isEditing || selectedTopic) && (
        <div>
          {/* Show prompt context */}
          {isEditing && editPrompt ? (
            <div style={{ ...topicCardStyle, marginBottom: '1.5rem', background: '#f9f9f9' }}>
              <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Prompt
              </span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: '#000' }}>
                {editPrompt}
              </p>
            </div>
          ) : selectedTopic ? (
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
                &larr; Pick a different topic
              </button>
            </div>
          ) : null}

          {/* Outline Builder (only for new footnotes) */}
          {!isEditing && (
            <>
              <OutlineBuilder items={outlineItems} onChange={setOutlineItems} />
              {outlineItems.length > 0 && (
                <div style={{ borderTop: '1px solid #eee', marginBottom: '1.5rem' }} />
              )}
            </>
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

const sheetCloseStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #eee',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1.5rem',
  lineHeight: 1,
  padding: '0.25rem 0.5rem',
  color: '#999',
};
