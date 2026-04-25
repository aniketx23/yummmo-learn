# Session 2026-04-18 — UX Polish Plan & Execution

## Context

Full codebase audit revealed the core platform is functionally complete but has significant UX gaps for both target user groups:
- **Admin (mom):** Course wizard too technical, tables break on mobile, no mobile nav, unsafe delete actions
- **Students (older Indian home cooks):** Dashboard doesn't categorize courses, profile requires URL for avatar, learning player lacks navigation aids
- **Public site:** Free preview lessons require login (should be watchable from course detail page), logged-out users see incomplete curriculum due to RLS policy gap

A 3-phase plan was created to address these issues in priority order: Admin (unblocks testing) → Student UX → New features.

## What changed

### Phase 1: Admin Panel Polish

#### 1.1 Course Wizard Simplification
- Hid slug field (auto-generated, shown read-only in edit mode)
- Changed Language to `<select>` dropdown (Hindi, Hinglish, English)
- Renamed Bunny video ID placeholder with helper text
- Added `Loader2` spinner on save button
- Replaced inline `msg` with Sonner toasts

#### 1.2 Course Actions
- Replaced 4-button row with `DropdownMenu` (... icon trigger)
- Replaced `confirm()` with `Dialog` for safe delete confirmation
- Added toast feedback for publish/unpublish/delete

#### 1.3 Mobile-Friendly Admin Tables
- All admin tables wrapped in `overflow-x-auto`
- Students page: added search by name/phone
- Enrollments page: added course filter dropdown

#### 1.4 Admin Dashboard
- Added quick-action buttons: New Course, View Students, View Enrollments

#### 1.5 Mobile Admin Navigation
- Created `components/ui/sheet.tsx` (shadcn Sheet component)
- Added Sheet-based hamburger menu to admin mobile header

#### 1.6 Revenue Chart
- Changed month labels from `YYYY-MM` to `MMM YY` format using `date-fns`

### Phase 2: Public Site & Student Experience

#### 2.1 Lesson Visibility Fix
- New migration `007_lessons_metadata_public.sql` — allows anonymous read of lesson metadata for published courses

#### 2.2 Free Preview Without Login
- `PreviewVideoDialog` component for inline preview on course detail page
- No login required to watch preview videos

#### 2.3 Student Dashboard Rework
- Courses split into: Continue Learning, Completed, Not Started
- Summary stats row (courses enrolled, lessons completed)
- "Explore New Courses" section at bottom

#### 2.4 Profile Improvements
- Avatar file upload (replaced URL field)
- Phone validation + placeholder
- Sonner toast feedback

#### 2.5 Header Navigation
- Added "My Profile" link for logged-in users (desktop + mobile)

#### 2.6 My Courses Page
- Made functional with 3-category course listing (was just a redirect to /dashboard)

#### 2.7 Learning Player Fixes
- Lock icon tooltips explaining why locked
- Breadcrumb navigation (Dashboard / Course / Lesson)
- "Next Lesson" button after marking complete

### Phase 3: New Features

#### 3.1 Blog/Newsletter Page
- Static blog page with newsletter signup form

#### 3.2 Admin Breadcrumbs
- Client component generating breadcrumbs from pathname

#### 3.3 Context-Aware Footer
- Shows Dashboard/Profile instead of Login/Signup when logged in

## Files touched

### New files
- `components/ui/sheet.tsx`
- `components/preview-video-dialog.tsx`
- `components/admin/admin-breadcrumbs.tsx`
- `app/(public)/blog/page.tsx`
- `supabase/migrations/007_lessons_metadata_public.sql`

### Modified files
- `components/admin/course-wizard.tsx`
- `components/admin/admin-course-actions.tsx`
- `components/admin-sidebar.tsx`
- `components/site-header.tsx`
- `components/site-header-mobile.tsx`
- `components/site-footer.tsx`
- `components/profile-form.tsx`
- `components/mark-lesson-complete.tsx`
- `app/(admin)/admin/layout.tsx`
- `app/(admin)/admin/page.tsx`
- `app/(admin)/admin/courses/page.tsx`
- `app/(admin)/admin/students/page.tsx`
- `app/(admin)/admin/enrollments/page.tsx`
- `app/(admin)/admin/revenue/page.tsx`
- `app/(public)/courses/[slug]/page.tsx`
- `app/(student)/dashboard/page.tsx`
- `app/(student)/my-courses/page.tsx`
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

## How to verify

1. `npm run build` — clean build
2. Admin: create course, publish, verify wizard UX and mobile nav
3. Public: browse courses logged out, see full curriculum, watch preview video
4. Student: enroll, dashboard shows categorized courses, profile upload works
5. Learning: breadcrumbs visible, next lesson button after completion
6. Mobile: all pages work on 375px viewport

## Follow-ups / risks

- Delete-and-reinsert for curriculum (from session 12) can orphan progress rows — acceptable pre-launch
- Blog page is static for v1 — connect to CMS or Supabase table later
- Newsletter subscribe is a toast-only no-op — connect to Resend/n8n later
- `EditCourseForm` component is now fully unused — can be deleted in cleanup
