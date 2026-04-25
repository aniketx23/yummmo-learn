# Session 2026-04-13 — Admin panel (instructor / super_admin)

## Context

PRD Module 4: admin dashboard, course CRUD, curriculum builder, students/revenue views.

## What was implemented

### Access control

- [middleware.ts](../middleware.ts) restricts `/admin/*` to `profiles.role` ∈ `super_admin`, `instructor`.  
- Layout [app/(admin)/admin/layout.tsx](../app/(admin)/admin/layout.tsx) uses `getUserWithProfile()` and redirects non-staff to `/dashboard`.

### Shell

- [components/admin/admin-sidebar.tsx](../components/admin/admin-sidebar.tsx) — nav links; mobile sheet via [components/admin/admin-mobile-header.tsx](../components/admin/admin-mobile-header.tsx).

### Pages

| Path | Purpose |
|------|---------|
| `/admin` | Stats cards (courses, students, revenue placeholder logic), recent enrollments |
| `/admin/courses` | List drafts + published; actions to publish/unpublish/delete |
| `/admin/courses/new` | [CourseWizard](../components/admin/course-wizard.tsx) — create course + sections/lessons + thumbnail upload + Bunny video ID per lesson |
| `/admin/courses/[id]/edit` | Metadata form + link to curriculum wizard |
| `/admin/courses/[id]/curriculum` | Same wizard in edit mode |
| `/admin/students` | Table of students (profiles + enrollment counts) |
| `/admin/enrollments` | Enrollments table + CSV export |
| `/admin/revenue` | Charts (Recharts) from payments data |

### Course wizard

- [components/admin/course-wizard.tsx](../components/admin/course-wizard.tsx) — multi-step: basics → curriculum (add/remove sections & lessons) → pricing → media (Supabase Storage upload for thumbnail; manual Bunny video ID).  
- Uses admin API routes for create/update/delete and video helpers.

## How to verify

1. Promote user to `instructor` or `super_admin`.  
2. Create course from `/admin/courses/new`, publish from list.  
3. Confirm course appears on public `/courses`.  
4. CSV export on enrollments downloads.

## Follow-ups / risks

- `@dnd-kit` is in dependencies but **drag-and-drop reorder** for sections/lessons is not wired — add-on session.  
- Bunny upload: server-side upload API exists; **not** full browser TUS to Bunny in wizard (manual ID acceptable for v1).  
- Some PRD “admin REST” endpoints are implemented as **server-rendered pages** + existing `/api/admin/*` rather than a separate JSON-only surface for every widget.
