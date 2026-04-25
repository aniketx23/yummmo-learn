-- Fix infinite recursion in RLS policies
-- Root cause: every "staff check" policy did:
--   exists (select 1 from profiles where id = auth.uid() and role in (...))
-- which re-enters the profiles RLS check → infinite recursion.
--
-- Fix: a security definer function that reads profiles bypassing RLS,
-- then all staff-check policies call is_staff() instead of the inline subquery.

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('super_admin', 'instructor')
  )
$$;

-- profiles
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
  for select using (public.is_staff());

-- categories
drop policy if exists "categories_write_staff" on public.categories;
create policy "categories_write_staff" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

-- courses
drop policy if exists "courses_read_staff" on public.courses;
create policy "courses_read_staff" on public.courses
  for select using (public.is_staff());

drop policy if exists "courses_write_staff" on public.courses;
create policy "courses_write_staff" on public.courses
  for all using (public.is_staff()) with check (public.is_staff());

-- sections
drop policy if exists "sections_read" on public.sections;
create policy "sections_read" on public.sections
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = sections.course_id
      and (c.is_published = true or public.is_staff())
    )
  );

drop policy if exists "sections_write_staff" on public.sections;
create policy "sections_write_staff" on public.sections
  for all using (public.is_staff()) with check (public.is_staff());

-- lessons
drop policy if exists "lessons_read_preview_or_enrolled_or_staff" on public.lessons;
create policy "lessons_read_preview_or_enrolled_or_staff" on public.lessons
  for select using (
    is_free_preview = true
    or exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid() and e.course_id = lessons.course_id
    )
    or public.is_staff()
  );

drop policy if exists "lessons_write_staff" on public.lessons;
create policy "lessons_write_staff" on public.lessons
  for all using (public.is_staff()) with check (public.is_staff());

-- payments
drop policy if exists "payments_select_staff" on public.payments;
create policy "payments_select_staff" on public.payments
  for select using (public.is_staff());

-- enrollments
drop policy if exists "enrollments_select_staff" on public.enrollments;
create policy "enrollments_select_staff" on public.enrollments
  for select using (public.is_staff());

-- progress
drop policy if exists "progress_select_staff" on public.progress;
create policy "progress_select_staff" on public.progress
  for select using (public.is_staff());
