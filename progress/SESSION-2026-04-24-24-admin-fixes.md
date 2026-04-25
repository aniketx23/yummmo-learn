# Session 24 — Admin Panel Fixes (Batch D)

**Date:** 2026-04-24
**Focus:** Ten fixes across the admin panel

---

## Fix D1 — Admin User Menu (logout + identity)

**Problem:** No logout button or user identity visible in admin.

**Fix:** Updated `components/admin-sidebar.tsx`:
- Added `UserRow` component at the bottom of both desktop sidebar and mobile Sheet
- Shows: avatar initial circle, admin name, role badge (Super Admin / Instructor)
- Logout button calls `POST /auth/signout` and redirects to home
- Admin layout now queries `profiles` table and passes `{ name, role }` to both `AdminSidebar` and `AdminMobileNav`

**Files:** `components/admin-sidebar.tsx`, `app/(admin)/admin/layout.tsx`

---

## Fix D2 — Breadcrumb Raw Slug Fix

**Problem:** Breadcrumb showed "live-classes" instead of "Live Classes".

**Fix:** Added `"live-classes": "Live Classes"` to the `labels` map in `admin-breadcrumbs.tsx`.

**Files:** `components/admin/admin-breadcrumbs.tsx`

---

## Fix D3 — Confirmation Dialog on Destructive Actions

**Problem:** Unpublish had no confirmation (Delete already had a dialog).

**Fix:** Added unpublish confirmation dialog: "Unpublish this course? Students won't be able to find or access this course until you publish it again." with Cancel + Unpublish buttons. The Unpublish dropdown item now opens this dialog instead of calling togglePublish directly. Publish (making live) still works immediately — only unpublish requires confirmation.

**Files:** `components/admin/admin-course-actions.tsx`

---

## Fix D4 — Add Enrollments KPI to Dashboard

**Problem:** Dashboard showed Courses + Students + Revenue but missing Enrollments.

**Fix:** Added 4th stat card "Enrollments" with `BookOpen` icon. Query: `supabase.from("enrollments").select("id", { count: "exact", head: true })`.

**Files:** `app/(admin)/admin/page.tsx`

---

## Fix D5 — Dashboard Stat Cards 2x2 on Mobile

**Problem:** 4 stat cards stacked in single column on mobile.

**Fix:** Changed grid from `sm:grid-cols-3` to `grid-cols-2 md:grid-cols-4`. Now shows 2x2 on mobile, 4 across on desktop.

**Files:** `app/(admin)/admin/page.tsx`

---

## Fix D6 — Search + Filter on Courses Table

**Problem:** No search or filtering on the admin courses list.

**Fix:** Created `components/admin/admin-courses-table.tsx` — a client component wrapping the courses table with:
- Text search input (filters on title, client-side)
- Status dropdown: All / Published / Draft
- Price dropdown: Free & Paid / Free / Paid
- Empty state when no courses match filters

Server page now passes pre-processed data (with resolved category names) to the client component.

**Files:** `components/admin/admin-courses-table.tsx` (NEW), `app/(admin)/admin/courses/page.tsx`

---

## Fix D7 — Slug Field in Course Wizard

**Problem:** Slug was auto-generated but never visible or editable. Caused title-URL mismatches.

**Fix:** Added editable slug input below the title in Course Info tab:
- Auto-populates from title via `slugify()` 
- Allows manual override (validates: lowercase letters, numbers, hyphens only)
- Shows preview: "URL: /courses/[slug]"
- Submit uses user's slug if set, otherwise falls back to auto-generated

**Files:** `components/admin/course-wizard.tsx`

---

## Fix D8 — Improved Publish Tab + SEO Fields

**Problem:** Publish tab was just a single checkbox.

**Fix:** Expanded the Publish tab with:
1. **Slug preview** (read-only): `learn.yummmo.com/courses/[slug]`
2. **SEO Title** — text input, defaults to course title if blank
3. **SEO Description** — textarea, max 160 chars with live counter
4. **Publish toggle** — existing checkbox, kept as-is

Created migration `supabase/migrations/010_seo_fields.sql`:
```sql
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;
```

Submit payload includes `seo_title` and `seo_description`.

**Files:** `components/admin/course-wizard.tsx`, `supabase/migrations/010_seo_fields.sql` (NEW)

---

## Fix D9 — Revenue Page Empty States

**Problem:** Monthly chart reserved full h-72 height when empty. By-course card was blank.

**Fix:**
- Monthly card: when `chartData` is empty, shows compact message: "Abhi koi payment nahi hua. Pehla course sell hone ke baad yahan data dikhega." No reserved height.
- By-course card: when `byCourse` map is empty, shows: "Course-wise revenue tab dikhega jab pehli sale ho."

**Files:** `app/(admin)/admin/revenue/page.tsx`

---

## Fix D10 — Live Classes Stats 2x2 on Mobile

**Problem:** 4 stat cards stacked in single column on mobile.

**Fix:** Changed from `sm:grid-cols-4` to `grid-cols-2 sm:grid-cols-4`.

**Files:** `components/admin/live-classes-admin.tsx`

---

## Build
- `npm run build` passes clean (one pre-existing `<img>` warning in course-wizard)

## All Files Touched
- `components/admin-sidebar.tsx` — D1 (rewritten with user info + logout)
- `app/(admin)/admin/layout.tsx` — D1 (passes user info to sidebar)
- `components/admin/admin-breadcrumbs.tsx` — D2 (added live-classes label)
- `components/admin/admin-course-actions.tsx` — D3 (unpublish dialog)
- `app/(admin)/admin/page.tsx` — D4, D5 (enrollments KPI + grid)
- `components/admin/admin-courses-table.tsx` — D6 (NEW client component)
- `app/(admin)/admin/courses/page.tsx` — D6 (uses new table component)
- `components/admin/course-wizard.tsx` — D7, D8 (slug + SEO fields)
- `supabase/migrations/010_seo_fields.sql` — D8 (NEW migration)
- `app/(admin)/admin/revenue/page.tsx` — D9 (empty states)
- `components/admin/live-classes-admin.tsx` — D10 (grid fix)
