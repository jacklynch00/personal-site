'use client';

import type { Editor } from '@tiptap/core';
import { tableMenuStyle, tableMenuItemStyle } from './styles';

interface TableMenuProps {
  editor: Editor;
}

export default function TableMenu({ editor }: TableMenuProps) {
  if (!editor.isActive('table')) return null;

  const actions = [
    { label: 'Add row above', action: () => editor.chain().focus().addRowBefore().run() },
    { label: 'Add row below', action: () => editor.chain().focus().addRowAfter().run() },
    { label: 'Add column left', action: () => editor.chain().focus().addColumnBefore().run() },
    { label: 'Add column right', action: () => editor.chain().focus().addColumnAfter().run() },
    { label: 'Delete row', action: () => editor.chain().focus().deleteRow().run() },
    { label: 'Delete column', action: () => editor.chain().focus().deleteColumn().run() },
    { label: 'Delete table', action: () => editor.chain().focus().deleteTable().run() },
  ];

  return (
    <div style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <TableDropdown actions={actions} />
      </div>
    </div>
  );
}

function TableDropdown({ actions }: { actions: { label: string; action: () => void }[] }) {
  return (
    <details style={{ position: 'relative', display: 'inline-block' }}>
      <summary
        style={{
          padding: '4px 8px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontFamily: 'inherit',
          borderRadius: '3px',
          color: '#333',
          lineHeight: 1.2,
          listStyle: 'none',
        }}
      >
        Table
      </summary>
      <div style={{ ...tableMenuStyle, top: '100%', left: 0, marginTop: '2px' }}>
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => {
              a.action();
              // Close the dropdown after action
              const details = document.querySelector('details[open]');
              if (details) (details as HTMLDetailsElement).open = false;
            }}
            style={tableMenuItemStyle}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </details>
  );
}
