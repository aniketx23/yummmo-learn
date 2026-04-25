# Implementation progress (Yummmo Learn)

This folder is the **living changelog** for the project. Anyone onboarding to the codebase should read these notes **before** spelunking through files blindly.

## Why this exists

- Capture **what** was built, **where** it lives, and **why** decisions were made.
- Reduce regressions: future work can check “did we already solve X?”
- Support handoff: designers, another engineer, or you in six months can trace features to docs.

## Conventions (please follow after every implementation session)

1. **One new Markdown file per session** (or per logically separate feature if a session ships multiple unrelated things—then split).
2. **Filename pattern:** `SESSION-YYYY-MM-DD-NN-short-topic.md`  
   - Example: `SESSION-2026-04-20-01-razorpay-webhooks.md`  
   - Use `NN` as two digits if you have multiple files the same day (`01`, `02`, …).
3. **Each file should include:**
   - **Context** — goal, link to PRD section if relevant.
   - **What changed** — bullet list of behaviour or data model changes.
   - **Files touched** — paths relative to repo root.
   - **How to verify** — manual steps or commands (`npm run build`, key user flows).
   - **Follow-ups / risks** — known limitations, tech debt, “do later” items.
4. **Update this README** with a one-line link in the index table when you add a file.

## Index

| Session doc | Summary |
|-------------|---------|
| [SESSION-2026-04-13-01-overview-and-repo-map.md](./SESSION-2026-04-13-01-overview-and-repo-map.md) | Stack, folder map, how routes group together |
| [SESSION-2026-04-13-02-database-and-migrations.md](./SESSION-2026-04-13-02-database-and-migrations.md) | Supabase schema, RLS, migrations 001–004 |
| [SESSION-2026-04-13-03-authentication-and-middleware.md](./SESSION-2026-04-13-03-authentication-and-middleware.md) | Auth pages, session, middleware, profile API |
| [SESSION-2026-04-13-04-public-site-and-catalog.md](./SESSION-2026-04-13-04-public-site-and-catalog.md) | Landing, courses browse/detail, categories |
| [SESSION-2026-04-13-05-student-area-learn-progress.md](./SESSION-2026-04-13-05-student-area-learn-progress.md) | Dashboard, profile, learn player, progress APIs |
| [SESSION-2026-04-13-06-admin-panel.md](./SESSION-2026-04-13-06-admin-panel.md) | Admin layout, courses CRUD wizard, analytics pages |
| [SESSION-2026-04-13-07-api-routes-reference.md](./SESSION-2026-04-13-07-api-routes-reference.md) | All `app/api` routes, contracts, callers |
| [SESSION-2026-04-13-08-external-integrations.md](./SESSION-2026-04-13-08-external-integrations.md) | Razorpay, Bunny, Resend, n8n |
| [SESSION-2026-04-13-09-ui-and-shared-libraries.md](./SESSION-2026-04-13-09-ui-and-shared-libraries.md) | Tailwind, shadcn-style UI, `lib/*`, types |
| [SESSION-2026-04-13-10-config-seo-and-quality.md](./SESSION-2026-04-13-10-config-seo-and-quality.md) | Env, Next config, sitemap/robots, error/loading |
| [SESSION-2026-04-13-11-staff-role-login-and-middleware.md](./SESSION-2026-04-13-11-staff-role-login-and-middleware.md) | Staff role + login; admin layout vs middleware; `/admin` refresh loop fix |
| [SESSION-2026-04-18-12-fix-rls-recursion.md](./SESSION-2026-04-18-12-fix-rls-recursion.md) | RLS recursion fix, full curriculum editing, sections/lessons CRUD APIs, error/loading boundaries, SEO metadata |
| [SESSION-2026-04-18-13-ux-polish-plan.md](./SESSION-2026-04-18-13-ux-polish-plan.md) | 3-phase UX polish: admin simplification, student dashboard rework, blog page, mobile nav, preview videos |
| [SESSION-2026-04-19-14-testing-fixes-round1.md](./SESSION-2026-04-19-14-testing-fixes-round1.md) | Testing round 1: sidebar link, enrollments crash fix, mobile overflow, file attachments, chef tips |
| [SESSION-2026-04-19-15-testing-fixes-round2.md](./SESSION-2026-04-19-15-testing-fixes-round2.md) | Testing round 2: hero badge, blog fix, progress tracking, navbar redesign, phone mandatory, Google OAuth |
| [SESSION-2026-04-19-16-testing-fixes-round3.md](./SESSION-2026-04-19-16-testing-fixes-round3.md) | Testing round 3: enrolled badge, resources display, progress fix, lesson tabs, live classes page |
| [SESSION-2026-04-20-17-live-classes-admin.md](./SESSION-2026-04-20-17-live-classes-admin.md) | Live classes admin: DB schema, CRUD APIs, batch management, registration tracking, status workflow |

## PRD source of truth

Product requirements: [YUMMMO_LEARN_PRD.md](../YUMMMO_LEARN_PRD.md) at repo root.
