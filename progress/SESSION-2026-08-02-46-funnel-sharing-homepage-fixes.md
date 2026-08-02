# SESSION-2026-08-02-46 — Audit fixes: funnel, sharing, homepage, trust

## Context
A full site audit (3 parallel scouts + a hands-on mobile walkthrough) found the
granted-student experience was good, but the *acquisition* half was broken: the
workshop enquiry could not be completed, nobody was notified when it was, shared
links rendered blank cards, and the homepage sold a different business.

## Fixed

### P0 — Workshop enquiry could not be completed
`components/live-class-enroll.tsx` stashed the form in localStorage and forced
"Continue with Google" on submit; `app/api/live-classes/route.ts` 401'd anonymous.
A referred visitor filled 5 steps then hit an account wall.
- Login gate deleted entirely (state, `loginWithGoogle`, localStorage round-trip,
  `autoRegister` auto-submit + its callsite).
- POST accepts anonymous: session optional, `student_id: user?.id ?? null`,
  insert via `createAdminClient()` (RLS `live_reg_insert_auth` needs a uid).
  Fields trimmed + capped at 200 chars; still 400s on missing name/phone.
- Form cut 5 steps -> 3: name -> WhatsApp -> batch. Age and gender dropped.

### P0 — Registrations notified nobody
Route now fires `postN8nWebhook(N8N_WEBHOOK_LIVE_CLASS, …)` + new
`sendLiveClassRegistrationAlert()` in `lib/resend.ts`, both inside
`Promise.allSettled`+try/catch so nothing post-insert can fail the registration.
Both no-op safely while unconfigured — so the success screen ALSO ships a
prefilled `wa.me/918459999991` button ("WhatsApp par confirm karein") carrying
name/phone/batch. That path needs zero config and works today.
Documented `ADMIN_ALERT_EMAIL` and `N8N_WEBHOOK_LIVE_CLASS` in `.env.example`.

### P0 — Shared links rendered blank/broken cards
Homepage emitted no `og:image`; `/live-classes` pointed at a 404. For a
WhatsApp-referral business this is the main distribution surface.
- Added real 1200x630 branded cards: `public/og-default.jpg`,
  `public/og-live-classes.jpg` (new `public/` dir — none existed).
- Site-wide `openGraph` + `twitter: summary_large_image` in `app/layout.tsx`.
  **Gotcha:** Next REPLACES `openGraph` per route, it does not deep-merge — any
  page defining its own `openGraph` must repeat `images` or it loses the card.
  Bit us on the homepage; fixed there and on both live-classes routes.
- Course pages use the cake `thumbnail_url` with `/og-default.jpg` fallback.

### P0 — Malformed sitemap/robots
`NEXT_PUBLIC_APP_URL` carries a trailing slash in prod -> `//courses`.
Base normalised with `.replace(/\/+$/,"")` in `sitemap.ts`/`robots.ts`; added
`/live-classes` + `/blog`; 7 private-route disallows added.

### Referral loop
`components/whatsapp-share.tsx` made reusable (optional `dateStr`/`city`, new
`message`/`label`/`className`) without changing the existing batch callsite.
Watch page now shows a referral card below the tabs whose message names the cake
and links to the PUBLIC `/live-classes` (never the gated lesson URL) — ~2 taps,
previously ~5 with no prompt. FAB prefill now says workshop, not "courses".

### Homepage rebuilt (workshop first, order second)
Per owner's direction. Part 1: hero ("Cake banana seekho — haath se haath",
CTA -> enquiry + WhatsApp), "Workshop mein kya hota hai" (4 cards), Akta's real
story, recorded tutorials, workshop CTA strip. Part 2: "Ya phir — banwa lo" —
product grid + WhatsApp **and** tap-to-call order CTAs.
Removed the parent-bakery selling (ganache "Order on WhatsApp", hampers pitch,
"not just a bakery"), the Kawasaki novelty-cake hero slide, and the Featured
Categories block that dead-ended into empty pages. Mobile height 9525px -> 7977px.

### Trust — fabricated claims removed sitewide
"Featured in Zee News", "Economic Times", "100+ Students Trained",
"10+ Years", "Noida's #1" deleted from homepage marquee + Akta block, footer,
live-classes page and batch page. Replaced with verifiable facts and Akta's real
story (self-taught, 25+ yrs, child 120kg -> 54kg over 3 years).

### Location correction (important)
Copy said "Noida"; the DB says otherwise — `location_city` is **Delhi**
(Laxmi Nagar, inactive) and **Haridwar** (both active batches, ₹1999). Noida is
only the studio address in the live-classes layout. All hardcoded "Noida" claims
replaced with location-neutral wording; `/live-classes` already renders real
cities from `batch.location_city`.

## Verification
- `npx tsc --noEmit` exit 0. `npm run build` compiles (first attempt FAILED on an
  ESLint unused `searchParams` that tsc did not catch — fixed; **always run the
  real build, not just tsc**).
- Live after deploy `04377ef`: og:image absolute + `summary_large_image`; both OG
  images HTTP 200; sitemap 8 URLs, zero double slashes, `/live-classes` present;
  7 robots disallows; 0 fabricated-claim hits on `/`, `/live-classes`, `/courses`.
- **Live enquiry completed anonymously end-to-end** at 390x844: 3 steps, no login
  wall, success screen, prefilled WhatsApp confirm. DB row written with
  `student_id: null`. Test rows deleted (3 real "Aniket" rows untouched).

## Still open
- `/live-classes` mixes "₹500" (registration fee) with "₹1999" (batch price).
  Coherent but confusing; "₹500 per class" was corrected to "₹500 se spot confirm".
  Worth a single consistent framing.
- Resend + n8n remain unconfigured, so server-side alerts no-op; the WhatsApp
  confirm button covers this until keys are added.
- Blog is still placeholder content, not in scope here.
