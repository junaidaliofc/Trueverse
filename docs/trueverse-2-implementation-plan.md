# Trueverse 2.0 implementation plan

## Scope guardrails

This document is an audit and implementation plan only. It intentionally does not implement routes, run migrations, deploy, modify production data, remove existing pages, or overwrite existing work.

## Current repository state

- Branch at audit time: `cursor/trueverse-2-plan-359f`, created from clean `main`.
- Framework: Next.js App Router with TypeScript, React, Tailwind CSS v4, shadcn/Radix-style UI primitives, Framer Motion, and Supabase Auth/Postgres.
- Package scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Vercel/deploy posture:
  - No `vercel.json` is present.
  - `next.config.ts` only configures remote image hosts for Supabase and Unsplash.
  - `.env.example` and `DEPLOY.md` require `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.
  - `DEPLOY.md` documents Vercel import/deploy steps and Supabase redirect URLs.

## Application audit

### App shell and navigation

- `src/app/layout.tsx` wraps every route in `AppShell`, `ThemeProvider`, and `TooltipProvider`; metadata still positions Trueverse as "Portable digital trust".
- `src/components/layout/app-shell.tsx` separates marketing routes from authenticated app routes. Current app nav points to `/dashboard`, `/profile`, `/community`, and `/notifications`.
- `src/lib/supabase/middleware.ts` protects `/dashboard`, `/profile`, `/interactions`, `/notifications`, `/missions`, `/badges`, `/community`, `/activity`, and `/admin`; authenticated users visiting `/auth/login` or `/auth/signup` redirect to `/dashboard`.

### Public and authenticated routes

- `/` is a landing page for the current trust/passport beta, with CTAs to `/auth/signup` and `/u/sarahkim`.
- `/auth/signup`, `/auth/login`, `/auth/check-email`, and `/auth/callback` implement Supabase email/password auth plus email confirmation.
- `/auth/verify` redirects to `/auth/login`; older OTP verification is removed.
- Password reset is not implemented. There are no forgot-password, recovery callback, or password update routes/forms.
- `/dashboard` is a trust/XP home page backed by `profiles` and `user_xp`.
- `/profile` is an authenticated Passport/profile editor plus owner Passport view.
- `/u/[username]` is a public Passport profile route. It can read demo data and, when Supabase is configured, public `profiles`.
- `/u/[username]/share` is still demo-data driven.
- `/community`, `/activity`, `/missions`, `/badges`, and `/leaderboards` are social/reputation/XP surfaces, mostly backed by `src/lib/dummy-data`.
- `/interactions`, `/interactions/create`, and `/interactions/[id]` implement positive Trust Acts and negative reports.
- `/admin` provides report moderation for admins.
- `/messages` redirects to `/dashboard` with a comment that messaging is deferred.
- `/insights` redirects to `/dashboard` with a comment that AI insights are deferred.
- `/feed` redirects to `/community`.
- `/notifications` renders an empty `NotificationCenter`.
- `/design-system` is a living style guide and should remain internal/non-primary.

### API routes

- `src/app/api/profile/route.ts`: authenticated profile read/update with zod validation and simple rate limiting.
- `src/app/api/feed/route.ts` and `src/app/api/feed/[id]/responses/route.ts`: help-request list/create and responses.
- `src/app/api/interactions/positive/*`: positive Trust Act create/accept/reject.
- `src/app/api/interactions/negative/route.ts`: evidence-backed negative reports.
- `src/app/api/social/follow/route.ts`: follow/unfollow, with demo fallback when the table is missing.
- `src/app/api/social/appreciate/route.ts`: activity appreciations, explicitly not trust-changing.
- `src/app/api/social/comments/route.ts`: activity comments, with demo fallback when the table is missing.
- `src/app/api/admin/*`: admin user list and negative-report review.

### Supabase schema and RLS audit

Existing migrations:

- `001_trueverse_schema.sql`
  - Core identity and trust tables: `profiles`, `trust_score_events`, `positive_interactions`, `negative_reports`, `report_evidence`, `disputes`, `help_requests`, `community_responses`, `admin_actions`, `notifications`.
  - Functions/triggers for profile provisioning, email sync, admin checks, Trust Act accept/reject, report review, dispute resolution, admin trust adjustment, role changes, disabled users, and timestamps.
  - RLS is enabled across all core tables.
  - Profiles are public when not disabled.
  - Trust interactions are visible to participants/admins.
  - Reports/evidence/disputes are visible to involved users/admins.
  - Help requests are publicly readable.
  - Notifications are recipient/admin readable.
  - Storage buckets exist for public avatars and private report evidence.
- `002_trust_xp_reputation_dna.sql`
  - Adds `trust_index`, `trust_level`, identity verification, username, profile-completion, trust-act/appreciation counters.
  - Adds `reputation_dna`, XP, badges, achievements, and related RLS.
  - DNA/badges/achievements are publicly readable; XP events are owner/admin readable.
- `003_core_loop.sql`
  - Adds mission templates, user missions, activity events, and streaks.
  - Public activity events are readable; owner/admin can read private activity.
- `004_social_graph.sql`
  - Adds follows, activity appreciations, activity comments, and XP leaderboard view.
  - Follows/appreciations are publicly readable with owner writes.
- `005_passport.sql`
  - Adds verification rows, passport privacy toggles, integrity DNA, public Passport stats, and default Passport rows.
  - Verification status and passport privacy are publicly readable.
- `006_auth_profile_name.sql`
  - Updates signup profile provisioning to preserve `name` or `full_name` from auth metadata.

## Reuse, hide, and add

### Reuse

- Supabase Auth clients, middleware session refresh, `requireUser`, `requireProfile`, and profile provisioning.
- `profiles` as the account identity table, but narrow what is surfaced in discovery.
- Existing profile editor patterns, zod validation patterns, route-handler error helpers, and rate limiter.
- UI primitives under `src/components/ui`, motion primitives, theme provider, app shell, session avatar, logout button, and design tokens.
- Admin/RLS patterns for moderation, participant-only records, disabled users, and auditability.
- Existing `negative_reports` only as a moderation/reporting pattern. Do not keep the Trust-score penalty semantics in the 2.0 matching UX.
- Existing `notifications` table shape can support connection-request notifications later.

### Hide from the initial 2.0 MVP navigation

Do not delete these routes or tables; route them away from the primary product path until they are intentionally redesigned:

- Trust/passport scoring surfaces: `/dashboard`, `/profile` Passport sections, `/u/[username]`, `/u/[username]/share`, `/interactions/*`, `/admin` report queue copy tied to trust scores.
- Gamification/social surfaces: `/community`, `/activity`, `/missions`, `/badges`, `/leaderboards`, `/notifications` until there is a collaboration-specific notification center.
- Legacy/deferred routes already hidden by redirect: `/feed`, `/messages`, `/insights`.
- Demo-data driven UI in `src/lib/dummy-data` should not power the new discovery experience.

### Add

Target MVP routes:

- `/` landing page: reposition around finding collaborators for specific goals. Public copy should avoid trust-score language and avoid claims that AI guarantees compatibility.
- `/onboarding`: authenticated flow to create the first active goal, offered skills, needed help, availability, languages, and collaboration preferences.
- `/discover`: authenticated discovery surface showing compatible people/goals and concrete suggested first actions.
- `/connections`: authenticated mutual connection-request inbox/outbox with accept/decline/cancel/block/report affordances.
- `/goals`: authenticated management of active/paused/archived goals and their skills/preferences.

Supporting additions:

- Password reset flow: `/auth/forgot-password` and `/auth/reset-password` using Supabase recovery links.
- Server-side matching helper in `src/lib/matching.ts` plus API route or server action used by `/discover`.
- Validation schemas for goals, skills, preferences, and connection requests in `src/lib/validators.ts`.
- TypeScript types for the new rows in `src/lib/types.ts`.
- New migration, for example `supabase/migrations/007_trueverse_2_mvp.sql`.

## Proposed minimal data model

Prefer computed matching for the MVP. Do not create a persistent `match_recommendations` table initially unless scale, audit, or experimentation requires snapshots.

### Enums

- `goal_status`: `active`, `paused`, `archived`
- `goal_visibility`: `private`, `discoverable`
- `goal_stage`: `idea`, `building`, `launched`, `learning`, `other`
- `goal_skill_kind`: `offered`, `needed`
- `connection_status`: `pending`, `accepted`, `declined`, `cancelled`
- `collaboration_mode`: `async`, `live_calls`, `local`, `hybrid`

### Tables

#### `goals`

- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null references profiles(id) on delete cascade`
- `title text not null`
- `summary text not null`
- `category text`
- `stage goal_stage not null`
- `status goal_status not null default 'active'`
- `visibility goal_visibility not null default 'discoverable'`
- `desired_first_action text`
- `availability_hours_per_week integer`
- `timezone text`
- `languages text[] not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

#### `goal_skills`

- `id uuid primary key default gen_random_uuid()`
- `goal_id uuid not null references goals(id) on delete cascade`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `kind goal_skill_kind not null`
- `skill text not null`
- `proficiency integer check (proficiency between 1 and 5)`
- `created_at timestamptz not null default now()`
- Unique normalized constraint target: one `(goal_id, kind, lower(skill))`.

Store offered and needed skills in one table so matching can compare "my needed" against "their offered" and "their needed" against "my offered" symmetrically.

#### `collaboration_preferences`

Keep this goal-scoped because a founder's startup goal can need different collaboration than a learning goal.

- `goal_id uuid primary key references goals(id) on delete cascade`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `mode collaboration_mode not null`
- `communication_style text`
- `meeting_cadence text`
- `availability_notes text`
- `looking_for text[] not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

#### `connection_requests`

- `id uuid primary key default gen_random_uuid()`
- `requester_id uuid not null references profiles(id) on delete cascade`
- `recipient_id uuid not null references profiles(id) on delete cascade`
- `requester_goal_id uuid not null references goals(id) on delete cascade`
- `recipient_goal_id uuid references goals(id) on delete set null`
- `status connection_status not null default 'pending'`
- `message text not null`
- `proposed_first_action text`
- `responded_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Constraints:
  - requester cannot equal recipient.
  - only one active pending request for the same requester/recipient/goal pair.
  - only requester can cancel, only recipient can accept/decline.

#### `user_blocks`

- `blocker_id uuid not null references profiles(id) on delete cascade`
- `blocked_id uuid not null references profiles(id) on delete cascade`
- `created_at timestamptz not null default now()`
- Primary key `(blocker_id, blocked_id)`
- Self-blocks disallowed.

Use this table in discovery and connection-request policies so blocked people cannot discover, request, or message each other.

#### `safety_reports`

Add a collaboration-specific reporting table instead of overloading negative trust reports:

- `id uuid primary key default gen_random_uuid()`
- `reporter_id uuid not null references profiles(id) on delete cascade`
- `reported_profile_id uuid references profiles(id) on delete set null`
- `connection_request_id uuid references connection_requests(id) on delete set null`
- `reason text not null`
- `details text`
- `status text not null default 'pending'`
- `created_at timestamptz not null default now()`
- `reviewed_by uuid references profiles(id) on delete set null`
- `reviewed_at timestamptz`

### Match recommendations

Do not store recommendations for MVP. Compute them at request time from discoverable active goals and indexed skill rows. Add a materialized `match_recommendations` table only if one of these becomes true:

- recommendations need to be reviewed/audited;
- ranking experimentation needs stable snapshots;
- computed queries become too slow after indexing;
- users need dismissal history that cannot live client-side.

If added later, keep it cache-like with `viewer_id`, `viewer_goal_id`, `candidate_profile_id`, `candidate_goal_id`, `score`, `reasons jsonb`, `computed_at`, and expiry. It should not be the source of truth.

## Initial matching rules

Use transparent scoring and reason labels. Do not claim that an AI algorithm guarantees compatibility.

Suggested first pass:

1. Candidate set:
   - both users have active, discoverable goals;
   - neither user has blocked the other;
   - candidate profile is not disabled;
   - exclude existing accepted connections and duplicate pending requests.
2. Complementary skills:
   - high weight when viewer `needed` skills overlap candidate `offered` skills;
   - additional weight when candidate `needed` overlaps viewer `offered`;
   - show concrete reason text such as "They offer React, which your goal needs."
3. Compatible goals:
   - medium weight for category/stage alignment, similar target audience, or mutually useful desired first action.
   - learning goals can match builders when offered/needed skills align.
4. Availability:
   - medium weight for overlapping availability bands or compatible async preference.
   - do not require identical hours; treat availability as a filter only when explicitly incompatible.
5. Language:
   - require at least one shared language for MVP unless the user has no language preference set.
6. Collaboration style:
   - small-to-medium weight for shared mode/cadence.
   - surface mismatch warnings instead of silently hiding all candidates.
7. Freshness and fairness:
   - small boost for recently updated goals;
   - rotate results to avoid the same top profiles monopolizing discovery.

## Mutual consent, privacy, blocking, reporting, access control, and RLS

### Mutual consent

- Discovery can show limited candidate/goal previews for discoverable active goals.
- A connection is not established until the recipient accepts a request.
- Pending requests should be visible only to requester, recipient, and admins.
- Accepted connections can unlock richer contact details or messaging in a later phase.
- Declining should not notify the requester with punitive language; show only that the request is no longer pending.

### Privacy

- Default new goals to `discoverable` only after onboarding consent; drafts/private goals stay owner-only.
- Do not expose email, private auth metadata, hidden goals, archived goals, reports, blocks, or internal trust fields in discovery.
- Existing public `profiles` policy is too broad for the new discovery model. Either:
  - keep `profiles` public for legacy Passport but make `/discover` select a narrow field list only; and/or
  - add a discovery view/RPC that returns only `profile_id`, display name, username, photo, short bio, goal preview, skills, language, and collaboration summary.
- Revisit public Passport routes before launch; they may conflict with a privacy-first collaborator network.

### Blocking

- Add `user_blocks`.
- Enforce blocks in:
  - matching queries;
  - connection-request insert policies;
  - any future messaging policy;
  - profile/goal preview RPCs.
- Users should be able to block from discovery cards, pending requests, and accepted connections.

### Reporting

- Add collaboration-specific `safety_reports` or refactor existing `negative_reports` copy and semantics before exposing it in the new product.
- Reports should be visible only to the reporter, admins, and selected moderation views.
- Reporting should not automatically affect matching rank or public reputation until reviewed.

### Supabase RLS recommendations

- `goals`:
  - owner/admin can read all of their own goals;
  - authenticated users can read active discoverable goals only through a narrow policy or view;
  - owner can insert/update/delete own goals;
  - no client writes to another user's goals.
- `goal_skills` and `collaboration_preferences`:
  - owner/admin can read/write through ownership of the parent goal;
  - authenticated users can read only rows attached to active discoverable goals and only if not blocked.
- `connection_requests`:
  - requester can insert when requester owns `requester_goal_id`, recipient is not blocked, and target goal is discoverable/active;
  - requester and recipient can select;
  - requester can cancel pending;
  - recipient can accept/decline pending;
  - admins can select for moderation.
- `user_blocks`:
  - blocker can insert/delete/select their own blocks;
  - policies that need block checks can use `exists` subqueries or security-definer RPCs.
- `safety_reports`:
  - reporter can insert/select own reports;
  - admins can select/update all;
  - reported user should not read the report until/unless moderation workflow explicitly supports it.
- Prefer security-definer RPCs for computed discovery if direct RLS across skills/preferences/blocks becomes too complex.

## Specific files to modify in implementation

### Navigation and routing

- `src/app/page.tsx`: rewrite landing page for goal-based collaboration.
- `src/app/layout.tsx`: update metadata for the 2.0 positioning.
- `src/components/layout/app-shell.tsx`: update marketing/auth nav and app nav to `/discover`, `/connections`, `/goals`; decide whether `/onboarding` is marketing-like or app-like.
- `src/lib/supabase/middleware.ts`: protect `/onboarding`, `/discover`, `/connections`, and `/goals`; redirect authenticated users from auth pages to `/discover` or `/onboarding` based on profile/goal state.
- `src/app/auth/callback/route.ts` and `src/components/auth-form.tsx`: change post-auth destination from `/dashboard` to onboarding/discovery logic.
- Add:
  - `src/app/onboarding/page.tsx`
  - `src/app/discover/page.tsx`
  - `src/app/connections/page.tsx`
  - `src/app/goals/page.tsx`
  - password reset routes/forms.

### Data and validation

- Add `supabase/migrations/007_trueverse_2_mvp.sql`.
- Update `src/lib/types.ts` with `Goal`, `GoalSkill`, `CollaborationPreferences`, `ConnectionRequest`, `UserBlock`, and `SafetyReport`.
- Update `src/lib/validators.ts` with schemas for onboarding, goal updates, connection request create/respond, block, and report.
- Add `src/lib/matching.ts` for deterministic scoring and reason generation.
- Consider `src/lib/goals.ts` and `src/lib/connections.ts` if server components need shared query helpers.

### Components

- Reuse and compose existing primitives from `src/components/ui/*`.
- Add focused components:
  - `src/components/onboarding/goal-onboarding-form.tsx`
  - `src/components/goals/goal-form.tsx`
  - `src/components/discover/match-card.tsx`
  - `src/components/connections/connection-request-card.tsx`
  - `src/components/safety/block-report-actions.tsx`
- Keep legacy trust/passport components in place but remove them from primary nav.

## Risks and open decisions

- Existing profile/public Passport RLS is broader than the privacy posture expected for collaborator discovery.
- Existing product copy is trust/reputation-heavy; leaving it in primary flows would confuse the pivot.
- Existing social routes use demo data and should not be mistaken for production matching.
- Password reset is missing and should be added before wider onboarding.
- Matching quality depends on normalized skills. MVP can lowercase/trim strings, but longer term may need aliases like `js` -> `javascript`.
- Connection requests are not messages. If messaging returns, it should be gated on accepted connections and blocks.
- Existing negative reports mutate trust after admin review; Trueverse 2.0 reports should be safety/moderation-first and not automatically become compatibility signals.
- Direct RLS for cross-user discovery with block checks can get complex. A security-definer RPC returning sanitized discovery rows may be safer.

## Ordered implementation sequence

1. Add the 2.0 database migration without running it in production:
   - enums, `goals`, `goal_skills`, `collaboration_preferences`, `connection_requests`, `user_blocks`, and `safety_reports`;
   - indexes for owner/status/visibility, skill lookup, request participants/status, and blocks;
   - RLS policies and timestamp triggers.
2. Add TypeScript types and zod validators for the new tables and request payloads.
3. Add password reset routes and update auth redirects so new users land in `/onboarding`.
4. Build `/onboarding` to create the first goal, skills, preferences, languages, and availability in one flow.
5. Build `/goals` so users can edit, pause, archive, and create active goals.
6. Implement `src/lib/matching.ts` and `/discover` using computed deterministic scoring with transparent reason labels.
7. Build connection request create/respond/cancel flows and `/connections`.
8. Add blocking and reporting actions to discovery and connection cards, enforcing both in queries and RLS.
9. Rework landing page, metadata, and `AppShell` navigation for the 2.0 product.
10. Hide or redirect legacy trust/passport/gamification routes from the primary experience without deleting them.
11. Add focused tests for validators and matching logic if a test framework is introduced; otherwise require `npm run lint` and `npm run build` for each implementation PR.
12. After review, run Supabase migrations in the appropriate environment through the normal deployment process, then smoke test signup, onboarding, discovery, request acceptance, block, and report paths.
