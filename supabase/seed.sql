-- Trueverse beta demo seed (fictional data only — no real personal data)
-- Apply after migrations 001–005.
-- Creates demo profile rows only when matching auth users already exist.
-- For the marketing “View Demo Profile” CTA, the app also ships client demo
-- data for /u/sarahkim (see src/lib/dummy-data.ts).

-- Optional: mark usernames on existing profiles for public links
-- update public.profiles set username = 'sarahkim' where trueverse_id = 'tv_sarahkim';
-- update public.profiles set username = 'ariamorgan' where trueverse_id = 'tv_ariamorgan';

-- Example accepted Trust Act between two existing profile UUIDs (replace IDs):
-- insert into public.positive_interactions (
--   author_id, recipient_id, title, description, status, accepted_at
-- ) values (
--   '00000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000002',
--   'Helped with weekend food pantry setup',
--   'Showed up on time, coordinated volunteers, and stayed until close.',
--   'accepted',
--   now()
-- );

select 'Demo seed placeholders loaded. Use /u/sarahkim for the public beta demo Passport.' as notice;
