-- Remove any existing policies on patients/vitals (we never saw them)
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('patients', 'vitals')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Logged-in users only. Anon gets nothing.
-- TODO: tighten to role-based checks in the user roles ticket.
create policy "patients_select" on public.patients
  for select to authenticated using (true);
create policy "patients_insert" on public.patients
  for insert to authenticated with check (true);
create policy "patients_update" on public.patients
  for update to authenticated using (true) with check (true);

create policy "vitals_select" on public.vitals
  for select to authenticated using (true);
create policy "vitals_insert" on public.vitals
  for insert to authenticated with check (true);
create policy "vitals_update" on public.vitals
  for update to authenticated using (true) with check (true);