# Admin Page with Server-Side Drafts

## Context

The site currently has `/write` and `/write-footnote` pages for creating content, but drafts only live in browser localStorage. There's no central dashboard to see what's in progress or publish drafts. This adds an `/admin` page and replaces localStorage drafts with GitHub-backed drafts using a `draft: true` frontmatter flag.

## Requirements

1. **`/admin` page** — password-protected (reuse `PUBLISH_PASSWORD`), shows:
   - Buttons linking to `/write` (new essay) and `/write-footnote` (new footnote)
   - List of all draft essays and footnotes (files with `draft: true` in frontmatter)
   - Each draft shows title, date, type (essay/footnote), with a "Publish" button
2. **Server-side drafts** — MDX files with `draft: true` in frontmatter are hidden from public pages but visible on `/admin`
3. **Publish from admin** — Removes `draft` flag from the file via GitHub API commit, triggering redeploy
4. **Updated write flow** — "Save Draft" pushes to GitHub with `draft: true`; "Publish" pushes without draft flag. localStorage drafts removed entirely.

## Architecture

### Frontmatter change

Essays and footnotes gain an optional `draft: true` field:

```yaml
---
title: "My Essay"
date: "2026-04-07"
draft: true
---
```

### File changes

**`lib/essays.ts`**
- Add `draft?: boolean` to `Essay` interface
- `getEssays()` filters out `draft: true` (public pages see only published)
- Add `getAllEssays()` that returns everything including drafts (for admin)

**`lib/footnotes.ts`**
- Same pattern: `draft?: boolean`, filter in `getFootnotes()`, add `getAllFootnotes()`

**`app/page.tsx`** and **`app/footnotes/page.tsx`**
- No changes needed — they already call `getEssays()`/`getFootnotes()` which will now filter drafts

**`app/essays/[slug]/page.tsx`** and **`app/footnotes/[slug]/page.tsx`**
- `generateStaticParams()` should only generate paths for published content (use filtered functions)
- Individual page fetch should still work for drafts if accessed directly (admin preview)

**`app/admin/page.tsx`** (new)
- Client component with password gate (same pattern as `/write`)
- Fetches drafts from new API route `/api/drafts`
- Displays draft list with publish buttons
- Links to `/write` and `/write-footnote`

**`app/api/drafts/route.ts`** (new)
- GET: Returns all draft essays and footnotes (password required via query param or header)
- Reads from filesystem (same as lib functions)

**`app/api/publish-draft/route.ts`** (new)
- POST: Takes `{ password, slug, type }` where type is "essay" or "footnote"
- Reads the file from GitHub, removes `draft: true` from frontmatter, commits back
- Returns success

**`app/write/page.tsx`**
- Remove all localStorage draft code
- "Save Draft" calls existing `/api/publish` but includes `draft: true` in the payload
- "Publish" calls `/api/publish` without draft flag (current behavior)
- Load existing drafts from `/api/drafts` instead of localStorage

**`app/write-footnote/page.tsx`**
- Same changes as write page
- Remove localStorage, use GitHub-backed drafts

**`app/api/publish/route.ts`** and **`app/api/publish-footnote/route.ts`**
- Accept optional `draft: true` in payload
- Include `draft: true` in frontmatter when present

## Verification

1. Create an essay draft from `/write` — confirm it appears on `/admin` but NOT on the homepage
2. Publish the draft from `/admin` — confirm it appears on the homepage after redeploy
3. Create a footnote draft — same verification
4. Confirm password gate works on `/admin`
5. Confirm public pages show no drafts
