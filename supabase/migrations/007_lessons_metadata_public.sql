-- Allow anyone to read lesson metadata (title, section_id, display_order, etc.)
-- for published courses. This ensures logged-out users see the full curriculum
-- on course detail pages, not just free-preview lessons.
-- Video content (Bunny IDs) is harmless without the CDN credentials.

CREATE POLICY "lessons_metadata_published" ON public.lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lessons.course_id AND c.is_published = true)
  );
