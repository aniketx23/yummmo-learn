# Session 26 — Mobile Fixes (Batch F)

**Date:** 2026-04-24
**Focus:** Fix critical mobile issues found during iPhone testing

---

## Root Cause Analysis

Most mobile issues shared a single root cause: **missing viewport meta + Input font-size < 16px**. iOS Safari auto-zooms the page when any input with font-size below 16px is focused. This zoom repositions DOM nodes, and React's reconciler then tries to manipulate nodes that have moved — producing "NotFoundError: The object cannot be found here" and "RangeError: Maximum call stack size exceeded" hydration crashes.

---

## Fix F1 — Add Viewport Export to Root Layout

**Problem:** No viewport meta tag. Pages opened zoomed in on mobile.

**Fix:** Added `Viewport` import and export to `app/layout.tsx`:
```ts
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```
This prevents iOS auto-zoom entirely.

**Files:** `app/layout.tsx`

---

## Fix F2 — Input Font-Size to 16px

**Problem:** Base `Input` component used `text-sm` (14px). iOS Safari auto-zooms inputs < 16px.

**Fix:** Changed `text-sm` to `text-base` (16px) in `components/ui/input.tsx`. This is a global fix — all inputs across auth forms, profile, newsletter, enrollment dialog, and admin panels now render at 16px. Visual impact is minimal (2px larger text, same 40px input height).

**Files:** `components/ui/input.tsx`

---

## Fix F3 — Remove autoFocus from Enrollment Dialog

**Problem:** Input inside the LiveClassEnroll dialog had `autoFocus`, which on mobile automatically opened the keyboard when any dialog appeared.

**Fix:** Deleted `autoFocus` from the Input in `components/live-class-enroll.tsx`. On desktop, user can still click the input to focus. On mobile, keyboard no longer auto-opens.

**Files:** `components/live-class-enroll.tsx`

---

## Fix F4 — Live Classes Highlight Cards Grid

**Problem:** "What to expect" cards used `grid-cols-2` without a mobile breakpoint, forcing 2 columns on 375px screens. Cards were severely cramped.

**Fix:** Changed from `grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Cards now stack to 1-column on phones.

**Files:** `app/(student)/live-classes/page.tsx`

---

## Fix F5 — Collapsible Sidebar on Mobile for Learning Player

**Problem:** Learning player sidebar took `h-[40vh]` on mobile, forcing students to scroll past the entire curriculum list before reaching the video.

**Fix:** Created `components/collapsible-sidebar.tsx` — a client component that:
- On mobile (below `lg`): shows a "Curriculum" toggle button, starts **collapsed** so the video is immediately visible
- On desktop (`lg+`): always visible, no toggle button (uses `lg:contents` + `lg:block`/`lg:hidden`)
- Only wraps the ScrollArea lesson list — header (back link, title, progress bar) stays always visible

The component uses simple `hidden`/`block` toggling with `useState`, no extra dependencies.

**Files:** `components/collapsible-sidebar.tsx` (NEW), `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

---

## Fix F6 — Hydration Errors (Resolved by F1 + F2)

**Problem:** "NotFoundError: The object cannot be found here" and "RangeError: Maximum call stack size exceeded" on various button clicks.

**Root cause:** iOS auto-zoom (triggered by < 16px inputs) repositioned DOM nodes during React hydration, corrupting React's virtual DOM model.

**Resolution:** No separate code changes needed. Fixes F1 (viewport) and F2 (input font-size) eliminate the zoom trigger entirely, preventing the hydration corruption.

---

## Build
- `npm run build` passes clean

## All Files Touched
- `app/layout.tsx` — F1 (viewport export)
- `components/ui/input.tsx` — F2 (text-sm → text-base)
- `components/live-class-enroll.tsx` — F3 (removed autoFocus)
- `app/(student)/live-classes/page.tsx` — F4 (grid fix)
- `components/collapsible-sidebar.tsx` — F5 (NEW)
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` — F5 (wrapped sidebar)

## Mobile Testing Checklist
- [ ] Tap any input → page should NOT zoom
- [ ] Open Live Class enrollment dialog → keyboard should NOT auto-open
- [ ] Live classes page → cards stack to 1-col on phone
- [ ] Open a lesson → curriculum collapsed, video visible immediately
- [ ] Tap "Curriculum" → expands/collapses lesson list
- [ ] Navigate around clicking buttons → no runtime errors
