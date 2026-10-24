# Trueverse 2.0 repository audit and implementation plan

## Scope and constraints

This document audits the current `main` branch as the starting point for the Trueverse 2.0 pivot:

> Trueverse connects people based on what they want to accomplish next.

The initial audience is people building side projects, launching startups, and learning useful
skills. This is a plan only. No existing page or table was deleted, no production data was read or
changed, no migration was executed, and no deployment was performed.

The current `PRODUCT_BIBLE.md` says it is canonical and defines Trueverse as a portable digital
trust product. That conflicts materially with the new goals-and-collaboration vision. The product
bible should be revised and approved before feature implementation so future work does not have two
competing product definitions. Existing trust and moderation capabilities can remain available, but
they should not determine or imply compatibility.

## 1. Current repository state

### Branch and worktree

- Audited starting branch: `main`, tracking `origin/main`.
- The worktree was clean at the start of the audit.
- Application version: `0.1.0`.
- There are no existing automated test files or CI workflows.

### Application framework

- Next.js 16 App Router, React 19, and strict TypeScript.
- Tailwind CSS 4, shadcn/Radix primitives, Framer Motion, Lucide icons, and `next-themes`.
- Supabase Auth and Postgres through `@supabase/ssr` and `@supabase/supabase-js`.
- Zod validates the existing API payloads.
- Available scripts are `dev`, `build`, `start`, and `lint`; there is no test or dedicated
  type-check script.
- `src/app/layout.tsx` mounts one global `AppShell` and has a hard-coded Google Analytics ID.
- `src/components/layout/app-shell.tsx` provides the reusable responsive header and four-item
  member navigation.

### Current page routes

| Route | Current state | Data source / access |
| --- | --- | --- |
| `/` | Portable-trust landing page | Public |
| `/auth/login` | Email/password login | Public; authenticated users redirect to `/dashboard` |
| `/auth/signup` | Email/password signup with name metadata | Public |
| `/auth/check-email` | Email-confirmation instructions | Public |
| `/auth/callback` | Exchanges an email-link code for a session | Public |
| `/auth/verify` | Stub that redirects to login | Public |
| `/dashboard` | Trust, XP, streak, and missions home | Protected; mixed live and dummy data |
| `/profile` | Profile editor and owner Passport | Protected; profile and XP are live |
| `/u/[username]` | Public Passport | Public; dummy-first with partial live fallback |
| `/u/[username]/share` | Share/QR Passport | Public; dummy profiles only |
| `/interactions` and children | Trust Act and report workflows | Protected; live |
| `/community` | People, help, and activity UI | Protected; primarily dummy data |
| `/activity`, `/missions`, `/badges` | Beta engagement surfaces | Protected; dummy data |
| `/notifications` | Empty notification center | Protected; table is not queried |
| `/leaderboards` | Demo leaderboard | Public because it is not in protected prefixes |
| `/admin` | Report moderation | Page-level admin guard |
| `/feed` | Redirects to `/community` | Legacy |
| `/messages`, `/insights` | Redirect to `/dashboard` | Deferred |
| `/design-system` | Component gallery | Public |

The global member navigation currently links to `/dashboard`, `/profile`, `/community`, and
`/notifications`. It has no concept of onboarding, goals, discovery, or mutual connections.

### Current API routes

- `GET/PATCH /api/profile`: owner profile read/update.
- `POST /api/interactions/positive` and accept/reject children: Trust Acts.
- `POST /api/interactions/negative`: evidence-backed user reports.
- `GET/POST /api/feed` and `POST /api/feed/[id]/responses`: help requests.
- `POST/DELETE /api/social/follow`: asymmetric following.
- `POST /api/social/appreciate` and `GET/POST /api/social/comments`: social activity.
- `PATCH /api/admin/reports/[id]` and `GET /api/admin/users`: moderation.

There are no goal, discovery, block, connection, or direct-message endpoints.

### Authentication and account lifecycle

Implemented:

- Email/password signup and login in `src/components/auth-form.tsx`.
- Signup passes `name` and `full_name` to Supabase Auth metadata.
- Email confirmation through `/auth/check-email` and `/auth/callback`.
- Session refresh and protected-prefix checks in `middleware.ts` and
  `src/lib/supabase/middleware.ts`.
- Profile provisioning through the Auth trigger in
  `supabase/migrations/006_auth_profile_name.sql`.
- Server helpers for required users, profiles, and admins in `src/lib/auth.ts`.

Missing or incorrect:

- There is no forgot-password request or password-reset completion route.
- OTP/magic-link verification is not implemented even though `README.md` says it is;
  `/auth/verify` is only a redirect and `otpVerificationSchema` is unused.
- The login page receives `?next=`, but `AuthForm` always sends a successful login to
  `/dashboard`.
- `/auth/callback` accepts a `next` value without restricting it to a same-origin relative path;
  this should be fixed before relying on post-auth redirects.
- Disabled accounts are checked in several database functions but are not rejected globally by
  middleware.

### Profiles and messaging

- `profiles` is the Auth-linked identity table. The owner can edit name, username, bio, and a
  photo URL.
- Avatar Storage policies exist, but the app does not implement an upload flow.
- The owner Passport is partly live; public Passport rendering still mixes live profile fields
  with fictional data and fixed privacy values.
- `passport_privacy` and `profile_verifications` exist but are not wired into the public profile.
- There is no user-to-user messaging schema or UI. `/messages` explicitly redirects away.
  `community_responses.message` and activity comments are not private messages.

### Vercel and runtime configuration

- There is no `vercel.json`.
- `next.config.ts` only configures remote images from Supabase and Unsplash.
- `DEPLOY.md` documents a manual Vercel import, environment variables, migrations, and smoke test.
- Required environment variables are documented in `.env.example`.
- `SUPABASE_SERVICE_ROLE_KEY` has a helper in `src/lib/supabase/admin.ts`, but the app does not use
  it.
- The in-memory rate limiter in `src/lib/rate-limit.ts` is per process and therefore is not a
  reliable global limit across Vercel instances.

## 2. Current Supabase model and access control

### Migration inventory

| Migration | Main objects |
| --- | --- |
| `001_trueverse_schema.sql` | Profiles, Trust Acts, reports/evidence/disputes, help requests, responses, admin audit, notifications, Storage, RLS |
| `002_trust_xp_reputation_dna.sql` | Trust index/level, reputation DNA, XP, badges, achievements |
| `003_core_loop.sql` | Missions, activity events, streaks |
| `004_social_graph.sql` | Follows, appreciations, comments, XP leaderboard view |
| `005_passport.sql` | Profile verifications, Passport privacy, Passport defaults |
| `006_auth_profile_name.sql` | Updated Auth profile trigger using signup name metadata |

The database has no goals, offered/needed skills, collaboration preferences, match
recommendations, mutual connection requests, user blocks, conversations, or direct messages.
`supabase/seed.sql` contains placeholders rather than actual seed records.

### Existing RLS and security findings

RLS is enabled on every current public table. Existing policies generally use owner, participant,
or admin checks, and private report evidence is stored in a non-public bucket. Those patterns are
useful, but the following issues should be addressed before exposing new discovery data:

1. The active-profile SELECT policy allows the entire `profiles` row to be read publicly,
   including `email`. Discovery must return an explicit safe field list and must not expose email.
2. Policies in migrations 002–004 call `public.is_admin()` with no argument, while migration 001
   defines only `public.is_admin(user_id uuid)`. These policies need a corrective migration using
   `public.is_admin(auth.uid())`.
3. Several security-definer functions do not explicitly revoke default `PUBLIC` execute access.
   Privileges and caller checks should be made explicit, especially for trust, XP, and admin
   mutation functions.
4. A recipient can directly update a pending positive interaction under the current RLS policy,
   bypassing the accept/reject RPC audit path.
5. The old `trust_score` mutation path does not update the newer `trust_index`/`trust_level`, so
   displayed reputation can diverge from the trust ledger.
6. Existing report rows are visible to both the reporter and reported user. The pivot needs a
   documented moderation/disclosure policy to avoid retaliation while preserving a fair contest
   path.
7. Social APIs can return a demo success after a database error, which would be unacceptable for
   connection or block writes.

These are pre-existing findings. The 2.0 work should correct them additively in new migrations,
not rewrite already-applied migration files.

## 3. Reuse, hide, and add

### Reuse

- `src/app/layout.tsx`, `src/app/globals.css`, design tokens, theme provider, motion primitives,
  and `src/components/ui/*`.
- The responsive structure in `src/components/layout/app-shell.tsx`, with a new navigation model.
- Supabase browser/server/middleware clients in `src/lib/supabase/*`.
- `requireUser`, `requireProfile`, profile provisioning, and admin guards in `src/lib/auth.ts`.
- Email/password signup, login, email confirmation, and callback after redirect hardening.
- `profiles` for identity and public display fields; do not create a second user table.
- Existing profile editor and avatar component, separated from Passport-specific positioning.
- Existing `negative_reports`, `report_evidence`, disputes, admin audit, and `/admin` moderation as
  the base reporting workflow.
- `notifications` and `NotificationCenter` for connection-request and acceptance events after
  adding new notification types and live queries.
- Zod/API error patterns and owner/participant/admin RLS conventions.

### Hide from the new primary experience, without deleting

- Remove `/dashboard`, `/community`, `/notifications`, and `/profile` from the primary 2.0
  navigation. Profile/settings can remain reachable from the session menu.
- Keep `/activity`, `/missions`, `/badges`, `/leaderboards`, `/interactions`, `/feed`,
  `/insights`, `/messages`, `/u/*`, `/admin`, and `/design-system` as preserved deep routes or
  internal surfaces, but do not market them as the 2.0 core loop.
- Isolate `src/lib/dummy-data.ts` and do not use it on `/onboarding`, `/discover`,
  `/connections`, or `/goals`.
- Keep Passport/trust components available for later product decisions, but do not use trust
  level as a compatibility score or ranking boost.

### Add

- Goal creation and management.
- Offered and needed skills attached to each goal.
- Goal-specific collaboration preferences, availability, and languages.
- Explainable, computed discovery ranking.
- Mutual connection requests and accepted connections.
- A required proposed first action with each request.
- Blocking and report entry points on discovery and connection surfaces.
- Privacy-safe profile cards and discovery queries.
- Password reset and safe post-auth redirects.
- Automated schema/RLS tests plus route-level validation tests.

## 4. Proposed MVP routes

| Route | Access | Purpose and first release behavior |
| --- | --- | --- |
| `/` | Public | Replace the trust-first message with goal-first positioning, examples for build/launch/learn, and signup/login CTAs. Do not show member discovery data. |
| `/onboarding` | Authenticated | Create the first goal, mark skills offered/needed, set collaboration style, availability, timezone, and languages. Save a draft locally in the form; commit atomically at the final step. Existing members with an active goal redirect to `/discover` unless explicitly editing. |
| `/discover` | Authenticated + onboarded | Choose one active goal and view privacy-safe candidate cards, score explanations, filters, dismiss/block/report actions, and a connection-request CTA. No email, private notes, pending reports, or exact availability windows are exposed. |
| `/connections` | Authenticated + onboarded | Separate received, sent, and accepted states. Only the recipient can accept/decline; only the requester can cancel. Accepted rows expose the proposed first action and a small set of next-step templates. Messaging remains out of scope for the first MVP. |
| `/goals` | Authenticated | List, create, edit, pause, complete, archive, and select active goals. Prefer soft status changes to destructive deletion once a goal has connection history. |

Recommended 2.0 primary navigation: Discover, Connections, Goals, and Profile/Settings. On mobile,
use three bottom tabs plus the existing session avatar rather than filling every available slot.

Post-auth flow:

1. New signup confirms email.
2. Login/callback redirects to a validated local path when provided.
3. Otherwise, a user with no active goal goes to `/onboarding`.
4. A user with an active goal goes to `/discover`.

## 5. Minimal additive data model

Use new migrations; do not edit migration 001–006 in place.

### `goals`

One user may have multiple goals, but discovery operates on one selected active goal at a time.

| Column | Notes |
| --- | --- |
| `id uuid primary key` | Generated UUID |
| `owner_id uuid not null` | FK to `profiles(id)` |
| `title text not null` | Specific outcome, 8–120 characters |
| `description text not null` | Context and success definition, up to about 1,000 characters |
| `goal_kind text not null` | Constrained initial values: `build`, `launch`, `learn`, `other` |
| `category text not null` | Controlled slug such as `software`, `design`, `marketing`, `business`, `data`, `language` |
| `status text not null` | `draft`, `active`, `paused`, `completed`, `archived` |
| `visibility text not null` | `discoverable` or `private`; default `private` until onboarding finishes |
| `target_date date null` | Optional, coarse planning signal |
| `created_at`, `updated_at` | Timestamps |

Add indexes on `(owner_id, status, updated_at desc)` and discoverable active
`(category, updated_at desc)`. Do not store contact details or sensitive private notes in this
table.

### `skills` and `goal_skills`

Use a small canonical skill catalog rather than free-text arrays so complementary overlap can be
indexed and explained.

`skills`:

- `id uuid primary key`
- `name citext not null`
- `slug citext unique not null`
- `category text null`
- `is_active boolean not null default true`

`goal_skills`:

- `goal_id uuid not null` FK to `goals`
- `skill_id uuid not null` FK to `skills`
- `relationship text not null check (relationship in ('offer', 'need'))`
- `proficiency text null check (proficiency in ('beginner', 'intermediate', 'advanced'))`
- primary key `(goal_id, skill_id, relationship)`

Onboarding should search the canonical catalog and allow a moderated “suggest a skill” path later;
it should not silently create duplicate spellings from clients.

### `collaboration_preferences`

Make preferences goal-specific because availability and desired working style can differ by goal.

- `goal_id uuid primary key` FK to `goals`
- `styles text[] not null` constrained to initial values such as `co_build`,
  `accountability`, `mentor`, `peer_learning`, and `advice`
- `availability_slots text[] not null` using coarse values such as `weekday_day`,
  `weekday_evening`, and `weekend`
- `hours_per_week smallint not null check (hours_per_week between 1 and 40)`
- `timezone text not null` using an IANA zone
- `languages text[] not null` using normalized BCP-47 language tags
- `work_mode text not null check (work_mode in ('remote', 'local', 'either'))`
- `communication_cadence text not null` such as `async`, `weekly`, or `multiple_weekly`
- `updated_at timestamptz not null`

Only coarse availability and overlap explanations should be shown. Exact calendars and timezone
need not be revealed.

### Match recommendations: compute, do not store

Do not create a `match_recommendations` table for the MVP. A recommendation is derived from mutable
goals, skills, preferences, blocks, and connection state; storing it would create stale rows and a
second source of truth.

Implement a stable database function such as
`discover_goal_matches(source_goal_id uuid, result_limit int, result_offset int)` that:

- verifies `auth.uid()` owns the source goal;
- considers only other active, discoverable goals and active profiles;
- removes either-direction blocks;
- removes already pending or accepted connection pairs;
- returns only an explicit safe profile/goal field list;
- returns component scores and short reason codes, not a compatibility claim;
- uses a fixed maximum page size and deterministic tie-breaker;
- is granted only to `authenticated`.

If usage later makes computation too expensive, use a short-lived materialized candidate cache
with `source_goal_id`, `candidate_goal_id`, score components, `computed_at`, and expiry. Do not add
that complexity until query measurements justify it.

### `connection_requests`

An accepted request is the MVP connection record; a second `connections` table is unnecessary
until the relationship has independent lifecycle data.

- `id uuid primary key`
- `requester_id uuid not null` and `recipient_id uuid not null`, both FKs to `profiles`
- `requester_goal_id uuid not null` and `recipient_goal_id uuid not null`, both FKs to `goals`
- `intro_message text not null` with a modest length limit
- `proposed_first_action text not null` (for example, a 20-minute call, repo review, or one-week
  milestone)
- `status text not null check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired'))`
- `responded_at`, `accepted_at`, `created_at`, `updated_at`
- no-self constraint
- trigger/RPC checks that each user owns the corresponding goal
- unique partial index preventing a second pending or accepted request for the same unordered user
  pair

All state transitions should go through narrow RPCs or route handlers:

- requester sends or cancels;
- recipient accepts or declines;
- neither party can rewrite participants, goals, or the original request after send;
- acceptance inserts notifications in the same transaction.

### `user_blocks`

Blocking is required before discovery launches:

- `blocker_id uuid not null`
- `blocked_id uuid not null`
- `created_at timestamptz not null`
- primary key `(blocker_id, blocked_id)` and no-self constraint

The blocker alone can read, create, or remove the row. The blocked person must not be able to query
who blocked them. A block immediately excludes both directions from discovery, prevents new
requests, and makes pending requests non-actionable. Whether an existing accepted connection is
marked cancelled or merely hidden should be one atomic server-side policy; marking it cancelled is
the safer MVP default.

### Reporting

Reuse the existing moderation system rather than create an unconnected second queue:

- add optional `source_context` and `source_id` fields to `negative_reports` so a report can point
  to a discovery card or connection request;
- add `/api/safety/reports` as a clearer 2.0 boundary while reusing the table and admin queue;
- allow evidence attachments, but do not require an external evidence URL for every discovery
  concern;
- rate-limit reports with a shared store rather than process memory;
- keep reports and evidence out of discovery and connection queries;
- define when and how the reported person is notified, what is disclosed, and how they contest a
  reviewed action.

Submitting a report should not automatically alter trust, matching, or account access. Existing
admin review and dispute rules should continue to control consequential action.

## 6. Initial matching rules

Use deterministic, explainable rules in SQL for the first release. Do not describe the result as an
AI decision and do not claim it guarantees compatibility.

### Eligibility filters

A candidate is ineligible when:

- it is the same user;
- either profile is disabled;
- either goal is not active and discoverable;
- either person has blocked the other;
- a pending or accepted connection already exists between them;
- the goals have no common language;
- a user-selected hard filter (for example remote-only) is incompatible.

### Suggested 100-point ranking

| Component | Weight | Initial calculation |
| --- | --- | --- |
| Complementary skills | 45 | Bidirectional overlap of one goal's offered skills with the other's needed skills. Award most points for direct complements and some for one-way help. |
| Compatible goals | 25 | Same or configured adjacent goal kind/category, plus compatible target horizon. Use explicit taxonomy mappings rather than opaque text similarity initially. |
| Availability | 20 | Coarse availability-slot overlap, compatible work mode, and reasonable hours-per-week overlap. Timezone should inform overlap, not expose exact schedules. |
| Language | 10 | At least one shared normalized language is required; additional overlap can add points up to the cap. |

Collaboration-style overlap should appear as a reason and tie-breaker in the first iteration. After
observing real usage, it can take a small explicit weight from goal compatibility rather than
silently changing ranking.

Every card should show two or three factual explanations, for example:

- “You need product design; they offer product design.”
- “Both are launching software projects.”
- “Both prefer weekday evenings and English.”

Copy should say “Potential fit” or “Recommended for this goal,” followed by: “Recommendations are
based on the details members provided. They do not predict compatibility or guarantee outcomes or
safety.”

Measure request, acceptance, decline, block, report, and first-action completion rates by score
component. Do not optimize only for request volume.

## 7. Privacy, consent, safety, and RLS design

### Mutual consent

- Discovery is not a connection.
- A requester sees only that their request is pending; no contact channel is opened.
- Only the recipient can accept.
- Decline does not require a reason and should not expose private feedback to the requester.
- Contact or richer collaboration details are revealed only after acceptance and only if separately
  consented.
- A proposed first action is visible before acceptance so the recipient knows what they are
  accepting.
- There is no automatic connection based on score, follows, Trust Acts, or profile views.

### Privacy defaults

- New goals remain private drafts until onboarding is explicitly completed.
- Discovery is authenticated-only.
- Return safe fields explicitly: display name, avatar, coarse profile summary, goal, offered/needed
  skills, coarse preference overlap, and languages.
- Never return profile email, role, disabled state, report history, internal trust ledger, exact
  availability, or private Passport settings in discovery.
- Public Passport visibility is separate from discovery visibility.
- Provide pause/hide controls that remove a goal from new matching without deleting history.
- Avoid logging goal descriptions, report text, or access tokens in analytics.

### RLS policy matrix

| Table/function | SELECT | INSERT | UPDATE/DELETE |
| --- | --- | --- | --- |
| `goals` | Owner reads all; authenticated users may read only active discoverable rows if direct cross-user reads are required. Prefer the safe discovery function. | Owner only | Owner only; immutable owner; archive rather than delete when referenced |
| `skills` | Authenticated read of active catalog | Service role/admin only | Service role/admin only |
| `goal_skills` | Owner direct read; cross-user data only through safe discovery output | Goal owner only | Goal owner only |
| `collaboration_preferences` | Owner direct read; overlap only through discovery output | Goal owner only | Goal owner only |
| `connection_requests` | Participants and admins only | Requester only through checked RPC | Recipient responds; requester cancels; participants cannot rewrite identity fields |
| `user_blocks` | Blocker only | Blocker only | Blocker only |
| `negative_reports` / evidence | Reporter and admins by default; subject disclosure follows moderation policy | Reporter only | Admin/RPC only |
| `discover_goal_matches` | Authenticated; caller must own source goal | N/A | N/A |

For every security-definer function:

- set a fixed `search_path`;
- verify `auth.uid()` and active-account status inside the function;
- revoke execute from `PUBLIC` and `anon`;
- grant only the minimum role;
- return a named, fixed column set;
- test as anonymous user, each participant, an unrelated authenticated user, a blocked user, a
  disabled user, and an admin.

UI route protection is convenience, not authorization. RLS and RPC checks remain mandatory even
when middleware protects the page.

## 8. Specific files to add or modify

### Documentation and product contract

- Revise `PRODUCT_BIBLE.md` to make the 2.0 vision canonical and distinguish retained trust
  infrastructure from matching.
- Update `README.md`, `DEPLOY.md`, and `supabase/README.md` after migrations exist; current docs are
  already stale and `DEPLOY.md` omits migration 006.

### Database

- Add `supabase/migrations/007_security_baseline.sql` for existing RLS/function/profile exposure
  corrections.
- Add `supabase/migrations/008_trueverse_2_core.sql` for goals, skills, preferences, connections,
  blocks, enums/checks, indexes, triggers, grants, and RLS.
- Add `supabase/migrations/009_trueverse_2_discovery.sql` for the explainable discovery function
  and connection transition RPCs if separating reviewable security boundaries is clearer.
- Extend `supabase/seed.sql` only with fictional skills and development fixtures; never production
  user data.

### Shared application code

- Modify `src/lib/types.ts` with goal, skill, preference, match result, connection, and block types.
- Modify `src/lib/validators.ts` with bounded schemas for all new writes and filters.
- Add `src/lib/matching.ts` for score labels, reason-code presentation, and shared constants; SQL
  remains authoritative for candidate selection.
- Add `src/lib/onboarding.ts` for server-side completion checks and post-auth destination logic.
- Modify `src/lib/auth.ts` only as needed for active-account checks and safe post-auth helpers.
- Modify `src/lib/supabase/middleware.ts` to protect the four new member prefixes. Avoid doing the
  full matching/onboarding query in middleware.
- Replace the process-local limiter for sensitive write endpoints with a Vercel-compatible shared
  limiter.

### Pages and components

- Rewrite `src/app/page.tsx` and update metadata in `src/app/layout.tsx`.
- Add `src/app/onboarding/page.tsx`.
- Add `src/app/discover/page.tsx`.
- Add `src/app/connections/page.tsx`.
- Add `src/app/goals/page.tsx`.
- Add `src/components/onboarding/*` for the multi-step goal/preferences form.
- Add `src/components/goals/*` for goal cards and editor.
- Add `src/components/discover/*` for candidate cards, reasons, filters, and safety actions.
- Add `src/components/connections/*` for request states and first-action prompts.
- Modify `src/components/layout/app-shell.tsx` for 2.0 navigation and route-aware marketing layout.
- Modify `src/components/auth-form.tsx`, `src/app/auth/login/page.tsx`, and
  `src/app/auth/callback/route.ts` for validated redirects and onboarding routing.
- Add forgot/reset password pages and a small reset form under `src/app/auth/`.
- Modify `src/app/notifications/page.tsx` and `src/components/notifications/notification-center.tsx`
  only if connection notifications are included in the first release.

### API route handlers

- Add `src/app/api/goals/route.ts`.
- Add `src/app/api/goals/[id]/route.ts`.
- Add `src/app/api/discover/route.ts`.
- Add `src/app/api/connections/route.ts`.
- Add `src/app/api/connections/[id]/route.ts` or action-specific accept/decline/cancel children.
- Add `src/app/api/blocks/route.ts`.
- Add `src/app/api/safety/reports/route.ts`, reusing the existing report tables and moderation queue.
- Keep service-role access out of ordinary user reads/writes where RLS and checked RPCs suffice.

## 9. Ordered implementation sequence

1. **Approve the pivot contract.** Revise `PRODUCT_BIBLE.md`, define discovery fields, report
   disclosure rules, connection cancellation on block, taxonomy ownership, and MVP analytics.
2. **Add verification infrastructure.** Introduce database/RLS tests and route validation tests
   before schema changes. Add CI for lint, tests, and build.
3. **Harden the existing security baseline.** Correct `is_admin` calls and function grants, remove
   public email exposure, force audited state transitions, validate callback redirects, and confirm
   disabled-user behavior.
4. **Add the core schema.** Create goals, skills, goal skills, collaboration preferences,
   connection requests, blocks, indexes, triggers, grants, and RLS in additive migrations.
5. **Prove RLS before UI.** Run participant/stranger/block/admin policy tests and inspect function
   grants. Test that no discovery query can return email or a blocked candidate.
6. **Build goals and onboarding.** Implement `/goals` first, then `/onboarding`, including atomic
   final save and private-by-default drafts.
7. **Build computed discovery.** Implement the SQL function, API, filters, reason codes, and
   `/discover`. Benchmark with representative fixture volumes before considering a cache.
8. **Build mutual connections.** Implement send/cancel/accept/decline transactions,
   `/connections`, notifications, and required first-action prompts.
9. **Add blocking and reporting to every people surface.** Verify immediate match/request removal,
   private block ownership, report moderation, and dispute handling.
10. **Pivot landing and navigation.** Update `/`, metadata, AppShell, signup copy, and default
    post-auth destinations. Hide old beta surfaces from primary navigation without deleting them.
11. **Complete account recovery.** Add password reset and regression-test confirmation/login/reset
    redirect behavior.
12. **Release behind controlled rollout.** Apply migrations in a non-production Supabase project,
    test desktop/mobile/accessibility flows, review query plans and logs, then follow a separately
    approved production migration and Vercel deployment runbook.

## 10. Test and acceptance plan for implementation

Database:

- Migration apply/rollback rehearsal on an empty development project and a schema copy with
  representative existing rows.
- pgTAP or equivalent tests for every RLS role and connection transition.
- Query-plan checks for candidate lookup, blocks, and active connection uniqueness.
- Assertions that anonymous and unrelated users cannot enumerate goals, preferences, requests,
  blocks, reports, or email.

Application:

- Unit tests for validators, reason-code formatting, score boundaries, and safe redirect parsing.
- Route-handler integration tests for owner/stranger/participant/blocked/disabled/admin cases.
- End-to-end tests for signup to onboarding, goal management, discover, request, decline, accept,
  block, report, and password reset.
- Manual mobile and desktop walkthroughs, keyboard navigation, focus order, reduced motion, and
  WCAG 2.2 AA checks.
- `npm run lint` and `npm run build` as release gates.

Acceptance criteria:

- A user can create a private draft and explicitly publish an active goal.
- Discovery returns only eligible, non-blocked candidates and explains the deterministic ranking.
- No recommendation copy promises compatibility, outcomes, or safety.
- No connection or contact disclosure occurs without recipient acceptance.
- Either-direction block prevents discovery and new requests immediately.
- Reports enter the existing audited moderation flow without changing matching or trust
  automatically.
- RLS tests demonstrate least-privilege access, including hidden block ownership and private
  preferences.
- Existing pages and tables remain intact, though non-core routes are absent from primary
  navigation.

## 11. Principal risks and decisions still required

1. **Conflicting canonical vision:** the current product bible and most UI copy describe a
   different product. Resolve this before implementation.
2. **Public profile exposure:** current profile RLS can expose email; fix before discovery.
3. **Safety semantics:** decide report disclosure timing, block effects on accepted connections,
   retention, appeals, and emergency/escalation guidance.
4. **Cold start:** skill taxonomy and sparse users can make deterministic matches weak. Use clear
   empty states and user-controlled filters; do not inflate confidence.
5. **Taxonomy quality:** duplicate or overly broad skills will damage complementary matching.
   Establish an admin-owned starter catalog and synonym process.
6. **Sensitive goal content:** free-text goals can reveal business, employment, health, location,
   or personal details. Add guidance, report controls, retention rules, and data-export/deletion
   handling.
7. **Ranking bias and gaming:** audit outcomes across goal categories and languages, cap repeated
   outreach, and expose understandable reasons rather than a mysterious universal score.
8. **Schema drift:** migrations and deployment docs already disagree. Add migration verification
   and keep generated schema/types in CI.
9. **No messaging in MVP:** a concrete first action can be coordinated through the connection
   record initially. Direct messages should be a separate, consent-aware schema and RLS project,
   not an assumed reuse of `/messages`.
10. **Legacy security debt:** the identified RLS, grants, trust divergence, and demo-success paths
    should be corrected before they are reused by a higher-volume discovery product.
