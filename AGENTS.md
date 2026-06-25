# AGENTS.md

## Cursor Cloud specific instructions

Trueverse is a single Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
application. Its backend is **Supabase** (Postgres + Auth). There is no separate backend
service — the Next.js app talks directly to Supabase via `@supabase/ssr`.

Standard scripts live in `package.json`: `npm run dev`, `npm run build`, `npm run lint`,
`npm run start`. Lint is `eslint .`; `next build` also type-checks.

### Running locally (non-obvious)

The app cannot do anything useful (signup, profiles, trust scores, feed) without a Supabase
backend. For local development use the **Supabase CLI local stack**, which runs in Docker and
does not need any external/cloud credentials.

1. Docker is required. There is no systemd in this VM, so start the daemon manually if it is
   not already running: `sudo dockerd > /tmp/dockerd.log 2>&1 &` (then `docker ps` to confirm).
   The docker socket may need `sudo chmod 666 /var/run/docker.sock` for non-sudo access.
2. Start Supabase from the repo root: `supabase start`. This boots Postgres/Auth/etc. and
   **automatically applies the migration** in `supabase/migrations/` (creates all tables,
   RLS, and the `handle_new_user` / `accept_positive_interaction` / `review_negative_report`
   functions). First run pulls several images and is slow; later runs are fast.
3. Get credentials with `supabase status`. The app expects the **legacy JWT keys**
   (`ANON_KEY`, `SERVICE_ROLE_KEY`), NOT the newer `PUBLISHABLE_KEY` / `SECRET_KEY`.
   Put them in `.env.local` (gitignored):
   - `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>`
   - `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>`
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
4. `npm run dev` serves on http://localhost:3000.

`supabase/config.toml` sets `auth.email.enable_confirmations = false`, so email signup returns
a session immediately (no inbox/OTP step needed) and the `handle_new_user` trigger provisions a
profile with trust score 50. Outgoing emails (when confirmations are on) are caught by Mailpit
at http://127.0.0.1:54324; Supabase Studio is at http://127.0.0.1:54323.

`next build` and `npm run lint` work without Supabase running, but they need the four env vars
present (placeholders are fine for build/lint only).

To make an account an admin (for `/admin`), update its row:
`docker exec supabase_db_workspace psql -U postgres -d postgres -c "update profiles set role='admin' where ..."`.
