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

The migration in `supabase/migrations/001_trueverse_schema.sql` is the canonical Supabase
schema for Trueverse. It creates:

- `profiles` with email, name, photo, bio, trust score, streak, Trueverse ID, role, and
  disabled-user state.
- `positive_interactions` with pending/accepted/rejected/expired states, expiry, and recipient
  acceptance/rejection timestamps.
- `negative_reports` with required evidence URL, admin notes, and pending/under-review/approved/
  rejected/disputed states.
- `report_evidence` for structured evidence files/URLs tied to reports.
- `disputes` for report escalation and resolution workflows.
- `help_requests` and `community_responses` for the public feed.
- `trust_score_events` as the immutable score-change ledger.
- `admin_actions` for moderation/audit history.
- `notifications` for user-facing trust/feed/admin events.

It also creates:

- `handle_new_user()` to provision profiles after Supabase Auth signup.
- `sync_profile_email()` to mirror Supabase Auth email changes into profiles.
- `accept_positive_interaction()` to atomically accept a positive interaction and apply `+3`.
- `reject_positive_interaction()` for recipient rejection without score changes.
- `review_negative_report()` to enforce admin review, audit the action, notify users, and apply
  `-5` on approval.
- `resolve_dispute()` for admin dispute resolution, including optional trust restoration.
- `admin_adjust_trust()`, `set_user_role()`, and `set_user_disabled()` for audited admin
  operations.
- Row-level security policies for profiles, trust events, interactions, reports, evidence,
  disputes, feed content, admin actions, and notifications.
- Supabase Storage buckets and policies for public avatars and private report evidence.

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