import { useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';

export function useMarkdownSync(
  editor: Editor | null,
  value: string,
  onChange: (value: string) => void,
) {
  const lastMarkdownRef = useRef(value);
  const isInternalChange = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Editor -> parent (debounced)
  const handleUpdate = useCallback(() => {
    if (!editor) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown.getMarkdown() as string;
      lastMarkdownRef.current = md;
      isInternalChange.current = true;
      onChange(md);
    }, 150);
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [editor, handleUpdate]);

  // Parent -> editor (external changes only)
  useEffect(() => {
    if (!editor) return;

    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (value !== lastMarkdownRef.current) {
      editor.commands.setContent(value);
      lastMarkdownRef.current = value;
    }
  }, [editor, value]);
}
