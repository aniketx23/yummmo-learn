# SESSION-2026-08-01-43 — Workshop tutorial pivot (payments off, single-video, admin-granted access)

## Context
Business model change. Yummmo Learn now runs **in-person workshops**; attendees get
per-cake **tutorial videos** afterward. Requirements:
- Disable online payment entirely.
- Each cake = **one single video** (was: multi-section/multi-lesson courses).
- Only **specific users** get access, granted by an admin (not self-serve).
- Videos hosted on **unlisted YouTube** (existing `YouTubePlayer` + `getYouTubeId` support; 2.2 GB files rule out Supabase Storage; Bunny not configured).

## Model decision (no schema migration)
"Access to a course" = an **enrollment row**, but created only by an admin.
Each course keeps exactly **1 section + 1 lesson** under the hood (video_url = YouTube,
`tips`, `attachments` = recipe PDF). This reuses the enrollment/progress gating with zero DB surgery.
`is_free=false`, `price=0` for all courses (payment path removed from UI).

## What changed
**Payments off**
- `components/course-purchase.tsx` — rewritten as an access-state CTA (no Razorpay, no self-enroll).
  States: enrolled → "Watch Now"; logged out → "Login to check access"; logged-in w/o access → locked message.
- `app/api/enrollments/free/route.ts` — now always returns 403 (self-enroll disabled).
- Razorpay + `/api/payment/*` code left in place but unreachable from the UI (re-enable later if needed).

**Single-video admin**
- `components/admin/course-form.tsx` — NEW. Single-page form: name, slug, short/full description,
  category/level/language, YouTube link, thumbnail, chef tips, recipe PDF, publish. On save builds
  one section + one lesson and POST/PUT to the existing `/api/admin/courses` API.
- `components/admin/course-wizard.tsx` — DELETED (replaced by course-form).
- `app/(admin)/admin/courses/new/page.tsx` + `[id]/edit/page.tsx` — use `CourseForm`; edit flattens
  first lesson (video_url/tips/recipe) back into the form.

**Access control**
- `app/api/admin/access/route.ts` — NEW. Staff-only. POST grants access (looks up profile by email or
  phone via service role, upserts enrollment). DELETE revokes (removes enrollment + progress).
- `components/admin/manage-access.tsx` — NEW. Grant-by-email/phone + list of people with access + revoke.
- `app/(admin)/admin/courses/[id]/access/page.tsx` — NEW. Lists granted students.
- `components/admin/admin-course-actions.tsx` — added "Manage access" dropdown item.
- `app/(admin)/admin/courses/[id]/edit/page.tsx` — "Manage access" button in header.

**Frontend single-video**
- `app/(public)/courses/[slug]/page.tsx` — rewritten: no price, no curriculum accordion; "Workshop
  tutorial" badge, access-state CTA, static "kya milega" list, instructor card.
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` — single-video layout (curriculum sidebar +
  prev/next only render when a course has >1 lesson, for legacy courses). Recipe PDF shows via LessonTabs.
- `components/course-card.tsx` — dropped price; "Workshop tutorial"/"Enrolled" + "View"/"Watch now";
  singular-safe "Video tutorial" label.
- `app/(public)/page.tsx` — hero CTA "Start Learning Free" → "Browse Tutorials". Free-courses section is
  `is_free`-gated so it no longer renders.

## How to verify (done locally, headless browser + service-role DB)
- `npx tsc --noEmit` → clean.
- Admin created a single-video course via the new form → DB: is_published=true, is_free=false,
  total_lessons=1, one lesson with YouTube URL + tips. ✓
- Admin granted access by email on the access page → enrollment created, appears in list. ✓
- Granted student: course page shows "You have access" + "Watch Now"; watch page embeds the YouTube
  iframe, no sidebar, mark-complete + chef tip render. ✓
- Non-granted student: course page shows locked message (no Watch Now); `/learn/[slug]` redirects to
  the course page. ✓
- `POST /api/enrollments/free` → 403. ✓

## Follow-ups / notes
- Real content: upload each cake to **unlisted** YouTube, then create the course in Admin → New cake
  tutorial and paste the link; grant access per attendee.
- Legacy courses (`healthy-atta-cake` 9 lessons, etc.) still exist; they render under the new UI with the
  sidebar because they have >1 lesson. Recreate/unpublish as needed.
- Razorpay/payment code is dormant, not removed.
- `is_free` still used only by the home "Free courses" section gate (now always empty).
