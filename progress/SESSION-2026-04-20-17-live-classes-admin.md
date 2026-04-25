# Session 2026-04-20 — Live Classes Admin System

## Context

The Live Classes page was previously student-facing only (hardcoded data, enrollment just showed a toast). This session builds the full admin backend: database, API, management UI, and connects the student enrollment to the database.

## What changed

### Database (migration 009)

Two new tables:

| Table | Purpose |
|-------|---------|
| `live_classes` | Class batches the admin creates: title, description, schedule_type (weekend/weekday/custom), schedule_days, time_slot, max_spots, price, is_active |
| `live_class_registrations` | Student enrollments: linked to live_class + student profile, stores name, phone, email, age, gender, preferred_date, preferred_slot, status (pending/confirmed/cancelled/completed) |

**RLS policies:**
- Active classes readable by anyone (public listing)
- Staff can manage all classes and all registrations
- Authenticated users can insert registrations (own rows)
- Users can read own registrations

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/live-classes` | List active classes (public) |
| POST | `/api/live-classes` | Student registration (saves to DB) |
| GET | `/api/admin/live-classes` | List all classes (admin) |
| POST | `/api/admin/live-classes` | Create batch |
| PUT | `/api/admin/live-classes/[id]` | Update batch |
| DELETE | `/api/admin/live-classes/[id]` | Delete batch |
| PUT | `/api/admin/live-class-registrations/[id]` | Update registration status |

### Admin Page (`/admin/live-classes`)

Full management UI with:

**Stats row:** Active Batches, Total Registrations, Pending, Confirmed — four cards at the top.

**Batches tab:**
- Grid of batch cards showing title, status badge (Active/Inactive), description, schedule, time, spots used/max
- "New Batch" button opens a dialog with: title, description, schedule type dropdown, days, time slot, max spots, price
- Dropdown menu per batch: Activate/Deactivate, Delete

**Registrations tab:**
- Filterable table: filter by status (pending/confirmed/cancelled/completed) and by batch
- Columns: Name (with age/gender), Phone, Batch, Preferred Date, Slot, Status badge, Actions
- Actions dropdown per registration: Confirm, Mark Completed, Cancel, Reset to Pending
- Each status change calls the API and refreshes

### Student Enrollment

The typeform-style enrollment dialog (`components/live-class-enroll.tsx`) now saves to the `live_class_registrations` table via `POST /api/live-classes` instead of just showing a toast.

### Navigation

"Live Classes" added to admin sidebar with Radio icon.

## Files touched

### New files
- `supabase/migrations/009_live_classes.sql`
- `app/api/live-classes/route.ts`
- `app/api/admin/live-classes/route.ts`
- `app/api/admin/live-classes/[id]/route.ts`
- `app/api/admin/live-class-registrations/[id]/route.ts`
- `app/(admin)/admin/live-classes/page.tsx`
- `components/admin/live-classes-admin.tsx`

### Modified files
- `components/live-class-enroll.tsx` — saves to DB instead of toast-only
- `components/admin-sidebar.tsx` — added Live Classes nav item

## How to verify

1. `npm run build` — clean
2. Admin sidebar shows "Live Classes" link
3. `/admin/live-classes` — create a batch (e.g. "Weekend Baking Batch"), set schedule/time/spots
4. Student: go to `/live-classes` → click "Enroll in Live Class" → complete the form → submit
5. Admin: refresh `/admin/live-classes` → Registrations tab shows the new registration with "pending" status
6. Admin: click "..." on registration → Confirm → status changes to "confirmed"
7. Admin: filter by status or batch — filters work

## Follow-ups
- Public `/live-classes` page still shows hardcoded batches — could be updated to read from DB later
- No email/WhatsApp notification on new registration — connect to n8n webhook later
- No registration capacity check (doesn't block when max_spots reached) — add server-side validation later
- Price handling for paid live classes (Razorpay) not implemented yet
