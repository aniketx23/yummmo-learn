-- Course-level resources/attachments (files + links)
-- Format: [{ "type": "file"|"link", "name": "Recipe PDF", "url": "https://..." }]
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS resources JSONB NOT NULL DEFAULT '[]';

-- Per-lesson chef tips / master notes (optional text)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS tips TEXT;
