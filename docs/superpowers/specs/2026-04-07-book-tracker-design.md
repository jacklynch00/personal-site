# Book Tracker Feature Design

## Overview

Add a book tracking feature to the personal site. Displays a "Reading" section on the landing page showing the current year's reading progress (goal: 12 books/year), the book currently being read, and finished books. Includes an admin interface for managing books and an archive page for past years.

## Data Model

Single file: `content/books.json`, stored in GitHub via the existing GitHub API pattern.

```json
{
  "goal": 12,
  "books": [
    {
      "title": "The Power Broker",
      "author": "Robert Caro",
      "status": "reading",
      "year": 2026
    },
    {
      "title": "Dune",
      "author": "Frank Herbert",
      "status": "finished",
      "year": 2026,
      "dateFinished": "2026-03-15"
    }
  ]
}
```

Fields:
- `goal`: number — yearly reading target (default 12)
- `books[].title`: string — book title
- `books[].author`: string — book author
- `books[].status`: `"reading"` | `"finished"`
- `books[].year`: number — the year this book belongs to
- `books[].dateFinished`: string (YYYY-MM-DD) — only present when status is "finished"

## Landing Page UI

New "Reading" section on `app/page.tsx`, placed after the Footnotes section.

### Layout

```
Reading                          2026 · 4 of 12
━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Now reading
  The Power Broker — Robert Caro

Finished
  Dune — Frank Herbert                    Mar 2026
  Project Hail Mary — Andy Weir           Feb 2026
  Klara and the Sun — Kazuo Ishiguro      Jan 2026

View past years →
```

### Styling

- **Header row:** "Reading" h2 on the left (existing h2 style: 1.1rem, 600 weight). Year and progress count on the right in gray (#999, 0.85rem) — same treatment as essay dates.
- **Progress bar:** 4px tall, black fill on #eee background, small border-radius. Width proportional to books finished / goal. Sits directly under the header row.
- **"Now reading" label:** Small gray text (0.85rem, #999), not a heading. Below the progress bar.
- **Current book:** Title in normal weight, author after an em dash in #666.
- **"Finished" label:** Same small gray text as "Now reading".
- **Finished book list:** Reuses `.essay-list` styling. Title + author on left, short month + year on right (e.g., "Mar 2026") in gray. Sorted newest first.
- **"View past years →":** Reuses `.section-link` styling.
- **Empty state:** "No books yet this year." in #999, 0.9rem (same as "Coming soon." pattern).
- **No currently reading:** If no book has status "reading", the "Now reading" sub-section is omitted entirely.

## Archive Page (`/books`)

Lists all years in reverse chronological order. Each year shows:
- Year heading with progress (e.g., "2025 · 8 of 12")
- Book list in the same format as the landing page (title, author, date finished)

Simple page, reuses existing styles. No pagination needed.

## Admin Interface

New "Books" section on the existing `/admin` page, below drafts management.

### Display

- "Books" heading with count badge (e.g., "4 of 12 in 2026")
- "Add Book" button
- List of current year's books: title, author, status, and action buttons

### Add/Edit Form (inline)

- Title input
- Author input
- Status dropdown: "Currently Reading" or "Finished"
- Date finished input (visible only when status is "Finished")
- Year field (defaults to current year, overridable for logging past reads)
- Save / Cancel buttons

### Per-Book Actions

- **Mark as Finished** — for the currently-reading book, sets status to "finished" with today's date
- **Edit** — opens inline form pre-filled with book data
- **Delete** — with confirm prompt

## API

New route: `/api/books` (`app/api/books/route.ts`)

### GET `/api/books`
- Query param: `password`
- Returns the full `books.json` content
- Used by the admin page

### POST `/api/books`
- Body: `{ password, action, book?, index? }`
- Actions:
  - `"add"` — appends `book` to the array
  - `"update"` — replaces the book at `index` with `book`
  - `"delete"` — removes the book at `index`
- `index` is the position in the books array (used for update/delete to identify which book)
- Reads `books.json` from GitHub (gets SHA), modifies the array, writes back
- Same GitHub API pattern as `/api/publish`

## Data Helper

New file: `lib/books.ts`

- `getBooks()` — reads `content/books.json` from disk, returns parsed data
- `getBooksByYear(year)` — filters books for a specific year
- `getCurrentlyReading()` — returns the book with status "reading" (or null)
- `getAllYears()` — returns sorted list of unique years from the books array

Follows the same pattern as `lib/essays.ts` (reads from local filesystem at build time).

## Files to Create/Modify

### New files
- `content/books.json` — initial data (empty books array, goal: 12)
- `lib/books.ts` — data helper functions
- `app/api/books/route.ts` — API route for CRUD operations
- `app/books/page.tsx` — archive page

### Modified files
- `app/page.tsx` — add Reading section
- `app/globals.css` — add progress bar and book-specific styles
- `app/admin/page.tsx` — add Books management section
