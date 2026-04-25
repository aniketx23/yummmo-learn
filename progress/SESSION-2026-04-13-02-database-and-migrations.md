# Session 2026-04-13 — Database and Supabase migrations

## Context

PRD Section 4 (tables) and Section 11 (RLS). All structured data lives in Supabase Postgres; thumbnails and uploads use Supabase Storage bucket `course-thumbnails`.

## What was implemented

### Schema (`001_initial.sql`)

Tables (in dependency order where relevant):

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users`: `full_name`, `avatar_url`, `phone`, `role` (`super_admin` \| `instructor` \| `student`) |
| `categories` | Course taxonomy; seeded rows (baking, healthy-swaps, etc.) |
| `courses` | Course metadata, pricing, publish flag, `search_vector` generated column for full-text search |
| `sections` | Chapters within a course |
| `lessons` | Lessons per section; `video_bunny_id`, optional `video_url`, attachments JSONB |
| `payments` | Razorpay records (created/verified server-side with service role where needed) |
| `enrollments` | Student ↔ course; optional `payment_id` FK |
| `progress` | Per-student per-lesson completion + `last_watched_seconds` |
| `wishlists` | Optional student wishlist (minimal UI in app v1) |

**Note:** `payments` is created before `enrollments` so `enrollments.payment_id` can reference `payments.id`.

### Triggers and functions

- `set_updated_at()` on `profiles`, `courses`, `lessons`
- `handle_new_user()` on `auth.users` INSERT → creates `profiles` row (security definer)

### RLS (high level)

- **Public read** of published courses; staff read/write for drafts and curriculum.
- **Lessons:** preview rows readable by anyone; full curriculum for enrolled students or staff.
- **Enrollments / progress:** students own rows; staff can read for admin pages.
- **Payments:** select for own user + staff; inserts for completed payments go through **service role** in API to avoid widening RLS.

### Storage (`001` tail)

- Bucket `course-thumbnails` (public read)
- Policies on `storage.objects` for authenticated upload/update/delete on that bucket

### Follow-up migrations

| File | Purpose |
|------|---------|
| [002_instructor_profiles_public.sql](../supabase/migrations/002_instructor_profiles_public.sql) | Lets **anon** read instructor `profiles` rows when they teach a **published** course (catalog cards). |
| [003_profiles_self_insert.sql](../supabase/migrations/003_profiles_self_insert.sql) | `profiles_insert_own` — own-row insert for signup race / upsert. |
| [004_enrollments_update.sql](../supabase/migrations/004_enrollments_update.sql) | `enrollments_update_own` — student can update own enrollment if upsert/update paths need it. |

## Files touched

- [supabase/migrations/001_initial.sql](../supabase/migrations/001_initial.sql)
- [supabase/migrations/002_instructor_profiles_public.sql](../supabase/migrations/002_instructor_profiles_public.sql)
- [supabase/migrations/003_profiles_self_insert.sql](../supabase/migrations/003_profiles_self_insert.sql)
- [supabase/migrations/004_enrollments_update.sql](../supabase/migrations/004_enrollments_update.sql)
- [types/database.ts](../types/database.ts) — hand-written types mirroring tables (reference; not all code paths use strict inference)

## How to verify

1. In Supabase SQL: `select table_name from information_schema.tables where table_schema = 'public' order by 1;` — expect 9 tables.  
2. `select policyname, tablename from pg_policies where schemaname = 'public' order by tablename, policyname;` — compare to migration files.  
3. Storage: confirm bucket + `storage.objects` policies exist.  
4. Seed: `select * from categories;` — four rows.

## Follow-ups / risks

- Re-running `001` on a non-empty DB may fail on `CREATE POLICY` / `CREATE TABLE` — use idempotent patterns or migrations tooling (`supabase db`) for production evolution.
- **Popular sort by enrollment count** is not a DB view yet; catalog sorting is mostly `created_at` / price unless extended.
