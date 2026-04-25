# Session 2026-04-13 — Authentication and middleware

## Context

PRD Module 1: email/password + Google OAuth, profile row, protected routes, role-based landing after login.

## What was implemented

### Supabase session handling

- **Browser client:** [lib/supabase/client.ts](../lib/supabase/client.ts) — `createBrowserClient` for client components (forms, wizard uploads).
- **Server client:** [lib/supabase/server.ts](../lib/supabase/server.ts) — `createServerClient` with Next.js `cookies()` read/write for RSC and route handlers.
- **Service role (server only):** [lib/supabase/admin.ts](../lib/supabase/admin.ts) — `createAdminClient()` for privileged operations (e.g. payment verify). **Never import in client components.**

### Middleware

- [middleware.ts](../middleware.ts)  
  - If `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` missing → passes through (allows local tooling without env).  
  - Refreshes session via `getUser()` + cookie `setAll`.  
  - Redirects unauthenticated users away from `/dashboard`, `/profile`, `/my-courses`, `/learn`, `/admin` → `/auth/login?next=…`.  
  - For `/admin/*`, requires `profiles.role` in `super_admin` or `instructor`; else → `/dashboard`.

### Auth UI (route group `(auth)`)

| Path | File | Behaviour |
|------|------|-------------|
| `/auth/login` | [app/(auth)/auth/login/page.tsx](../app/(auth)/auth/login/page.tsx) + [components/auth/login-form.tsx](../components/auth/login-form.tsx) | Email/password; Google OAuth; redirect `next` or `/admin` if staff |
| `/auth/signup` | [app/(auth)/auth/signup/page.tsx](../app/(auth)/auth/signup/page.tsx) + [components/auth/signup-form.tsx](../components/auth/signup-form.tsx) | Sign up + optional call to profile-create API |
| `/auth/forgot-password` | forgot-password form | Supabase `resetPasswordForEmail` |
| `/auth/reset-password` | reset form | `auth.updateUser({ password })` |
| `/auth/callback` | [app/auth/callback/route.ts](../app/auth/callback/route.ts) | OAuth code exchange → redirect `next` |
| `/auth/signout` | [app/auth/signout/route.ts](../app/auth/signout/route.ts) | POST → `signOut()` → redirect `/` |

### Profile bootstrap

- [app/api/auth/profile-create/route.ts](../app/api/auth/profile-create/route.ts) — POST: upserts `profiles` for current user; fires optional n8n new-user webhook ([lib/n8n.ts](../lib/n8n.ts)).
- DB trigger `handle_new_user` also inserts profile; API is for metadata refresh / webhook side.

### Helper

- [lib/auth.ts](../lib/auth.ts) — `getUserWithProfile()` for server layouts (header email + role).

## How to verify

1. With valid Supabase env: sign up → row in `profiles` with `student`.  
2. Manually set `role` to `super_admin` in SQL → login → lands on `/admin`.  
3. Hit `/dashboard` logged out → redirect to login with `next`.  
4. Google: enable provider in Supabase; redirect URL must include `{NEXT_PUBLIC_APP_URL}/auth/callback`.

## Follow-ups / risks

- Email confirmation flow: if Supabase requires confirmed email, session may be null until confirm — document your project setting.  
- Rate limiting / CAPTCHA not in v1.  
- Session refresh on heavy middleware matcher runs on many routes — acceptable for v1; can narrow matcher later if needed.
