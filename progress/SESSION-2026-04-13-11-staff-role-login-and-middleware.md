# Session 2026-04-13 — Staff role: login redirect and middleware

## Context

`super_admin` / `instructor` users landed on `/dashboard` after login and could be blocked from `/admin` symptoms. DB `profiles.role` was correct.

## Root cause

RLS policy `profiles_select_staff` allows staff to **select every row** in `public.profiles`. The login form queried:

```ts
supabase.from("profiles").select("role").single()
```

with **no** `.eq("id", user.id)`, so PostgREST returned **many rows**. `.single()` then fails (or yields unusable data), `prof` was undefined, and redirect fell back to `next` → `/dashboard`.

## What changed

- Added [`lib/profile-role.ts`](../lib/profile-role.ts): `fetchProfileAppRole(supabase, userId)` (RPC `auth_app_role` when present, else `.eq("id", userId).maybeSingle()`), `normalizeAppRole`, `isStaffRole`.
- [`components/auth/login-form.tsx`](../components/auth/login-form.tsx): after `signInWithPassword`, `getUser()` then `fetchProfileAppRole` → staff go to `/admin`.
- [`app/auth/callback/route.ts`](../app/auth/callback/route.ts): same helper after OAuth code exchange.
- [`middleware.ts`](../middleware.ts): uses shared helper for `/admin` gate only (non-staff → `/dashboard`). **No** automatic `/dashboard` → `/admin` redirect (that caused a ping-pong with the admin layout before the layout fix below).
- [`app/(admin)/admin/layout.tsx`](../app/(admin)/admin/layout.tsx): staff check uses `fetchProfileAppRole` (same source as middleware), not only `getUserWithProfile().profile?.role`.
- [`lib/auth.ts`](../lib/auth.ts): `getUserWithProfile` loads profile with `.maybeSingle()` instead of `.single()`.

## Files touched

- `lib/profile-role.ts` (new)
- `lib/auth.ts`
- `components/auth/login-form.tsx`
- `app/auth/callback/route.ts`
- `middleware.ts`
- `app/(admin)/admin/layout.tsx`

## How to verify

1. Run SQL from [`supabase/migrations/005_auth_app_role_rpc.sql`](../supabase/migrations/005_auth_app_role_rpc.sql) if not already applied.
2. `npm run build`
3. Log in as `super_admin`: should land on `/admin`; `/admin` should render once (no `/admin` ↔ `/dashboard` loop in the terminal).

## Follow-ups

- Optional UX: header “Dashboard” for staff could point to `/admin`.

## Update (same day) — `/admin` refresh loop

**Symptom:** Terminal showed alternating `GET /admin` / `GET /dashboard`, or rapid `GET /admin` with a blank page.

**Cause:** Middleware sent staff from `/dashboard` → `/admin`, but `admin/layout.tsx` used `getUserWithProfile()` and strict `profile?.role` checks. When `profiles` came back null (e.g. `.single()` / timing), the layout redirected to `/dashboard`, recreating a ping-pong.

**Fix:** Authorize admin shell with `fetchProfileAppRole(supabase, user.id)` (same as middleware). Use `.maybeSingle()` in `getUserWithProfile` for headers. Remove middleware rule that redirected staff from `/dashboard` to `/admin` (login/OAuth already send staff to `/admin`).
