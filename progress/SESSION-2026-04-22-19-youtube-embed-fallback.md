# Session 19 — YouTube Embed Fallback for Video Player

**Date:** 2026-04-22
**Focus:** Enable YouTube URLs in `video_url` as a fallback video source when Bunny.net isn't set up yet

---

## Problem

Bunny.net CDN isn't wired for demo yet (Phase 8 item). Lessons need a way to show video during demos. The `video_url` column already exists on `lessons` but the player only used it for native `<video>` tags, not YouTube embeds.

## Changes

### New files

**`lib/video.ts`**
- `getYouTubeId(url)` — extracts video ID from any YouTube URL format (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`). Returns `null` if not YouTube.
- `getYouTubeEmbedUrl(url)` — returns `https://www.youtube.com/embed/{id}` or `null`.

**`components/youtube-player.tsx`**
- Accepts `url: string` prop.
- Uses `getYouTubeEmbedUrl` to render a responsive 16:9 iframe.
- Same dark `bg-[#0f0f0f]` container and `rounded-lg` as `BunnyVideoPlayer` for visual consistency.
- Falls back to the warm placeholder card if URL is not a valid YouTube link.

### Modified files

**`app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`**
- Video rendering priority:
  1. `video_bunny_id` exists → BunnyVideoPlayer (unchanged)
  2. `video_url` exists + is YouTube → YouTubePlayer (new)
  3. `video_url` exists + not YouTube → native `<video>` tag (existing, container updated to dark bg)
  4. No video → placeholder card: "Video bahut jaldi aane wala hai! 🎬" (warm cream bg, saffron text)
- All four states maintain `aspect-video` for consistent layout.

**`components/admin/course-wizard.tsx`**
- Added `video_url` to `Lesson` type and `emptyLesson()`.
- Added `video_url` input field per lesson, below the Bunny Video ID field.
- Helper text: "YouTube link paste karein (jab tak Bunny.net setup na ho)".
- `video_url` included in submit payload (API already supported it).

**`app/(admin)/admin/courses/[id]/edit/page.tsx`**
- Added `video_url` to the lesson mapping so existing YouTube URLs are pre-populated when editing a course.

### What was NOT changed
- Bunny.net player logic — completely untouched
- No new DB columns — uses existing `lessons.video_url`
- No schema migrations
- API routes — already handled `video_url`, no changes needed

---

## Build
- `npm run build` passes clean (no errors, one pre-existing `<img>` warning in course-wizard)

## Files touched
- `lib/video.ts` — NEW
- `components/youtube-player.tsx` — NEW
- `app/(student)/learn/[courseSlug]/[lessonId]/page.tsx` — updated video rendering
- `components/admin/course-wizard.tsx` — added video_url field + helper text
- `app/(admin)/admin/courses/[id]/edit/page.tsx` — added video_url to lesson mapping
