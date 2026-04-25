# Session 2026-04-13 — Overview and repository map

## Context

Initial implementation of **Yummmo Learn**: a Next.js 14 (App Router) course platform for healthy cooking (Hindi/Hinglish), with Supabase backend, Razorpay, Bunny Stream, Resend, and optional n8n webhooks. Aligned with [YUMMMO_LEARN_PRD.md](../YUMMMO_LEARN_PRD.md).

## Tech stack (locked for v1)

| Layer | Choice |
|--------|--------|
| Framework | Next.js 14.2 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3.x, `tailwindcss-animate`, custom brand tokens |
| UI primitives | Radix-based components under `components/ui/` (shadcn-style) |
| Auth + DB | Supabase Auth + PostgreSQL + Storage |
| Video | Bunny.net Stream (create video, server upload, iframe embed) |
| Payments | Razorpay (order + signature verify server-side) |
| Email | Resend (optional; skipped if no API key) |
| Automation | n8n via HTTP webhooks (optional env URLs) |

## Top-level folder map

```
yummmo_learn/
├── app/                    # Next.js App Router
│   ├── (public)/           # Marketing + catalog (has SiteHeader/Footer)
│   ├── (auth)/             # Minimal layout; /auth/*
│   ├── (student)/         # Logged-in student shell + dashboard, learn, profile
│   ├── (admin)/           # Instructor/super_admin admin UI
│   ├── api/                # Route handlers (REST-style JSON)
│   ├── auth/               # OAuth callback, sign-out POST
│   ├── layout.tsx          # Root: fonts, Providers, globals
│   ├── globals.css
│   ├── sitemap.ts, robots.ts, error.tsx, loading.tsx
├── components/             # Shared + feature components (not only ui/)
├── lib/                    # supabase, auth helpers, bunny, razorpay, resend, n8n, utils
├── types/                  # database.ts (optional strict typing; clients run untyped)
├── supabase/migrations/    # SQL to run in Supabase (001 + follow-ups)
├── n8n/                    # Sample flow metadata
├── progress/               # This documentation folder
├── middleware.ts           # Session refresh + route protection
├── next.config.mjs         # Images: Unsplash + dynamic Supabase host from env
└── package.json
```

## Route groups (URLs vs folders)

| URL prefix | Folder | Layout |
|------------|--------|--------|
| `/`, `/courses`, `/categories/*` | `app/(public)/` | Public layout with nav/footer |
| `/auth/*` | `app/(auth)/auth/` | Centered auth layout |
| `/dashboard`, `/profile`, `/learn/*`, `/my-courses` | `app/(student)/` | Same chrome as public (header/footer) |
| `/admin/*` | `app/(admin)/admin/` | Admin sidebar + mobile header |

Parentheses in folder names `(public)` are **route groups**: they do **not** appear in the URL.

## Scripts

- `npm run dev` — local development  
- `npm run build` — production build (requires valid-looking `.env.local` for Supabase URL/keys)  
- `npm run lint` — ESLint  

## Follow-ups / risks

- Next.js 14.2 has known security advisories; plan an upgrade path to a patched minor when you stabilise features.
- Supabase clients intentionally omit strict `Database` generic in code to avoid `never` inference issues; types in `types/database.ts` exist for reference but are not wired to every query.
