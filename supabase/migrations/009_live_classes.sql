-- Live class batches (admin creates these)
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT CHECK (schedule_type IN ('weekend', 'weekday', 'custom')) DEFAULT 'weekend',
  schedule_days TEXT,           -- e.g. "Saturday & Sunday"
  time_slot TEXT,               -- e.g. "10:00 AM - 1:00 PM"
  max_spots INT NOT NULL DEFAULT 8,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student registrations for live classes
CREATE TABLE IF NOT EXISTS public.live_class_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID REFERENCES public.live_classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INT,
  gender TEXT,
  preferred_date DATE,
  preferred_slot TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can read active classes
CREATE POLICY "live_classes_public_read" ON public.live_classes
  FOR SELECT USING (is_active = true);

-- Staff can manage classes
CREATE POLICY "live_classes_staff_all" ON public.live_classes
  FOR ALL USING (public.is_staff());

-- Authenticated users can register
CREATE POLICY "live_reg_insert_auth" ON public.live_class_registrations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can see own registrations
CREATE POLICY "live_reg_select_own" ON public.live_class_registrations
  FOR SELECT USING (student_id = auth.uid());

-- Staff can see/manage all registrations
CREATE POLICY "live_reg_staff_all" ON public.live_class_registrations
  FOR ALL USING (public.is_staff());

-- Updated_at trigger
DROP TRIGGER IF EXISTS live_classes_updated_at ON public.live_classes;
CREATE TRIGGER live_classes_updated_at BEFORE UPDATE ON public.live_classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
