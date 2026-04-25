# Session 2026-04-13 — Student area, learn experience, progress

## Context

PRD Module 3: student dashboard, profile, course player (Bunny), progress tracking.

## What was implemented

### Routes (group `(student)`)

| Path | File | Notes |
|------|------|-------|
| `/dashboard` | [app/(student)/dashboard/page.tsx](../app/(student)/dashboard/page.tsx) | Enrolled courses, continue learning CTA |
| `/profile` | [app/(student)/profile/page.tsx](../app/(student)/profile/page.tsx) | Edit name, phone, avatar URL |
| `/my-courses` | [app/(student)/my-courses/page.tsx](../app/(student)/my-courses/page.tsx) | Redirects to `/dashboard` |
| `/learn/[courseSlug]` | [app/(student)/learn/[courseSlug]/page.tsx](../app/(student)/learn/[courseSlug]/page.tsx) | First incomplete lesson or first lesson |
| `/learn/[courseSlug]/[lessonId]` | [app/(student)/learn/[courseSlug]/[lessonId]/page.tsx](../app/(student)/learn/[courseSlug]/[lessonId]/page.tsx) | Sidebar curriculum + Bunny iframe |

### Learn page behaviour

- Verifies enrollment server-side; if not enrolled → redirect to course detail.  
- Embeds Bunny Stream iframe when `lessons.video_bunny_id` is set ([lib/bunny.ts](../lib/bunny.ts) `getBunnyEmbedUrl`).  
- “Mark complete” button calls `/api/progress/complete` (POST).  
- Optional native `<video>` path uses [components/native-video-progress.tsx](../components/native-video-progress.tsx) to POST `/api/progress/update` on `timeupdate` (throttled).

### APIs used by student UI

- `GET /api/student/dashboard` — JSON for client refresh if extended.  
- `GET /api/learn/[courseSlug]` — course + sections + lessons + progress map for client components if needed.  
- `POST /api/progress/update` — `{ lessonId, seconds }`.  
- `POST /api/progress/complete` — `{ lessonId }`.

## How to verify

1. Enroll (free or paid) in a course with Bunny video IDs on lessons.  
2. Open `/learn/{slug}` → should land in a lesson.  
3. Mark complete → refresh; progress row should exist; sidebar shows completion state.  
4. `/dashboard` lists the course.

## Follow-ups / risks

- Bunny iframe does not auto-report watch position to our API (only native video helper does). Manual “mark complete” is the primary completion path for Bunny.  
- No certificate generation in v1.  
- Resume position from `last_watched_seconds` is stored but Bunny embed may not seek without extra player integration.
