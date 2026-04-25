# Session 18 — Codebase Cleanup + Live Classes DB Connection

**Date:** 2026-04-22
**Focus:** Dead code removal + connect student /live-classes page to database

---

## Part 1: Dead Code Deletion

### Files deleted
| File | Reason |
|---|---|
| `components/admin/edit-course-form.tsx` | Superseded by CourseWizard edit mode |
| `components/site-header-mobile.tsx` | Superseded by site-nav.tsx |

### Verification
- Grep confirmed zero source-code imports for both files
- Only references were in `.next` build cache (auto-rebuilds) and progress session docs (mentions, not imports)

---

## Part 2: Live Classes Student Page — DB Connection

### Problem
`app/(student)/live-classes/page.tsx` displayed hardcoded batch data (two static entries). The DB already had a `live_classes` table (migration 009) with real batches managed by admin.

### Changes

**`app/(student)/live-classes/page.tsx`**
- Converted to async server component
- Queries `live_classes` table directly via Supabase server client (idiomatic Next.js 14 — no self-API-call anti-pattern)
- Filters `is_active = true`, ordered by `created_at` desc
- Each batch card displays: title, description, schedule_type badge, schedule_days, time_slot, price (shows "Free" badge if 0, rupee amount otherwise), max_spots
- Empty state: "Abhi koi batch available nahi hai. Jaldi aane wali hain — Instagram pe follow karein!" with link
- Hero section and "what to expect" cards unchanged

**`components/live-class-enroll.tsx`**
- Added optional `liveClassId` prop
- POST body now includes `live_class_id` field, linking registration to the specific batch

### What stayed the same
- Hero section (unchanged)
- "What to expect" highlight cards (unchanged)
- Bottom CTA section (unchanged)
- 6-step typeform-style enrollment dialog (unchanged, just receives liveClassId)
- `GET /api/live-classes` API route (unchanged, still available for other consumers)

---

## Build
- `npm run build` passes clean (no errors, one pre-existing img warning in course-wizard)

## Files touched
- `components/admin/edit-course-form.tsx` — DELETED
- `components/site-header-mobile.tsx` — DELETED
- `app/(student)/live-classes/page.tsx` — rewritten (hardcoded -> DB)
- `components/live-class-enroll.tsx` — added liveClassId prop
