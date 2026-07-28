# Trueverse

Trueverse is a production-oriented digital trust and reputation platform for real-world
interactions. It is built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, and
PostgreSQL.

## Product architecture

### Core trust model

- New users receive a profile with a starting trust score of `50`, a streak of `0`, and a
  globally unique Trueverse ID.
- Positive interactions are submitted by one user for another user. The recipient must accept
  the interaction before the submitter receives `+3` trust score.
- Negative interactions require an evidence URL and are stored as reports. No score changes
  until an admin approves the report, which applies `-5` trust score to the reported user.
- Every trust-score mutation is written to `trust_score_events` for auditability.
- Admin users can review reports, mark reports as disputed, reject them, and view/manage users.

### Authentication flow

1. Email signup uses Supabase Auth with password credentials and user metadata for the profile name.
2. Supabase sends an email verification/OTP depending on project Auth settings.
3. `/auth/verify` accepts one-time passwords through `supabase.auth.verifyOtp`.
4. `/auth/login` supports email/password login and OTP login.
5. `/auth/callback` exchanges Supabase email-link codes for a session.
6. Middleware refreshes Supabase sessions for Server Components and API routes.

### Folder structure

```txt
src/
  app/
    api/
      admin/reports/[id]/route.ts     # Admin report review
      admin/users/route.ts            # Admin user list
      feed/route.ts                   # Help request list/create
      feed/[id]/responses/route.ts    # Community responses
      interactions/negative/route.ts  # Evidence-backed reports
      interactions/positive/route.ts  # Positive interaction submissions
      interactions/positive/[id]/accept/route.ts
      profile/route.ts                # Profile read/update
    admin/page.tsx                    # Admin dashboard
    auth/
      callback/route.ts               # Supabase email-link callback
      login/page.tsx
      signup/page.tsx
      verify/page.tsx                 # OTP verification
    feed/page.tsx
    interactions/page.tsx
    profile/page.tsx
    layout.tsx
    page.tsx
  components/
    admin-report-queue.tsx
    app-shell.tsx
    auth-form.tsx
    feed.tsx
    interaction-forms.tsx
    profile-card.tsx
    profile-form.tsx
    trust-score-badge.tsx
    verify-otp-form.tsx
  lib/
    api.ts
    auth.ts
    env.ts
    supabase/
      admin.ts
      client.ts
      middleware.ts
      server.ts
    types.ts
    validators.ts
supabase/
  migrations/
    001_trueverse_schema.sql
```

## Database schema

The migration in `supabase/migrations/001_trueverse_schema.sql` creates:

- `profiles` with name, photo, bio, trust score, streak, Trueverse ID, and role.
- `positive_interactions` with pending/accepted/rejected states.
- `negative_reports` with evidence URL, admin notes, and report status.
- `disputes` for report escalation workflows.
- `help_requests` and `community_responses` for the public feed.
- `trust_score_events` as the immutable score-change ledger.

It also creates:

- `handle_new_user()` to provision profiles after Supabase Auth signup.
- `accept_positive_interaction()` to atomically accept a positive interaction and apply `+3`.
- `review_negative_report()` to enforce admin review and apply `-5` on approval.
- Row-level security policies for public profile/feed reads, authenticated writes, and admin review.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Apply the Supabase migration with your normal Supabase workflow, for example:

```bash
supabase db push
```

## Verification

```bash
npm run lint
npm run build
```

## Deployment (Vercel)

This is a standard Next.js App Router project and deploys to Vercel with no extra build configuration.

1. Import the repository into Vercel (Framework preset: **Next.js**).
2. Set these Environment Variables in the Vercel project (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` — hosted Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/publishable key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key (server-only; never exposed to the browser)
   - `NEXT_PUBLIC_SITE_URL` — the deployed URL (e.g. `https://your-app.vercel.app`), used for auth redirect callbacks
3. Apply the SQL migrations in `supabase/migrations/` to the hosted Supabase project in order (`001` → `004`), e.g. `supabase db push`. Migration `004` grants the API-role privileges the app requires.
4. In Supabase Auth settings, add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to the allowed redirect URLs.
5. Deploy. `next build` also runs type-checking; the routing/auth layer runs from `src/proxy.ts` (Next.js 16 proxy convention) on the Node.js runtime.

Notes:

- `NEXT_PUBLIC_*` values are inlined at build time, so they must be set before the build runs.
- The build does not require a reachable database — every route renders dynamically at request time.