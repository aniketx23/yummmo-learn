# Session 21 — Global Layout & Navigation Fixes (Batch A)

**Date:** 2026-04-23
**Focus:** Six independent layout/nav/UX fixes across the platform

---

## Fix A1 — Desktop Navbar

**Problem:** Site showed ONLY a hamburger menu at all screen sizes, including 1440px desktop.

**Fix:** Rewrote `components/site-nav.tsx` with responsive breakpoint at `lg:` (1024px):

**Desktop (lg+):**
- Horizontal nav links: Courses, Live Classes, Blog
- If logged in: Dashboard link (+ Admin link for staff), bell, avatar
- If logged out: "Log in" (ghost) + "Sign up" (filled) buttons
- No hamburger

**Mobile (below lg):**
- Bell + avatar (if logged in) + hamburger button
- Hamburger opens the existing Sheet drawer (unchanged)

Used `hidden lg:flex` / `lg:hidden` for toggle. Desktop links use `DesktopLink` component with saffron hover state (`hover:text-primary`).

**Files:** `components/site-nav.tsx`

---

## Fix A2 — Horizontal Page Overflow

**Problem:** Some pages could scroll horizontally.

**Fix:** Added `overflow-x: hidden` to the body rule in `app/globals.css`. Audited for negative margins (`-mx-`) and `min-w-[...]` patterns — none found.

**Files:** `app/globals.css`

---

## Fix A3 — Permanent Vertical Scrollbar

**Problem:** Potential permanent scrollbar from `overflow-y: scroll`.

**Result:** No-op. Audited the entire codebase — no `overflow-y: scroll` found anywhere. The body already uses default `overflow-y: auto` behavior.

**Files:** None changed

---

## Fix A4 — Auth Pages Missing Header/Footer

**Problem:** Auth pages (login, signup, forgot-password, reset-password) rendered as a centered card in empty white space — no header, no footer, no way back to the marketing site.

**Fix:** Rewrote `app/(auth)/layout.tsx`:
- Added `SiteHeader` (same as public pages, no auth props = shows logged-out state with Log in / Sign up)
- Added minimal footer (just copyright line, not the full three-column `SiteFooter`)
- Kept the centered card layout for the auth form

**Files:** `app/(auth)/layout.tsx`

---

## Fix A5 — Standardize Date Format to DD/MM/YYYY

**Problem:** Dates displayed via `.toLocaleDateString()` with no locale argument — format depends on the user's browser/OS locale. Inconsistent across admin pages.

**Fix:**
1. Added `formatDate()` helper to `lib/utils.ts`:
   ```ts
   export function formatDate(date: string | Date): string {
     return new Date(date).toLocaleDateString("en-GB");
   }
   ```
   `en-GB` produces `DD/MM/YYYY`.

2. Replaced all 5 display date instances:

| File | Line | Before | After |
|---|---|---|---|
| `app/(admin)/admin/page.tsx` | 171 | `new Date(row.enrolled_at).toLocaleDateString()` | `formatDate(row.enrolled_at)` |
| `app/(admin)/admin/students/page.tsx` | 82 | `new Date(s.created_at).toLocaleDateString()` | `formatDate(s.created_at)` |
| `app/(admin)/admin/enrollments/page.tsx` | 143 | `new Date(r.enrolled_at).toLocaleDateString()` | `formatDate(r.enrolled_at)` |
| `components/admin/live-classes-admin.tsx` | 287 | `new Date(reg.preferred_date).toLocaleDateString()` | `formatDate(reg.preferred_date)` |
| `app/(public)/blog/page.tsx` | 65 | `new Date(post.date).toLocaleDateString("en-IN", {...})` | `formatDate(post.date)` |

**Files:** `lib/utils.ts`, plus the 5 files above

---

## Fix A6 — Dynamic Footer Year

**Problem:** Potential hardcoded `© 2026`.

**Result:** No-op. `components/site-footer.tsx` line 72 already uses `{new Date().getFullYear()}`. Already dynamic.

**Files:** None changed

---

## Build
- `npm run build` passes clean (no errors, one pre-existing `<img>` warning in course-wizard)

## All Files Touched
- `components/site-nav.tsx` — rewritten (A1)
- `app/globals.css` — added overflow-x: hidden (A2)
- `app/(auth)/layout.tsx` — rewritten with header + footer (A4)
- `lib/utils.ts` — added `formatDate()` helper (A5)
- `app/(admin)/admin/page.tsx` — date format (A5)
- `app/(admin)/admin/students/page.tsx` — date format + import (A5)
- `app/(admin)/admin/enrollments/page.tsx` — date format (A5)
- `components/admin/live-classes-admin.tsx` — date format + import (A5)
- `app/(public)/blog/page.tsx` — date format + import (A5)
