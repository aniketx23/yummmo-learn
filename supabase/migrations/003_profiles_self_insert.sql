-- Allow users to insert their own profile row (covers upsert before trigger completes)
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);
