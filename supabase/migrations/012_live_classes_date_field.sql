-- Add specific date and time columns to live_classes
ALTER TABLE public.live_classes
ADD COLUMN IF NOT EXISTS class_date DATE,
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS end_time TEXT;

-- Allow guest-visible registration insert (student_id can be null for pending guest regs)
-- Actually student_id is already nullable via ON DELETE SET NULL, but ensure RLS allows auth insert
