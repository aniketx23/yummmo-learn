# Session 2026-04-13 — UI design system and shared libraries

## Context

PRD Section 7: brand colours, typography, component approach (shadcn-style).

## What was implemented

### Tailwind + tokens

- [tailwind.config.ts](../tailwind.config.ts) — `brand`, `cream`, `sage`, `coral`, `warm` colour scales; Baloo 2 / DM Sans font families; `tailwindcss-animate` plugin.  
- [app/globals.css](../app/globals.css) — CSS variables for light/dark, base radius, `@layer base` typography.

### UI primitives (`components/ui/`)

Radix-based building blocks: Button, Card, Input, Label, Badge, Dialog, Dropdown, Sheet, Tabs, Select, Avatar, Separator, Progress, Table, Textarea, Checkbox, ScrollArea, Toast/Sonner wrappers, etc. Pattern matches [shadcn/ui](https://ui.shadcn.com) conventions.

### Utilities

- [lib/utils.ts](../lib/utils.ts) — `cn()` (clsx + tailwind-merge).

### Charts

- Admin revenue uses **Recharts** ([app/(admin)/admin/revenue/page.tsx](../app/(admin)/admin/revenue/page.tsx)).

### Types / quality

- [types/database.ts](../types/database.ts) — table Row/Insert/Update types.  
- [tsconfig.json](../tsconfig.json) — `target` ES2017 for `Set` iteration / modern syntax compatibility with build.

## How to verify

- Visual pass on light/dark toggle (if exposed in header).  
- `npm run lint` — no a11y regressions on new components.

## Follow-ups / risks

- Formal Storybook not added — docs live in `progress/` and PRD.  
- Some components may be unused; safe to prune in a dedicated cleanup session.
