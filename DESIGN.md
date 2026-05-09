# Personal Site Design Direction

## North Star

The site should feel like a personal builder index: part public notebook, part project archive, part playful software toy. It should be inspiring without becoming hard to navigate.

The current visual direction combines:

- Marc Lou-style left identity rail plus right-side project/revenue grid.
- Mercury-inspired restraint: spacious layout, focused typography, soft surfaces, and a single cool blue accent for data/interactive emphasis.
- Jack-specific energy: projects, writing, books, F1, Cleveland, outdoors, training, and constant tinkering.

## Homepage

- First viewport should prioritize a compact left profile/identity column and a right project grid.
- Projects are a primary surface, not a downstream afterthought.
- Keep the left column readable and personal: avatar, name, location/context, concise statement, CTAs, social links.
- Project cards should show title, status, short story, tags, TTM revenue, and sparkline.
- Avoid huge boxed hero cards that dominate the page. The project grid should carry the visual weight.

## Visual System

- Background: warm neutral grid is allowed, but avoid making every section feel like a heavy framed card.
- Typography: strong but not gimmicky. Use large headings sparingly and keep UI labels compact.
- Cards: project cards may be softer and more modern than the rest of the site, especially in the homepage grid.
- Accent: use blue/purple-blue mainly for data or primary interaction emphasis. Do not scatter many saturated colors.
- Buttons: clear, high-contrast, and tactile. Primary action should be visually obvious.
- Motion: playful but purposeful. The race mode button and `/race` page are the main playful interaction surfaces.

## Admin

- Admin should feel like a real dashboard, not a raw maintenance page.
- Prioritize fast content entry: project creation, writing management, book updates, and revenue refresh.
- Forms should be grouped by mental model: identity, public display, status/visibility, revenue connection.
- Never send saved Stripe secrets back to the browser. If secret keys are pasted in admin, store them encrypted.

## Content Principles

- Show the real archive, including building, live, paused, and retired work.
- Prefer honest builder language over corporate portfolio language.
- Writing and books should remain easy to find, but Projects are a core pillar.
- The F1 mini-game is a side experience, not the primary navigation model.

## Avoid

- Generic portfolio templates.
- Decorative bento grids that do not reflect real content.
- Heavy hero sections that push projects below the fold.
- Overly cute labels that make status meanings unclear.
- Dense dark mode across the whole site unless intentionally reworking the full visual system.
