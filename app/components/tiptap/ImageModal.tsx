'use client';

import { useState, useRef } from 'react';
import {
  backdropStyle,
  modalStyle,
  tabStyle,
  modalInputStyle,
  modalButtonStyle,
} from './styles';

interface ImageModalProps {
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
  password: string;
}

export default function ImageModal({ onInsert, onClose, password }: ImageModalProps) {
  const [tab, setTab] = useState<'url' | 'upload'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function insertFromUrl() {
    if (!url.trim()) return;
    onInsert(url.trim(), alt || 'image');
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
        onInsert(data.path, alt || name);
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
