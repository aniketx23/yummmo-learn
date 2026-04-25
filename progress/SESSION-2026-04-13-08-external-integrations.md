# Session 2026-04-13 — External integrations

## Context

PRD: Razorpay, Bunny Stream, Resend, n8n automation.

## Razorpay

- **Library:** [lib/razorpay.ts](../lib/razorpay.ts) — `createRazorpayOrder`, `verifyRazorpaySignature` (uses `crypto` HMAC).  
- **Env:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (see [.env.example](../.env.example)).  
- **Flow:** [components/course-purchase.tsx](../components/course-purchase.tsx) loads Razorpay script, opens checkout, then POST `/api/payments/verify` with order id, payment id, signature.

## Bunny.net Stream

- **Library:** [lib/bunny.ts](../lib/bunny.ts) — create video, upload URL, TUS endpoint helper, embed URL, optional token fetch.  
- **Env:** `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY`, `BUNNY_CDN_HOSTNAME`, `BUNNY_TOKEN_AUTH_KEY` (optional).  
- **Admin APIs:** [app/api/admin/video/](../app/api/admin/video/) — create-upload, upload, token.  
- **Student UI:** iframe `getBunnyEmbedUrl(videoId)`.

## Resend

- **Library:** [lib/resend.ts](../lib/resend.ts) — lazy client; if `RESEND_API_KEY` missing, email functions no-op / log.  
- **Use cases:** welcome / purchase emails can be triggered from API routes (wire as needed).

## n8n

- **Library:** [lib/n8n.ts](../lib/n8n.ts) — `postN8nWebhook(url, payload)` with timeout.  
- **Env:** `N8N_WEBHOOK_NEW_USER`, `N8N_WEBHOOK_PURCHASE`, `N8N_WEBHOOK_COURSE_PUBLISHED` (all optional).  
- **Sample:** [n8n/flows.sample.json](../n8n/flows.sample.json) — reference structure only.

## How to verify

- **Razorpay:** test mode keys + test card in staging.  
- **Bunny:** create video in admin; confirm embed loads with library id + video id.  
- **Resend:** set key; trigger a test send from a one-off route or script.  
- **n8n:** point env to webhook.site or n8n test URL; sign up user and watch request arrive.

## Follow-ups / risks

- Razorpay **webhook** for idempotent payment confirmation not in v1.  
- Bunny **TUS** from browser not fully integrated in wizard.  
- Secrets must never use `NEXT_PUBLIC_*` except Razorpay key id (public by design).
