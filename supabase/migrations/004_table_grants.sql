-- Grant base-table privileges to the PostgREST API roles.
--
-- The schema migrations enable RLS and define policies but do not GRANT base
-- privileges to anon/authenticated. On Postgres 17 the defaults only cover
-- TRUNCATE/REFERENCES/TRIGGER, so every API read/write fails with
-- "permission denied for table ...". Row access is still governed by RLS; these
-- grants only make the tables reachable.
--
-- This lives in a migration (in addition to the local supabase/seed.sql) so that
-- hosted deployments applied with `supabase db push` behave the same as local dev.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Cover objects created after this migration as well.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
