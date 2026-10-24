# Trueverse 2.0 implementation plan

## Scope and constraints

This document audits the existing repository and proposes the Trueverse 2.0 MVP pivot. It is a plan only: no product features were implemented, no existing pages or tables were deleted, no database migrations were executed, no production data was modified, and no deployment was triggered.

Product pivot: Trueverse should connect people around what they want to accomplish next. A user states a specific goal, what they can offer, what help they need, and how they prefer to collaborate. The product then helps them discover compatible people, request mutual connections, and take a concrete first action together.

Initial audience: people building side projects, launching startups, and learning useful skills.

## Current repository state

### Git

- Current branch at audit start: `main`.
- Working tree at audit start: clean.
- Audit document branch: `cursor/trueverse-2-plan-8f91`.

### Framework and runtime

- App framework: Next.js App Router with React and TypeScript.
- UI stack: Tailwind CSS v4 tokens, shadcn/Radix primitives, Framer Motion, Lucide icons.
- Data/auth: Supabase Auth, Supabase SSR clients, Postgres migrations under `supabase/migrations`.
- Validation: Zod schemas in `src/lib/validators.ts`.
- Auth/session middleware: root `middleware.ts` delegates to `src/lib/supabase/middleware.ts`.
- Build scripts: `npm run dev`, `npm run build`, `npm run lint`.

### Deployment and environment

- No `vercel.json` exists.
- `DEPLOY.md` documents Vercel import, required env vars, Supabase redirect URLs, migration order, build, and smoke tests.
- `.env.example` contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- `next.config.ts` only configures remote image patterns for Supabase and Unsplash.

## Existing app audit

### Routes

Current public/marketing and auth routes:

- `/` renders the current "portable trust" landing page in `src/app/page.tsx`.
- `/auth/signup` renders email/password signup in `src/app/auth/signup/page.tsx`.
- `/auth/login` renders email/password login in `src/app/auth/login/page.tsx`.
- `/auth/check-email` explains email confirmation.
- `/auth/callback` exchanges Supabase email-link codes for a session.
- `/auth/verify` redirects to `/auth/login`; OTP UI is intentionally removed.
- `/u/[username]` renders public Passport pages with Supabase profile fallback and demo data fallback.
- `/u/[username]/share` renders a demo-data Passport share/QR surface.

Current protected/member routes:

- `/dashboard` is the authenticated home focused on trust level, streaks, XP, and daily missions.
- `/profile` edits profile fields and shows the owner's Passport.
- `/interactions` lists Trust Acts.
- `/interactions/create` creates positive Trust Acts and negative reports.
- `/interactions/[id]` should be retained for existing Trust Act detail flows.
- `/notifications` renders an empty notification center.
- `/community`, `/activity`, `/missions`, `/badges`, and `/leaderboards` are consumer social/reputation surfaces, mostly powered by demo data.
- `/feed` redirects to `/community`.
- `/messages` redirects to `/dashboard`.
- `/insights` redirects to `/dashboard`.
- `/admin` renders the report review queue and is gated by `requireAdmin()`.
- `/design-system` exists as a development/design reference route.

API routes:

- `/api/profile` loads and updates profiles.
- `/api/feed` and `/api/feed/[id]/responses` support help requests and responses.
- `/api/interactions/positive` and accept/reject subroutes support positive Trust Acts.
- `/api/interactions/negative` supports evidence-backed reports.
- `/api/admin/reports/[id]` and `/api/admin/users` support admin moderation.
- `/api/social/follow`, `/api/social/appreciate`, `/api/social/comments` support social reputation interactions.

### Authentication, signup, login, and password reset

Reusable:

- Supabase SSR setup in `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, and `middleware.ts`.
- Email/password signup and login in `src/components/auth-form.tsx`.
- Email confirmation callback in `src/app/auth/callback/route.ts`.
- `ensureProfile`, `requireUser`, `requireProfile`, and `requireAdmin` in `src/lib/auth.ts`.
- Logout and session avatar components.

Gaps:

- Password reset is not implemented. There is no reset request route, reset callback/update page, or `supabase.auth.resetPasswordForEmail` / `updateUser` flow.
- `AuthForm` ignores the `next` search param on login; later implementation should preserve post-login redirects, especially `/onboarding`.
- Current auth copy says "portable reputation", not goal-matching.
- `/auth/verify` is a redirect-only placeholder while `README.md` still describes OTP verification. The docs and route behavior should be reconciled later.

### Profiles and public identity

Reusable:

- `profiles` is the canonical user row keyed by `auth.users.id`.
- Current fields can support MVP identity: `full_name`, `username`, `photo_url`, `bio`, `is_disabled`, and `role`.
- `profileUpdateSchema` and `/api/profile` already validate and update basic user profile data.
- `ProfileForm` and shared UI primitives can be adapted for goal-oriented onboarding.

Hide or de-emphasize for MVP:

- Passport, trust score, trust index, Reputation DNA, XP, streak, badges, achievements, leaderboards, Trust Acts, and public Passport details should not lead the Trueverse 2.0 MVP.
- Keep underlying tables and pages for compatibility, but remove them from primary navigation during the pivot.

Add:

- Goal-oriented profile completion state.
- Goal visibility controls.
- Collaboration preferences.
- Skills offered and help needed.
- Lightweight safety/privacy settings for discovery.

### Messaging and connections

Current state:

- `/messages` redirects to `/dashboard`.
- There are no conversations, messages, or chat tables.
- The closest existing consent mechanic is Trust Act acceptance, but it is reputation-specific and should not be reused as a connection request.

MVP direction:

- Build `/connections` around mutual connection requests first.
- Do not implement open DMs initially. After both users consent, show a "first action" panel with suggested next step and optional external contact handoff if both users have chosen to share it.
- If in-app messaging becomes necessary, add it after mutual connections and blocking/reporting are in place.

## Supabase schema and RLS audit

### Existing migrations

- `001_trueverse_schema.sql`: profiles, trust events, positive interactions, negative reports, evidence, disputes, help requests, community responses, admin actions, notifications, storage buckets, RLS, and trust/admin RPCs.
- `002_trust_xp_reputation_dna.sql`: trust levels, Reputation DNA, XP, badges, achievements, and profile-protection trigger.
- `003_core_loop.sql`: mission templates, user missions, activity events, streaks, and RLS.
- `004_social_graph.sql`: follows, activity appreciations, comments, and weekly XP leaderboard view.
- `005_passport.sql`: profile verifications, passport privacy, additional profile stats, defaults.
- `006_auth_profile_name.sql`: updates `handle_new_user()` to preserve signup name metadata.

### Existing RLS posture

Strong foundations:

- RLS is enabled across existing public tables.
- Profile writes are owner-only and protected by triggers for system fields.
- Trust/report/admin flows are mostly participant/admin-gated.
- Evidence storage is private by policy.
- Admin-sensitive writes use role checks and security-definer functions.

Risks and items to validate before adding new migrations:

- Later migrations call `public.is_admin()` with no argument in several places, while `001_trueverse_schema.sql` defines `public.is_admin(user_id uuid)`. A fresh migration replay may fail unless a zero-argument overload exists in the deployed database. Validate with a local Supabase reset before layering new schema.
- `profiles are public` allows public read of active profiles. That may be too broad for goal discovery if users expect goals/help needs to be shown only to authenticated members.
- `reputation_dna`, badges, achievements, follows, appreciations, and comments have public read policies. They can remain for legacy surfaces but should not become the privacy model for goals.
- In-memory API rate limiting in `src/lib/rate-limit.ts` is best-effort per instance only. Abuse-sensitive actions such as connection requests, blocks, and reports should use database-backed throttling or stricter unique constraints.
- Admin checks in some API routes read profile role directly; keep RLS/admin RPCs as the authoritative enforcement layer.

## Reuse, hide, and add

### Reuse

- Next App Router project structure under `src/app`.
- Supabase auth/session helpers and middleware.
- Profile creation trigger and `ensureProfile()` pattern.
- Basic profile table columns and profile edit API.
- Shared design system: `Button`, `Input`, `Textarea`, `Label`, `Card`, `Badge`, `Avatar`, `Surface`, `Tabs`, motion primitives, theme provider, app shell.
- Validation style in `src/lib/validators.ts`.
- API response helpers in `src/lib/api.ts`.
- Admin/report foundations for safety reporting, with new reports tied to goal/connection context.
- Notification table concept, after notification types are extended.

### Hide or de-prioritize from primary UX

Do not delete these yet; remove from primary nav and marketing copy while the pivot is validated:

- Trust/Passport positioning on `/`, `/dashboard`, `/profile`, `/u/[username]`.
- Trust Acts routes: `/interactions`, `/interactions/create`, `/interactions/[id]`.
- XP/streak/missions/badges/leaderboards/activity social surfaces.
- Demo-data community surfaces that imply an old product.
- Public Passport share CTA and demo profile CTA.
- `/messages` should stay deferred until mutual connections are implemented.
- `/insights` can remain redirected.

### Add

Routes:

- `/` landing page for goal-based collaboration.
- `/onboarding` for goal, skills, help needed, preferences, availability, language, and privacy.
- `/discover` for compatible people and explainable match reasons.
- `/connections` for inbound/outbound/mutual connection requests.
- `/goals` for managing active goals.

Core app/API files:

- `src/app/onboarding/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/connections/page.tsx`
- `src/app/goals/page.tsx`
- `src/app/api/onboarding/route.ts`
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/app/api/discover/route.ts`
- `src/app/api/connections/route.ts`
- `src/app/api/connections/[id]/accept/route.ts`
- `src/app/api/connections/[id]/decline/route.ts`
- `src/app/api/connections/[id]/cancel/route.ts`
- `src/app/api/safety/block/route.ts`
- `src/app/api/safety/report/route.ts`
- `src/lib/matching.ts`
- `src/lib/trueverse2-types.ts` or additions to `src/lib/types.ts`
- New Zod schemas in `src/lib/validators.ts`
- New migration, for example `supabase/migrations/007_trueverse_2_goal_matching.sql`

## Proposed MVP route behavior

### `/`

Purpose: explain the new value proposition and route users to signup/onboarding.

Content:

- Headline around finding collaborators for the next concrete goal.
- Short examples: side project cofounder, launch peer, skill-learning partner.
- CTA for "Start with your goal".
- Secondary CTA for sign in.
- No claim that AI guarantees compatibility.

Implementation notes:

- Replace current trust-first copy in `src/app/page.tsx`.
- Keep marketing shell behavior in `AppShell`.

### `/onboarding`

Purpose: capture the minimum matching inputs.

Fields:

- Current goal: title, description, category, stage, timeframe.
- Skills offered.
- Help needed.
- Collaboration preferences: remote/local/hybrid, async/scheduled, cadence, communication style.
- Availability: weekly hours and optional timezone.
- Languages.
- Visibility: discoverable on/off, show goal to authenticated users only, hide from public profile.

Implementation notes:

- Require auth.
- Create or update profile, active goal, skills, and preferences in one transaction/RPC or carefully ordered API call.
- Redirect incomplete authenticated users here from `/discover`.

### `/discover`

Purpose: show compatible people with explainable reasons and connection CTA.

Content:

- Cards with name/photo/bio snippet, active goal, offered skills, needed skills, availability, language overlap, and match reasons.
- Filters for goal category, skills, language, availability, remote/local, and stage.
- Request connection button.
- Hide blocked users, disabled users, self, users with discoverability off, and users with existing terminal connection state if appropriate.

Implementation notes:

- Prefer computed matching in SQL/API via views or functions rather than storing match recommendations.
- Only store a recommendation if later needed for analytics, notification history, or expensive asynchronous ranking.

### `/connections`

Purpose: mutual consent workflow.

States:

- Sent requests.
- Received requests.
- Accepted/mutual connections.
- Declined/cancelled requests.

Connection request content:

- Sender, recipient, related goal, optional note, suggested first action, status, timestamps.
- Accepted state should create a mutual connection record or use accepted request as the source of truth.

Implementation notes:

- No automatic DMs on one-sided interest.
- Accepted connections can show a first-action checklist or prompt.

### `/goals`

Purpose: manage active goals.

Content:

- Active goal list.
- Create/edit/pause/complete goal.
- Skills offered/help needed per goal.
- Goal visibility and discoverability.

Implementation notes:

- Start with one active goal in onboarding, but design schema for multiple active goals.

## Minimal database design

Prefer normalized, explicit user-owned rows. Use Postgres views/RPCs for matching. Do not store match recommendations for MVP unless query cost, audit needs, or notification history justify it.

### Enums

```sql
create type public.goal_status as enum ('active', 'paused', 'completed', 'archived');
create type public.goal_stage as enum ('idea', 'building', 'launching', 'growing', 'learning');
create type public.skill_relation as enum ('offered', 'needed');
create type public.connection_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'blocked');
create type public.collaboration_mode as enum ('remote', 'local', 'hybrid');
create type public.collaboration_cadence as enum ('async', 'scheduled', 'both');
```

### `goals`

Stores what the user wants to accomplish next.

```sql
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 20 and 1000),
  category text not null check (char_length(category) between 2 and 80),
  stage public.goal_stage not null,
  timeframe text check (timeframe is null or char_length(timeframe) <= 80),
  desired_first_action text check (desired_first_action is null or char_length(desired_first_action) <= 240),
  status public.goal_status not null default 'active',
  is_discoverable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `profile_skills`

Stores normalized skills as user-entered text for MVP. A later taxonomy can add canonical skill IDs.

```sql
create table public.profile_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  relation public.skill_relation not null,
  skill text not null check (char_length(skill) between 2 and 80),
  skill_key text generated always as (lower(trim(skill))) stored,
  created_at timestamptz not null default now(),
  unique (profile_id, goal_id, relation, skill_key)
);
```

### `collaboration_preferences`

Stores discovery and collaboration fit inputs.

```sql
create table public.collaboration_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  mode public.collaboration_mode not null default 'remote',
  cadence public.collaboration_cadence not null default 'both',
  weekly_hours_min integer check (weekly_hours_min is null or weekly_hours_min between 0 and 80),
  weekly_hours_max integer check (weekly_hours_max is null or weekly_hours_max between 0 and 80),
  timezone text check (timezone is null or char_length(timezone) <= 64),
  languages text[] not null default array['English'],
  communication_style text check (communication_style is null or char_length(communication_style) <= 240),
  discoverable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_hours_order check (
    weekly_hours_min is null or weekly_hours_max is null or weekly_hours_min <= weekly_hours_max
  )
);
```

### `connection_requests`

Stores mutual consent around a goal.

```sql
create table public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  requester_goal_id uuid references public.goals(id) on delete set null,
  recipient_goal_id uuid references public.goals(id) on delete set null,
  note text check (note is null or char_length(note) <= 500),
  proposed_first_action text check (proposed_first_action is null or char_length(proposed_first_action) <= 240),
  status public.connection_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connection_no_self check (requester_id <> recipient_id)
);
```

Recommended indexes/constraints:

- Unique active request pair to prevent duplicate pending requests.
- Index recipient/status for inbound requests.
- Index requester/status for outbound requests.
- Consider an ordered pair generated column or unique index for one accepted connection per pair.

### `user_blocks`

Required for safety and discovery filtering.

```sql
create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self check (blocker_id <> blocked_id)
);
```

### `safety_reports`

Keep separate from legacy trust reports unless/until the moderation model is unified.

```sql
create table public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  connection_request_id uuid references public.connection_requests(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  reason text not null check (char_length(reason) between 4 and 120),
  description text not null check (char_length(description) between 20 and 1600),
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint safety_reports_no_self check (reporter_id <> reported_user_id)
);
```

### Match recommendations

Do not create a `match_recommendations` table in the MVP by default.

Prefer:

- `src/lib/matching.ts` for scoring/explanation.
- A SQL view or RPC such as `public.discover_goal_matches(current_profile_id uuid, active_goal_id uuid)` that computes candidates from active goals, skills, preferences, blocks, and connection state.

Store recommendations later only if:

- Matching becomes expensive enough to require batch jobs.
- The product needs "why did we show this" audit history.
- Notifications depend on durable match snapshots.
- A/B ranking experiments require frozen candidate sets.

## Initial matching rules

The MVP should present "suggested collaborators" with explainable reasons. It should not claim that AI or any algorithm guarantees compatibility, trust, safety, or success.

Recommended scoring signals:

1. Complementary skills:
   - Strong positive signal when User A needs a skill User B offers.
   - Strong positive signal when User B needs a skill User A offers.
   - Highest score for reciprocal complementarity.
2. Compatible goals:
   - Same or adjacent categories, such as startup, side project, design, marketing, coding, sales, learning.
   - Similar stage, or a useful adjacent stage where one user has recently done what the other is trying to do.
   - Similar desired first action, such as brainstorm, code review, accountability, customer interview, launch checklist.
3. Availability:
   - Weekly hours overlap.
   - Remote/local/hybrid compatibility.
   - Timezone proximity where scheduled collaboration is preferred.
4. Language:
   - At least one shared language required for default results.
5. Collaboration style:
   - Async vs scheduled compatibility.
   - Communication preference text can become a simple tagged field later.
6. Safety and eligibility filters:
   - Exclude disabled users.
   - Exclude blocked relationships in either direction.
   - Exclude users with discoverability off.
   - Exclude self.
   - Exclude pairs with existing pending/accepted requests unless the UI intentionally shows their state.

Display match reasons as transparent bullets, for example:

- "You need React; Maya offers React."
- "You both want weekly accountability."
- "You share English and remote collaboration."
- "Both goals are in the launch stage."

## Mutual consent, privacy, blocking, reporting, access control, and RLS

### Mutual consent

- Discovery is one-way browsing only.
- A connection starts as a pending request from requester to recipient.
- Only the recipient can accept or decline.
- The requester can cancel while pending.
- A mutual connection exists only after acceptance.
- In-app direct messaging should remain unavailable until both users accept, and can be deferred entirely for MVP.
- Every request should include a note or proposed first action to make the ask concrete.

### Privacy

- Goal and preference records should be readable only when a user opts into discoverability.
- Start with authenticated-member discovery, not public web indexing.
- Public profile pages should not reveal active goals/help needs until explicit public-goal visibility exists.
- Hide exact email and private contact data from discovery cards.
- Allow users to pause a goal or turn off discoverability without deleting data.
- If language, timezone, or availability feels sensitive, show coarse labels in UI and keep exact values for matching.

### Blocking

- Blocking should:
  - Remove both users from each other's discovery results.
  - Prevent new connection requests in either direction.
  - Hide or mark existing pending requests as blocked/cancelled through a controlled server path.
  - Not notify the blocked user with sensitive details.
- RLS should allow users to read only their own block rows.
- Server-side matching must apply block filters; do not rely only on UI filtering.

### Reporting

- Add report entry points from discovery cards, connection requests, and mutual connection views.
- Safety reports should be visible to reporter, reported user only when appropriate for policy/product, and admins.
- Admins need a queue that can reuse parts of `/admin`, but the MVP report model should not automatically mutate trust scores.
- Do not promise safety outcomes. Present reporting as a review and enforcement process.

### Access control and RLS

Recommended RLS shape:

- `goals`
  - Owner can select/insert/update their own rows.
  - Authenticated users can select active, discoverable goals only when the owner is discoverable and neither party has blocked the other.
  - Admins can select/update for moderation.
- `profile_skills`
  - Owner can manage their own skills.
  - Authenticated users can select skills attached to discoverable goals/profiles.
  - Admins can read for moderation.
- `collaboration_preferences`
  - Owner can select/insert/update their own row.
  - Authenticated users can select limited discoverable preferences for candidates; consider a security-definer RPC instead of broad select.
  - Admins can read.
- `connection_requests`
  - Requester can insert pending requests where requester is `auth.uid()`, recipient is not self, neither party blocks the other, and recipient is discoverable.
  - Requester and recipient can select their requests.
  - Recipient can update status to accepted/declined.
  - Requester can update status to cancelled while pending.
  - Admins can read for moderation.
- `user_blocks`
  - Blocker can insert/delete/select own blocks.
  - No public read; matching RPC filters with security-definer logic or policies.
- `safety_reports`
  - Reporter can insert.
  - Reporter can select own reports.
  - Admin can select/update.
  - Reported user visibility should be a deliberate Trust & Safety choice, not broad default read.

Use database constraints plus RLS plus route-handler validation. UI checks are convenience only.

## Specific files to modify in implementation

Routing and shell:

- `src/app/page.tsx`: replace trust landing with goal-collaboration landing.
- `src/components/layout/app-shell.tsx`: update app nav to `Discover`, `Connections`, `Goals`, and profile/account entry. Keep legacy routes reachable only by URL if needed.
- `src/lib/supabase/middleware.ts`: protect `/onboarding`, `/discover`, `/connections`, and `/goals`; decide whether `/dashboard` redirects to `/discover` or remains legacy.
- `src/app/layout.tsx`: update metadata from portable trust to goal-based collaboration.

New pages:

- `src/app/onboarding/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/connections/page.tsx`
- `src/app/goals/page.tsx`

Components:

- Add goal forms, skill chips, preference form, discover card, match reason list, connection request card, privacy/safety controls.
- Prefer shared `src/components/ui/*` primitives and `Surface`/motion wrappers.

APIs and validation:

- `src/lib/validators.ts`: add onboarding, goal, skills, preferences, connection, block, and report schemas.
- `src/lib/types.ts`: add goal, skill, preference, connection, block, and report types.
- `src/lib/matching.ts`: add deterministic scoring and reason generation.
- New route handlers under `src/app/api`.

Supabase:

- New migration `supabase/migrations/007_trueverse_2_goal_matching.sql`.
- Update `supabase/README.md` after migration is implemented.
- Optionally update `supabase/seed.sql` with fictional side-project/startup/learning demo records only after schema exists.

Docs/config:

- `README.md`, `DEPLOY.md`, and `PRODUCT_BIBLE.md` will need product-language updates after the pivot is accepted.
- Vercel env vars likely remain unchanged for MVP unless new third-party services are added.

## Key risks

- Product overlap/confusion: the existing product bible, pages, copy, and data model are trust/passport-first. Users will see conflicting value propositions unless legacy surfaces are hidden from primary flows.
- Migration replay risk: `public.is_admin()` arity mismatch should be validated before adding new migrations.
- Privacy risk: existing public-read profile/social policies should not be copied into goals by default.
- Safety risk: goal matching can introduce unwanted contact. Blocking, reporting, and mutual consent should ship with discovery, not after.
- Matching quality risk: user-entered free-text skills will be noisy. Start transparent and deterministic, then add normalization/taxonomy later.
- Abuse risk: connection spam needs unique constraints, rate limits, and block checks.
- Messaging scope risk: open chat is larger than MVP and should wait until mutual request, moderation, and blocking primitives exist.
- Legacy admin/report coupling: existing negative reports mutate trust after admin approval. New collaboration safety reports should initially avoid automatic trust changes.

## Ordered implementation sequence

1. Validate the current baseline:
   - Run `npm run lint` and `npm run build`.
   - Run a local Supabase migration replay/reset if available to confirm the existing SQL chain works.
   - Fix any migration replay blockers before adding `007`.
2. Add schema migration:
   - Enums, tables, indexes, updated_at triggers, RLS policies, and optional `discover_goal_matches` RPC.
   - Include block/report primitives in the same migration so discovery never ships without safety controls.
3. Add TypeScript types and validators:
   - Define goal, skill, preference, connection, block, and safety report contracts.
4. Implement protected APIs:
   - Goals CRUD.
   - Onboarding upsert flow.
   - Discover computed matches.
   - Connection request create/accept/decline/cancel.
   - Block/report actions.
5. Build `/onboarding`:
   - Auth-required form.
   - Create first active goal, skills, and preferences.
   - Redirect to `/discover` after completion.
6. Build `/goals`:
   - List, create, edit, pause, complete.
   - Manage skills and discoverability per goal.
7. Build `/discover`:
   - Candidate cards from computed matching.
   - Explainable match reasons.
   - Filter and safety actions.
   - Request connection CTA.
8. Build `/connections`:
   - Sent, received, and accepted states.
   - Accept/decline/cancel flows.
   - First-action prompt for accepted connections.
9. Pivot navigation and landing:
   - Update `/` copy.
   - Update `AppShell` nav.
   - Protect new routes in middleware.
   - Redirect or de-emphasize legacy `/dashboard` based on product decision.
10. Update profile/onboarding integration:
   - Keep basic profile edit.
   - Add prompts for goal completion.
   - Avoid surfacing Passport/trust as the main product.
11. Add focused tests and QA:
   - Validator tests if a test framework is added.
   - API route/manual Supabase RLS checks for owner, candidate, blocked, and admin personas.
   - Manual flows: signup, onboarding, discover, request, accept, block, report.
12. Update docs:
   - `README.md`, `DEPLOY.md`, `supabase/README.md`, and product docs after implementation behavior is real.

## Recommended MVP non-goals

- Do not implement AI-generated compatibility claims.
- Do not store recommendation snapshots unless there is a measured need.
- Do not build open messaging before mutual connections.
- Do not delete legacy trust/passport tables or routes in the first pivot pass.
- Do not expose goals on public profile pages until privacy controls are explicit.
- Do not mutate trust scores from new connection reports.
