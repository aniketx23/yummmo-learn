# SESSION-2026-08-02-45 — "Your tutorials" section under the hero

## Context
Granted students had to go Home → Courses → course page → Watch. For a non-technical
audience that's three clicks too many. Requirement: show a signed-in student's granted
tutorials directly below the hero, one click to the video.

## What changed
- `components/my-tutorials.tsx` — NEW. Presentational server component. Renders a tinted
  band with `Namaste, <FirstName>!`, sub-line "Aapke workshop tutorials — seedha yahan se
  dekhiye.", and a card grid (thumbnail, title, short description, full-width **Watch now**).
  Shows a green **Completed** badge and switches the CTA to **Watch again** when every lesson
  in the course is done. Returns `null` when there is nothing to show.
- `app/(public)/page.tsx`
  - Reuses the existing `user` / `enrolledIds` lookup; adds three queries, all skipped
    entirely when the visitor is logged out or has no enrollments:
    published courses in `enrolledIds`, completed `progress` rows, and the profile's
    `full_name` (for the greeting).
  - `completed` = `total_lessons > 0 && completedLessons >= total_lessons`.
  - Renders `<MyTutorials />` immediately after the hero `</section>`, before the marquee.

Links point at `/learn/[slug]`, which already redirects to the course's lesson — so it is a
genuine single click from the homepage to the playing video.

## How to verify (done, local + live)
Three visitor states, all checked:

| State | Expected | Result |
|---|---|---|
| Logged out | section hidden | ✓ hidden |
| Logged in, no access | section hidden | ✓ hidden |
| Logged in, granted | section visible | ✓ "Namaste, Priya!" + card + Watch now |

- Clicking **Watch now** → `/learn/tutifruti-dryfruit-cake/<lessonId>` with the YouTube iframe
  `youtube.com/embed/I1LDT2EJEbw` mounted. One click, both local and live.
- Marked the lesson complete → section switched to **Completed** badge + **Watch again**. ✓
- Live verified after deploy `47a3d54` with a temporary granted account, then deleted.
- `npx tsc --noEmit` clean.

Test accounts were created and removed; final DB state is unchanged: 7 profiles,
1 enrollment (Aniket), 0 progress rows.

## Notes
- Queries are conditional, so logged-out homepage traffic does no extra DB work.
- The homepage is already dynamic (auth cookie), so no caching change was needed.

## Still open
- Homepage marquee/footer claim "Featured in Zee News", "Economic Times",
  "100+ Students Trained", "10+ Years Baking Experience" — unverified credentials that
  conflict with the brand rule; raised twice, awaiting a decision.
