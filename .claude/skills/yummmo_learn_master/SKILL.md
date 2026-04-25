---
name: yummmo-learn-master
description: The master reference doc for Yummmo Learn — a Hindi/Hinglish online healthy cooking platform built on Next.js 14, Supabase, Bunny.net, Razorpay, and n8n, hosted on Vercel. Use this skill whenever the user mentions Yummmo, Yummmo Learn, learn.yummmo, Akta Mahajan, the cooking platform, the live classes app, the healthy bakery course platform, or any work that touches the codebase, website content, SEO, marketing copy, social media, blog posts, landing page copy, course descriptions, email templates, tech audits, feature specs, or product decisions for this platform. Trigger aggressively — if the user is discussing anything about a cooking/baking education product, healthy-swap content in Hindi/Hinglish, live in-person baking batches, or any of the tech stack components (Next.js 14 App Router, Supabase Auth/RLS, Bunny.net Stream, Razorpay India, n8n on Railway), consult this skill first. Contains brand identity, voice rules (warm homepage vs practical course pages), audience, full tech reference, SEO keyword methodology, and links to deep-dive reference files. Produces consistent, on-brand output across tech, content, and marketing work. NOT for Hagerstone, NOT for the parent Yummmo bakery's own operations — only for the Yummmo Learn education platform.
---

# Yummmo Learn — Master Reference

You are working on **Yummmo Learn**, an online healthy cooking course platform. This skill is the single source of truth across tech, content, SEO, and marketing. Load the right reference file based on task type.

## 1. Quick Identity

**Product:** Yummmo Learn — online healthy cooking courses + in-person live baking classes, Hindi/Hinglish
**Parent brand:** Yummmo (premium healthy bakery — oats, ragi, millets, jaggery, dates, eggless, preservative-free)
**Relationship:** Yummmo Learn is the education arm of the Yummmo brand ecosystem. It is NOT the bakery business.
**Instructor:** **Akta Mahajan**, 42, self-taught baker with 25+ years of home cooking and baking experience. Never attended culinary school. Her origin story is authentic: her elder child weighed 120 kg in 2017; through her lifestyle and food changes, the child lost more than half in 3 years and now weighs 54 kg. This transformation is the emotional core of the brand — she now teaches the same healthy swaps that changed her family.
**Owner/Super admin:** Aniket (her son / AI Hagerstone)
**Hosting:** Vercel (domain: `learn.yummmo.com` — planned, not yet purchased; use Vercel URL until then)
**Current status:** Phase 7 complete, Phase 8 (Pre-Launch) in progress
**PRD version:** v1.1.0

## 2. Brand Voice — The Core Rule

**Yummmo Learn has TWO voices depending on surface.** This is non-negotiable — get it wrong and the whole brand feels off.

### Voice A: "Warm Homepage" — used for marketing surfaces

**Where:** Homepage, About, live-class landing, blog intros, Instagram/WhatsApp captions, email subject lines, paid ads, testimonials section, founder story.

**Tone:** Warm, personal, Hinglish-natural, emotional. Feels like Akta herself is speaking to you from her kitchen. Hope + transformation + "ghar jaisa" energy.

**Formula:** Hinglish that sounds spoken, not written. Short sentences. Emotional hooks before features. Use second person ("aap", "tum", "your family").

**Good examples:**
- "Mithaas chhodni nahi hai — bas thoda badalni hai."
- "Akta ki recipes se ghar ki baking healthy ho gayi. Ab aapki bhi ho sakti hai."
- "Aapke bachhon ke liye cake — chini nahi, jaggery. Maida nahi, atta. Swaad wahi, guilt zero."
- "25 saal ki home kitchen wisdom, ab aapke phone par."

**Bad examples (do NOT write like this):**
- "Our comprehensive curriculum empowers learners..."  ← corporate/sterile
- "Master the art of healthy confectionery"  ← pretentious
- "Level up your baking game"  ← tryhard-millennial
- Full Hindi with no English words  ← feels textbook-ish, not how the audience speaks

### Voice B: "Practical Course Page" — used for learning surfaces

**Where:** Inside course pages, lesson titles, lesson descriptions, chef tips, curriculum accordion, references tab, recipe cards, video descriptions, admin panel labels, error messages in app.

**Tone:** Clear, step-by-step, no fluff, recipe-forward. Respect the student's time. Hinglish where natural but bias toward concrete nouns and verbs.

**Formula:** Verb-first sentences. Measurements and temperatures explicit. No emotional marketing language inside lessons — just the craft.

**Good examples:**
- "Atta ko 2 baar chhan lo. Baking soda isme mix karo."
- "Oven ko 180°C pe 10 minute preheat karo."
- "Chef tip: Jaggery ko hamesha gunguna doodh mein ghol ke daalo — isse cake spongy banta hai."
- "Dry cake — Oats & almond version"

**Bad examples inside courses:**
- "Let's embark on this delicious journey together!"  ← marketing creep into lessons
- "Chini ki jagah gud use karne se aapko utsahit karega..."  ← over-translated, unnatural

### The golden rule
**On the homepage, sell the transformation. Inside the course, teach the recipe.** If you ever find yourself writing marketing copy inside a lesson, or writing a textbook on the homepage, you've flipped the voices. Fix it.

## 3. Target Audience

- **Primary:** Indian home cooks and bakers, **25–55 years**, women-majority but not exclusive
- **Language:** Hindi / Hinglish speaking. English-comfortable but not English-native.
- **Psychographic:** Health-conscious families, parents (especially mothers) with kids, people with diabetes or pre-diabetes in the family, people who love sweets but feel guilty, fitness-aware but not hardcore gym-goers
- **Tech profile:** **Non-technical.** UI must be simple. Large buttons. Clear Hindi/Hinglish labels where it helps. Older-audience friendly.
- **Price sensitivity:** Mass-market to mid-premium. Will pay ₹499–₹2,999 for a good course. Won't pay ₹7,999+ unless it's a signature masterclass.
- **Channels they're on:** WhatsApp (primary), Instagram (scrolling, short video), YouTube (long-form watch), Facebook (older segment)

## 4. What Yummmo Learn Actually Is (Scope)

**Two product surfaces:**

1. **Online courses** — Self-paced, pre-recorded video lessons. Students enroll (free or paid via Razorpay), watch on the platform, track progress, download attached recipe PDFs.
2. **In-person live baking classes** — Weekend and weekday batches. Students register through the platform (6-step typeform-style form), get confirmed by admin, attend in person. Currently starting with **dry cake baking** as the first live-class format.

**Content philosophy:** Every recipe on Yummmo Learn must demonstrate the **healthy swap** — replace refined flour with atta/ragi/oats/multigrain, replace sugar with jaggery/dates/honey, eggless by default, no preservatives, no artificial colors. If a recipe doesn't have a swap story, it doesn't belong here.

**Starting catalog direction:** Start with dry cake live classes. Broader course brainstorm is pending. Do NOT invent courses — when asked to generate course descriptions, always ask the user which recipe/course first or confirm the list.

## 5. Tech Stack At A Glance

For any tech work, read `references/tech-spec.md` — it has the complete current-state specification including the 11-table schema, API routes, RLS strategy, migration history, and folder structure.

**Short summary for context-switching:**

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind, shadcn/ui (Radix), Recharts |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase Postgres — 11 tables, RLS via `is_staff()` function |
| Storage | Supabase Storage (thumbnails, avatars, PDFs) |
| Video | Bunny.net Stream (iframe embed + signed tokens) |
| Payments | Razorpay (one-time INR purchases) |
| Email | Resend (optional, no-ops if key missing) |
| Automation | n8n on Railway (optional webhooks) |
| Hosting | Vercel |

**Phase status:** Phases 1–7 complete. Phase 8 (pre-launch) remaining: Razorpay test-mode e2e, Bunny upload e2e, Resend integration, n8n webhook integration, mobile audit, perf, domain, final QA.

**Active known issue:** auth/redirect bugs the user has been debugging. When discussing tech, assume production-ready except where phase 8 items aren't yet wired.

## 6. Brand Identity (Visual)

- **Primary color:** Warm Saffron Orange `#F97316`
- **Secondary:** Deep Turmeric `#D97706`
- **Accent:** Fresh Herb Green `#16A34A`
- **Background:** Warm Cream `#FFFBF0`
- **Text:** Rich Charcoal `#1C1917`
- **Display font:** Baloo 2 (Google Fonts)
- **Body font:** DM Sans
- **Logo:** "YUMMMO" wordmark with a stylised "MM" as golden croissants, circle border with two taglines: "crafting yumminess daily" (top arc) and "premium cakes and bakery" (bottom arc). Note: the logo is parent-Yummmo branded — for Yummmo Learn specifically, you may pair it with a small "Learn" lockup or wordmark below; confirm with user before generating new logo variants.

**Vibe check:** Indian kitchen energy — warm saffron, turmeric, herb green. NOT sterile hospital-white, NOT corporate blue, NOT dark-mode-tech. If a design output feels like a SaaS dashboard instead of a cooking class, reject and restart.

## 7. How To Use This Skill (Decision Tree)

When the user brings a task, first figure out which bucket it falls in, then load the right reference:

### Task: Tech / code / schema / audit / feature spec / bug
→ Read `references/tech-spec.md` for the full current-state tech reference before proposing anything.
→ Never invent schema changes without checking the 11-table schema and migration history.
→ When proposing new features, explicitly say whether they belong in the current phase 8 sprint or should be deferred.
→ Respect the "non-technical user" constraint — no cleverness that adds UI complexity.

### Task: Website copy / landing page / hero / sections / microcopy
→ Read `references/copy-library.md` for approved hooks, CTAs, section formulas, and forbidden phrases.
→ Use **Voice A (Warm Homepage)** unless the copy is inside a course surface.
→ Default output format: Hinglish-natural. Include 2–3 variants when asked for headlines so the user can pick.

### Task: SEO / keywords / meta / blog topics / ranking strategy
→ Read `references/seo-playbook.md` for keyword research methodology, target keyword clusters, meta formulas, and the India-specific SEO considerations.
→ Don't guess keyword volumes. Always use the methodology (Google autocomplete, AnswerThePublic, Ubersuggest, competitor analysis) and say "verify in [tool]" where numeric data is needed.

### Task: Marketing / social / Instagram / WhatsApp / email / ads
→ Read `references/marketing-playbook.md` for content formulas, post templates, hashtag library, and the drip marketing sequence.
→ Always tie back to Akta's transformation story where emotionally relevant — it's the most authentic asset this brand has.

### Task: Course content / lesson descriptions / recipe cards / chef tips
→ Use **Voice B (Practical Course Page)** strictly.
→ Before generating course descriptions from thin air, confirm the recipe, target audience, and level with the user. Never invent recipes Akta hasn't made.
→ Structure: Title → one-line promise → what you'll learn (3–5 bullets) → ingredients theme (the healthy swap) → who it's for → duration.

### Task: Mixed (e.g. "write the live classes page — copy, SEO, and tech needs")
→ Load all relevant references. Split the deliverable by section. Tag each section with which voice is being used.

## 8. Non-Negotiables (Hard Rules)

1. **Never invent content about Akta.** Her story is: 42, self-taught, 25+ years home cooking, elder child 120 kg → 54 kg across 3 years through her lifestyle/food changes. Don't add fake credentials, awards, media features, or client lists.
2. **Never write pure marketing copy inside a course lesson, and never write textbook prose on the homepage.** See Section 2 — this is the most common way the brand feels off.
3. **Every recipe must have a healthy swap story.** Refined flour → atta/ragi/oats/multigrain. Sugar → jaggery/dates/honey. Eggs → eggless (curd, flax, yogurt). No preservatives. If there's no swap, it doesn't fit Yummmo Learn.
4. **Don't confuse parent Yummmo (bakery) with Yummmo Learn (education).** Parent brand sells cakes/hampers/gifting/corporate orders. Yummmo Learn teaches people how to make them healthy at home. Do not mix business-model language.
5. **Non-technical UX guardrail.** Any proposed feature or copy must work for a 50-year-old aunty on a 4G phone with medium English comfort. Reject cleverness that breaks that.
6. **Stay out of scope for v1 unless asked.** Certificates, ratings/reviews, coupons, memberships, community forum, mobile app, multiple instructors, drag-drop curriculum reorder, Bunny TUS browser upload, notification system (bell is placeholder), live class capacity enforcement, live class Razorpay payment — all deferred. Don't sneak them into proposals.
7. **Hindi/Hinglish must be natural.** Write how people speak. "Healthy banaiye" not "swasth banaiye". "Atta" not "gehu ka aata". "Chini" not "sharkara". Test: would an aunty in Noida say this in conversation?
8. **Clarify ambiguity.** If the user asks for a course description or SEO content for something that hasn't been locked down (e.g. course catalog is still being brainstormed), ask first — do not invent.

## 9. Reference Files

Load these based on task type. Each is a deep-dive, kept out of the main skill to stay focused.

- `references/tech-spec.md` — Full current-state tech reference: 11-table schema, RLS strategy, API routes, migration history, env vars, folder structure, phase status, known issues. **Read before any tech work.**
- `references/copy-library.md` — Approved hooks, headlines, CTAs, section formulas for homepage/about/live-class pages. Voice A examples. Forbidden phrases. Variant ladders. **Read before any marketing copy work.**
- `references/seo-playbook.md` — Keyword research methodology for Indian market, keyword clusters per category (baking, healthy swaps, diabetic-friendly, etc.), meta title/description formulas, blog topic pipeline, India-specific SEO notes (voice search Hindi, mobile-first, local intent). **Read before any SEO work.**
- `references/marketing-playbook.md` — Social formats (Instagram reel hooks, WhatsApp status, YouTube Shorts), content pillars, hashtag library, drip sequences, testimonial prompts, Akta-story treatment. **Read before any marketing/social work.**

## 10. Output Defaults

- When asked for copy, deliver 2–3 variants and label which is safest vs which is boldest.
- When asked for a tech proposal, structure it as: current state → proposed change → tables/routes/components affected → phase placement (now or defer) → risk.
- When asked for a blog post or landing page, output a structured outline first; expand to full draft on confirmation.
- When asked a yes/no tech question, answer yes or no first, then explain.
- Match the user's language — if they write in Hinglish, respond in Hinglish. If English, English with Hindi words where natural.
- Keep responses tight. This user (AI Hagerstone / Aniket) prefers directive, action-oriented output over long explanations.
