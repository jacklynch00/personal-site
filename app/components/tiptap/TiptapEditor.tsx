'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';

import { useMarkdownSync } from './useMarkdownSync';
import TiptapToolbar from './TiptapToolbar';
import ImageModal from './ImageModal';
import { SlashCommands } from './SlashCommandMenu';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  password: string;
  minHeight?: string;
  placeholder?: string;
}

export default function TiptapEditor({
  value,
  onChange,
  password,
  minHeight = '50vh',
  placeholder = 'Write in Markdown...',
}: TiptapEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        dropcursor: false,
        gapcursor: false,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Dropcursor.configure({
        color: '#ddd',
        width: 2,
      }),
      Gapcursor,
      SlashCommands,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useMarkdownSync(editor, value, onChange);

  function handleImageInsert(src: string, alt: string) {
    if (editor) {
      editor.chain().focus().setImage({ src, alt }).run();
    }
  }

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {editor && (
        <TiptapToolbar editor={editor} onImageClick={() => setShowImageModal(true)} />
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          background: '#fff',
          minHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {showImageModal && (
        <ImageModal
          password={password}
          onInsert={handleImageInsert}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
