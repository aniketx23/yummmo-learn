# Session 2026-04-19 — Testing Round 2 Fixes

## Context

After completing Part A-D testing, 7 issues were reported. All fixed in this session.

## What changed

### 1. Removed Hindi+Hinglish badge from home page hero
The small orange badge at the top of the hero section was removed per user request.

**File:** `app/(public)/page.tsx`

### 2. Chef tips + lesson attachments now visible on student learning player
- **Chef's Tip** box: orange-tinted card with lightbulb icon, shows when admin writes a tip for the lesson
- **Lesson Resources**: file/link badges below the lesson description — click to download/open
- Both only render when content exists (optional fields)

**File:** `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`

### 3. Blog page crash fixed
Same server-component-with-event-handler issue as enrollments. Extracted newsletter form into `NewsletterForm` client component.

**Files:**
- `components/newsletter-form.tsx` (new)
- `app/(public)/blog/page.tsx`

### 4. Progress tracking improved
- `MarkLessonComplete` now accepts `initiallyCompleted` prop — pre-checks if lesson is already done (no false "not complete" on revisit)
- Shows toast notification "Lesson completed!" on success
- Shows "Next lesson →" button after completion when there's a next lesson
- Loading spinner during the API call

**Files:**
- `components/mark-lesson-complete.tsx`
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` (passes new props)

### 5. My Courses page now in navigation
The hamburger menu includes "My Courses" link (was built in previous session but not accessible from nav).

**File:** `components/site-nav.tsx`

### 6. Phone number mandatory on signup + Google OAuth profile completion
- **Signup form:** Phone field now required with validation (10-15 digits, placeholder "+91 98765 43210")
- **Google OAuth callback:** After Google sign-in, checks if profile has phone number. If not → redirects to `/profile?complete=1` with a welcome banner asking them to add their phone.

**Files:**
- `components/auth/signup-form.tsx` — phone validation made mandatory
- `app/auth/callback/route.ts` — phone check + redirect
- `app/(student)/profile/page.tsx` — welcome banner when `?complete=1`

### 7. Navbar redesigned — minimal layout
Old navbar had visible links spread across the header. New design:
- **Left:** "Yummmo Learn" logo
- **Right:** Notification bell (placeholder) + Profile avatar + Hamburger menu (three lines)
- **Hamburger opens** a Sheet (slide-out panel) with all links organized in sections:
  - Browse: Home, All Courses, Categories, Blog
  - Your Account (when logged in): Dashboard, My Courses, My Profile, Admin Panel (staff only)
  - Log out
  - Or Login/Sign up (when logged out)
- Same layout on desktop and mobile — no separate mobile component needed

**Files:**
- `components/site-header.tsx` — simplified, delegates to SiteNav
- `components/site-nav.tsx` (new) — hamburger + avatar + bell
- `components/site-header-mobile.tsx` — now unused (superseded by site-nav.tsx)
- `app/(public)/layout.tsx` — passes avatarUrl to header
- `app/(student)/layout.tsx` — passes avatarUrl to header

## Files touched

### New files
- `components/site-nav.tsx`
- `components/newsletter-form.tsx`

### Modified files
- `app/(public)/page.tsx`
- `app/(public)/blog/page.tsx`
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`
- `app/(student)/profile/page.tsx`
- `app/(public)/layout.tsx`
- `app/(student)/layout.tsx`
- `app/auth/callback/route.ts`
- `components/site-header.tsx`
- `components/mark-lesson-complete.tsx`
- `components/auth/signup-form.tsx`

## How to verify

1. `npm run build` — clean
2. Home page: no Hindi+Hinglish badge in hero
3. Learning player: create a lesson with chef tips and attachments in admin → view as student → tip card and resource links visible
4. `/blog` — loads without error, newsletter form works (shows toast)
5. Mark lesson complete → toast + "Next lesson" button appears → sidebar checkmark updates
6. Navbar: only logo on left, bell + avatar + hamburger on right. Sheet opens with all links.
7. Sign up: phone is required. Google OAuth → redirects to profile page with welcome banner if no phone.

## Follow-ups
- `site-header-mobile.tsx` is now unused — can be deleted in cleanup
- Notification bell is a placeholder — wire to real notifications later
- Course-level resources should also show on the public course detail page
