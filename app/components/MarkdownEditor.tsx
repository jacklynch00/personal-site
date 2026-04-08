'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  password: string;
  minHeight?: string;
  placeholder?: string;
}

type ViewMode = 'edit' | 'split' | 'preview';

// ---------------------------------------------------------------------------
// Textarea manipulation helpers
// ---------------------------------------------------------------------------

function insertAround(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string,
  placeholder: string,
  onChange: (v: string) => void,
  setCursor: (pos: number) => void,
) {
  const { selectionStart, selectionEnd } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const insert = selected || placeholder;
  const newValue =
    value.slice(0, selectionStart) + before + insert + after + value.slice(selectionEnd);
  onChange(newValue);
  // Place cursor: if there was a selection, put cursor after the insertion.
  // If no selection, select the placeholder text so user can type over it.
  if (selected) {
    setCursor(selectionStart + before.length + insert.length + after.length);
  } else {
    // We'll select the placeholder — handled via a selection range
    setCursor(-(selectionStart + before.length)); // negative = select placeholder
  }
}

function insertLinePrefix(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string | ((lineIndex: number) => string),
  onChange: (v: string) => void,
  setCursor: (pos: number) => void,
) {
  const { selectionStart, selectionEnd } = textarea;
  // Find the start of the first selected line and end of the last
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEnd = value.indexOf('\n', selectionEnd);
  const end = lineEnd === -1 ? value.length : lineEnd;

  const lines = value.slice(lineStart, end).split('\n');
  const prefixed = lines
    .map((line, i) => {
      const p = typeof prefix === 'function' ? prefix(i) : prefix;
      return p + line;
    })
    .join('\n');

  const newValue = value.slice(0, lineStart) + prefixed + value.slice(end);
  onChange(newValue);
  setCursor(lineStart + prefixed.length);
}

// ---------------------------------------------------------------------------
// Image Modal
// ---------------------------------------------------------------------------

function ImageModal({
  onInsert,
  onClose,
  password,
}: {
  onInsert: (markdown: string) => void;
  onClose: () => void;
  password: string;
}) {
  const [tab, setTab] = useState<'url' | 'upload'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function insertFromUrl() {
    if (!url.trim()) return;
    onInsert(`![${alt || 'image'}](${url.trim()})`);
    onClose();
  }

  async function uploadFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('password', password);
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const name = file.name.replace(/\.[^.]+$/, '');
        onInsert(`![${alt || name}](${data.path})`);
        onClose();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (e) {
      setError(`Upload failed: ${e}`);
    }
    setUploading(false);
  }

  return (
    <>
      <div onClick={onClose} style={backdropStyle} />
      <div style={modalStyle}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setTab('upload')}
            style={{
              ...tabStyle,
              borderBottomColor: tab === 'upload' ? '#000' : 'transparent',
              color: tab === 'upload' ? '#000' : '#999',
            }}
          >
            Upload
          </button>
          <button
            onClick={() => setTab('url')}
            style={{
              ...tabStyle,
              borderBottomColor: tab === 'url' ? '#000' : 'transparent',
              color: tab === 'url' ? '#000' : '#999',
            }}
          >
            From URL
          </button>
        </div>

        <input
          type="text"
          placeholder="Alt text (optional)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          style={{ ...modalInputStyle, marginBottom: '0.5rem' }}
        />

        {tab === 'url' && (
          <>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={modalInputStyle}
              autoFocus
            />
            <button onClick={insertFromUrl} style={{ ...modalButtonStyle, marginTop: '0.75rem' }}>
              Insert
            </button>
          </>
        )}

        {tab === 'upload' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
            />
            <button
              onClick={uploadFile}
              disabled={uploading}
              style={{ ...modalButtonStyle, marginTop: '0.5rem' }}
            >
              {uploading ? 'Uploading...' : 'Upload & Insert'}
            </button>
          </>
        )}

        {error && <p style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Editor
// ---------------------------------------------------------------------------

export default function MarkdownEditor({
  value,
  onChange,
  password,
  minHeight = '50vh',
  placeholder = 'Write in Markdown...',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('edit');
  const [showImageModal, setShowImageModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<number | null>(null);
  const placeholderLenRef = useRef(0);

  // Restore cursor position after React re-render
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta || cursorRef.current === null) return;
    ta.focus();
    const pos = cursorRef.current;
    if (pos < 0) {
      // Negative means "select placeholder" starting at abs(pos)
      const start = Math.abs(pos);
      ta.setSelectionRange(start, start + placeholderLenRef.current);
    } else {
      ta.setSelectionRange(pos, pos);
    }
    cursorRef.current = null;
  }, [value]);

  const setCursor = useCallback((pos: number) => {
    cursorRef.current = pos;
  }, []);

  function toolbar(action: string) {
    const ta = textareaRef.current;
    if (!ta) return;

    switch (action) {
      case 'bold':
        placeholderLenRef.current = 4;
        insertAround(ta, value, '**', '**', 'bold', onChange, setCursor);
        break;
      case 'italic':
        placeholderLenRef.current = 6;
        insertAround(ta, value, '_', '_', 'italic', onChange, setCursor);
        break;
      case 'h2':
        insertLinePrefix(ta, value, '## ', onChange, setCursor);
        break;
      case 'h3':
        insertLinePrefix(ta, value, '### ', onChange, setCursor);
        break;
      case 'ul':
        insertLinePrefix(ta, value, '- ', onChange, setCursor);
        break;
      case 'ol':
        insertLinePrefix(ta, value, (i) => `${i + 1}. `, onChange, setCursor);
        break;
      case 'quote':
        insertLinePrefix(ta, value, '> ', onChange, setCursor);
        break;
      case 'code': {
        const { selectionStart, selectionEnd } = ta;
        const selected = value.slice(selectionStart, selectionEnd);
        if (selected.includes('\n')) {
          placeholderLenRef.current = 4;
          insertAround(ta, value, '```\n', '\n```', 'code', onChange, setCursor);
        } else {
          placeholderLenRef.current = 4;
          insertAround(ta, value, '`', '`', 'code', onChange, setCursor);
        }
        break;
      }
      case 'link':
        placeholderLenRef.current = 4;
        insertAround(ta, value, '[', '](url)', 'text', onChange, setCursor);
        break;
      case 'image':
        setShowImageModal(true);
        break;
    }
  }

  function insertImageMarkdown(md: string) {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + '\n' + md);
      return;
    }
    const { selectionStart } = ta;
    const newValue = value.slice(0, selectionStart) + md + value.slice(selectionStart);
    onChange(newValue);
    setCursor(selectionStart + md.length);
  }

  const preview = marked.parse(value || '') as string;

  const showTextarea = mode === 'edit' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {/* Toolbar */}
      <div style={toolbarContainerStyle}>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          <ToolbarBtn label="B" title="Bold" onClick={() => toolbar('bold')} bold />
          <ToolbarBtn label="I" title="Italic" onClick={() => toolbar('italic')} italic />
          <ToolbarSep />
          <ToolbarBtn label="H2" title="Heading 2" onClick={() => toolbar('h2')} />
          <ToolbarBtn label="H3" title="Heading 3" onClick={() => toolbar('h3')} />
          <ToolbarSep />
          <ToolbarBtn label="&bull;" title="Bullet list" onClick={() => toolbar('ul')} />
          <ToolbarBtn label="1." title="Numbered list" onClick={() => toolbar('ol')} />
          <ToolbarBtn label="&ldquo;" title="Blockquote" onClick={() => toolbar('quote')} />
          <ToolbarSep />
          <ToolbarBtn label="&lt;/&gt;" title="Code" onClick={() => toolbar('code')} />
          <ToolbarBtn label="&#128279;" title="Link" onClick={() => toolbar('link')} />
          <ToolbarBtn label="&#128247;" title="Image" onClick={() => toolbar('image')} />
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          {(['edit', 'split', 'preview'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...toolbarBtnStyle,
                background: mode === m ? '#e8e8e8' : 'transparent',
                fontWeight: mode === m ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview area */}
      <div
        style={{
          display: 'flex',
          gap: mode === 'split' ? '1px' : 0,
          background: mode === 'split' ? '#ddd' : 'transparent',
          border: '1px solid #ddd',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          minHeight,
        }}
      >
        {showTextarea && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              minHeight,
              padding: '0.75rem',
              border: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        )}
        {showPreview && (
          <div
            className="prose"
            style={{
              flex: 1,
              padding: '0.75rem',
              overflow: 'auto',
              minHeight,
              background: '#fff',
              boxSizing: 'border-box',
            }}
            dangerouslySetInnerHTML={{ __html: preview || '<p style="color:#999">Preview will appear here...</p>' }}
          />
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          password={password}
          onInsert={insertImageMarkdown}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar sub-components
// ---------------------------------------------------------------------------

function ToolbarBtn({
  label,
  title,
  onClick,
  bold,
  italic,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...toolbarBtnStyle,
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
      }}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
}

function ToolbarSep() {
  return <div style={{ width: '1px', background: '#e0e0e0', margin: '2px 4px' }} />;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const toolbarContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 6px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '4px 4px 0 0',
  flexWrap: 'wrap',
  gap: '4px',
};

const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontFamily: 'inherit',
  borderRadius: '3px',
  color: '#333',
  lineHeight: 1.2,
};

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  zIndex: 1000,
  width: 'min(24rem, 90vw)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};

const tabStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  padding: '0.25rem 0.5rem',
};

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const modalButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#000',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};
