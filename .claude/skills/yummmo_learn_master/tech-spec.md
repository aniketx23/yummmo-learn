# Yummmo Learn — Tech Spec Reference

Current-state technical reference. Read before any code, schema, feature-spec, or audit work. This mirrors PRD v1.1.0 (dated 2026-04-22) plus runtime notes.

## Table of Contents
1. Stack summary
2. Roles & access matrix
3. Database schema (11 tables)
4. Key functions & triggers
5. Module-by-module behaviour
6. Page routes summary
7. API routes summary
8. Design system
9. Environment variables
10. RLS strategy
11. Build phases (what's done, what's left)
12. Out-of-scope list (v1 guardrails)
13. Migrations history
14. Folder structure
15. Known active issues

---

## 1. Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS |
| UI | shadcn/ui (Radix) — Sheet, Dialog, Dropdown, Tabs, Toast |
| Charts | Recharts |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | Supabase Postgres — 11 tables |
| Storage | Supabase Storage |
| Video | Bunny.net Stream (iframe embed + signed tokens) |
| Payments | Razorpay (INR, one-time) |
| Email | Resend (optional — no-ops if key missing) |
| Automation | n8n on Railway (optional webhooks) |
| Hosting | Vercel |
| Backend API | Next.js API routes |

---

## 2. Roles & Access Matrix

| Role | Who | Notes |
|---|---|---|
| `super_admin` | Aniket | Full platform control, refunds, manage admin users |
| `instructor` | Akta Mahajan (referred to as "Mom" in PRD, earlier placeholder "Yashika" — use Akta) | Course CRUD, own students view, live class management |
| `student` | Public users | Browse, enroll, watch, register for live classes |

| Action | super_admin | instructor | student |
|---|---|---|---|
| Create/edit courses | Yes | Yes | No |
| Upload videos | Yes | Yes | No |
| Publish/unpublish | Yes | Yes | No |
| View all students | Yes | Yes (own) | No |
| Manage live classes | Yes | Yes | No |
| Process refunds | Yes | No | No |
| Purchase course | No | No | Yes |
| Watch enrolled | No | Yes (preview) | Yes |
| Track progress | No | No | Yes |
| Register live class | No | No | Yes |

---

## 3. Database Schema — 11 Tables

### 3.1 `profiles`
Extends `auth.users`. Auto-created via `handle_new_user()` trigger.
Columns: `id UUID PK (FK auth.users)`, `full_name`, `avatar_url`, `phone`, `role` (CHECK: super_admin/instructor/student, default student), `created_at`, `updated_at`.

### 3.2 `categories`
Seeded with: Baking, Healthy Swaps, Indian Cooking, Meal Prep.
Columns: `id`, `name`, `slug UNIQUE`, `icon_url`, `display_order`, `created_at`.

### 3.3 `courses`
Columns: `id`, `instructor_id → profiles`, `category_id → categories`, `title`, `slug UNIQUE`, `description`, `short_description`, `thumbnail_url`, `language` (default 'Hindi'), `level` (Beginner/Intermediate/Advanced), `is_free`, `price`, `original_price`, `is_published`, `total_lessons`, `total_duration_minutes`, `tags TEXT[]`, `resources JSONB` (course-level files/links `[{type, name, url}]`), `search_vector TSVECTOR GENERATED` (full-text on title+description), `created_at`, `updated_at`.

### 3.4 `sections`
Columns: `id`, `course_id → courses ON DELETE CASCADE`, `title`, `display_order`, `created_at`.

### 3.5 `lessons`
Columns: `id`, `section_id → sections CASCADE`, `course_id → courses CASCADE`, `title`, `description`, `video_bunny_id`, `video_url`, `video_duration_seconds`, `is_free_preview`, `display_order`, `attachments JSONB` (per-lesson files/links), `tips TEXT` (optional chef tip / instructor note), `created_at`, `updated_at`.

### 3.6 `enrollments`
Columns: `id`, `student_id → profiles`, `course_id → courses`, `enrolled_at`, `is_free`, `payment_id → payments`, `completed_at`, `UNIQUE(student_id, course_id)`.

### 3.7 `payments`
Columns: `id`, `student_id`, `course_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency` (default INR), `status` (pending/completed/failed/refunded), `created_at`.

### 3.8 `progress`
Columns: `id`, `student_id`, `lesson_id → lessons CASCADE`, `course_id → courses CASCADE`, `is_completed`, `last_watched_seconds`, `completed_at`, `UNIQUE(student_id, lesson_id)`.

### 3.9 `wishlists`
Columns: `id`, `student_id`, `course_id`, `created_at`, `UNIQUE(student_id, course_id)`.

### 3.10 `live_classes`
Columns: `id`, `title`, `description`, `schedule_type` (weekend/weekday/custom), `schedule_days`, `time_slot`, `max_spots` (default 8), `price`, `is_active`, `created_at`, `updated_at`.

### 3.11 `live_class_registrations`
Columns: `id`, `live_class_id → live_classes ON DELETE SET NULL`, `student_id → profiles ON DELETE SET NULL`, `full_name`, `phone`, `email`, `age`, `gender`, `preferred_date`, `preferred_slot`, `status` (pending/confirmed/cancelled/completed), `notes`, `created_at`.

---

## 4. Key Functions & Triggers

- `is_staff()` — SECURITY DEFINER, returns boolean. Checks if current `auth.uid()` is `super_admin` or `instructor`. Used in all staff-check RLS policies to prevent infinite recursion. Defined in migration 006.
- `set_updated_at()` — trigger function for auto-updating `updated_at` columns.
- `handle_new_user()` — trigger on `auth.users` INSERT → creates a matching `profiles` row.
- `auth_app_role(user_id)` — RPC for middleware role checks (migration 005).

---

## 5. Module-by-Module Behaviour

### Module 1: Auth
- `/auth/login` — Email+password + Google OAuth.
- `/auth/signup` — Name, Email, Password, **Phone (mandatory, 10–15 digits validated)**.
- `/auth/forgot-password`, `/auth/reset-password`.
- On signup → `profiles` row created with role=student.
- On login → redirect `/dashboard` for students, `/admin` for admin/instructor (uses `fetchProfileAppRole()` helper).
- Google OAuth → creates profile row. If phone missing → redirect to `/profile?complete=1` with welcome banner.
- Protected routes via Next.js middleware using Supabase session.

### Module 2: Course Catalog (Public)
- `/` Home — Hero CTA, featured categories, trending grid, free courses, about instructor, testimonials, context-aware footer.
- `/courses` — Browse all. Search bar (tsvector), filter (category, level, free/paid), sort (newest, price low/high).
- `/courses/[slug]` — Detail: title, badges (language/level/category), thumbnail, curriculum accordion with lock icons on paid, course resources, free preview section, instructor card, sticky sidebar with price + CTA (Enroll Free / Buy Now / Go to Course), student count, total hours.
- `/categories/[slug]` — Filtered by category.
- `/blog` — Static articles (hardcoded v1) + newsletter signup (toast confirmation for now, connect to Resend/n8n later).

### Module 3: Payment & Enrollment
**Paid flow:** Buy Now → (login if needed) → `/api/payment/create-order` → Razorpay modal (prefilled) → on success `/api/payment/verify` → verify signature → insert `payments` (completed) + `enrollments` → redirect `/learn/[courseSlug]`.
**Free flow:** Enroll Free → (login if needed) → `/api/enrollments/free` → redirect `/learn/[courseSlug]`.

### Module 4: Learning Player
- Route: `/learn/[courseSlug]/[lessonId]`.
- Access: must be enrolled; free-preview lessons bypass check.
- Layout: left sidebar with curriculum + completion checkmarks; main area Bunny.net iframe (or "Video coming soon" placeholder); below video two tabs:
  - **Lesson tab** — title, description, Chef's Tip card (orange, lightbulb icon) if `lessons.tips` present.
  - **References tab** — lesson files/links with titles.
- Top bar: "Lesson X of Y" + Previous/Next buttons.
- "Mark Lesson Complete" button appears for ALL lessons (works even without video).
- After completion → "Next lesson →" button.
- Progress tracking: `/api/progress/update` every 30s (native video only), auto-mark complete at ≥90% (native video only), manual mark complete always works.

### Module 5: Student Dashboard
- `/dashboard` — Welcome ("Namaste, [Name]!"), stats (courses enrolled / lessons completed / courses finished), sections: Continue Learning (in-progress with progress bar), Not Started Yet, Completed (with badge), Explore New Courses.
- `/my-courses` — Enrolled only, split In Progress / Not Started / Completed.
- `/profile` — Edit name, phone (validated), avatar (file upload to Supabase Storage). Welcome banner when `?complete=1`.

### Module 6: Admin Panel
Base: `/admin`, role-protected.

**Navigation:** Desktop fixed sidebar (Dashboard, Courses, Students, Enrollments, Revenue, Live Classes). Mobile hamburger → Sheet slide-out. Breadcrumbs auto-generated from URL. "Back to site" link in sidebar.

- `/admin` Dashboard — Stat cards (total courses, total students, revenue this month), all-time revenue text, quick-action buttons, recent enrollments table (last 8, horizontal scroll on mobile).
- `/admin/courses` — Table with dropdown actions (View, Edit, Publish/Unpublish, Delete). Delete uses Dialog confirmation (NOT `confirm()`). Toast feedback on all actions.
- `/admin/courses/new` & `/admin/courses/[id]/edit` — **3-tab wizard:**
  - **Course Info:** title (slug auto-generated), short description, full description, category, level, language (Hindi/Hinglish/English), tags comma-separated, free/paid toggle, price, original price, thumbnail upload (file or URL), **course resources** (files with title or links with title).
  - **Curriculum:** add/remove sections; per lesson: title, description, Video ID, **Chef Tips** (optional textarea), **Lesson files & links** with title, Free Preview toggle.
  - **Publish:** publish/draft toggle.
  - **Edit mode:** full wizard re-renders with existing data. Curriculum uses delete-and-reinsert strategy on save.
- `/admin/students` — Searchable table (name/phone), columns: Name, Phone, Courses count, Joined date.
- `/admin/enrollments` — Filterable (by course), columns: Student, Course, Date, Amount, Payment ID. CSV export button.
- `/admin/revenue` — All-time revenue card, monthly bar chart (Recharts, readable labels like "Apr 26"), per-course breakdown table sorted by revenue.
- `/admin/live-classes` — Stats (Active Batches, Total Regs, Pending, Confirmed). Two tabs:
  - **Batches tab:** cards per batch with create/edit/activate/deactivate via dialog + dropdown.
  - **Registrations tab:** filterable table (status + batch), columns: Name (age/gender), Phone, Batch, Date, Slot, Status. Status management dropdown: Confirm / Complete / Cancel / Reset to Pending.

### Module 7: Video Upload (Bunny.net)
- Admin enters Bunny.net video ID manually in lesson form (v1). TUS browser upload deferred.
- Server-side upload API exists (`/api/video/create-upload`, `/api/video/upload`) for future wiring.
- Player uses Bunny.net iframe with signed token.
- `/api/video/token/[videoId]` generates embed URL; works without auth for public free previews.

### Module 8: Search & Discovery
- Search bar on `/courses`. Full-text on title + description via tsvector (`courses.search_vector`).
- Filters: category, level, free/paid. Sort: newest, price low/high.

### Module 9: Live Classes
- `/live-classes` (protected, student) — hero, "what to expect" cards (hands-on, small batches, healthy recipes, in-person), upcoming batches section, **6-step typeform-style enrollment dialog** (Name, Phone, Age, Gender, Date picker, Time slot) → saves to `live_class_registrations`.
- `/admin/live-classes` — Full batch CRUD + registration status workflow pending→confirmed→completed/cancelled.

---

## 6. Page Routes Summary

**Public:** `/`, `/courses`, `/courses/[slug]`, `/categories/[slug]`, `/blog`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`.

**Student (protected):** `/dashboard`, `/my-courses`, `/learn/[courseSlug]`, `/learn/[courseSlug]/[lessonId]`, `/profile`, `/live-classes`.

**Admin/Instructor (protected):** `/admin`, `/admin/courses`, `/admin/courses/new`, `/admin/courses/[id]/edit`, `/admin/students`, `/admin/enrollments`, `/admin/revenue`, `/admin/live-classes`.

---

## 7. API Routes Summary

**Auth**
- `POST /api/auth/profile-create` — upsert profile + n8n webhook

**Public courses**
- `GET /api/courses` — list published
- `GET /api/courses/[slug]` — single detail
- `GET /api/courses/search` — search + filter

**Student**
- `POST /api/enrollments/free`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `GET /api/learn/[courseSlug]` — curriculum for enrolled
- `POST /api/progress/update`
- `POST /api/progress/complete`
- `GET /api/dashboard/student`

**Video**
- `POST /api/video/create-upload`
- `POST /api/video/upload`
- `GET /api/video/token/[videoId]`

**Admin — Courses**
- `GET /api/admin/courses`
- `POST /api/admin/courses` (with sections/lessons)
- `PUT /api/admin/courses/[id]` (curriculum rebuild)
- `DELETE /api/admin/courses/[id]`

**Admin — Sections & Lessons**
- `POST/PUT/DELETE /api/admin/sections` & `/api/admin/sections/[id]`
- `POST/PUT/DELETE /api/admin/lessons` & `/api/admin/lessons/[id]`

**Admin — Live Classes**
- `GET/POST /api/admin/live-classes`
- `PUT/DELETE /api/admin/live-classes/[id]`
- `PUT /api/admin/live-class-registrations/[id]`

**Student — Live Classes**
- `GET /api/live-classes` — list active
- `POST /api/live-classes` — register

---

## 8. Design System

- **Primary:** Warm Saffron Orange `#F97316`
- **Secondary:** Deep Turmeric `#D97706`
- **Accent:** Fresh Herb Green `#16A34A`
- **Background:** Warm Cream `#FFFBF0`
- **Text:** Rich Charcoal `#1C1917`
- **Display font:** Baloo 2
- **Body font:** DM Sans
- **Cards:** soft shadows, rounded 12px
- **Buttons:** rounded-full for CTA, rounded-md for secondary
- **Video player area:** dark bg for immersion
- **Admin:** white bg, sidebar nav, breadcrumbs, data-dense tables with horizontal scroll on mobile
- **Mobile-first:** all layouts 375px+
- **Navbar:** minimal — logo left, notification bell + profile avatar + hamburger right
- **Hamburger menu:** Sheet slide-out organized by section (Browse, Your Account, Admin)
- **Same layout on desktop and mobile** — no separate mobile component

---

## 9. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ACCESS_TOKEN=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Bunny.net
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=
BUNNY_CDN_HOSTNAME=
BUNNY_TOKEN_AUTH_KEY=

# Resend (optional)
RESEND_API_KEY=
EMAIL_FROM=learn@yummmo.com

# n8n (optional)
N8N_WEBHOOK_NEW_USER=
N8N_WEBHOOK_PURCHASE=
N8N_WEBHOOK_COURSE_PUBLISHED=

# App
NEXT_PUBLIC_APP_URL=https://learn.yummmo.com
```

---

## 10. RLS Strategy

All staff-check policies use `is_staff()` (SECURITY DEFINER) to avoid infinite recursion.

Pattern:
- **Public data** (published courses, active live classes, categories): readable by anyone.
- **Lesson metadata:** readable for published courses — allows logged-out users to see full curriculum.
- **Student data** (enrollments, progress): own rows only.
- **Staff data:** `is_staff()` for all admin ops.
- **Payments:** insert via service role; select for own user + staff.

---

## 11. Build Phases

- Phase 1 — Foundation: COMPLETED
- Phase 2 — Catalog: COMPLETED
- Phase 3 — Video & Enrollment: COMPLETED
- Phase 4 — Learning Experience: COMPLETED
- Phase 5 — Admin Panel: COMPLETED
- Phase 6 — Polish & UX: COMPLETED
- Phase 7 — Live Classes: COMPLETED
- **Phase 8 — Pre-Launch: REMAINING**
  - [ ] Razorpay test mode end-to-end (paid course flow)
  - [ ] Bunny.net video upload + playback end-to-end
  - [ ] Resend email integration (welcome + receipt)
  - [ ] n8n webhook integration (enrollment alerts)
  - [ ] Mobile responsiveness final audit
  - [ ] Performance optimization (image lazy loading, bundle size)
  - [ ] Domain setup: `learn.yummmo.com`
  - [ ] Final QA pass

---

## 12. Out of Scope (V1) — Hard Guardrails

Do not propose these unless the user asks specifically:
- Course completion certificates
- Ratings & reviews
- Affiliate / referral program
- Subscription / membership plans
- Community forum
- Mobile app (React Native)
- Multiple instructors
- Coupon codes
- Drag-and-drop reorder for sections/lessons (dnd-kit installed but not wired)
- Bunny TUS browser upload in wizard (admin enters video ID manually for v1)
- Real notification system (bell icon is placeholder)
- Live class capacity enforcement (server-side `max_spots` check)
- Live class payment via Razorpay

---

## 13. Migrations History

| File | Purpose |
|---|---|
| `001_initial.sql` | Core schema: 9 tables, RLS, triggers, storage bucket, category seeds |
| `002_instructor_profiles_public.sql` | Anon read of instructor profiles for catalog cards |
| `003_profiles_self_insert.sql` | Own-row insert for signup race condition |
| `004_enrollments_update.sql` | Student can update own enrollment |
| `005_auth_app_role_rpc.sql` | `auth_app_role` RPC for middleware role checks |
| `006_fix_rls_recursion.sql` | `is_staff()` function + replaced all recursive policies |
| `007_lessons_metadata_public.sql` | Lesson metadata readable for published courses |
| `008_course_resources_lesson_tips.sql` | `resources` JSONB on courses, `tips` TEXT on lessons |
| `009_live_classes.sql` | `live_classes` + `live_class_registrations` + RLS |

---

## 14. Folder Structure

```
/app
  /(public)
    /page.tsx                    -> Home
    /courses/page.tsx            -> Browse
    /courses/[slug]/page.tsx     -> Course detail
    /categories/[slug]/page.tsx  -> Category
    /blog/page.tsx               -> Blog + newsletter
  /(auth)
    /auth/login/page.tsx
    /auth/signup/page.tsx
    /auth/forgot-password/page.tsx
    /auth/reset-password/page.tsx
  /(student)
    /dashboard/page.tsx
    /my-courses/page.tsx
    /learn/[courseSlug]/page.tsx
    /learn/[courseSlug]/[lessonId]/page.tsx
    /profile/page.tsx
    /live-classes/page.tsx
  /(admin)
    /admin/page.tsx
    /admin/courses/page.tsx
    /admin/courses/new/page.tsx
    /admin/courses/[id]/edit/page.tsx
    /admin/students/page.tsx
    /admin/enrollments/page.tsx
    /admin/revenue/page.tsx
    /admin/live-classes/page.tsx
  /api/                          -> 24 API route handlers
  /auth/callback/route.ts        -> OAuth code exchange
  /auth/signout/route.ts         -> POST signout
/components
  /ui/                           -> shadcn (Button, Card, Dialog, Sheet, Tabs, etc.)
  /admin/                        -> course-wizard, live-classes-admin, etc.
  /auth/                         -> login, signup, forgot/reset password forms
  /site-header.tsx, site-nav.tsx, site-footer.tsx
  /course-card.tsx, course-purchase.tsx
  /mark-lesson-complete.tsx, lesson-tabs.tsx
  /profile-form.tsx, newsletter-form.tsx
  /live-class-enroll.tsx
  /bunny-video-player.tsx, lesson-progress-tracker.tsx
/lib
  /supabase/client.ts, server.ts, admin.ts
  /auth.ts, profile-role.ts
  /razorpay.ts, bunny.ts, resend.ts, n8n.ts
  /utils.ts
/supabase/migrations/            -> 9 SQL migration files
/progress/                       -> Session documentation (17 sessions)
```

---

## 15. Known Active Issues

- **Auth / redirect bugs** — user has been actively debugging. Context for any auth-related questions.
- **Video upload + payment flows not yet tested end-to-end.** Phase 8 priority.
- **Bell icon is placeholder** — do not treat as functional.
- **Drag-and-drop** — dnd-kit installed but not wired for curriculum reorder.

---

## 16. Naming Consistency Flag

PRD v1.1.0 line 64 lists instructor as "Yashika". User confirmed instructor is **Akta Mahajan, 42**. If editing the PRD or any user-facing surface, use **Akta Mahajan**. If unsure, ask.

---

*End of tech spec reference.*
