-- Yummmo Learn — initial schema, RLS, search, storage, triggers
-- Run in Supabase SQL Editor (or supabase db push)

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'student' check (role in ('super_admin', 'instructor', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Courses (payments must exist before enrollments FK; order below)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.profiles (id),
  category_id uuid references public.categories (id),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  thumbnail_url text,
  language text not null default 'Hindi',
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  is_free boolean not null default false,
  price numeric(10,2) not null default 0,
  original_price numeric(10,2),
  is_published boolean not null default false,
  total_lessons int not null default 0,
  total_duration_minutes int not null default 0,
  tags text[],
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(short_description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_search_idx on public.courses using gin (search_vector);

-- Sections
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  video_bunny_id text,
  video_url text,
  video_duration_seconds int not null default 0,
  is_free_preview boolean not null default false,
  display_order int not null default 0,
  attachments jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments before enrollments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id),
  course_id uuid not null references public.courses (id),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id),
  course_id uuid not null references public.courses (id),
  enrolled_at timestamptz not null default now(),
  is_free boolean not null default false,
  payment_id uuid references public.payments (id),
  completed_at timestamptz,
  unique (student_id, course_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  is_completed boolean not null default false,
  last_watched_seconds int not null default 0,
  completed_at timestamptz,
  unique (student_id, lesson_id)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id),
  course_id uuid not null references public.courses (id),
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

-- New user profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.wishlists enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_select_staff" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Categories: public read, staff write
create policy "categories_read_all" on public.categories for select using (true);
create policy "categories_write_staff" on public.categories for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Courses
create policy "courses_read_published" on public.courses for select using (is_published = true);
create policy "courses_read_staff" on public.courses for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);
create policy "courses_write_staff" on public.courses for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Sections / lessons: mirror course access
create policy "sections_read" on public.sections for select using (
  exists (
    select 1 from public.courses c
    where c.id = sections.course_id
    and (c.is_published = true or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor')
    ))
  )
);
create policy "sections_write_staff" on public.sections for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

create policy "lessons_read_preview_or_enrolled_or_staff" on public.lessons for select using (
  is_free_preview = true
  or exists (
    select 1 from public.enrollments e
    where e.student_id = auth.uid() and e.course_id = lessons.course_id
  )
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);
create policy "lessons_write_staff" on public.lessons for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Payments: own rows read; inserts via service role recommended
create policy "payments_select_own" on public.payments for select using (student_id = auth.uid());
create policy "payments_select_staff" on public.payments for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Enrollments
create policy "enrollments_select_own" on public.enrollments for select using (student_id = auth.uid());
create policy "enrollments_select_staff" on public.enrollments for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);
create policy "enrollments_insert_own" on public.enrollments for insert with check (student_id = auth.uid());

-- Progress
create policy "progress_all_own" on public.progress for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "progress_select_staff" on public.progress for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'instructor'))
);

-- Wishlists
create policy "wishlists_own" on public.wishlists for all using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Seed categories
insert into public.categories (name, slug, display_order)
values
  ('Baking', 'baking', 1),
  ('Healthy Swaps', 'healthy-swaps', 2),
  ('Indian Cooking', 'indian-cooking', 3),
  ('Meal Prep', 'meal-prep', 4)
on conflict (slug) do nothing;

-- Storage bucket (public thumbnails)
insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

create policy "thumbnails_public_read" on storage.objects for select using (bucket_id = 'course-thumbnails');
create policy "thumbnails_authenticated_insert" on storage.objects for insert with check (
  bucket_id = 'course-thumbnails' and auth.uid() is not null
);
create policy "thumbnails_authenticated_update" on storage.objects for update using (
  bucket_id = 'course-thumbnails' and auth.uid() is not null
);
create policy "thumbnails_authenticated_delete" on storage.objects for delete using (
  bucket_id = 'course-thumbnails' and auth.uid() is not null
);
