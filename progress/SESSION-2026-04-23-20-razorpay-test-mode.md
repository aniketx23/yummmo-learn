# Session 20 — Razorpay Test Mode Verification

**Date:** 2026-04-23
**Focus:** Audit and fix the Razorpay payment flow end-to-end for test mode

---

## Files Reviewed

| File | Role |
|---|---|
| `lib/razorpay.ts` | Razorpay SDK instance + HMAC signature verification |
| `app/api/payment/create-order/route.ts` | Creates Razorpay order (paise conversion, course validation) |
| `app/api/payment/verify/route.ts` | Verifies signature, inserts payment + enrollment |
| `components/course-purchase.tsx` | Client component: Buy Now button → Razorpay modal → verify → redirect |
| `app/(public)/courses/[slug]/page.tsx` | Renders CoursePurchase with correct props |
| `lib/supabase/admin.ts` | Service role client used by verify route |
| `lib/resend.ts` | Purchase confirmation email (optional, no-ops without key) |
| `lib/n8n.ts` | Webhook helper (optional, no-ops without URL) |
| `app/api/enrollments/free/route.ts` | Free enrollment flow (reviewed for comparison) |
| `supabase/migrations/001_initial.sql` | payments table: `numeric(10,2)`, RLS policies |

---

## Bugs Found & Fixed

### Bug 1: Race condition in Buy button state (critical)

**File:** `components/course-purchase.tsx`

**Problem:** `setBusy(false)` ran immediately after `Razorpay.open()`, re-enabling the Buy button while the modal was still open. When the user completed payment and the modal closed, the `handler` fired with `busy` already false — making the button clickable during the verify API call. Could cause duplicate payment records.

**Fix:**
- Removed the `setBusy(false)` after `open()`
- Added `setBusy(true)` at the top of the success `handler` (ensures button stays disabled during verification)
- Added `modal.ondismiss` callback that calls `setBusy(false)` (re-enables button only when user explicitly closes the modal without paying)
- Moved `setBusy(false)` in handler to only run on verify failure (on success, page navigates away)

### Bug 2: amount sent as string to numeric column

**File:** `app/api/payment/verify/route.ts`

**Problem:** `amount.toFixed(2)` returns string `"499.00"`. The `payments.amount` column is `numeric(10,2)`. PostgREST can coerce strings to numeric, but this is fragile and non-standard.

**Fix:** Changed to `amount` (already a number from `parseFloat`). PostgreSQL handles `numeric(10,2)` storage precision.

---

## Audit: What's Correct (No Changes Needed)

| Component | Status | Notes |
|---|---|---|
| `lib/razorpay.ts` | OK | HMAC-SHA256 verification matches Razorpay docs |
| `create-order/route.ts` | OK | Converts to paise correctly, validates course state |
| `verify/route.ts` (logic) | OK | Uses admin client (bypasses RLS), upserts enrollment with `onConflict` |
| `course-purchase.tsx` (Razorpay script load) | OK | `waitRazorpay()` polls for script with timeout |
| Course detail page props | OK | All required props passed correctly |
| Resend email | OK | No-ops gracefully if RESEND_API_KEY missing |
| n8n webhook | OK | No-ops gracefully if webhook URL undefined |
| RLS on payments | OK | No insert policy needed — verify uses service role |
| RLS on enrollments | OK | Free flow uses user client (insert policy exists), paid flow uses service role |

## Expected Test Payment Flow

1. Student visits `/courses/[slug]` for a paid course
2. Clicks "Buy now — ₹499"
3. Button disables (`setBusy(true)`), order created via `POST /api/payment/create-order`
4. Razorpay modal opens with test key + prefilled email
5. Student enters test card (4111 1111 1111 1111), any future expiry, any CVV, OTP: 1234
6. On success: modal closes → `handler` fires → `setBusy(true)` → `POST /api/payment/verify`
7. Verify route: validates HMAC signature → inserts `payments` row (status: completed) → upserts `enrollments` row
8. Client redirects to `/learn/[courseSlug]`
9. On modal dismiss (without paying): `ondismiss` fires → `setBusy(false)` → button re-enabled

---

## Build
- `npm run build` passes clean

## Files Changed
- `components/course-purchase.tsx` — fixed race condition, added modal.ondismiss
- `app/api/payment/verify/route.ts` — fixed amount type (string → number)
