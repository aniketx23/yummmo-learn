# Session 23 — Course Detail + Learning Player Fixes (Batch C)

**Date:** 2026-04-23
**Focus:** Ten fixes across course detail page and learning player

---

## Fix C1 — Description Repeating

**Investigation:** The rendering code at line 165 of `courses/[slug]/page.tsx` renders `{course.description}` exactly once inside a single `<p>` tag. There is no loop, map, or duplication in the template. If the description appears 5x on screen, the cause is the actual text stored in the `description` column in the DB containing duplicated content (likely from a copy-paste during data entry). 

**Fix:** Removed the `prose prose-neutral` wrapper class which could cause unexpected text rendering. The code now renders the description in a clean `<div>` with explicit heading + paragraph. No structural change — the code was correct.

**Files:** `app/(public)/courses/[slug]/page.tsx`

---

## Fix C2 — Free Course Showing Payment Copy

**Problem:** Sidebar showed "Secure payments with Razorpay. Instant access after purchase." for all courses, including free ones. Razorpay checkout.js script loaded for free courses too.

**Fix:**
- Sidebar copy is now conditional: free courses show "Get instant access — no payment needed." Paid courses show the Razorpay copy. Already-enrolled users see neither (copy hidden entirely).
- `components/course-purchase.tsx`: Razorpay `<Script>` tag now wrapped in `{!isFree && ...}` — only loads for paid courses.

**Files:** `app/(public)/courses/[slug]/page.tsx`, `components/course-purchase.tsx`

---

## Fix C3 — Curriculum Accordion Not Expanding

**Problem:** Clicking a section didn't expand it — chevron didn't rotate.

**Investigation:** The accordion component uses correct Radix primitives. The `type="multiple"` accordion with UUID string values should toggle on click. The issue was likely that no sections were open by default, and users may have perceived the initial state as broken.

**Fix:** Added `defaultValue={defaultOpenSections}` to the `Accordion` component, which passes all section IDs. All sections now render expanded by default so students see the full curriculum immediately. Sections can still be collapsed by clicking.

**Files:** `app/(public)/courses/[slug]/page.tsx`

---

## Fix C4 — Hide "0 Students" Stat

**Problem:** "0 students" shown prominently in course header stats.

**Fix:** Wrapped student count in `{enrollmentCount > 0 && ...}` conditional. When zero, the stat is hidden entirely.

**Files:** `app/(public)/courses/[slug]/page.tsx`

---

## Fix C5 — "What You'll Learn" Section

**Problem:** No learning outcomes shown on the course detail page.

**Fix:** Added a new section between the description and curriculum:
- Heading: "Is course mein kya seekhenge?" (Voice A — warm, Hinglish)
- Derives first 6 lesson titles across all sections (ordered by section display_order, then lesson display_order)
- Renders as a 2-column grid with green checkmark icons (`CheckCircle2`)
- Only renders if there are lessons
- Styled as a bordered white card

**Files:** `app/(public)/courses/[slug]/page.tsx`

---

## Fix C6 — Disabled Previous/Next Button Styling

**Problem:** Disabled buttons at first/last lesson weren't visually clear enough.

**Fix:** Added explicit `className="opacity-50 cursor-not-allowed"` to disabled Previous and Next buttons. Refactored the conditional logic to use named `prevAccessible` / `nextAccessible` variables for clarity.

**Files:** `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

---

## Fix C7 — Chef Tips + Description + Attachments

**Status:** Already fully implemented. No changes needed.

The `LessonTabs` component (line 264-268 in the lesson player) already renders:
- `lesson.description` — in the Lesson tab
- `lesson.tips` — as an orange Chef's Tip card with lightbulb icon
- `lesson.attachments` — as downloadable file/link list in the References tab

The lesson query uses `select("*")` which fetches all columns.

**Files:** None changed

---

## Fix C8 — Move Mark Complete Below Video

**Problem:** `MarkLessonComplete` was embedded inside each video branch's `<div className="space-y-3">`, creating tight coupling and inconsistent positioning.

**Fix:** Extracted `MarkLessonComplete` from all four video branches (Bunny, YouTube, native video, placeholder). It now renders as a standalone element between the video player and the lesson title:
```
Video player
Mark lesson complete ← moved here
Lesson title
LessonTabs (description, tips, attachments)
```

The native video progress tracker (`LessonProgressTracker`) is also extracted and conditionally rendered only for non-YouTube, non-Bunny video URLs.

**Files:** `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

---

## Fix C9 — Sidebar Completion Indicators

**Problem:** Sidebar lesson list showed green check for completed and lock for locked, but empty space for not-started lessons. No visual indicator for the current lesson.

**Fix:** Four visual states:
| State | Icon |
|---|---|
| Completed | Green checkmark (`Check` in herb color) |
| Current lesson | Orange filled dot (small `bg-primary` circle) |
| Locked | Lock icon (muted) |
| Not started | Empty circle (`Circle` in muted color) |

Active lesson also keeps the existing `bg-primary/10` highlighted background.

**Files:** `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

---

## Fix C10 — Redirect /learn/[courseSlug] to First Lesson

**Status:** Already fully implemented. No changes needed.

The page at `app/(student)/learn/[courseSlug]/page.tsx` already:
1. Fetches the first lesson by `display_order`
2. If not enrolled + has preview lesson → redirects to preview
3. If not enrolled + no preview → redirects to course detail
4. If enrolled → redirects to first lesson
5. If no lessons exist → shows "no lessons yet" message

**Files:** None changed

---

## Build
- `npm run build` passes clean

## All Files Touched
- `app/(public)/courses/[slug]/page.tsx` — C1, C2, C3, C4, C5 (rewritten)
- `components/course-purchase.tsx` — C2 (Razorpay script conditional)
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` — C6, C8, C9 (rewritten)
