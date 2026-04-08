'use client';

import type { Editor } from '@tiptap/core';
import { toolbarContainerStyle, toolbarBtnStyle, toolbarBtnActiveStyle } from './styles';
import TableMenu from './TableMenu';

interface TiptapToolbarProps {
  editor: Editor;
  onImageClick: () => void;
}

export default function TiptapToolbar({ editor, onImageClick }: TiptapToolbarProps) {
  return (
    <div style={toolbarContainerStyle}>
      <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', alignItems: 'center' }}>
        <ToolbarBtn
          label="B"
          title="Bold (Cmd+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          bold
        />
        <ToolbarBtn
          label="I"
          title="Italic (Cmd+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          italic
        />
        <ToolbarSep />
        <ToolbarBtn
          label="H2"
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarBtn
          label="H3"
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarSep />
        <ToolbarBtn
          label="&bull;"
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn
          label="1."
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarBtn
          label="&ldquo;"
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarSep />
        <ToolbarBtn
          label="&lt;/&gt;"
          title="Code"
          active={editor.isActive('code') || editor.isActive('codeBlock')}
          onClick={() => {
            if (editor.isActive('codeBlock')) {
              editor.chain().focus().toggleCodeBlock().run();
            } else {
              editor.chain().focus().toggleCode().run();
            }
          }}
        />
        <ToolbarBtn
          label="&#128279;"
          title="Link"
          active={editor.isActive('link')}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}
        />
        <ToolbarBtn
          label="&#128247;"
          title="Image"
          active={false}
          onClick={onImageClick}
        />
        <TableMenu editor={editor} />
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  title,
  active,
  onClick,
  bold,
  italic,
}: {
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...(active ? toolbarBtnActiveStyle : toolbarBtnStyle),
        fontWeight: bold ? 700 : active ? 600 : 400,
        fontStyle: italic ? 'italic' : 'normal',
      }}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
}

function ToolbarSep() {
  return <div style={{ width: '1px', background: '#e0e0e0', margin: '2px 4px' }} />;
}
