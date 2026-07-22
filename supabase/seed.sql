-- Local development seed data.
-- Auto-applied by `supabase db reset` and the first `supabase start`
-- (see the [db.seed] section in supabase/config.toml).
--
-- The schema migration (001_trueverse_schema.sql) enables row-level security and
-- defines policies, but it does not GRANT base-table privileges to the `anon` /
-- `authenticated` roles. On Postgres 17 the default privileges only grant
-- TRUNCATE/REFERENCES/TRIGGER to those roles, so every PostgREST read/write fails
-- with "permission denied for table ...". The visible symptom is that signup/login
-- appear to succeed but authenticated pages (e.g. /profile) bounce back to the
-- login screen because the profile query returns nothing.
--
-- RLS still enforces the row-level rules, so these grants are safe for local
-- development. They are applied here (local-only) rather than in the migration so
-- the committed application migration is left unchanged.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
