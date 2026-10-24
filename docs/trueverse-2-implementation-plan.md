# Trueverse 2.0 implementation plan

## Scope of this audit

This document is the Task 1 repository audit and implementation plan for the Trueverse 2.0 pivot. It does not implement features, delete existing pages or tables, execute migrations, modify production data, deploy, or overwrite existing work.

## Current repository state

- Branch at audit time: `main`, with a clean working tree before this document was added.
- Application framework: Next.js App Router (`src/app`) with TypeScript, React 19, Tailwind CSS 4, Radix/shadcn-style UI components, `framer-motion`, and Supabase via `@supabase/ssr` and `@supabase/supabase-js`.
- Package scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- Deployment configuration:
  - No `vercel.json` is present.
  - `next.config.ts` only configures allowed remote image hostnames for Supabase and Unsplash.
  - `.env.example` requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.
  - `src/app/layout.tsx` includes a hard-coded Google Analytics ID through `@next/third-parties/google`.

## Current routes and product surface

### Public and auth routes

- `/` (`src/app/page.tsx`) is the current landing page. It is positioned around "portable trust for the real world" and links to signup and a demo public profile.
- `/auth/signup` and `/auth/login` use `src/components/auth-form.tsx` with Supabase email/password auth.
- `/auth/check-email` tells users to confirm email through Supabase.
- `/auth/callback` exchanges Supabase email-link codes for a session and redirects to `/dashboard` by default.
- `/auth/verify` redirects to `/auth/login`; OTP verification was removed for beta.
- Password reset is not implemented. There is no route or component for `resetPasswordForEmail` or password update after recovery.

### Authenticated app routes

- `/dashboard` is the current home screen for the old trust/passport product. It shows trust level, XP, streaks, and daily missions.
- `/profile` is an authenticated profile/passport editor. It calls Supabase through `requireProfile`, `ProfileForm`, and `/api/profile`.
- `/interactions`, `/interactions/create`, and `/interactions/[id]` implement the old "Trust Acts" loop around positive interactions, negative reports, acceptance/rejection, and admin-reviewed trust changes.
- `/notifications` requires auth but currently passes an empty list to `NotificationCenter`.
- `/messages` redirects to `/dashboard`; there is no messaging database model or message UI.
- `/feed` redirects to `/community`.
- `/community` and `/activity` are client pages driven by `src/lib/dummy-data.ts`, not the live feed APIs.
- `/missions`, `/badges`, `/leaderboards`, and `/insights` are old trust/XP/reputation surfaces and should not be promoted in the Trueverse 2.0 MVP.
- `/admin` is an authenticated admin report review page for the old negative-report moderation flow.
- `/u/[username]` and `/u/[username]/share` expose public passport/profile views.
- `/design-system` is a design/dev route and should remain unlinked in production navigation.

### Middleware and navigation

- `src/lib/supabase/middleware.ts` protects these prefixes: `/dashboard`, `/profile`, `/interactions`, `/notifications`, `/missions`, `/badges`, `/community`, `/activity`, and `/admin`.
- The proposed MVP routes `/onboarding`, `/discover`, `/connections`, and `/goals` are not protected yet.
- `src/components/layout/app-shell.tsx` is the primary shell. Marketing mode is only `/`, `/auth/*`, and `/design-system`. Authenticated navigation currently points to Home, Passport, Community, and Alerts.

## Current Supabase state

### Existing client/server helpers

- Reuse `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, and `src/lib/supabase/middleware.ts`.
- Reuse `src/lib/auth.ts` for `requireUser`, `requireProfile`, `ensureProfile`, and `requireAdmin`.
- Reuse `src/lib/api.ts`, `src/lib/rate-limit.ts`, and `src/lib/validators.ts` patterns for API routes.

### Existing migrations and tables

The repository contains six migrations under `supabase/migrations`.

1. `001_trueverse_schema.sql`
   - Creates `profiles`, `trust_score_events`, `positive_interactions`, `negative_reports`, `report_evidence`, `disputes`, `help_requests`, `community_responses`, `admin_actions`, and `notifications`.
   - Creates trust/admin functions such as `handle_new_user`, `accept_positive_interaction`, `reject_positive_interaction`, `review_negative_report`, and admin helpers.
   - Enables RLS across all public tables and storage buckets.

2. `002_trust_xp_reputation_dna.sql`
   - Adds public trust fields to `profiles`.
   - Adds `reputation_dna`, `user_xp`, `xp_events`, `badges`, `user_badges`, `achievements`, and `user_achievements`.
   - Keeps XP isolated from trust.

3. `003_core_loop.sql`
   - Adds missions, activity events, and streaks.

4. `004_social_graph.sql`
   - Adds `follows`, `activity_appreciations`, and `activity_comments`.
   - Adds an XP leaderboard view.

5. `005_passport.sql`
   - Adds verification and passport privacy tables.
   - Adds public passport stats fields to `profiles`.

6. `006_auth_profile_name.sql`
   - Updates profile creation from Supabase Auth metadata.

### Current RLS observations

- RLS is enabled for existing public tables.
- The existing trust/report policies are participant/admin-scoped for sensitive interactions.
- The current `profiles` select policy is broad: active profiles are public. Because `profiles` includes `email`, this should be treated as a privacy risk before expanding discovery. Trueverse 2.0 should either remove private fields from public profile reads, split private account data into a separate table, or expose discovery/profile data through a safe view/RPC.
- `help_requests` are globally readable, which is acceptable only if content is intentionally public.
- `follows`, appreciations, comments, badges, achievements, verification statuses, and passport privacy are broadly readable. These policies should be reviewed against the new privacy model before using them in discovery.

## Reuse, hide, and add

### Reuse

- Next.js App Router structure and existing route/API conventions.
- Supabase Auth, session middleware, server/client helpers, and profile provisioning.
- `profiles.id = auth.users.id` as the identity anchor.
- Shared UI primitives under `src/components/ui`.
- `AppShell` structure after replacing navigation and marketing copy.
- `ProfileForm` concepts for display name, username, photo, and bio, with copy adjusted away from Passport.
- `rateLimit`, validation with Zod, and JSON error helpers for write APIs.
- Existing `notifications` table can be reused for connection request events.
- Existing `admin_actions` pattern can be reused for moderation audit events.
- Existing `follows` table can be retained but should not be the MVP connection model because follows are one-way and do not express mutual consent.

### Hide or de-emphasize for MVP

Do not delete these routes or tables during the pivot, but remove them from primary navigation and avoid promoting them in the new user journey:

- `/dashboard`
- `/profile` Passport-specific sections
- `/interactions/*`
- `/community`
- `/activity`
- `/feed`
- `/missions`
- `/badges`
- `/leaderboards`
- `/insights`
- `/messages`
- `/admin` from normal member navigation
- Public Passport CTAs from `/`

Recommended hiding approach:

- Update `AppShell` navigation to the MVP routes.
- Redirect old authenticated home traffic from `/dashboard` to `/discover` after onboarding exists.
- Keep admin/report routes available to admins but unlinked from member UI.
- Keep public profile routes available for backward compatibility but do not use Passport language in MVP acquisition paths.

### Add

MVP routes requested:

- `/` landing page for goal-based collaboration.
- `/onboarding` for first active goal, offered skills, needed help, language, availability, and collaboration preferences.
- `/discover` for compatible people and transparent match explanations.
- `/connections` for pending, accepted, declined, and cancelled mutual connection requests.
- `/goals` for active goal management.

Suggested supporting API routes:

- `GET /api/goals`
- `POST /api/goals`
- `PATCH /api/goals/[id]`
- `GET /api/discover?goal_id=...`
- `POST /api/connections`
- `PATCH /api/connections/[id]`
- `POST /api/blocks`
- `DELETE /api/blocks/[id]`
- `POST /api/reports`

Suggested new components:

- `src/components/onboarding/onboarding-form.tsx`
- `src/components/goals/goal-form.tsx`
- `src/components/goals/goal-list.tsx`
- `src/components/discover/match-card.tsx`
- `src/components/discover/match-score-breakdown.tsx`
- `src/components/connections/connection-request-card.tsx`

Suggested shared code updates:

- `src/lib/types.ts` for goal, skill, preference, connection, block, and report types.
- `src/lib/validators.ts` for onboarding, goal, skill, connection, block, and report schemas.
- `src/lib/matching.ts` for deterministic score helpers if matching is computed in application code.
- `src/lib/auth.ts` only if onboarding completion becomes a reusable auth/profile check.
- `src/lib/supabase/middleware.ts` to protect `/onboarding`, `/discover`, `/connections`, and `/goals`.

## Proposed minimal MVP schema

Add a new migration such as `supabase/migrations/007_trueverse_2_mvp.sql`. Do not edit prior migrations unless the team has confirmed the database has not been deployed.

### Enums

```sql
create type public.goal_status as enum ('active', 'paused', 'completed', 'archived');
create type public.goal_visibility as enum ('private', 'discoverable');
create type public.skill_kind as enum ('offered', 'needed');
create type public.connection_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.report_reason as enum ('spam', 'harassment', 'unsafe_behavior', 'misrepresentation', 'other');
create type public.report_status_v2 as enum ('pending', 'reviewed', 'dismissed', 'action_taken');
```

### `goals`

Stores what a user wants to accomplish next.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `title text not null`
- `summary text not null`
- `target_outcome text`
- `stage text`
- `category text`
- `visibility public.goal_visibility not null default 'private'`
- `status public.goal_status not null default 'active'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Notes:

- Keep sensitive availability/contact details out of this table if discoverable rows are publicly readable through RLS.
- Allow more than one active goal per user, but onboarding should create one.

### `goal_skills`

Stores offered skills and needed help per goal.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `goal_id uuid not null references public.goals(id) on delete cascade`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `kind public.skill_kind not null`
- `name text not null`
- `normalized_name text not null`
- `proficiency text`
- `priority integer not null default 1 check (priority between 1 and 5)`
- `created_at timestamptz not null default now()`
- `unique(goal_id, kind, normalized_name)`

Notes:

- `profile_id` duplicates ownership for simpler RLS checks and indexing.
- A separate `skill_catalog` is not necessary for MVP. Add one later if normalization becomes noisy.

### `collaboration_preferences`

Stores user-level collaboration preferences.

Columns:

- `profile_id uuid primary key references public.profiles(id) on delete cascade`
- `availability_hours_per_week integer check (availability_hours_per_week between 0 and 80)`
- `timezone text`
- `language_codes text[] not null default array[]::text[]`
- `collaboration_styles text[] not null default array[]::text[]`
- `communication_channels text[] not null default array[]::text[]`
- `meeting_cadence text`
- `remote_preference text`
- `updated_at timestamptz not null default now()`

Notes:

- Treat this as owner-private by default.
- The match RPC can use these fields internally and return only coarse explanations such as "both prefer async collaboration" or "shared language: English".

### `connection_requests`

Represents mutual-consent requests and accepted connections.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `requester_id uuid not null references public.profiles(id) on delete cascade`
- `recipient_id uuid not null references public.profiles(id) on delete cascade`
- `requester_goal_id uuid references public.goals(id) on delete set null`
- `recipient_goal_id uuid references public.goals(id) on delete set null`
- `message text not null`
- `status public.connection_request_status not null default 'pending'`
- `responded_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `constraint connection_requests_no_self check (requester_id <> recipient_id)`

Indexes and constraints:

- Index `(requester_id, created_at desc)`.
- Index `(recipient_id, status, created_at desc)`.
- Add a partial unique index that prevents duplicate pending requests between the same two users for the same requester goal.

Notes:

- No separate `connections` table is needed for MVP; accepted rows are the connection record.
- If chat is added later, create conversation rows only after `status = 'accepted'`.

### `user_blocks`

Required for safety and discovery filtering.

Columns:

- `blocker_id uuid not null references public.profiles(id) on delete cascade`
- `blocked_id uuid not null references public.profiles(id) on delete cascade`
- `reason text`
- `created_at timestamptz not null default now()`
- `primary key (blocker_id, blocked_id)`
- `constraint user_blocks_no_self check (blocker_id <> blocked_id)`

### `user_reports`

Required for reporting abuse in the new discovery/connection flow.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `reporter_id uuid not null references public.profiles(id) on delete cascade`
- `reported_id uuid not null references public.profiles(id) on delete cascade`
- `connection_request_id uuid references public.connection_requests(id) on delete set null`
- `reason public.report_reason not null`
- `details text`
- `status public.report_status_v2 not null default 'pending'`
- `reviewed_by uuid references public.profiles(id) on delete set null`
- `reviewed_at timestamptz`
- `created_at timestamptz not null default now()`
- `constraint user_reports_no_self check (reporter_id <> reported_id)`

Notes:

- This should not replace legacy `negative_reports` immediately. Keep it focused on discovery/connection safety and bridge to admin tooling later.

### Match recommendations

Do not create a `match_recommendations` table for MVP.

Use a computed query or RPC such as `public.discover_goal_matches(viewer_goal_id uuid)` that returns candidates and a transparent score breakdown. Storing recommendations is only justified later if the product needs auditing, offline batch generation, notification campaigns, A/B testing, or "dismissed/saved recommendation" state.

If the team wants lightweight feedback without storing every recommendation, add `match_feedback` later:

- `profile_id`
- `goal_id`
- `candidate_profile_id`
- `action` (`dismissed`, `saved`, `not_interested`)
- `created_at`

## Initial matching rules

Use deterministic, explainable rules. Do not claim that AI guarantees compatibility.

Recommended scoring inputs:

1. Complementary skills
   - Strong signal: candidate offered skills overlap with the viewer's needed skills.
   - Strong signal: viewer offered skills overlap with the candidate's needed skills.
   - Prioritize higher-priority needed skills.

2. Compatible goals
   - Similar or adjacent categories, stages, and target outcomes.
   - Avoid overfitting on identical wording; start with normalized text/tags and simple keyword overlap.

3. Availability and collaboration style
   - Shared collaboration styles such as async, pair sessions, accountability check-ins, or build sprints.
   - Compatible meeting cadence and remote/in-person preference.
   - Availability bands that can realistically overlap.

4. Language
   - At least one shared language for the initial MVP unless the user explicitly opts into cross-language matching.

5. Quality and safety filters
   - Exclude disabled profiles.
   - Exclude private or non-active goals.
   - Exclude self.
   - Exclude users blocked in either direction.
   - Exclude pairs with existing accepted connections or unresolved pending requests if duplicate requests would be confusing.

Suggested output:

- `candidate_profile_id`
- `candidate_goal_id`
- `score`
- `reasons jsonb`, for example:
  - `["Offers React, which you need", "Also wants startup launch support", "Both prefer async collaboration", "Shared language: English"]`

## Mutual consent, privacy, blocking, reporting, and access control

### Mutual consent

- Discovery should only show a "request to connect" action.
- A connection exists only after the recipient accepts a `connection_requests` row.
- Declined or cancelled requests should not notify the other side repeatedly.
- Accepted connections can unlock first-action suggestions and, later, messaging.
- Connection acceptance should be handled by an API route or RPC that verifies the recipient and valid state transition.

### Privacy

- Onboarding should clearly label which goal/skill fields are discoverable.
- Keep detailed availability, communication preferences, and contact details private.
- Do not expose email in discovery cards.
- Review the current public `profiles` RLS policy before launching discovery because it can expose columns that are not appropriate for public browsing.
- Prefer views/RPCs for discovery results so the client receives only safe fields.

### Blocking

- A blocked user should not appear in discover results.
- A blocked user should not be able to send a connection request.
- Existing pending requests between the pair should be cancelled or hidden after a block.
- Block lists should be owner-private and admin-readable only when needed for moderation.

### Reporting

- Add a report action from discovery cards, connection requests, and accepted connections.
- Reports should be visible to the reporter and admins, not broadly public.
- Admins need a queue that can review `user_reports`, optionally reuse `admin_actions`, and apply account-level safety actions.
- Reporting should not automatically mutate trust/reputation scores.

### Supabase RLS recommendations

- `goals`
  - Owners can select/insert/update/delete their own rows.
  - Admins can select/update for moderation.
  - Other authenticated users can select only `visibility = 'discoverable'` and `status = 'active'`, but only if all selected columns are safe for discovery. Otherwise expose through a view/RPC instead.

- `goal_skills`
  - Owners can manage rows for their goals.
  - Other authenticated users can read skills only for discoverable active goals.
  - Admins can read/update for moderation.

- `collaboration_preferences`
  - Owners can select/insert/update their own row.
  - Admins can read for moderation.
  - Do not grant broad select. Use a security-definer matching RPC to compute compatibility.

- `connection_requests`
  - Requesters can insert pending requests as themselves.
  - Participants can select rows where they are requester or recipient.
  - Requesters can cancel pending requests.
  - Recipients can accept or decline pending requests.
  - Admins can read for moderation.
  - Use triggers or RPCs to prevent state transitions by the wrong participant.

- `user_blocks`
  - Blockers can insert/delete/select their own block rows.
  - Admins can select for safety review.
  - No public read.

- `user_reports`
  - Reporters can insert reports as themselves and select their own reports.
  - Admins can select/update.
  - Reported users should not have automatic row access in MVP; user-facing notifications can be designed separately.

## Ordered implementation sequence

1. Product shell and route guard preparation
   - Update `src/app/layout.tsx` metadata for goal-based collaboration.
   - Update `src/components/layout/app-shell.tsx` navigation to `/discover`, `/connections`, `/goals`, and profile/account.
   - Update `src/lib/supabase/middleware.ts` to protect `/onboarding`, `/discover`, `/connections`, and `/goals`.
   - Keep old routes intact but unlinked.

2. Auth completion
   - Keep current signup/login/check-email/callback flow.
   - Add password reset request and update-password routes before public launch.
   - Redirect newly authenticated users without an active discoverable goal to `/onboarding`.

3. Database migration
   - Add `007_trueverse_2_mvp.sql` with goals, goal skills, collaboration preferences, connection requests, blocks, reports, indexes, triggers, and RLS.
   - Add RLS tests or migration comments that document each policy's access model.
   - Do not execute this migration against production until reviewed.

4. Types, validators, and API routes
   - Extend `src/lib/types.ts`.
   - Add Zod schemas in `src/lib/validators.ts`.
   - Add API routes for goals, onboarding save, discovery, connection requests, blocks, and reports.
   - Add rate limits to connection requests, block/report writes, and discovery if needed.

5. Onboarding
   - Build `/onboarding` around one clear active goal.
   - Capture offered skills, needed skills, preferred collaboration style, availability, and language.
   - Make discoverability explicit before setting `goals.visibility = 'discoverable'`.

6. Goals management
   - Build `/goals` for editing active goals, pausing discovery, and marking goals completed.
   - Avoid deleting user goals by default; archive where possible.

7. Discovery
   - Build `/discover` using computed matching.
   - Show transparent match reasons.
   - Add block/report actions.
   - Avoid claims that an AI algorithm guarantees compatibility.

8. Connections
   - Build `/connections` for inbound, outbound, and accepted requests.
   - Add accept/decline/cancel flows.
   - After acceptance, show a concrete first-action prompt such as "Schedule a 20-minute goal swap" or "Share your repo/outline and one blocker."

9. Safety and admin
   - Add an admin queue for `user_reports`.
   - Consider whether the existing `/admin` page should be expanded or a separate route should be added.
   - Add audit logging through `admin_actions` for reviewed reports and account safety actions.

10. Cleanup and launch readiness
   - Remove old trust/passport CTAs from public paths.
   - Keep legacy routes available but hidden until the team decides whether to migrate or retire them.
   - Review analytics configuration and Vercel environment variables.
   - Run `npm run lint` and `npm run build`.
   - Manually test auth, onboarding, discovery filters, connection request state transitions, block/report behavior, and RLS with at least two non-admin users plus one admin.

## Key risks and review points

- Public profile privacy: existing `profiles` RLS exposes active profile rows broadly, and the table includes email. Fix this before launching user discovery.
- RLS column leakage: PostgreSQL RLS is row-level, not field-level. Do not put private data in rows that are broadly selectable unless the app only exposes data through safe views/RPCs and direct table access is restricted.
- Legacy product confusion: current navigation, copy, and public pages strongly signal trust/passport/XP. Hide those surfaces before inviting new Trueverse 2.0 users.
- Dummy data: `/community`, `/activity`, and several social UI components use `src/lib/dummy-data.ts`. Do not reuse these as live discovery without replacing data access.
- Mutual-consent correctness: one-way follows are not sufficient for connections. Use `connection_requests` state transitions.
- Abuse prevention: connection requests, reports, blocks, and discovery should be rate-limited and RLS-enforced from the start.
- Matching expectations: present matches as explainable suggestions, not guaranteed compatibility.
- Migration compatibility: add new migrations rather than editing prior deployed migrations unless deployment history confirms they are safe to rewrite.
- Password recovery: current auth lacks password reset, which is a launch blocker for a public MVP.
