# Session 2026-04-13 — API routes reference

## Context

PRD Module 5 and scattered “API” mentions. All handlers live under [app/api/](../app/api/).

## Convention

- **JSON** in/out unless noted.  
- **Auth:** `createServerClient` + `getUser()`; admin routes also check `profiles.role`.  
- **Errors:** `{ error: string }` with appropriate HTTP status.

## Route table

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/api/courses` | Public | List published courses (optional query params) |
| GET | `/api/courses/[slug]` | Public | Course detail JSON |
| GET | `/api/courses/search` | Public | Search published courses |
| POST | `/api/auth/profile-create` | User | Upsert profile + n8n hook |
| GET | `/api/student/dashboard` | Student | Dashboard payload |
| GET | `/api/learn/[courseSlug]` | Student | Learn page data |
| POST | `/api/enrollments/free` | Student | Free enrollment for `price_paise === 0` |
| POST | `/api/payments/create` | Student | Create Razorpay order |
| POST | `/api/payments/verify` | Student | Verify signature; insert payment + enrollment (service role) |
| POST | `/api/progress/update` | Student | Save watch seconds |
| POST | `/api/progress/complete` | Student | Mark lesson complete |
| GET | `/api/admin/courses` | Staff | List all courses (admin) |
| POST | `/api/admin/courses` | Staff | Create course |
| PUT | `/api/admin/courses/[id]` | Staff | Update course |
| DELETE | `/api/admin/courses/[id]` | Staff | Delete course |
| POST | `/api/admin/courses/[id]/publish` | Staff | Set `is_published` |
| POST | `/api/admin/courses/[id]/unpublish` | Staff | Unpublish |
| POST | `/api/admin/sections` | Staff | Create section |
| PUT | `/api/admin/sections/[id]` | Staff | Update section |
| DELETE | `/api/admin/sections/[id]` | Staff | Delete section |
| POST | `/api/admin/lessons` | Staff | Create lesson |
| PUT | `/api/admin/lessons/[id]` | Staff | Update lesson |
| DELETE | `/api/admin/lessons/[id]` | Staff | Delete lesson |
| POST | `/api/admin/video/create-upload` | Staff | Bunny create video + upload URL |
| POST | `/api/admin/video/upload` | Staff | Multipart upload to Bunny |
| GET | `/api/admin/video/token` | Staff | Optional signed playback token |

## Files

Each folder under `app/api/**/route.ts` implements one segment. Refer to repo tree for exact paths.

## How to verify

- Use browser Network tab on flows (purchase, wizard save) or `curl` with session cookie.  
- `npm run build` ensures route handlers type-check.

## Follow-ups / risks

- No unified OpenAPI spec in v1.  
- Webhooks (Razorpay server-to-server) not implemented — verification is client-initiated after Razorpay checkout.
