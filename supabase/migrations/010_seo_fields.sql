-- Add SEO fields to courses table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;
