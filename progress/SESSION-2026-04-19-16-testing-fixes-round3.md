# Session 2026-04-19 — Testing Round 3 Fixes + Live Classes Feature

## Context

After full flow testing, 6 issues were reported including a new feature request (Live Classes page). All fixed in this session.

## What changed

### 1. Enrolled badge on course detail page
Previously showed "Free" even when the user was already enrolled. Now shows "Enrolled" in green when the user has an enrollment.

**File:** `app/(public)/courses/[slug]/page.tsx`

### 2. Course-level resources visible on course detail page
Course resources (PDFs, links) attached by admin are now displayed in a "Course Resources" section below the curriculum on the public course detail page.

**File:** `app/(public)/courses/[slug]/page.tsx`

### 3. Progress bar fix — Mark Complete for all lessons
Previously, the "Mark lesson complete" button only appeared when a lesson had a Bunny video. Lessons without video had no way to be marked complete, so progress never updated. Now the button appears for ALL lessons including those without video.

**File:** `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

### 4. Lesson page bifurcated into Video + References tabs
The lesson player page now has two tabs below the video:
- **Lesson tab**: Description + Chef's Tip (if present)
- **References tab**: Files and links with titles, clickable to download/open

New component: `components/lesson-tabs.tsx` (client component with Tabs UI)

**Files:**
- `components/lesson-tabs.tsx` (new)
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

### 5. Admin resource editor improved
- File upload now asks for a title before uploading (defaults to filename)
- Link addition requires a title (shows error if missing)
- Existing resources are shown as clickable links in the admin
- Clear visual separation between "Upload file" and "Add link" sections

**File:** `components/admin/course-wizard.tsx`

### 6. Live Classes page (new feature)
New page at `/live-classes` (protected — requires login) with:
- Inspiring hero section about in-person cooking classes
- "What to expect" cards (hands-on cooking, small batches, healthy recipes, in-person)
- Upcoming batches section (weekend + weekday)
- Typeform-style enrollment dialog:
  - Step 1: Name
  - Step 2: Phone
  - Step 3: Age
  - Step 4: Gender (select options)
  - Step 5: Date picker (calendar)
  - Step 6: Time slot (Morning/Afternoon/Evening)
  - Progress bar showing step X of 6
  - Back/Next navigation
  - Submit shows toast confirmation
- Added "Live Classes" link to hamburger nav menu

**Files:**
- `app/(student)/live-classes/page.tsx` (new)
- `components/live-class-enroll.tsx` (new)
- `components/site-nav.tsx` (added Live Classes link)

## Files touched

### New files
- `components/lesson-tabs.tsx`
- `components/live-class-enroll.tsx`
- `app/(student)/live-classes/page.tsx`

### Modified files
- `app/(public)/courses/[slug]/page.tsx` — enrolled badge + course resources
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` — mark complete for all lessons + lesson tabs
- `components/admin/course-wizard.tsx` — resource editor title fields
- `components/site-nav.tsx` — live classes nav link

## How to verify

1. `npm run build` — clean (49 routes)
2. Course detail page: shows "Enrolled" for enrolled users, "Free" for non-enrolled
3. Course detail page: course resources section visible below curriculum
4. Learning player: "Mark lesson complete" button visible even without video → progress updates
5. Learning player: Lesson tab shows description + chef tip, References tab shows files/links
6. Admin wizard: resource editor asks for title for both files and links
7. `/live-classes`: inspiring page with enrollment dialog (typeform-style steps)
8. Hamburger nav: "Live Classes" link visible for logged-in users

## Follow-ups
- Live class enrollment currently no-ops (toast only) — connect to Supabase table or n8n webhook later
- Live class details (schedule, pricing, topics) are hardcoded — make admin-configurable later
- `site-header-mobile.tsx` is fully unused now — delete in cleanup
