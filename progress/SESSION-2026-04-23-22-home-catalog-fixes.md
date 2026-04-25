# Session 22 — Home Page + Course Catalog Fixes (Batch B)

**Date:** 2026-04-23
**Focus:** Nine fixes across homepage and course catalog

---

## Fix B1 — Course Grid Columns on Desktop

**Problem:** Course grids capped at 2-3 columns, no 4-column breakpoint.

**Fix:** Applied `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` to:
- Homepage popular courses grid
- Homepage free courses grid
- `/courses` catalog grid

**Files:** `app/(public)/page.tsx`, `app/(public)/courses/page.tsx`

---

## Fix B2 — Deduplicate Popular + Free Sections

**Problem:** Popular and Free sections showed identical courses.

**Fix:**
- Popular courses: reduced limit from 6 to 4
- Collected popular IDs, then excluded them from the free courses query using `.not("id", "in", ...)`
- If zero free courses remain after dedup, the entire Free section is hidden (conditional render)

**Files:** `app/(public)/page.tsx`

---

## Fix B3 — Hide "0 min" Duration

**Problem:** Course cards showed "0 min" when no duration was set.

**Fix:** Wrapped duration display in a `> 0` conditional across 4 files:
- `components/course-card.tsx` — clock + duration span
- `app/(public)/courses/[slug]/page.tsx` — header stats row
- `app/(student)/dashboard/page.tsx` — course info line
- `app/(student)/my-courses/page.tsx` — course info line

**Files:** 4 files listed above

---

## Fix B4 — Mobile Hero CTAs Full Width

**Problem:** Hero buttons were inline on mobile, too small to tap.

**Fix:** Added `w-full sm:w-auto` to both hero buttons. They now stack full-width on mobile and sit side-by-side on sm+.

**Files:** `app/(public)/page.tsx`

---

## Fix B5 — Hero Image Mobile Crop Fix

**Problem:** Hero kitchen photo was cropped on narrow viewports, caption disappeared.

**Fix:**
- Changed aspect ratio to `aspect-[4/5]` on mobile, `sm:aspect-square` on desktop (taller on mobile = more image visible)
- Added `objectPosition: "center top"` via style prop so the subject stays visible
- Increased caption gradient padding (`pb-5 pt-12`) so text has more breathing room and stays within bounds

**Files:** `app/(public)/page.tsx`

---

## Fix B6 — Replace "Explore Swaps" CTA

**Problem:** Secondary hero CTA linked to a category page instead of live classes.

**Fix:** Changed text to "Join Live Class" and href to `/live-classes`. Kept outlined/ghost style.

**Files:** `app/(public)/page.tsx`

---

## Fix B7 — Filter Bar Overflow on /courses Desktop

**Problem:** Filter bar used a 5-column grid that overflowed at 1440px.

**Fix:** Replaced `grid md:grid-cols-5` with `flex flex-wrap items-end gap-3`:
- Search input: `w-full sm:flex-1` (takes available space on desktop, full-width on mobile)
- Dropdowns: `w-full sm:w-36` (compact fixed width on desktop, full-width on mobile)
- Apply + Reset buttons stay inline

**Files:** `app/(public)/courses/page.tsx`

---

## Fix B8 — Free/Paid Filter Labels

**Problem:** The free/paid filter defaulted to "All" with no label context.

**Fix:** Changed option labels:
- `""` → "Free & Paid" (was "All")
- `"1"` → "Free only" (unchanged)
- `"0"` → "Paid only" (unchanged)

**Files:** `app/(public)/courses/page.tsx`

---

## Fix B9 — Result Count on Catalog

**Problem:** No result count shown after filtering.

**Fix:** Added `<p>` above the course grid:
```
{list.length} course{list.length !== 1 ? "s" : ""} found
```
Left-aligned, small muted text, between filter bar and grid.

**Files:** `app/(public)/courses/page.tsx`

---

## Build
- `npm run build` passes clean

## All Files Touched
- `app/(public)/page.tsx` — B1, B2, B4, B5, B6
- `app/(public)/courses/page.tsx` — B1, B7, B8, B9
- `components/course-card.tsx` — B3
- `app/(public)/courses/[slug]/page.tsx` — B3
- `app/(student)/dashboard/page.tsx` — B3
- `app/(student)/my-courses/page.tsx` — B3
