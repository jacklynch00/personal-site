# Tiptap Editor Migration

## Context

The current `MarkdownEditor` component is a plain `<textarea>` with toolbar buttons that insert markdown syntax and a `marked`-based preview pane. This works but provides no WYSIWYG experience -- the user writes raw markdown and switches to preview mode to see the result.

The goal is to replace this with a Tiptap-based rich text editor that renders formatted text inline while still using markdown as the storage/output format. The editor should also gain new capabilities: slash commands, tables, and drag-and-drop block reordering.

## Architecture

### Component Structure

```
app/components/tiptap/
  TiptapEditor.tsx          -- Main component (drop-in replacement)
  TiptapToolbar.tsx         -- Fixed toolbar with formatting buttons
  SlashCommandMenu.tsx      -- Slash command popup via @tiptap/suggestion
  ImageModal.tsx            -- Extracted from current editor (reused as-is)
  TableMenu.tsx             -- Context menu for table operations
  useMarkdownSync.ts        -- Hook for markdown <-> ProseMirror sync
  styles.ts                 -- Shared inline style objects
```

`app/components/MarkdownEditor.tsx` becomes a thin re-export of `TiptapEditor` so parent pages need zero changes.

### Props Interface (unchanged)

```typescript
interface TiptapEditorProps {
  value: string;           // markdown string
  onChange: (value: string) => void;
  password: string;
  minHeight?: string;
  placeholder?: string;
}
```

### Packages

**Core:** `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`

**Markdown:** `tiptap-markdown` (bidirectional markdown serialization)

**Extensions:** `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/suggestion`, `@tiptap/extension-dropcursor`, `@tiptap/extension-gapcursor`

## Markdown Sync Strategy

The `useMarkdownSync` hook manages the bidirectional flow:

**Editor -> parent:** On every Tiptap `update` event, serialize the document to markdown via `editor.storage.markdown.getMarkdown()` and call `onChange()`. Debounce at ~150ms for performance on long documents.

**Parent -> editor:** When the `value` prop changes externally (draft load, content reset after publish), detect that it differs from the last editor-generated markdown and call `editor.commands.setContent(newValue)`. A ref-based guard prevents infinite loops from the editor's own changes triggering this path.

**Initialization:** Pass the initial markdown string as `content` to the Tiptap editor. The `tiptap-markdown` extension intercepts string content and parses it as markdown.

## Features

### Toolbar
Same buttons as current editor (bold, italic, H2, H3, bullet list, numbered list, blockquote, code, link, image) but using Tiptap commands instead of textarea manipulation. Active state highlighting shows which formats are applied at the cursor. Remove the edit/split/preview mode toggle since WYSIWYG replaces preview.

### Slash Commands
Type `/` to open a filtered command menu: Heading 2, Heading 3, Bullet List, Numbered List, Blockquote, Code Block, Table, Image, Horizontal Rule. Arrow keys to navigate, Enter to select, Escape to dismiss. Built on `@tiptap/suggestion`.

### Tables
Insert via `/table` slash command or toolbar. Default 3x3. Context menu appears when cursor is inside a table with options: add/remove rows and columns, delete table. Serializes to GFM pipe-table syntax.

### Image Upload
Reuse existing `ImageModal` component logic. When user completes upload/URL entry, use `editor.chain().focus().setImage({ src, alt }).run()` instead of inserting raw markdown text. The serializer handles converting back to `![alt](url)`.

### Drag-and-Drop
Use `@tiptap/extension-dropcursor` for visual feedback. ProseMirror's native drag behavior handles block reordering. Explicit drag handle gutter is deferred as a polish step.

### Keyboard Shortcuts
Come free from starter-kit: Cmd+B (bold), Cmd+I (italic), Cmd+Z/Cmd+Shift+Z (undo/redo), etc.

## Styling

All UI uses inline styles (project convention). Add minimal CSS to `globals.css` for:
- `.tiptap-editor` base styles (outline, padding, min-height)
- Placeholder text (via `::before` pseudo-element)
- Table borders and cell padding
- Match existing color palette: `#000`, `#333`, `#ddd`, `#f5f5f5`, `#fff`
- Reuse existing `.prose` styles for content rendering

## Build Sequence

1. Install Tiptap packages
2. Create `useMarkdownSync.ts` hook
3. Create `TiptapEditor.tsx` with basic formatting (bold, italic, headings, lists, blockquotes, code, links)
4. Create `TiptapToolbar.tsx` with same buttons as current toolbar
5. Extract `ImageModal.tsx` and integrate with Tiptap image commands
6. Add CSS to `globals.css`
7. Replace `MarkdownEditor.tsx` with re-export
8. Test basic editor with both `/write` and `/write-footnote` pages
9. Add slash commands (`SlashCommandMenu.tsx`)
10. Add table support (`TableMenu.tsx` + extensions)
11. Add drag-and-drop (dropcursor extension)

## Critical Files

- `app/components/MarkdownEditor.tsx` -- replaced with re-export
- `app/components/tiptap/*` -- all new files
- `app/globals.css` -- add Tiptap styles
- `app/write/page.tsx` -- verify unchanged behavior
- `app/write-footnote/page.tsx` -- verify unchanged behavior
- `package.json` -- add ~14 packages

## Verification

1. **Round-trip test:** Load existing essay markdown into editor, serialize back, diff. Whitespace changes acceptable, content loss is not.
2. **Draft lifecycle:** Create draft in `/write`, save, reload, load draft -- content renders correctly in WYSIWYG.
3. **Publish flow:** Write content, publish -- API receives clean markdown.
4. **Image upload:** Both upload and URL insertion work, images render inline, serialize to `![alt](path)`.
5. **All formatting:** Each toolbar button and keyboard shortcut produces correct markdown output.
6. **Tables:** Insert, edit, add/remove rows/columns -- serializes to GFM table syntax.
7. **Slash commands:** `/` opens menu, filtering works, selection inserts correct block.
8. **Both pages:** `/write` and `/write-footnote` work identically to before (modulo the improved UX).

## Risks

| Risk | Mitigation |
|---|---|
| Markdown roundtrip loses content (nested lists, HTML in MDX) | Test with every existing essay from the repo |
| Performance on long essays | Debounce `onChange` at 150ms |
| Bundle size (~150-200KB gzipped) | Acceptable for admin-only pages; lazy-load with `next/dynamic({ ssr: false })` |
| SSR hydration mismatch | Client-only rendering via dynamic import |
