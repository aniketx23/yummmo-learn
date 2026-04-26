-- Add email column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update trigger to include email on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email WHERE profiles.email IS NULL;
  RETURN new;
END;
$$;
