# Product Requirements Document
# Yummmo Learn — Healthy Cooking Course Platform
**Version:** 2.0.0
**Status:** Live on Vercel / Pre-Launch
**Platform Name:** `Yummmo Learn`
**Part of:** Yummmo Brand Ecosystem
**Prepared for:** Claude Code / Development Team
**Last updated:** 2026-04-26

---

## 1. PRODUCT OVERVIEW

### 1.1 What Is This?
Yummmo Learn is a full-stack online course learning platform dedicated to healthy cooking — built specifically for an Indian audience. The core USP is teaching people to **replace unhealthy ingredients with healthy alternatives** without sacrificing taste. Content is delivered in **Hindi + Hinglish**.

It also offers **in-person live cooking classes** with an online registration system that supports guest browsing and batch selection.

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
| Auth | **Supabase Auth** | Email/password + Google OAuth + identity linking |
| Database | **Supabase (PostgreSQL)** | All structured data, 12 tables |
| Storage | **Supabase Storage** | Thumbnails, PDFs, attachments, avatars |
| Video Hosting | **Bunny.net Stream** | MP4 upload, CDN delivery, iframe embed player |
| Video Fallback | **YouTube embed** | Fallback when Bunny.net not configured |
| Payments | **Razorpay** | One-time purchases, India-first (test mode verified) |
| Email | **Resend** | Transactional emails (welcome, receipt) — optional, no-ops if key missing |
| Automation | **n8n (Railway)** | Enrollment webhooks, WhatsApp alerts — optional |
| Charts | **Recharts** | Admin revenue bar chart |
| Deployment | **Vercel** | Frontend hosting (yummmo-learn.vercel.app) |
| Backend API | **Next.js API Routes** | All server logic |

---

## 3. USER ROLES

### 3.1 Role Definitions

| Role | Who | Access |
|---|---|---|
| `super_admin` | Aniket | Full platform control |
| `instructor` | Akta Mahajan | Create/manage courses, view enrollments, earnings, manage live classes |
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
| Register for live classes | No | No | Yes (+ guests) |

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
  email TEXT,
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
  resources JSONB NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
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
  attachments JSONB NOT NULL DEFAULT '[]',
  tips TEXT,
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
  schedule_type TEXT DEFAULT 'custom',
  schedule_days TEXT,
  time_slot TEXT,
  class_date DATE,
  start_time TEXT,
  end_time TEXT,
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
- `handle_new_user()` — trigger on `auth.users` INSERT that creates a `profiles` row with email.
- `auth_app_role(user_id)` — RPC for fetching user role (used by middleware).

---

## 5. FEATURE MODULES (V1 — Current)

---

### MODULE 1: AUTH SYSTEM

**Pages:**
- `/auth/login` — Email + Password login, Google OAuth
- `/auth/signup` — Name, Email, Password, Phone (**mandatory, 10-digit validated**)
- `/auth/forgot-password` — Email reset link
- `/auth/reset-password` — New password form

**Behaviour:**
- On signup → create row in `profiles` with role = `student`, email saved
- Phone number is **required** during signup (validated: exactly 10 digits, non-digits stripped)
- On login → redirect to `/dashboard` if student, `/admin` if admin/instructor
- Google OAuth creates a `profiles` row on first login. If phone is missing, redirects to `/profile?complete=1` with welcome banner. After saving phone → auto-redirects to `/dashboard`.
- Email verification **enabled** — users must confirm email before first login
- Protected routes via Next.js middleware using Supabase session
- Role-aware login redirect using `fetchProfileAppRole()` helper

**Auth pages have header + footer** — SiteHeader (logged-out state) + minimal copyright footer. Users can navigate back to the marketing site from auth pages.

**Identity & Account Linking** (on `/profile`):
- Connected Accounts section shows linked providers (Google, Email/Password)
- Connect/Unlink Google account (with confirmation dialog)
- Change Google account (unlink + re-link flow)
- Add password for Google-only users
- Change email with verification flow
- Safety: cannot unlink last remaining provider

---

### MODULE 2: COURSE CATALOG (PUBLIC)

**Pages:**
- `/` — Landing/Home page
- `/courses` — All courses browse page
- `/courses/[slug]` — Course detail page
- `/categories/[slug]` — Category filtered page
- `/blog` — Blog articles + newsletter signup

**Home Page Sections:**
1. Hero banner with CTAs ("Start Learning Today" + "Join Live Class" linking to `/live-classes`)
2. Featured categories (Baking, Healthy Swaps, Indian Cooking)
3. Popular courses grid (limit 4, responsive 1→2→3→4 columns)
4. Free courses section (deduplicated from popular, hidden if empty after dedup)
5. About the instructor
6. Testimonials
7. Footer (context-aware: shows Dashboard/Profile when logged in, Login/Signup when logged out)

**Course Detail Page Sections:**
1. Course title, short description, language/level/category badges
2. Thumbnail image
3. Stats: student count (hidden if 0), lessons count, duration (hidden if 0 min)
4. About this course (description)
5. **"Is course mein kya seekhenge?"** — derived from first 6 lesson titles, 2-column grid with green checkmarks
6. Curriculum accordion (**expanded by default**, sections with lessons, lock/play icons)
7. Course Resources section
8. Free preview section
9. Sticky sidebar: Price/Free/Enrolled badge, CTA button, **conditional copy** (free: "no payment needed", paid: "Razorpay", enrolled: hidden)
10. Instructor card

**Course Cards:**
- Show "Enrolled" badge + "Go to course" link for enrolled users across all pages
- Show "FREE" badge for free courses
- Hide "0 min" duration

**Courses Browse Page `/courses`:**
- Responsive filter bar (flex-wrap, search flex-1, dropdowns compact)
- Filters: Search (text), Category, Level, Free & Paid, Sort
- Result count shown above grid
- Grid: 1→2→3→4 responsive columns

**Blog Page:**
- Articles in responsive grid (1→2→3 columns)
- Each article is a clickable link card with hover effect + "Read more →"
- Newsletter signup with mobile-stacking form (flex-col on mobile)

---

### MODULE 3: PAYMENT & ENROLLMENT

**Flow — Paid Course:**
1. Student clicks "Buy Now"
2. If not logged in → redirect to login → back to course page
3. Call `/api/payment/create-order` → creates Razorpay order
4. Razorpay checkout modal opens (prefilled email)
5. On success → call `/api/payment/verify` → verify HMAC signature
6. On verified → create `payments` row (completed) + `enrollments` row (via admin client)
7. Redirect to `/learn/[courseSlug]`
8. **Race condition fixed:** button stays disabled during verify, `modal.ondismiss` re-enables on cancel

**Flow — Free Course:**
1. Student clicks "Enroll Free"
2. If not logged in → redirect to login → back
3. Call `/api/enrollments/free` → create enrollment directly
4. Redirect to `/learn/[courseSlug]`

**Razorpay Script:** Only loads for paid courses (not injected on free course pages).

---

### MODULE 4: COURSE LEARNING PLAYER

**Page:** `/learn/[courseSlug]/[lessonId]`

**Access Control:**
- Must be enrolled in the course
- If not enrolled → redirect to course detail page
- Free preview lessons bypass enrollment check

**Redirect:** `/learn/[courseSlug]` (no lessonId) → auto-redirects to first lesson (or preview lesson for unenrolled users)

**Layout:**
- **Left sidebar:** Course title, progress bar, **collapsible curriculum on mobile** (starts collapsed so video is immediately visible), always visible on desktop
- **Sidebar indicators:** Green check (completed), orange dot (current), empty circle (not started), lock (locked)
- **Main area:** Video player with priority: Bunny.net → YouTube embed → native video → placeholder ("Video bahut jaldi aane wala hai! 🎬")
- **Below video:** Mark Lesson Complete button → Lesson title → LessonTabs
- **LessonTabs:** Lesson tab (description + Chef's Tip orange card) + References tab (attachments)
- **Top bar:** "Lesson X of Y", Previous/Next buttons with clear disabled styling (opacity-50)

**Progress Tracking:**
- "Mark lesson complete" button (manual, works for all lessons)
- On video play → save `last_watched_seconds` every 30s via API (native video only)
- On video end (>= 90% watched) → auto-mark lesson completed (native video only)

---

### MODULE 5: STUDENT DASHBOARD

**Page:** `/dashboard`

**Sections:**
1. Welcome message ("Namaste, [Name]!")
2. **Phone missing banner:** "Phone number add karein" with CTA (shown when phone is null)
3. Stats row: Courses enrolled, Lessons completed, Courses finished
4. **"Jaari Hai"** (In Progress) — courses with progress > 0 and < 100%
5. **"Shuru Nahi Kiya"** (Not Started) — courses with 0 progress
6. **"Poora Ho Gaya! 🎉"** (Completed) — courses with 100% progress
7. **Explore New Courses** — published courses the student hasn't enrolled in

Each section only renders when it has courses.

**Page:** `/my-courses`
- Focused view of enrolled courses only, split into In Progress / Not Started / Completed sections

**Page:** `/profile`
- Edit name, phone (**required, 10-digit**), avatar (file upload to Supabase Storage)
- Welcome banner when `?complete=1` (Google OAuth profile completion)
- Email updated banner when `?email_updated=1`
- **Connected Accounts** section (Google + Email/Password linking)
- **Logout button** at the bottom
- Auto-redirect to `/dashboard` after saving when `?complete=1`

---

### MODULE 6: ADMIN PANEL

**Base Route:** `/admin` (role-protected: super_admin + instructor)

**Navigation:**
- Desktop: Fixed sidebar with links (Dashboard, Courses, Students, Enrollments, Revenue, Live Classes)
- **Sidebar user info:** Avatar initial + name + role badge + Logout button at bottom
- Mobile: Hamburger menu opening a Sheet slide-out panel (also with user info + logout)
- Breadcrumbs on all pages (auto-generated from URL path, including "Live Classes" label)
- "Back to site" link in sidebar

#### 6.1 Admin Dashboard `/admin`
- Stat cards (**2×2 on mobile, 4-across on desktop**): Courses, Students, Enrollments, Revenue (this month)
- All-time revenue text
- Quick-action buttons: New Course, View Students, View Enrollments
- Recent enrollments table (last 8, with horizontal scroll on mobile)
- All dates formatted DD/MM/YYYY via `formatDate()` helper

#### 6.2 Course Management `/admin/courses`
- **Client-side search + filters:** Search by title, Status (All/Published/Draft), Price (Free & Paid/Free/Paid)
- Table: all courses (title, category, status badge, price, actions)
- Actions via dropdown menu: View, Edit, Publish/Unpublish, Delete
- **Unpublish confirmation dialog** (separate from delete)
- **Delete confirmation dialog** with safe cascade (deletes progress → enrollments → payments → wishlists → course via admin client)
- Toast feedback for all actions

#### 6.3 Create/Edit Course `/admin/courses/new` & `/admin/courses/[id]/edit`

Three-tab wizard (Course Info, Curriculum, Publish):

**Course Info tab:**
- Title
- **Editable URL slug** (auto-populates from title, allows manual override, validates lowercase/numbers/hyphens, shows URL preview)
- Short description, full description
- Category, Level, Language (Hindi/Hinglish/English)
- Tags (comma-separated)
- Free/Paid toggle, Price (INR), Original Price
- Thumbnail upload (file or URL)
- Course Resources section
- **Video URL field** per lesson with helper: "YouTube link paste karein (jab tak Bunny.net setup na ho)"

**Curriculum tab:**
- Add/remove sections
- Per lesson: Title, Description, Bunny Video ID, **Video URL (YouTube fallback)**, Chef Tips, Lesson files & links
- Free Preview toggle per lesson

**Publish tab:**
- **Slug preview** (read-only URL: learn.yummmo.com/courses/[slug])
- **SEO Title** input (defaults to course title)
- **SEO Description** textarea (max 160 chars with live counter)
- Publish/Draft toggle

#### 6.4 Students `/admin/students`
- Searchable table (filter by name, **email**, or phone)
- Columns: Name, **Email**, Phone, Courses count, Joined date

#### 6.5 Enrollments `/admin/enrollments`
- Filterable table (filter by course via dropdown)
- Columns: Student, **Email**, Course, Date, Amount, Payment ID
- Export CSV button

#### 6.6 Revenue `/admin/revenue`
- All-time revenue card
- Monthly bar chart (Recharts)
- Per-course breakdown table
- **Empty states** with Hinglish messages when no data

#### 6.7 Live Classes `/admin/live-classes`
- Stats: Active Batches, Total Registrations, Pending, Confirmed (**2×2 on mobile**)
- **Batches tab:** Cards with title, **date (DD/MM/YYYY)**, **start time - end time**, spots used/max. Create via dialog with **date picker + hour:minute AM/PM selectors** (no more schedule_type/days).
- **Registrations tab:** Table shows batch date/time from linked batch when preferred_date/slot are empty. Status management via dropdown.

---

### MODULE 7: VIDEO SYSTEM

**Priority order in player:**
1. Bunny.net video (`video_bunny_id`) — iframe embed with signed token
2. YouTube URL (`video_url`) — detected via `getYouTubeId()`, rendered as YouTube embed iframe
3. Native video (`video_url`, non-YouTube) — HTML5 `<video>` tag
4. No video — placeholder card: "Video bahut jaldi aane wala hai! 🎬"

**YouTube helper** (`lib/video.ts`):
- `getYouTubeId(url)` — extracts ID from youtube.com/watch, youtu.be, youtube.com/embed
- `getYouTubeEmbedUrl(url)` — returns embed URL

---

### MODULE 8: SEARCH & DISCOVERY

**Features:**
- Search bar on `/courses` page
- Full-text search on course title + description (Supabase `tsvector`)
- Filter by: Category, Level, Free/Paid
- Sort by: Newest, Price Low→High, Price High→Low
- Result count displayed above grid

---

### MODULE 9: LIVE CLASSES

**Student Page:** `/live-classes` (accessible to guests — no login required to browse)
- Hero section with registration CTA
- "What to expect" cards (**1-col mobile, 2-col tablet, 4-col desktop**)
- Upcoming batches with date, time, price, spots
- Each batch has its own "Register for This Batch" button

**Registration Flow (5 steps, typeform-style dialog):**
1. Name — "Aapka naam?"
2. Phone — "WhatsApp number daalein" (10-digit, with sublabel about correct WhatsApp number)
3. Age
4. Gender
5. **Choose Batch** — batch cards with expandable details, price shown, "Choose This Batch" button

**Guest Access:**
- Form fills without login required
- On submit, if not logged in → form data saved to `localStorage` → login prompt inside dialog ("Registration complete karne ke liye login karein — sirf 10 second lagenge!") with "Continue with Google" + "Login with Email"
- After login → auto-redirects to `/live-classes?auto_register=1` → auto-submits from `localStorage`

**Admin:** Full CRUD for class batches + registration management (see Module 6.7)

---

## 6. DESKTOP NAVIGATION

**Desktop (lg+ / 1024px+):**
- Left: "Yummmo Learn" logo
- Center/Right: horizontal nav links — Courses, Live Classes, Blog
- If logged in: Dashboard link (+ Admin for staff), bell, **avatar with dropdown menu** (My Profile, My Courses, Log out)
- If logged out: "Log in" (ghost) + "Sign up" (filled) buttons
- No hamburger on desktop

**Mobile (below lg):**
- Left: "Yummmo Learn" logo
- Right: bell + avatar (if logged in) + hamburger
- Hamburger opens Sheet drawer with full navigation + logout

---

## 7. PAGE ROUTES SUMMARY

### Public Routes
```
/                          → Home / Landing
/courses                   → All courses browse
/courses/[slug]            → Course detail
/categories/[slug]         → Category page
/blog                      → Blog + newsletter
/auth/login
/auth/signup
/auth/forgot-password
/auth/reset-password
```

### Protected — Student
```
/dashboard                 → Student home (categorized courses + stats)
/my-courses                → Enrolled courses
/learn/[courseSlug]        → Redirect to first lesson
/learn/[courseSlug]/[lessonId] → Video player with tabs
/profile                   → Edit profile + connected accounts + logout
```

### Accessible to guests (no auth required)
```
/live-classes              → Live class info + registration
```

### Protected — Admin/Instructor
```
/admin                     → Dashboard + quick actions
/admin/courses             → Course list (searchable + filterable)
/admin/courses/new         → Create course (3-tab wizard)
/admin/courses/[id]/edit   → Edit course
/admin/students            → Students list (name/email/phone search)
/admin/enrollments         → Enrollments list (filterable + CSV export)
/admin/revenue             → Revenue overview + chart
/admin/live-classes        → Live class batches + registrations
```

---

## 8. API ROUTES SUMMARY

```
# Auth
POST   /api/auth/profile-create        → Upsert profile (incl. email) + n8n webhook

# Public courses
GET    /api/courses                    → List published courses
GET    /api/courses/[slug]             → Single course detail
GET    /api/courses/search             → Search + filter

# Student
POST   /api/enrollments/free           → Free course enrollment
POST   /api/payment/create-order       → Create Razorpay order
POST   /api/payment/verify             → Verify signature + create enrollment (admin client)
GET    /api/learn/[courseSlug]         → Curriculum for enrolled student
POST   /api/progress/update            → Save video position
POST   /api/progress/complete          → Mark lesson complete
GET    /api/dashboard/student          → Student dashboard data

# Video
POST   /api/video/create-upload        → Bunny.net upload URL
POST   /api/video/upload               → Direct upload to Bunny
GET    /api/video/token/[videoId]      → Embed URL (no auth required)

# Admin — Courses
GET    /api/admin/courses              → List all courses
POST   /api/admin/courses              → Create course (with sections/lessons)
PUT    /api/admin/courses/[id]         → Update course (with curriculum rebuild)
DELETE /api/admin/courses/[id]         → Delete course (cascade via admin client)

# Admin — Sections & Lessons
POST   /api/admin/sections             → Create section
PUT    /api/admin/sections/[id]        → Update section
DELETE /api/admin/sections/[id]        → Delete section
POST   /api/admin/lessons              → Create lesson
PUT    /api/admin/lessons/[id]         → Update lesson
DELETE /api/admin/lessons/[id]         → Delete lesson

# Admin — Live Classes
GET    /api/admin/live-classes         → List all batches
POST   /api/admin/live-classes         → Create batch (date + start/end time)
PUT    /api/admin/live-classes/[id]    → Update batch
DELETE /api/admin/live-classes/[id]    → Delete batch
PUT    /api/admin/live-class-registrations/[id] → Update registration status

# Student — Live Classes
GET    /api/live-classes               → List active classes (public)
POST   /api/live-classes               → Register for live class (auth required)
```

---

## 9. DESIGN SYSTEM

### 9.1 Brand Direction
- **Vibe:** Warm, joyful, Indian kitchen energy. NOT sterile or clinical.
- **Primary Color:** Warm Saffron Orange `#F97316`
- **Secondary:** Deep Turmeric `#D97706`
- **Accent:** Fresh Herb Green `#16A34A`
- **Background:** Warm Cream `#FFFBF0`
- **Text:** Rich Charcoal `#1C1917`
- **Font — Display:** `Baloo 2` (Google Fonts)
- **Font — Body:** `DM Sans`

### 9.2 Component Standards
- All cards have soft shadows + rounded corners (12px)
- Buttons: rounded-full for CTA, rounded-md for secondary
- Video player area: dark background for immersion
- Admin panel: white background, sidebar nav, breadcrumbs, data-dense tables with horizontal scroll on mobile
- Mobile-first: all layouts must work on 375px+ screens
- All dates displayed as DD/MM/YYYY via `formatDate()` helper
- Input font-size: 16px (`text-base`) to prevent iOS auto-zoom

### 9.3 Mobile Viewport
```ts
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```
Prevents iOS Safari auto-zoom on input focus. HTML lang set to `en`.

---

## 10. ENVIRONMENT VARIABLES

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

# Resend (Email) — optional
RESEND_API_KEY=
EMAIL_FROM=learn@yummmo.com

# n8n Webhooks — optional
N8N_ENROLLMENT_WEBHOOK_URL=

# App
NEXT_PUBLIC_APP_URL=https://yummmo-learn.vercel.app
```

---

## 11. SUPABASE RLS STRATEGY

All staff-check policies use the `is_staff()` security definer function:

```sql
CREATE FUNCTION public.is_staff() RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'instructor')
) $$;
```

**Policy pattern:**
- Public data (published courses, active live classes, categories): readable by anyone
- Lesson metadata: readable for published courses (allows logged-out users to see curriculum)
- Student data (enrollments, progress): own rows only
- Staff data: `is_staff()` for all admin operations
- Payments: insert via service role; select for own user + staff
- Course deletion: via admin client (service role) to bypass FK constraints

---

## 12. BUILD PHASES / ROADMAP

### Phases 1–7: COMPLETED
All core features built (auth, catalog, payments, learning player, admin panel, live classes).

### Phase 8 — Pre-Launch (IN PROGRESS)
- [x] Razorpay test mode end-to-end (paid course flow verified)
- [x] YouTube embed fallback for video player
- [x] Google OAuth enabled and tested
- [x] Mobile responsiveness audit + fixes (viewport, input zoom, collapsible sidebar)
- [x] Desktop navbar with horizontal links + avatar dropdown
- [x] Identity linking (Google + Email/Password)
- [x] Email saved in profiles + visible in admin
- [x] Phone validation (10-digit)
- [x] Enrolled badge on course cards
- [x] SEO fields in course wizard
- [x] Live classes overhaul (date picker, batch selection, guest access)
- [ ] Bunny.net video upload and playback end-to-end
- [ ] Resend email integration (welcome + receipt)
- [ ] n8n webhook integration (enrollment + WhatsApp alerts)
- [ ] Domain setup: `learn.yummmo.com`
- [ ] Final QA pass

---

## 13. MIGRATIONS HISTORY

| File | Purpose |
|------|---------|
| `001_initial.sql` | Core schema: 9 tables, RLS, triggers, storage bucket, category seeds |
| `002_instructor_profiles_public.sql` | Anon read of instructor profiles for catalog cards |
| `003_profiles_self_insert.sql` | Own-row insert for signup race condition |
| `004_enrollments_update.sql` | Student can update own enrollment |
| `005_auth_app_role_rpc.sql` | `auth_app_role` RPC for middleware role checks |
| `006_fix_rls_recursion.sql` | `is_staff()` function + replaced all recursive policies |
| `007_lessons_metadata_public.sql` | Lesson metadata readable for published courses |
| `008_course_resources_lesson_tips.sql` | `resources` JSONB on courses, `tips` TEXT on lessons |
| `009_live_classes.sql` | `live_classes` + `live_class_registrations` tables with RLS |
| `010_seo_fields.sql` | `seo_title` + `seo_description` on courses |
| `011_profiles_email.sql` | `email` column on profiles + backfill + trigger update |
| `012_live_classes_date_field.sql` | `class_date`, `start_time`, `end_time` on live_classes |

---

## 14. FOLDER STRUCTURE (Current)

```
/app
  /(public)
    /page.tsx                    → Home
    /courses/page.tsx            → Browse
    /courses/[slug]/page.tsx     → Course detail
    /categories/[slug]/page.tsx  → Category
    /blog/page.tsx               → Blog + newsletter
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
  /api/                          → 27 API route handlers
  /auth/callback/route.ts       → OAuth code exchange + email change handler
  /auth/signout/route.ts        → POST signout
/components
  /ui/                           → shadcn components (Button, Card, Dialog, Sheet, Tabs, etc.)
  /admin/                        → Admin-specific components
    admin-breadcrumbs.tsx, admin-course-actions.tsx, admin-courses-table.tsx,
    course-filter-select.tsx, course-wizard.tsx, enrollments-export.tsx,
    live-classes-admin.tsx, revenue-chart.tsx
  /auth/                         → Auth forms (login, signup, forgot/reset password)
  admin-sidebar.tsx              → Admin sidebar with user info + logout
  site-header.tsx, site-nav.tsx, site-footer.tsx
  course-card.tsx, course-purchase.tsx
  mark-lesson-complete.tsx, lesson-tabs.tsx
  profile-form.tsx, newsletter-form.tsx
  live-class-enroll.tsx          → 5-step registration with batch selection + guest access
  connected-accounts.tsx         → Identity linking (Google + Email)
  logout-button.tsx
  collapsible-sidebar.tsx        → Mobile-only curriculum collapse
  bunny-video-player.tsx, youtube-player.tsx, lesson-progress-tracker.tsx
  providers.tsx
/lib
  /supabase/client.ts, server.ts, admin.ts
  /auth.ts, profile-role.ts
  /razorpay.ts, bunny.ts, resend.ts, n8n.ts
  /video.ts                      → YouTube URL helpers
  /utils.ts                      → cn, formatPrice, formatDate, formatDurationMinutes, slugify
/supabase/migrations/            → 12 SQL migration files
/progress/                       → Session documentation (29 sessions)
```

---

## 15. OUT OF SCOPE (V1) — Future Features

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
- Live class payment via Razorpay (currently payment via WhatsApp/UPI after registration)

---

*End of PRD — Version 2.0.0*
*Status: Live on Vercel. Phase 8 (Pre-Launch) in progress.*
