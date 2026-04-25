create policy "enrollments_update_own"
  on public.enrollments
  for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
