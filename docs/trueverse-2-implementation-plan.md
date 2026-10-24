# Trueverse 2.0 repository audit and implementation plan

## Scope and audit basis

This document is a repository audit and proposed implementation plan only. No application
feature, production data, Supabase project, migration, or deployment was changed or executed.

Audit snapshot:

- Starting branch: `main`, tracking `origin/main`
- Starting worktree: clean
- Planning branch: `cursor/trueverse-2-plan-0213`
- Application: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Backend: Supabase Auth, Postgres, Storage, and Row Level Security (RLS)
- Hosting guidance: Vercel is described in `DEPLOY.md`; there is no `vercel.json`
- Repository automation: no GitHub Actions configuration was found

The audit describes repository code, not the live Supabase project's migration state, Auth
settings, data, secrets, or Vercel dashboard configuration. Those must be verified separately
before rollout.

## Product direction and MVP boundary

Trueverse 2.0 should make a user's active goal the center of discovery:

1. State a specific outcome.
2. State skills offered and help needed.
3. State availability, language, and collaboration preferences.
4. Discover explainable candidate matches.
5. Request a connection.
6. Connect only after recipient consent.
7. Agree on a concrete first action.

The initial audience is people building side projects, launching startups, and learning useful
skills. Matching must be presented as a ranked suggestion based on user-provided signals, not as
an AI determination or a guarantee of compatibility, safety, or success.

MVP deliberately excludes direct messaging, teams with more than two people, calendar
integration, opaque ML ranking, and persistent match recommendation records. An accepted
connection can expose mutually shared contact/action details; messaging can follow later.

## Current application state

### Framework and shared architecture

- `package.json` defines a Next.js 16 application with App Router, React 19, Supabase SSR,
  Zod, Radix/shadcn primitives, and Framer Motion.
- `src/app/layout.tsx` wraps every route in `ThemeProvider`, `TooltipProvider`, and
  `src/components/layout/app-shell.tsx`. It also contains trust-first metadata and a hard-coded
  Google Analytics ID.
- `middleware.ts` delegates session refresh and route protection to
  `src/lib/supabase/middleware.ts`.
- Supabase browser, server, middleware, and admin client factories live in
  `src/lib/supabase/`. The admin client is currently unused.
- API handlers use reusable patterns in `src/lib/api.ts`, `src/lib/validators.ts`, and
  `src/lib/rate-limit.ts`. The rate limiter is in-memory and therefore not a reliable global
  limit across Vercel instances.
- `src/lib/dummy-data.ts` supplies substantial demo content. Community, activity, missions,
  badges, and rankings are not consistently backed by live data.

### Route inventory

| Route | Current behavior | Data/auth status | 2.0 disposition |
| --- | --- | --- | --- |
| `/` | Trust/reputation landing page | Public, static | Rewrite for goals and collaboration |
| `/dashboard` | Streak, XP, missions, trust home | Protected; mixed live and demo data | Hide from primary navigation; redirect to `/discover` after transition |
| `/profile` | Profile editor and Passport | Protected; live profile | Reuse identity editor; keep trust as secondary context |
| `/u/[username]` | Public Passport | Public; demo-first, then live lookup | Reuse as public profile, with privacy review |
| `/u/[username]/share` | Passport share/QR | Public; demo-only | Hide for non-demo users until live lookup is implemented |
| `/community` | Feed and people suggestions | Protected; dummy data | Hide from MVP navigation |
| `/activity` | Activity timeline | Protected; dummy data | Hide from MVP navigation |
| `/interactions` | Trust Act list | Protected; live | Preserve as legacy/deep link |
| `/interactions/create` | Create Trust Act | Protected; live | Preserve as post-collaboration reputation flow |
| `/interactions/[id]` | Trust Act detail | Protected; live | Preserve |
| `/notifications` | Notification shell | Protected; currently receives an empty list | Hide or label unavailable until wired |
| `/missions` | Daily/weekly missions | Protected; demo-oriented | Hide from MVP navigation |
| `/badges` | Achievements/badges | Protected; demo-oriented | Hide from MVP navigation |
| `/leaderboards` | XP ranking | Not middleware-protected | Hide from MVP navigation |
| `/feed` | Redirects to `/community` | Public redirect | Preserve redirect; do not use as 2.0 canonical route |
| `/messages` | Redirects to `/dashboard` | Stub | Keep hidden; messaging is not MVP |
| `/insights` | Redirects to `/dashboard` | Stub | Keep hidden |
| `/admin` | Negative report review | Admin helper plus live data | Preserve as separate safety tooling |
| `/auth/login` | Email/password login | Public | Reuse and add reset entry point |
| `/auth/signup` | Email/password signup | Public | Reuse; send completed signup to onboarding |
| `/auth/check-email` | Email confirmation instructions | Public | Reuse |
| `/auth/verify` | Redirects to login | Public stub | Keep hidden; documentation should not claim OTP UI exists |
| `/auth/callback` | Exchanges confirmation code for session | Public route handler | Reuse; validate the `next` destination |
| `/design-system` | Internal component showcase | Public | Keep out of product navigation; consider non-production gating |

Proposed MVP routes:

| Route | Access | Responsibility |
| --- | --- | --- |
| `/` | Public | Audience-specific landing page, product explanation, sign up/sign in |
| `/onboarding` | Authenticated | Create the first goal, offered/needed skills, and collaboration preferences |
| `/discover` | Authenticated and onboarding-complete | Explainable ranked candidates for a selected active goal |
| `/connections` | Authenticated | Incoming/outgoing requests and accepted connections; accept, decline, cancel, block, report |
| `/goals` | Authenticated | Create, edit, pause, complete, and select active goals |

Add all four authenticated route prefixes to `PROTECTED_PREFIXES` in
`src/lib/supabase/middleware.ts`. Each page and API must still call `requireUser()` or
`requireProfile()`; middleware is navigation convenience, not the authorization boundary.

### Authentication and account flows

Implemented:

- Email/password signup in `src/components/auth-form.tsx`
- Name and full-name Auth metadata at signup
- Email confirmation redirect through `src/app/auth/callback/route.ts`
- Email/password login through `signInWithPassword`
- Confirmation instructions at `/auth/check-email`
- Cookie-based session refresh with `@supabase/ssr`
- Database profile provisioning in `supabase/migrations/006_auth_profile_name.sql`
- Application fallback profile provisioning in `src/lib/auth.ts`
- Logout in `src/components/auth/logout-button.tsx`

Missing or incomplete:

- There is no forgot-password request or password-update flow.
- There is no OAuth flow.
- `/auth/verify` is a redirect stub; the README's OTP description is stale.
- Middleware sets a login `next` parameter, but `src/components/auth-form.tsx` always routes
  successful login to `/dashboard`.
- `src/app/auth/callback/route.ts` accepts a `next` query parameter. Because it is passed into a
  URL constructor, constrain it to a same-origin path before relying on it for onboarding or
  deep links.
- Signup currently lands on `/dashboard`; 2.0 should route new or incomplete users to
  `/onboarding`, and returning complete users to `/discover`.

Add:

- `/auth/forgot-password` calling `resetPasswordForEmail` with a callback to a dedicated reset
  path.
- `/auth/reset-password` requiring a recovery session and calling `updateUser({ password })`.
- A small server-side onboarding-completion check based on the existence of at least one active
  goal with preferences and both offered/needed skill declarations.
- Safe handling of local `next` paths in login and callback.

### Profiles

`profiles` currently stores identity, public biography, username, photo URL, role/disabled state,
and trust/gamification fields. `src/components/profile-form.tsx` and
`src/app/api/profile/route.ts` edit only name, username, bio, and photo URL. Public Passport
rendering is reusable, but no current profile or related table stores goal-specific skills,
availability, language, or collaboration style.

Do not put goal-specific offered/needed skills directly on `profiles`. A person may offer a skill
for one goal and need it for another. Keep durable identity in `profiles`; attach intent to goals.

### Messaging and notifications

Messaging does not exist. `src/app/messages/page.tsx` only redirects; there are no conversation,
participant, or message tables, APIs, Realtime subscriptions, or message UI. Do not imply that an
accepted connection includes chat in MVP.

`notifications` exists in the base migration, but its enum has no goal/connection values and the
page passes no live items. For MVP, `/connections` can be the source of truth and connection
notifications can be added in the schema migration. Email/push delivery is a later concern.

### Vercel and environment configuration

- There is no `vercel.json` and no repository-level Vercel project configuration.
- `DEPLOY.md` describes manual Vercel import, environment variables, build, and smoke testing.
- `.env.example` includes Supabase URL, anonymous key, service-role key, and site URL.
- `next.config.ts` permits Supabase-hosted and Unsplash images.
- `DEPLOY.md` omits migration `006_auth_profile_name.sql` from its ordered list.
- No deployment was performed during this audit.

A `vercel.json` is not required for the MVP unless explicit redirects, headers, function limits,
or cron jobs are introduced. Prefer Next.js configuration for app redirects. Keep the service-role
key server-only, and do not use it in normal user requests to bypass RLS.

## Current Supabase state

### Migration inventory

| Migration | Main contents |
| --- | --- |
| `001_trueverse_schema.sql` | Profiles, trust interactions/events, negative reports/evidence/disputes, help requests/responses, notifications, admin audit, storage, base RLS |
| `002_trust_xp_reputation_dna.sql` | Trust level/DNA, XP, badges, achievements, profile extensions |
| `003_core_loop.sql` | Missions, activity events, streaks |
| `004_social_graph.sql` | Follows, appreciations, activity comments, XP leaderboard view |
| `005_passport.sql` | Verifications, Passport privacy preferences, integrity |
| `006_auth_profile_name.sql` | Signup profile name handling |

`supabase/seed.sql` contains placeholders only. No goal, skill, connection, block, chat, or
matching tables exist.

### Reusable database concepts

- `profiles` remains the identity anchor (`auth.users.id`).
- `help_requests` and `community_responses` demonstrate author-owned content and responses, but
  should not be renamed or overloaded as goals. Their semantics, policy, and deployed-data
  compatibility differ.
- `positive_interactions` can remain evidence of a completed collaboration. It is not a
  connection request and must not drive pre-consent discovery.
- `follows` can remain a one-way social signal. It is not mutual consent.
- `notifications`, `activity_events`, and `admin_actions` provide patterns for event and audit
  records.
- Existing negative reports and evidence are useful moderation infrastructure, but their
  evidence requirement and trust-score consequences make them inappropriate as the only way to
  report a profile, goal, or connection interaction.

### Existing RLS and security concerns

RLS is enabled on the current public tables, but the following issues must be verified and
remediated in a separate security migration before exposing new matching data:

1. `001_trueverse_schema.sql` defines only `public.is_admin(user_id uuid)`. Migrations 002–004
   call `public.is_admin()` with no argument in policies and triggers. A fresh migration run is
   expected to fail unless the live database has an untracked overload.
2. Several `SECURITY DEFINER` functions authorize caller-supplied UUID parameters rather than
   checking `auth.uid()`: interaction accept/reject and admin/trust operations. Direct RPC access
   may permit impersonation if execute grants remain available.
3. `apply_trust_delta` has no caller authorization in its body.
4. The recipient update policy on `positive_interactions` permits broad row updates rather than
   limiting clients to a narrow accept/reject operation.
5. `profiles`, `reputation_dna`, follows, verifications, and several social records are globally
   readable. Passport privacy toggles are not consistently enforced by database read policy.
6. `help_requests` uses `using (true)`, including closed requests and content from disabled
   authors.
7. Existing profile, feed, follow, and report policies do not account for blocks.
8. The report-evidence storage insert policy validates the uploader folder but does not require
   an existing report record at upload time.
9. Legacy `trust_score` and newer `trust_index` can diverge; neither should be a primary matching
   score.

Do not copy these policy patterns into 2.0 without correction. New definer functions must revoke
default execution, grant only required roles, derive the actor from `auth.uid()`, use an explicit
`search_path`, and test unauthorized direct PostgREST/RPC calls.

## Reuse, hide, and add

### Reuse and extend

- Auth/session factories and guards: `middleware.ts`, `src/lib/supabase/*`, `src/lib/auth.ts`
- Signup, login, confirmation, logout: `src/components/auth-form.tsx`, `src/app/auth/*`
- Identity/profile editing and public slugs: `src/app/profile/page.tsx`,
  `src/components/profile-form.tsx`, `src/app/api/profile/route.ts`, `src/app/u/[username]`
- App shell, theme, responsive layout, and UI primitives:
  `src/components/layout/app-shell.tsx`, `src/components/ui/*`, `src/app/globals.css`
- API validation/error conventions: `src/lib/api.ts`, `src/lib/validators.ts`
- Trust level and verification as optional context on a candidate card, with the existing
  non-guarantee disclaimer
- Existing admin report queue and audit concepts for moderation

### Hide or de-emphasize without deleting

- Remove `/dashboard`, `/community`, `/activity`, `/missions`, `/badges`, and `/leaderboards`
  from primary member navigation.
- Keep Trust Acts accessible as a secondary, post-collaboration flow.
- Keep `/messages` and `/insights` hidden while they are redirects.
- Do not display dummy community/person data in discovery.
- Do not use XP, streaks, leaderboards, follows, trust score, or Passport DNA as the primary
  candidate ranking.
- Hide the demo-only live-user share path until it reads Supabase data.
- Gate or omit `/design-system` from production navigation.

Routes and tables remain intact. Hiding is a navigation/product decision, not deletion.

### Add

- Goal onboarding and management
- Goal-scoped offered/needed skills
- Goal-scoped collaboration preferences
- Explainable computed discovery
- Mutual connection request lifecycle
- Blocking and lightweight safety reporting
- Connection notifications
- Password reset
- Tests for matching, consent transitions, privacy, and RLS

## Proposed minimal schema

Create new forward-only migrations after first reconciling the existing migration chain. Do not
edit an already-applied migration to fix production; add corrective migrations. Names below are
proposed and can be finalized against the live migration history.

### `goals`

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Goal identity |
| `owner_id` | `uuid not null references profiles(id) on delete cascade` | Owner |
| `title` | `text`, 4–120 chars | Specific outcome |
| `description` | `text`, 20–1500 chars | Context and success definition |
| `kind` | constrained text: `build`, `launch`, `learn` | Initial audience/use case |
| `topics` | `text[] not null default '{}'` with length/count limits | Lightweight goal compatibility |
| `status` | constrained text: `active`, `paused`, `completed`, `archived` | Lifecycle |
| `visibility` | constrained text: `discoverable`, `private` | Discovery consent |
| `target_date` | `date null` | Optional timing |
| `created_at`, `updated_at` | `timestamptz` | Audit |

Limit the number of active goals per user in the application and, if required, with a transaction
safe database function. Index `(owner_id, status)` and active discoverable goals. Do not expose
private goals through public profile or discovery queries.

### `skills`

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `id` | `uuid primary key` | Skill identity |
| `slug` | `citext unique not null` | Stable normalized key |
| `name` | `text unique not null`, 2–60 chars | Display label |
| `is_active` | `boolean not null default true` | Controlled vocabulary lifecycle |
| `created_at` | `timestamptz` | Audit |

Seed a deliberately small curated vocabulary for startup, side-project, and learning skills.
Do not let clients create arbitrary canonical skills. Add an admin-reviewed alias/import path
later if free-text demand warrants it.

### `goal_skills`

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `goal_id` | `uuid references goals(id) on delete cascade` | Goal |
| `skill_id` | `uuid references skills(id)` | Skill |
| `direction` | constrained text: `offer`, `need` | Complement signal |
| `level` | constrained text: `learning`, `working`, `expert` | Optional ranking/explanation input |
| primary key | `(goal_id, skill_id, direction)` | Prevent duplicates |

This junction table is preferable to arrays because it preserves referential integrity and makes
complement queries/indexing straightforward. Index `(skill_id, direction, goal_id)`.

### `collaboration_preferences`

One row per goal:

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `goal_id` | `uuid primary key references goals(id) on delete cascade` | Goal |
| `hours_per_week` | `smallint`, 1–40 | Availability |
| `timezone` | `text`, IANA zone | Scheduling context |
| `languages` | `text[]`, 1–5 normalized BCP 47 codes | Shared communication language |
| `work_mode` | constrained text: `remote`, `local`, `either` | Location expectation |
| `collaboration_style` | constrained text array or junction: `async`, `scheduled`, `pairing`, `accountability` | Desired style |
| `meeting_cadence` | constrained text: `flexible`, `weekly`, `multiple_weekly` | Coordination fit |
| `location_text` | `text null`, max 120 | MVP local-match hint; not exact coordinates |
| `created_at`, `updated_at` | `timestamptz` | Audit |

Use arrays only for the small, closed language/style sets in MVP and add GIN indexes if query
plans require them. Never store exact home addresses. Timezone and coarse location are visible to
eligible authenticated users only.

### `connection_requests`

An accepted request is the MVP connection record; a separate `connections` table is unnecessary
until connections need independent lifecycle or team membership.

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `id` | `uuid primary key` | Request identity |
| `requester_id` | `uuid references profiles(id)` | Sender |
| `recipient_id` | `uuid references profiles(id)` | Recipient |
| `requester_goal_id` | `uuid references goals(id)` | Sender's context |
| `recipient_goal_id` | `uuid references goals(id)` | Target discovery context |
| `note` | `text`, max 500 | Why connect |
| `proposed_first_action` | `text`, 4–280 chars | Concrete next step |
| `status` | constrained text: `pending`, `accepted`, `declined`, `canceled`, `expired` | Consent state |
| `responded_at`, `created_at`, `updated_at`, `expires_at` | timestamps | Lifecycle |

Constraints must prevent self-requests, require each goal to belong to its corresponding user,
and prevent duplicate pending requests for the same directed goal pair. Use a transaction-safe
RPC for create/accept/decline/cancel. The RPC derives the actor from `auth.uid()`, checks blocks,
active profiles, active/discoverable goals, and valid transitions. Only the recipient can accept
or decline; only the requester can cancel. Acceptance is explicit and must never be inferred from
a follow, profile view, recommendation, or reciprocal pending request.

### No `match_recommendations` table for MVP

Compute discovery at request time from current active goals, skills, preferences, blocks, and
connection state. This avoids stale records, invalidation work, and unnecessary disclosure of
rankings. Return:

- candidate profile and goal fields allowed for discovery
- total score
- bounded score components
- plain-language reasons such as “Offers TypeScript, which you need”

Add short-lived server-side caching only after measuring query cost. Consider a materialized
recommendation table later only if query latency or candidate volume requires asynchronous
precomputation. If added, it must have expiry, reason components, owner-only RLS, and invalidation
on goal/preference/block changes.

### `user_blocks`

| Column | Type/constraint | Purpose |
| --- | --- | --- |
| `blocker_id` | `uuid references profiles(id)` | Acting user |
| `blocked_id` | `uuid references profiles(id)` | Hidden user |
| `created_at` | `timestamptz` | Audit |
| primary key | `(blocker_id, blocked_id)` | One directional block |

No self-blocks. A block takes effect in both directions for discovery and interaction: neither
party sees the other's discoverable goals or can create/accept connection requests. Existing
pending requests between them are canceled in the same transaction. Do not notify the blocked
user. The blocker can list and remove their own blocks; the blocked user cannot query who blocked
them.

### `safety_reports`

Keep this separate from `negative_reports` so a report does not automatically become a trust-score
event and does not require evidence.

Minimum fields: `id`, `reporter_id`, `reported_user_id`, optional `goal_id`, optional
`connection_request_id`, constrained `category`, `details`, optional `evidence_url`, moderation
`status`, `reviewed_by`, `reviewed_at`, and timestamps. RLS permits insert and own-report read for
the reporter; it does not expose the report to the reported user. Admins review through explicit
policies/RPCs and audited actions. Reporting does not automatically block; offer “report and
block” as a clear combined UI action.

## Computed matching rules

### Eligibility filters

Exclude a candidate before scoring when:

- candidate is the current user
- either profile is disabled
- either goal is not active and discoverable
- either user has blocked the other
- there is already an accepted connection or relevant pending request
- there is no shared language
- the requesting user does not own the selected source goal

Do not expose candidates' email addresses, exact location, private goals, private preferences,
block state, declined requests, or internal moderation/trust data.

### Initial explainable score

Use a deterministic 0–100 score:

| Component | Weight | Initial rule |
| --- | ---: | --- |
| Complementary skills | 40 | Up to 25 for candidate offers matching source needs; up to 15 for reciprocal offer/need matches |
| Compatible goals | 25 | Same or adjacent `kind`, overlapping topics, and compatible target timing |
| Availability | 15 | Similar weekly commitment and feasible timezone/cadence overlap |
| Language | 10 | At least one required shared language; extra shared language adds no large advantage |
| Collaboration style | 10 | Work mode, cadence, and style overlap |

Use Jaccard-style overlap or capped counts so users cannot increase rank by selecting every tag.
Require at least one meaningful skill complement or strongly compatible goal; do not rank on
trust/XP popularity. Apply stable tie-breaking, such as score then recent goal activity then goal
ID, and paginate with a cursor.

Every result should show two or three reasons and a “Why this match?” explanation. Copy must say
“recommended based on your goals and preferences,” never “AI-approved,” “perfect match,” or
“guaranteed compatible.” Measure request acceptance and meaningful first actions, not merely card
clicks.

## Consent, privacy, safety, access control, and RLS

### Mutual consent

- Discovery is not contact permission.
- Sending a request reveals only the sender's selected discoverable goal, profile summary, note,
  and proposed first action.
- The recipient explicitly accepts or declines.
- Only acceptance creates a connection and unlocks any mutually permitted contact/action detail.
- Decline is private; the sender sees only the terminal status, not a reason unless the recipient
  chooses to provide one.
- Rate-limit requests and prevent repeated requests after decline for a cooling-off period.
- A user can cancel a pending outgoing request and disconnect later. Add an independent
  connection lifecycle table when disconnect/history requirements are implemented.

### Privacy

- Default new goals to `private` while editing; the user explicitly makes them `discoverable`.
- Discovery requires authentication.
- Public Passport does not automatically expose goals, availability, languages, or connection
  status.
- Store coarse location only for MVP, never an exact home/work address.
- Email stays private. Only expose user-entered contact details after acceptance, if this is added.
- Honor profile and goal visibility in database policy, not only in React.
- Provide pause/archive controls that immediately remove a goal from computed discovery.
- Define retention for declined/expired requests and reports before launch.

### Blocking and reporting

- Block checks apply in both directions to goal reads, discovery, request creation/acceptance, and
  future messaging.
- A block must not reveal itself through a special error. Return a generic unavailable result.
- Reports are private to reporter and moderators; reporting alone does not signal guilt or alter
  reputation.
- Preserve evidence, admin audit, dispute, and fairness principles from the existing moderation
  system, but do not force users to provide evidence before they can report harassment or spam.
- Add abuse controls for request volume, repeated declines, and duplicate reports. Replace the
  in-memory limiter with a shared durable limit before meaningful public scale.

### RLS matrix for new tables

| Table | Select | Insert | Update/delete |
| --- | --- | --- | --- |
| `goals` | Owner sees all; authenticated eligible users see active discoverable, non-blocked goals | Owner only, active profile | Owner only; system fields protected |
| `skills` | Authenticated read of active catalog | Admin/service workflow only | Admin/service workflow only |
| `goal_skills` | Follows visibility of parent goal | Parent goal owner only | Parent goal owner only |
| `collaboration_preferences` | Owner sees all; discovery exposes only approved fields for eligible goals | Parent goal owner only | Parent goal owner only |
| `connection_requests` | Requester and recipient only; admin only when required for a report | Authenticated requester through checked RPC | State transitions through checked RPC only |
| `user_blocks` | Blocker only | Blocker only, `blocker_id = auth.uid()` | Blocker only |
| `safety_reports` | Reporter and authorized moderators only | Reporter only | Moderator-only state changes; reporter may append evidence under strict rules |

Prefer direct owner CRUD under RLS for goals/preferences and narrow RPCs for multi-row consent,
block, and moderation transitions. Add SQL policy tests using two normal users, a blocked pair,
a disabled user, and an admin. Test direct table and direct RPC access, not only Next.js APIs.

## Specific files to modify during implementation

### Existing files

- `PRODUCT_BIBLE.md`: formally revise the canonical mission, personas, core loop, navigation,
  privacy, matching claims, and success metrics before changing product behavior.
- `README.md`: update architecture, route map, Auth behavior, and verification commands.
- `DEPLOY.md`: add migration 006 and future 2.0 migrations; update smoke tests and redirects.
- `.env.example`: add only genuinely required server-side configuration; no new secret is needed
  for deterministic matching.
- `src/app/layout.tsx`: update title/description; decide whether analytics ID becomes environment
  configuration.
- `src/app/page.tsx`: replace trust-first landing content and CTAs.
- `src/components/layout/app-shell.tsx`: replace primary navigation with Discover, Connections,
  Goals, and Profile while preserving the marketing/app shell split.
- `src/lib/supabase/middleware.ts`: protect `/onboarding`, `/discover`, `/connections`, `/goals`;
  update authenticated Auth redirects.
- `src/components/auth-form.tsx`: route incomplete users to onboarding and honor a safe `next`.
- `src/app/auth/callback/route.ts`: validate local redirects and apply onboarding destination.
- `src/app/auth/login/page.tsx`: add forgot-password link.
- `src/lib/auth.ts`: add onboarding-completion helpers without trusting client claims.
- `src/lib/types.ts`: add goal, preference, skill, request, block, report, and discovery result
  types (prefer generated Supabase types once available).
- `src/lib/validators.ts`: add bounded schemas for all 2.0 writes.
- `src/lib/rate-limit.ts`: replace or supplement with durable shared enforcement before launch.
- `src/components/profile-form.tsx` and `src/app/api/profile/route.ts`: only add durable identity
  fields if needed; do not store goal-specific intent here.
- `src/app/notifications/page.tsx` and its component: wire connection events if included in MVP.
- `next.config.ts`: add redirects only if the route transition requires them.

### New application files

- `src/app/onboarding/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/connections/page.tsx`
- `src/app/goals/page.tsx`
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/app/api/discover/route.ts`
- `src/app/api/connections/route.ts`
- `src/app/api/connections/[id]/route.ts`
- `src/app/api/blocks/route.ts`
- `src/app/api/reports/route.ts`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/components/goals/*`
- `src/components/discovery/*`
- `src/components/connections/*`
- `src/lib/matching.ts` for score component types/explanations and pure tests; keep authoritative
  candidate eligibility in SQL/RLS

API route names may be adjusted to use Server Actions, but one authorization/validation path must
remain authoritative rather than duplicating transition rules.

### New migrations and tests

Proposed forward-only files:

- `supabase/migrations/007_security_baseline_fixes.sql`
- `supabase/migrations/008_trueverse_2_goals_matching.sql`
- `supabase/migrations/009_trueverse_2_safety_connections.sql`

Before choosing these numbers, compare the repository with the live Supabase migration ledger.
Add SQL tests under a project-standard Supabase test directory and application unit/integration
tests after selecting a test runner. The current repository has no test script or CI workflow.

## Ordered implementation sequence

1. **Approve the new product contract.** Revise `PRODUCT_BIBLE.md`; decide whether trust Passport
   remains a secondary differentiator, finalize onboarding fields, and define MVP success events.
2. **Verify deployed state.** Compare live migrations, functions, grants, RLS, Auth redirect URLs,
   environment variables, and Vercel settings with the repository. Back up before any migration.
3. **Repair the security baseline.** Add a forward migration that resolves `is_admin` signatures,
   binds definer functions to `auth.uid()`, revokes unsafe execute grants, narrows interaction
   updates, and adds regression tests.
4. **Add the 2.0 schema.** Create goals, skills, goal skills, preferences, requests, blocks,
   safety reports, indexes, triggers, and RLS. Seed only the curated skill catalog.
5. **Test access before UI.** Prove owner, candidate, participant, blocked, disabled, anonymous,
   and admin cases through direct SQL/PostgREST-equivalent tests.
6. **Build goal APIs and `/goals`.** Implement private draft creation first, then explicit
   discoverable activation and lifecycle management.
7. **Build `/onboarding`.** Collect one actionable goal, at least one offered skill, at least one
   needed skill, availability, language, and collaboration style. Resume partial drafts safely.
8. **Build computed discovery.** Implement eligibility, deterministic scoring, explanations,
   pagination, and query-plan checks. Add unit fixtures for all score components and block/privacy
   exclusions.
9. **Build `/connections`.** Add send, accept, decline, cancel, expiration, proposed first action,
   block, and report flows with atomic state transitions.
10. **Update navigation and Auth destinations.** Make the five requested routes the visible MVP
    journey; preserve legacy pages as hidden/deep-linked routes without deletion.
11. **Add password reset and live notifications.** Verify recovery-session handling and connect
    accepted/request events to the notification surface if included for launch.
12. **Rewrite landing and documentation.** Update metadata, README, deployment guide, disclaimers,
    and privacy/safety copy. Remove stale OTP and migration-order claims.
13. **End-to-end verification.** Test two-user consent, blocked pairs, private/paused goals,
    disabled users, report privacy, mobile navigation, accessibility, direct RLS bypass attempts,
    and Vercel preview behavior.
14. **Controlled rollout.** Apply reviewed migrations through the normal deployment process,
    monitor errors/abuse/query latency, and retain a route-level feature flag for discovery.

## Risks and open decisions

### High risk

- Existing migration signature and definer-function authorization issues could undermine all new
  RLS assumptions.
- Repository migrations may not match the live project; editing old SQL or blindly pushing could
  break production.
- Existing globally readable profile/social data conflicts with a privacy-first discovery model.
- Dummy data and APIs that fall back to demo success can make a non-working social action appear
  successful; 2.0 actions must fail honestly.
- `PRODUCT_BIBLE.md` currently declares a different canonical mission and navigation. The pivot
  requires an explicit revision rather than silent implementation drift.

### Medium risk

- Skill taxonomy quality determines matching quality; uncontrolled free text will fragment
  matches, while an overly small list will frustrate users.
- Availability and collaboration style are self-reported and can become stale.
- A deterministic query is explainable but needs indexes and query-plan testing as active goals
  grow.
- Lack of durable rate limiting invites request/report spam on serverless infrastructure.
- Public Passport privacy and discovery privacy can diverge unless one database-level visibility
  contract is defined.

### Product decisions required before schema lock

- Can a user have multiple simultaneously discoverable goals?
- Is a shared language a hard requirement or can a user opt into translation?
- Is local collaboration in MVP, and if so what coarse location granularity is acceptable?
- Does acceptance reveal contact information, an external link, or only the agreed first action?
- How long are pending, declined, expired, and disconnected records retained?
- Is disconnect needed at MVP launch? If yes, add a first-class `connections` table now.
- Which report categories and moderation service levels are promised?
- Which curated skills and topic vocabulary ship for the three initial audience segments?

## MVP acceptance criteria

- A new user can sign up, confirm email, complete onboarding, and manage an active goal.
- A user can keep a draft/private goal that never appears in discovery.
- Discovery returns only eligible, non-blocked, active users and gives understandable reasons.
- Skill complement, goal compatibility, availability, language, and style each affect tested
  ranking components.
- A connection exists only after recipient acceptance.
- Every request includes a proposed concrete first action.
- Blocking immediately removes both parties from discovery and prevents request transitions
  without revealing block ownership.
- Reports are private, auditable, and do not automatically penalize the reported user.
- Direct database access cannot read private goals/preferences/requests or perform another user's
  state transition.
- Product copy explicitly says recommendations do not guarantee compatibility or safety.
- Existing pages and tables remain present; the MVP changes navigation and adds forward-only
  structures rather than deleting production assets.
