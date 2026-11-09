-- anon should have nothing on patient data
revoke all on public.patients from anon;
revoke all on public.vitals   from anon;

-- authenticated: strip privileges the app should never use
revoke truncate, references, trigger on public.patients from authenticated;
revoke truncate, references, trigger on public.vitals   from authenticated;

-- Clinical records are usually never hard-deleted.
-- Remove these two lines if your app genuinely deletes rows.
revoke delete on public.patients from authenticated;
revoke delete on public.vitals   from authenticated;

-- Stop future tables from inheriting wide-open grants
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;