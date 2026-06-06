-- Edge functions connect as service_role. RLS is enabled (so anon/authenticated
-- stay locked out), but service_role still needs table-level privileges since
-- these tables were created by a migration. service_role bypasses RLS policies.
grant select, insert, update, delete on public.devices        to service_role;
grant select, insert, update, delete on public.call_schedules to service_role;
