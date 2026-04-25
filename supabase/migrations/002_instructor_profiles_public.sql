-- Allow anyone to read instructor names for published courses (catalog / cards)
create policy "profiles_read_for_published_course_instructors"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.courses c
      where c.instructor_id = profiles.id
        and c.is_published = true
    )
  );
