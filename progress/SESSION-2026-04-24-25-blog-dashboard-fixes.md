# Session 25 — Blog + Dashboard + Live Classes Polish (Batch E)

**Date:** 2026-04-24
**Focus:** Eight fixes across blog, student dashboard, and live classes pages

---

## Fix E1 — Blog Article Clickable Links

**Problem:** Article titles and cards were not wrapped in links.

**Fix:**
- Added `slug` field to each hardcoded post object
- Wrapped each card in `<Link href="/blog/[slug]">` with `group` class for hover coordination
- Title gets `group-hover:text-primary` for saffron hover state
- Added "Read more →" text link with `ArrowRight` icon at the bottom of each card
- Cards get `hover:-translate-y-0.5 hover:shadow-md` for hover lift effect
- Links point to `/blog/[slug]` — will 404 until individual post pages are built

**Files:** `app/(public)/blog/page.tsx`

---

## Fix E2 — Blog Grid 2-Column on Desktop

**Problem:** Articles rendered in a single column at all widths.

**Fix:** Changed from `space-y-6` (stacked list) to `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (responsive grid). Also widened the container from `max-w-4xl` to `max-w-5xl` to accommodate 3 columns.

**Files:** `app/(public)/blog/page.tsx`

---

## Fix E3 — Blog Newsletter Mobile Stack

**Problem:** Email input and Subscribe button were side by side on mobile, making both too narrow.

**Fix:** Changed newsletter form from `flex gap-2` to `flex flex-col gap-2 sm:flex-row`. On mobile, input is full-width on top and button is full-width below. On sm+ they return to side-by-side.

**Files:** `components/newsletter-form.tsx`

---

## Fix E4 — Student Dashboard Section Headings

**Problem:** Section headings were in English ("Continue Learning", "Not Started Yet", "Completed") without Hinglish warmth matching the brand voice.

**Fix:** Updated to Hinglish headings:
- "Continue Learning" → "Jaari Hai"
- "Not Started Yet" → "Shuru Nahi Kiya"
- "Completed" → "Poora Ho Gaya! 🎉"

Each section only renders when it has courses (already conditional).

**Files:** `app/(student)/dashboard/page.tsx`

---

## Fix E5 — Hide "0 min" on Dashboard Cards

**Status:** Already fixed in Session 22 (Batch B, fix B3). Verified line 143: `{c.total_duration_minutes > 0 && ...}`.

**Files:** None changed

---

## Fix E6 — Live Classes "What to Expect" 4-Up

**Problem:** Highlight cards used `sm:grid-cols-2` — never went to 4 columns on wide screens.

**Fix:** Changed to `grid-cols-2 lg:grid-cols-4` — 2 columns on mobile/tablet, 4 columns on lg+ desktop.

**Files:** `app/(student)/live-classes/page.tsx`

---

## Fix E7 — Differentiate Bottom CTA Text

**Problem:** Two identical "Enroll in Live Class" buttons on the same page (hero + bottom CTA band).

**Fix:**
- Added `buttonLabel` prop to `LiveClassEnroll` component (defaults to "Enroll in Live Class" if not provided)
- Bottom CTA now renders with `buttonLabel="Register Your Spot"`
- Hero CTA keeps default text

**Files:** `components/live-class-enroll.tsx`, `app/(student)/live-classes/page.tsx`

---

## Fix E8 — Dynamic Footer Year

**Status:** Already dynamic. Verified `site-footer.tsx` line 72: `© {new Date().getFullYear()} Yummmo Learn.`

**Files:** None changed

---

## Build
- `npm run build` passes clean

## All Files Touched
- `app/(public)/blog/page.tsx` — E1, E2 (rewritten)
- `components/newsletter-form.tsx` — E3 (flex-col sm:flex-row)
- `app/(student)/dashboard/page.tsx` — E4 (Hinglish headings)
- `app/(student)/live-classes/page.tsx` — E6, E7 (grid + CTA text)
- `components/live-class-enroll.tsx` — E7 (buttonLabel prop)
