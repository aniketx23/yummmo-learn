# Product Requirements Document
# Yummmo Learn — Healthy Cooking Course Platform
**Version:** 1.1.0
**Status:** In Testing / Pre-Launch
**Platform Name:** `Yummmo Learn`
**Part of:** Yummmo Brand Ecosystem
**Prepared for:** Claude Code / Development Team
**Last updated:** 2026-04-22

---

## 1. PRODUCT OVERVIEW

### 1.1 What Is This?
Yummmo Learn is a full-stack online course learning platform dedicated to healthy cooking — built specifically for an Indian audience. The core USP is teaching people to **replace unhealthy ingredients with healthy alternatives** without sacrificing taste. Content is delivered in **Hindi + Hinglish**.

It also offers **in-person live cooking classes** (weekend and weekday batches) with an online registration system.

It is NOT a third-party SaaS platform. It is a **fully owned, custom-built web application** under the Yummmo brand umbrella.

### 1.2 Business Goals
- Give the instructor (owner) full control over content, pricing, and student data
- Build a loyal student base around the healthy cooking niche
- Serve as the content/education arm of the Yummmo brand ecosystem
- Enable future integration with Yummmo's main product (ingredient substitution startup)
- Drive in-person live class registrations through the platform

### 1.3 Target Audience
- Indian home cooks and bakers (25–55 years)
- Hindi/Hinglish speaking
- Health-conscious families
- People curious about healthy swaps (atta cakes, sugar-free sweets, etc.)
- **Non-technical users** — the platform is designed for ease of use by older, less tech-savvy audience

---

## 2. TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **Next.js 14** (App Router) | SSR for SEO, fast page loads |
| Styling | **Tailwind CSS** | Utility-first, mobile-first |
| UI Components | **shadcn/ui (Radix)** | Accessible, customizable. Includes Sheet, Dialog, Dropdown, Tabs, etc. |
| Auth | **Supabase Auth** | Email/password + Google OAuth |
| Database | **Supabase (PostgreSQL)** | All structured data, 11 tables |
| Storage | **Supabase Storage** | Thumbnails, PDFs, attachments, avatars |
| Video Hosting | **Bunny.net Stream** | MP4 upload, CDN delivery, iframe embed player |
| Payments | **Razorpay** | One-time purchases, India-first |
| Email | **Resend** | Transactional emails (welcome, receipt) — optional, no-ops if key missing |
| Automation | **n8n (Railway)** | Enrollment webhooks, WhatsApp alerts — optional |
| Charts | **Recharts** | Admin revenue bar chart |
| Deployment | **Vercel** | Frontend hosting |
| Backend API | **Next.js API Routes** | All server logic |

---

## 3. USER ROLES

### 3.1 Role Definitions

| Role | Who | Access |
|---|---|---|
| `super_admin` | Aniket | Full platform control |
| `instructor` | Mom (Yashika) | Create/manage courses, view enrollments, earnings, manage live classes |
| `student` | Public users | Browse, enroll, watch courses, register for live classes |

### 3.2 Role Capabilities Matrix

| Action | Super Admin | Instructor | Student |
|---|---|---|---|
| Create/edit courses | Yes | Yes | No |
| Upload videos | Yes | Yes | No |
| Publish/unpublish course | Yes | Yes | No |
| View all students | Yes | Yes (own) | No |
| Manage live classes | Yes | Yes | No |
| Process refunds | Yes | No | No |
| Browse course catalog | Yes | Yes | Yes |
| Purchase course | No | No | Yes |
| Watch enrolled courses | No | Yes (preview) | Yes |
| Track progress | No | No | Yes |
| Register for live classes | No | No | Yes |

---

## 4. DATABASE SCHEMA

### 4.1 Table: `profiles`
Extends Supabase `auth.users`. Auto-created via `handle_new_user()` trigger.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'instructor', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 Table: `categories`
Seeded with: Baking, Healthy Swaps, Indian Cooking, Meal Prep.
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.3 Table: `courses`
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  language TEXT NOT NULL DEFAULT 'Hindi',
  level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  total_lessons INT NOT NULL DEFAULT 0,
  total_duration_minutes INT NOT NULL DEFAULT 0,
  tags TEXT[],
  resources JSONB NOT NULL DEFAULT '[]',    -- course-level files & links [{type, name, url}]
  search_vector TSVECTOR GENERATED ALWAYS AS (...) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.4 Table: `sections`
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.5 Table: `lessons`
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_bunny_id TEXT,
  video_url TEXT,
  video_duration_seconds INT NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  attachments JSONB NOT NULL DEFAULT '[]',  -- per-lesson files & links [{type, name, url}]
  tips TEXT,                                 -- chef tips / instructor notes (optional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.6 Table: `enrollments`
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  payment_id UUID REFERENCES payments(id),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);
```

### 4.7 Table: `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.8 Table: `progress`
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);
```

### 4.9 Table: `wishlists`
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
```

### 4.10 Table: `live_classes`
```sql
CREATE TABLE live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT CHECK (schedule_type IN ('weekend', 'weekday', 'custom')) DEFAULT 'weekend',
  schedule_days TEXT,
  time_slot TEXT,
  max_spots INT NOT NULL DEFAULT 8,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.11 Table: `live_class_registrations`
```sql
CREATE TABLE live_class_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID REFERENCES live_classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INT,
  gender TEXT,
  preferred_date DATE,
  preferred_slot TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.12 Key Functions
- `is_staff()` — security definer function that checks if the current user is `super_admin` or `instructor`, bypassing RLS. Used in all staff-check policies to prevent infinite recursion.
- `set_updated_at()` — trigger function for auto-updating `updated_at` columns.
- `handle_new_user()` — trigger on `auth.users` INSERT that creates a `profiles` row.
- `auth_app_role(user_id)` — RPC for fetching user role (used by middleware).

---

## 5. FEATURE MODULES (V1)

---

### MODULE 1: AUTH SYSTEM

**Pages:**
- `/auth/login` — Email + Password login, Google OAuth
- `/auth/signup` — Name, Email, Password, Phone (**mandatory**)
- `/auth/forgot-password` — Email reset link
- `/auth/reset-password` — New password form

**Behaviour:**
- On signup -> create row in `profiles` with role = `student`
- Phone number is **required** during signup (validated: 10-15 digits)
- On login -> redirect to `/dashboard` if student, `/admin` if admin/instructor
- Google OAuth creates a `profiles` row on first login. If phone is missing, redirects to `/profile?complete=1` with a welcome banner asking user to add phone.
- Protected routes via Next.js middleware using Supabase session
- Role-aware login redirect using `fetchProfileAppRole()` helper

---

### MODULE 2: COURSE CATALOG (PUBLIC)

**Pages:**
- `/` — Landing/Home page
- `/courses` — All courses browse page
- `/courses/[slug]` — Course detail page
- `/categories/[slug]` — Category filtered page
- `/blog` — Blog articles + newsletter signup

**Home Page Sections:**
1. Hero banner with CTA ("Start Learning Today")
2. Featured categories (Baking, Healthy Swaps, Indian Cooking)
3. Popular / Trending courses grid
4. Free courses section
5. About the instructor (mom's story)
6. Testimonials
7. Footer (context-aware: shows Dashboard/Profile when logged in, Login/Signup when logged out)

**Course Detail Page Sections:**
1. Course title, short description, language/level/category badges
2. Thumbnail image
3. Course curriculum (accordion: sections -> lessons, lock icons on paid)
4. Course Resources section (files + links attached by admin)
5. Free preview section
6. Instructor card
7. Sticky sidebar: Price or "Enrolled" badge, CTA button (Enroll Free / Buy Now / Go to Course)
8. Student count, total hours, level badge

**Blog Page:**
- Static articles (hardcoded for V1, connect to CMS later)
- Newsletter signup form (toast confirmation for V1, connect to Resend/n8n later)

---

### MODULE 3: PAYMENT & ENROLLMENT

**Flow — Paid Course:**
1. Student clicks "Buy Now"
2. If not logged in -> redirect to login -> back to course page
3. Call `/api/payment/create-order` -> creates Razorpay order
4. Razorpay checkout modal opens (prefilled name, email, phone)
5. On success -> call `/api/payment/verify` -> verify signature
6. On verified -> create `payments` row (completed) + `enrollments` row
7. Redirect to `/learn/[courseSlug]`

**Flow — Free Course:**
1. Student clicks "Enroll Free"
2. If not logged in -> redirect to login -> back
3. Call `/api/enrollments/free` -> create enrollment directly
4. Redirect to `/learn/[courseSlug]`

---

### MODULE 4: COURSE LEARNING PLAYER

**Page:** `/learn/[courseSlug]/[lessonId]`

**Access Control:**
- Must be enrolled in the course
- If not enrolled -> redirect to course detail page
- Free preview lessons bypass enrollment check

**Layout:**
- Left sidebar: Course curriculum with completion checkmarks
- Main area: Bunny.net video embed player (or "Video coming soon" placeholder)
- Below video: Two tabs:
  - **Lesson tab** — Lesson title, description, Chef's Tip (optional orange card with lightbulb icon)
  - **References tab** — Lesson files and links with titles, clickable to download/open
- Top bar: "Lesson X of Y", Previous/Next buttons
- Mark Lesson Complete button (appears for ALL lessons, including those without video)
- After completion: "Next lesson ->" button appears

**Progress Tracking:**
- "Mark lesson complete" button (manual, works for all lessons)
- On video play -> save `last_watched_seconds` every 30 seconds via API (native video only)
- On video end (>= 90% watched) -> auto-mark lesson completed (native video only)
- Progress bar in sidebar updates on page refresh after completion

---

### MODULE 5: STUDENT DASHBOARD

**Page:** `/dashboard`

**Sections:**
1. Welcome message ("Namaste, [Name]!")
2. Stats row: Courses enrolled, Lessons completed, Courses finished
3. **Continue Learning** — In-progress courses with progress bar
4. **Not Started Yet** — Enrolled courses with zero progress
5. **Completed** — Courses with all lessons done (with "Completed" badge)
6. **Explore New Courses** — Published courses the student hasn't enrolled in

**Page:** `/my-courses`
- Focused view of enrolled courses only, split into In Progress / Not Started / Completed sections

**Page:** `/profile`
- Edit name, phone (validated), avatar (file upload to Supabase Storage)
- Welcome banner when `?complete=1` (Google OAuth profile completion)

---

### MODULE 6: ADMIN PANEL

**Base Route:** `/admin` (role-protected: super_admin + instructor)

**Navigation:**
- Desktop: Fixed sidebar with links (Dashboard, Courses, Students, Enrollments, Revenue, Live Classes)
- Mobile: Hamburger menu opening a Sheet slide-out panel
- Breadcrumbs on all pages (auto-generated from URL path)
- "Back to site" link in sidebar

#### 6.1 Admin Dashboard `/admin`
- Stat cards: Total courses, total students, revenue (this month)
- All-time revenue text
- Quick-action buttons: New Course, View Students, View Enrollments
- Recent enrollments table (last 8, with horizontal scroll on mobile)

#### 6.2 Course Management `/admin/courses`
- Table: all courses (title, category, status badge, price, actions)
- Actions via dropdown menu (...): View, Edit, Publish/Unpublish, Delete
- Delete uses Dialog confirmation (not browser confirm())
- Toast feedback for all actions
- Mobile: table scrolls horizontally

#### 6.3 Create/Edit Course `/admin/courses/new` & `/admin/courses/[id]/edit`

Three-tab wizard (Course info, Curriculum, Publish):

**Course Info tab:**
- Title (slug auto-generated, hidden from UI, shown read-only in edit mode)
- Short description, full description
- Category (dropdown), Level (dropdown), Language (dropdown: Hindi/Hinglish/English)
- Tags (comma-separated with helper text)
- Free/Paid toggle, Price (INR), Original Price (for strikethrough)
- Thumbnail upload (file or URL)
- **Course Resources** section: attach files (with title) or reference links (with title) for the whole course

**Curriculum tab:**
- Add/remove sections
- Per lesson: Title, Description, Video ID, **Chef Tips** (optional textarea), **Lesson files & links** (with title per resource)
- Free Preview toggle per lesson

**Publish tab:**
- Publish/Draft toggle

**Editing:** Full wizard re-renders with existing data. Curriculum uses delete-and-reinsert strategy on save.

#### 6.4 Students `/admin/students`
- Searchable table (filter by name or phone)
- Columns: Name, Phone, Courses count, Joined date
- Mobile: horizontal scroll

#### 6.5 Enrollments `/admin/enrollments`
- Filterable table (filter by course via dropdown)
- Columns: Student, Course, Date, Amount, Payment ID
- Export CSV button
- Mobile: horizontal scroll

#### 6.6 Revenue `/admin/revenue`
- All-time revenue card
- Monthly bar chart (Recharts) with readable month labels (e.g. "Apr 26")
- Per-course breakdown table sorted by revenue

#### 6.7 Live Classes `/admin/live-classes`
- Stats: Active Batches, Total Registrations, Pending, Confirmed
- **Batches tab**: Cards for each class batch (title, schedule, time, spots used/max). Create/edit/activate/deactivate via dialog + dropdown.
- **Registrations tab**: Filterable table (by status + batch). Columns: Name (age/gender), Phone, Batch, Date, Slot, Status. Status management via dropdown: Confirm, Complete, Cancel, Reset to Pending.

---

### MODULE 7: VIDEO UPLOAD SYSTEM (BUNNY.NET)

**Flow:**
1. Admin enters Bunny.net video ID in the lesson form (manual for V1)
2. Server-side upload API exists (`/api/video/create-upload`, `/api/video/upload`) for future TUS integration
3. Player on `/learn` page uses Bunny.net iframe embed with signed token
4. Token endpoint (`/api/video/token/[videoId]`) generates embed URL (works without auth for public previews)

---

### MODULE 8: SEARCH & DISCOVERY

**Features:**
- Search bar on `/courses` page
- Full-text search on course title + description (Supabase `tsvector`)
- Filter by: Category, Level, Free/Paid
- Sort by: Newest, Price Low/High

---

### MODULE 9: LIVE CLASSES

**Student Page:** `/live-classes` (protected — requires login)
- Hero section about in-person cooking classes
- "What to expect" cards (hands-on, small batches, healthy recipes, in-person)
- Upcoming batches section
- Typeform-style enrollment dialog (6 steps: Name, Phone, Age, Gender, Date picker, Time slot)
- Registrations saved to `live_class_registrations` table

**Admin Page:** `/admin/live-classes`
- Full CRUD for class batches
- Registration management with status workflow (pending -> confirmed -> completed/cancelled)

---

## 6. PAGE ROUTES SUMMARY

### Public Routes
```
/                          -> Home / Landing
/courses                   -> All courses browse
/courses/[slug]            -> Course detail
/categories/[slug]         -> Category page
/blog                      -> Blog + newsletter
/auth/login
/auth/signup
/auth/forgot-password
/auth/reset-password
```

### Protected — Student
```
/dashboard                 -> Student home (categorized courses + stats)
/my-courses                -> Enrolled courses (in-progress/completed/not started)
/learn/[courseSlug]        -> Redirect to first lesson
/learn/[courseSlug]/[lessonId] -> Video player with tabs
/profile                   -> Edit profile (avatar upload, phone)
/live-classes              -> Live class info + enrollment
```

### Protected — Admin/Instructor
```
/admin                     -> Dashboard + quick actions
/admin/courses             -> Course list (dropdown actions)
/admin/courses/new         -> Create course (3-tab wizard)
/admin/courses/[id]/edit   -> Edit course (full wizard)
/admin/students            -> Students list (searchable)
/admin/enrollments         -> Enrollments list (filterable + CSV export)
/admin/revenue             -> Revenue overview + chart
/admin/live-classes        -> Live class batches + registrations
```

---

## 7. API ROUTES SUMMARY

```
# Auth
POST   /api/auth/profile-create        -> Upsert profile + n8n webhook

# Public courses
GET    /api/courses                    -> List published courses
GET    /api/courses/[slug]             -> Single course detail
GET    /api/courses/search             -> Search + filter

# Student
POST   /api/enrollments/free           -> Free course enrollment
POST   /api/payment/create-order       -> Create Razorpay order
POST   /api/payment/verify             -> Verify + create enrollment
GET    /api/learn/[courseSlug]         -> Curriculum for enrolled student
POST   /api/progress/update            -> Save video position
POST   /api/progress/complete          -> Mark lesson complete
GET    /api/dashboard/student          -> Student dashboard data

# Video
POST   /api/video/create-upload        -> Bunny.net upload URL
POST   /api/video/upload               -> Direct upload to Bunny
GET    /api/video/token/[videoId]      -> Embed URL (no auth required)

# Admin — Courses
GET    /api/admin/courses              -> List all courses
POST   /api/admin/courses              -> Create course (with sections/lessons)
PUT    /api/admin/courses/[id]         -> Update course (with curriculum rebuild)
DELETE /api/admin/courses/[id]         -> Delete course

# Admin — Sections & Lessons
POST   /api/admin/sections             -> Create section
PUT    /api/admin/sections/[id]        -> Update section
DELETE /api/admin/sections/[id]        -> Delete section
POST   /api/admin/lessons              -> Create lesson
PUT    /api/admin/lessons/[id]         -> Update lesson
DELETE /api/admin/lessons/[id]         -> Delete lesson

# Admin — Live Classes
GET    /api/admin/live-classes         -> List all batches
POST   /api/admin/live-classes         -> Create batch
PUT    /api/admin/live-classes/[id]    -> Update batch
DELETE /api/admin/live-classes/[id]    -> Delete batch
PUT    /api/admin/live-class-registrations/[id] -> Update registration status

# Student — Live Classes
GET    /api/live-classes               -> List active classes
POST   /api/live-classes               -> Register for live class
```

---

## 8. DESIGN SYSTEM

### 8.1 Brand Direction
- **Vibe:** Warm, joyful, Indian kitchen energy. NOT sterile or clinical.
- **Primary Color:** Warm Saffron Orange `#F97316`
- **Secondary:** Deep Turmeric `#D97706`
- **Accent:** Fresh Herb Green `#16A34A`
- **Background:** Warm Cream `#FFFBF0`
- **Text:** Rich Charcoal `#1C1917`
- **Font — Display:** `Baloo 2` (Google Fonts, feels Indian + modern)
- **Font — Body:** `DM Sans` (clean, readable)

### 8.2 Component Standards
- All cards have soft shadows + rounded corners (12px)
- Buttons: rounded-full for CTA, rounded-md for secondary
- Video player area: dark background for immersion
- Admin panel: white background, sidebar nav, breadcrumbs, data-dense tables with horizontal scroll on mobile
- Mobile-first: all layouts must work on 375px+ screens

### 8.3 Navigation
- **Navbar:** Minimal — logo on left, notification bell + profile avatar + hamburger menu on right
- **Hamburger menu:** Sheet slide-out panel with all links organized by section (Browse, Your Account, Admin)
- **Same layout on desktop and mobile** — no separate mobile component

---

## 9. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ACCESS_TOKEN=          # Management API token (for migrations via API)

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Bunny.net
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=
BUNNY_CDN_HOSTNAME=
BUNNY_TOKEN_AUTH_KEY=

# Resend (Email) — optional
RESEND_API_KEY=
EMAIL_FROM=learn@yummmo.com

# n8n Webhooks — optional
N8N_WEBHOOK_NEW_USER=
N8N_WEBHOOK_PURCHASE=
N8N_WEBHOOK_COURSE_PUBLISHED=

# App
NEXT_PUBLIC_APP_URL=https://learn.yummmo.com
```

---

## 10. SUPABASE RLS STRATEGY

All staff-check policies use the `is_staff()` security definer function to avoid infinite recursion:

```sql
CREATE FUNCTION public.is_staff() RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'instructor')
) $$;
```

**Policy pattern:**
- Public data (published courses, active live classes, categories): readable by anyone
- Lesson metadata: readable for published courses (allows logged-out users to see full curriculum)
- Student data (enrollments, progress): own rows only
- Staff data: `is_staff()` for all admin operations
- Payments: insert via service role; select for own user + staff

---

## 11. BUILD PHASES / ROADMAP

### Phase 1 — Foundation (COMPLETED)
- [x] Next.js project setup with Tailwind + shadcn/ui
- [x] Supabase project: all tables + RLS policies
- [x] Auth: signup, login, Google OAuth, middleware
- [x] Profile creation on signup
- [x] Public landing page

### Phase 2 — Catalog (COMPLETED)
- [x] Admin: create course form
- [x] Admin: course list, publish/unpublish
- [x] Public: `/courses` browse page
- [x] Public: `/courses/[slug]` detail page
- [x] Categories + filtering

### Phase 3 — Video & Enrollment (COMPLETED)
- [x] Bunny.net integration: upload API + player embed
- [x] Admin: curriculum builder (sections + lessons + video ID)
- [x] Razorpay integration: create order + verify
- [x] Free enrollment flow

### Phase 4 — Learning Experience (COMPLETED)
- [x] `/learn/[courseSlug]/[lessonId]` player page with tabs
- [x] Progress tracking (mark complete + watched seconds)
- [x] Curriculum sidebar with completion states
- [x] Student dashboard: categorized courses + stats
- [x] Chef tips + lesson attachments

### Phase 5 — Admin Panel (COMPLETED)
- [x] Admin dashboard with stats + quick actions
- [x] Students list with search
- [x] Enrollments table with filter + CSV export
- [x] Revenue page with chart (readable month labels)
- [x] Mobile admin navigation (Sheet hamburger)
- [x] Admin breadcrumbs
- [x] Dropdown course actions with safe delete dialog

### Phase 6 — Polish & UX (COMPLETED)
- [x] Navbar redesign: hamburger + profile icon + notification bell
- [x] Phone mandatory on signup + Google OAuth profile completion
- [x] Avatar file upload on profile page
- [x] Blog page with newsletter signup
- [x] My Courses page (functional, categorized)
- [x] Context-aware footer
- [x] Route-level error/loading boundaries
- [x] Per-page SEO metadata
- [x] Mobile overflow fixes on admin tables

### Phase 7 — Live Classes (COMPLETED)
- [x] Live classes student page with typeform enrollment
- [x] Live classes admin: batch management + registration tracking
- [x] Database schema + RLS + API routes

### Phase 8 — Pre-Launch (REMAINING)
- [ ] Razorpay test mode end-to-end (paid course flow)
- [ ] Bunny.net video upload and playback end-to-end
- [ ] Resend email integration (welcome + receipt)
- [ ] n8n webhook integration (enrollment alerts)
- [ ] Mobile responsiveness final audit
- [ ] Performance optimization (image lazy loading, bundle size)
- [ ] Domain setup: `learn.yummmo.com`
- [ ] Final QA pass

---

## 12. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target |
|---|---|
| Page load (LCP) | < 2.5 seconds |
| Mobile support | 100% — all pages |
| Video buffering | Handled by Bunny.net CDN |
| Payment security | Razorpay signature verified server-side always |
| Video security | Signed Bunny.net tokens, no direct MP4 URLs exposed |
| Auth security | Supabase RLS on all tables, `is_staff()` for admin policies, service role key never on client |
| SEO | Dynamic meta per course/category page, sitemap, robots.txt |

---

## 13. OUT OF SCOPE (V1) — Future Features

- Course completion certificates
- Ratings & reviews
- Affiliate / referral program
- Subscription/membership plans
- Community forum
- Mobile app (React Native)
- Multiple instructors
- Coupon codes
- Drag-and-drop reorder for sections/lessons (dnd-kit installed but not wired)
- Bunny TUS browser upload in wizard (admin enters video ID manually for V1)
- Real notification system (bell icon is placeholder)
- Live class capacity enforcement (server-side max_spots check)
- Live class payment via Razorpay

---

## 14. MIGRATIONS HISTORY

| File | Purpose |
|------|---------|
| `001_initial.sql` | Core schema: 9 tables, RLS, triggers, storage bucket, category seeds |
| `002_instructor_profiles_public.sql` | Anon read of instructor profiles for catalog cards |
| `003_profiles_self_insert.sql` | Own-row insert for signup race condition |
| `004_enrollments_update.sql` | Student can update own enrollment |
| `005_auth_app_role_rpc.sql` | `auth_app_role` RPC for middleware role checks |
| `006_fix_rls_recursion.sql` | `is_staff()` function + replaced all recursive policies |
| `007_lessons_metadata_public.sql` | Lesson metadata readable for published courses (logged-out curriculum) |
| `008_course_resources_lesson_tips.sql` | `resources` JSONB on courses, `tips` TEXT on lessons |
| `009_live_classes.sql` | `live_classes` + `live_class_registrations` tables with RLS |

---

## 15. FOLDER STRUCTURE (Current)

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
  /auth/callback/route.ts       -> OAuth code exchange
  /auth/signout/route.ts        -> POST signout
/components
  /ui/                           -> shadcn components (Button, Card, Dialog, Sheet, Tabs, etc.)
  /admin/                        -> Admin-specific (course-wizard, live-classes-admin, etc.)
  /auth/                         -> Auth forms (login, signup, forgot/reset password)
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

*End of PRD — Version 1.1.0*
*Status: In Testing. Next: Phase 8 (Pre-Launch).*
