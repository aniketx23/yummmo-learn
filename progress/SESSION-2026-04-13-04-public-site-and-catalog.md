# Session 2026-04-13 — Public site and course catalog

## Context

PRD Module 2: landing, course listing, course detail, category pages, SEO basics.

## What was implemented

### Layout and chrome

- [app/(public)/layout.tsx](../app/(public)/layout.tsx) — wraps public pages with [SiteHeader](../components/site-header.tsx) and [SiteFooter](../components/site-footer.tsx).
- Root [app/layout.tsx](../app/layout.tsx) — Baloo 2 + DM Sans (Google Fonts), [Providers](../components/providers.tsx) (next-themes + Sonner toasts).

### Pages

| Route | Purpose |
|-------|---------|
| `/` | [app/(public)/page.tsx](../app/(public)/page.tsx) — hero, featured courses, categories strip, trust section |
| `/courses` | [app/(public)/courses/page.tsx](../app/(public)/courses/page.tsx) — grid + search param `?q=` |
| `/courses/[slug]` | [app/(public)/courses/[slug]/page.tsx](../app/(public)/courses/[slug]/page.tsx) — detail, curriculum preview, [CoursePurchase](../components/course-purchase.tsx) |
| `/categories/[slug]` | [app/(public)/categories/[slug]/page.tsx](../app/(public)/categories/[slug]/page.tsx) — courses in category |

### Shared components

- [components/course-card.tsx](../components/course-card.tsx) — card for grids (image, title, price, instructor name when available).
- [components/course-purchase.tsx](../components/course-purchase.tsx) — free enroll vs Razorpay flow; uses `/api/payments/create` + `/api/payments/verify` or `/api/enrollments/free`.

### Data access

- Server components use `createServerClient` from [lib/supabase/server.ts](../lib/supabase/server.ts) to read published courses, categories, sections/lessons (RLS allows public read where applicable).

## How to verify

1. Seed at least one published course in Supabase.  
2. Open `/`, `/courses`, `/courses/{slug}`, `/categories/{slug}`.  
3. Search: `/courses?q=bread` should filter (depends on `search_vector` / title match in query).

## Follow-ups / risks

- “Popular” sort by enrollment count is not fully wired in all list queries.  
- OG images: optional `opengraph-image` per course not added in v1.  
- Instructor avatar on cards depends on migration `002` for public profile read.
