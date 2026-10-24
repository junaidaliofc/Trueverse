# Trueverse 2.0 repository audit and implementation plan

## Scope and audit baseline

This document is a read-only product and engineering audit for the Trueverse 2.0 pivot. The
repository was on `main`, tracking `origin/main`, with a clean worktree when the audit began.
The audit itself was documented on `cursor/trueverse-2-audit-683c`.

No application feature, existing page, database object, production data, migration, or deployment
was changed. The only repository change is this plan.

## Executive summary

The repository is a usable foundation, not a clean match for the new product. It already has:

- Supabase email/password authentication, server/browser clients, session refresh, and protected
  route middleware.
- Auth-backed profiles, profile editing, usernames, avatars, and public profile pages.
- A responsive application shell and reusable design-system components.
- Moderation concepts, evidence-backed reports, and an admin report queue.
- Vercel-compatible Next.js deployment documentation.

The current product is centered on trust, reputation, gamification, and a mostly fictional
community experience. Goals, skill supply/demand, collaboration preferences, discovery, mutual
connections, blocking, and direct messaging do not exist. Several visible routes use dummy data.
The existing database also has authorization and privacy issues that must be addressed before
discovery exposes more people to one another.

The recommended MVP is a deterministic, explainable match query over active goals. Do not persist
match recommendations initially. A match score is a ranking aid based on declared information; it
does not guarantee compatibility.

## Current application state

### Framework and configuration

- Next.js 16 App Router, React 19, TypeScript in strict mode, Tailwind CSS 4, Radix/shadcn-style UI,
  Framer Motion, Zod, and Supabase SSR are configured in `package.json`.
- `src/app/layout.tsx` provides global fonts, theme and tooltip providers, the application shell,
  and a hard-coded Google Analytics property.
- `next.config.ts` only configures remote images from Supabase and Unsplash.
- `middleware.ts` delegates session handling to `src/lib/supabase/middleware.ts`.
- There is no `vercel.json` and no repository CI configuration. Vercel deployment is described in
  `DEPLOY.md`.
- `.env.example` lists Supabase URL, anon key, service-role key, and site URL. The service-role
  client in `src/lib/supabase/admin.ts` is currently unused.
- No generated Supabase database types exist. `src/lib/types.ts` is hand-written and lags the
  later migrations.

### Route inventory

Public routes:

| Route | Current behavior | 2.0 disposition |
| --- | --- | --- |
| `/` | Trust/reputation landing page | Replace copy and CTAs for goal-based collaboration |
| `/auth/login` | Email/password login | Reuse; preserve a validated `next` destination |
| `/auth/signup` | Email/password signup | Reuse; send new users to onboarding |
| `/auth/check-email` | Signup confirmation instructions | Reuse with revised post-confirmation flow |
| `/auth/callback` | Exchanges PKCE code for session | Reuse after closing its open-redirect risk |
| `/auth/verify` | Legacy route that redirects to login | Hide from navigation; retain temporarily as a compatibility redirect |
| `/u/[username]` | Public passport; demo-first, then live profile | Keep but make privacy-aware and remove discovery dependence on public passport data |
| `/u/[username]/share` | Share/QR for bundled demo profiles only | Hide until live-profile sharing is implemented |
| `/leaderboards` | Public dummy leaderboard | Hide |
| `/design-system` | Public internal component gallery | Restrict to development/admin or hide |

Authenticated routes:

| Route | Current behavior | 2.0 disposition |
| --- | --- | --- |
| `/dashboard` | Live profile/XP plus dummy missions and achievements | Redirect to `/discover` after onboarding; keep code until the pivot stabilizes |
| `/profile` | Live profile editor and passport | Reuse profile editor; reposition as account/profile settings |
| `/interactions` and children | Live positive interactions and evidence-backed reports | Hide from primary navigation; preserve tables and code pending a separate trust-system decision |
| `/community` | Dummy social feed | Hide |
| `/activity` | Dummy timeline | Hide |
| `/missions` | Dummy missions | Hide |
| `/badges` | Dummy badges | Hide |
| `/notifications` | Renders an empty list despite a database table | Hide for first MVP or wire only connection events |
| `/admin` | Live, role-gated report queue | Preserve and harden |
| `/feed` | Redirects to `/community` | Preserve as a compatibility redirect |
| `/messages` | Redirects to `/dashboard`; no messaging backend exists | Do not advertise; defer until accepted connections exist |
| `/insights` | Redirects to `/dashboard` | Preserve as a compatibility redirect |

API routes exist for profiles, positive/negative interactions, a help-request feed, social
follow/appreciate/comments, and admin reports/users. There are no APIs for goals, discovery,
connections, blocks, or messages. The social APIs return demo success responses when database
writes fail; that behavior must not be copied into 2.0 APIs.

### Authentication and account lifecycle

Implemented:

- Email/password signup in `src/components/auth-form.tsx`.
- Email confirmation through `src/app/auth/callback/route.ts`.
- Email/password login and logout.
- Profile provisioning through the `handle_new_user()` database trigger, with a second
  best-effort path in `src/lib/auth.ts`.
- Cookie-based session refresh and page protection.

Missing or unsafe:

- No forgot-password request or password-update page exists.
- Middleware adds `?next=...`, but the login form ignores it and always sends users to
  `/dashboard`.
- The auth callback passes `next` to `new URL()` without restricting it to a same-origin relative
  path, allowing an open redirect after login.
- `/auth/verify` and the README still describe an OTP flow that no longer exists.
- OAuth is not implemented; it is not required for the first MVP.
- Protected route middleware is a convenience boundary, not authorization. Every API and database
  operation still needs user and ownership checks.

### Profiles

`profiles` is keyed to `auth.users` and already contains names, usernames, avatar URLs, bios,
roles, disabled state, and legacy trust fields. `src/app/api/profile/route.ts` and
`src/components/profile-form.tsx` can be extended for the limited identity fields needed by 2.0.

Important privacy issue: the current `"profiles are public"` RLS policy allows selection of the
entire row for active profiles, including `email`. Discovery must never query or expose the raw
profile row. Public and discovery-safe fields should be served through a narrow view/RPC, and raw
profile access should be owner/admin only.

### Messaging

There is no direct-messaging table, conversation model, or API. `src/app/messages/page.tsx` is only
a redirect. `community_responses.message` and activity comments are public community content, not
private messages.

For MVP, a connection request should contain a short optional note and a proposed concrete first
action. Do not build general messaging until both people have accepted a connection. When
messaging is added, only accepted, unblocked connection participants should be able to read or
write a conversation.

### Supabase schema and migration health

Existing migrations:

1. `supabase/migrations/001_trueverse_schema.sql`: profiles, trust events, positive interactions,
   reports/evidence/disputes, help feed, notifications, admin audit, functions, RLS, and storage.
2. `002_trust_xp_reputation_dna.sql`: trust index/level, reputation DNA, XP, badges, achievements.
3. `003_core_loop.sql`: missions, activity events, and streaks.
4. `004_social_graph.sql`: follows, appreciations, comments, and a leaderboard view.
5. `005_passport.sql`: profile verifications, passport privacy, and passport defaults.
6. `006_auth_profile_name.sql`: revised auth-to-profile provisioning.

Migration documentation is stale: `DEPLOY.md` stops at migration 005, while `README.md` and
`supabase/README.md` describe migration 001 as the complete schema.

Material database risks to resolve before 2.0 launch:

- Migration 001 defines `is_admin(user_id uuid)`, while policies and a trigger in migrations
  002–004 call zero-argument `is_admin()`. A clean migration run is likely to fail unless the
  deployed database has an untracked overload.
- Several `SECURITY DEFINER` functions authorize caller-supplied user UUIDs rather than
  `auth.uid()`. Execute privileges are not explicitly revoked for most functions.
- Recipients can directly update a pending positive interaction through RLS, bypassing the
  acceptance RPC, trust ledger, and notification side effects.
- `trust_score` and `trust_index` are separate, unsynchronized systems.
- Profiles expose email through public row selection.
- Passport verification details are publicly selectable.
- There is no block model, and existing social/feed read policies are not block-aware.
- The app does not enforce `passport_privacy` on the public profile.
- In-memory API rate limiting is per server instance and is not a reliable abuse control on
  Vercel.

These are existing risks. The 2.0 migration should not silently rewrite historical tables or data.
Use additive migrations and separate, reviewed hardening migrations with preflight queries and
rollback notes.

### Vercel readiness

The app follows normal Next.js conventions and should deploy on Vercel without `vercel.json`.
`DEPLOY.md` documents build and environment-variable setup, but it omits migration 006 and contains
legacy smoke tests. Before a 2.0 deployment:

- Update the deployment runbook and redirect allowlist.
- Decide whether the unused service-role secret is actually required; remove it from Vercel if it
  remains unused.
- Configure production and preview `NEXT_PUBLIC_SITE_URL` behavior carefully. A single fixed
  production URL is not suitable for preview auth callbacks without explicit preview redirect
  configuration.
- Add security headers through `next.config.ts` or `vercel.json`.
- Run a clean database migration test and a production build in CI.
- Move analytics ID to configuration and document consent/privacy requirements.

## Reuse, hide, and add

### Reuse

- Supabase clients in `src/lib/supabase/`, after generating database types.
- Authentication pages/components and profile provisioning, after fixing redirect handling and
  adding password reset.
- `src/lib/auth.ts` helpers, while removing client-side profile creation as a fallback once
  provisioning is verified.
- `src/components/layout/app-shell.tsx`, theme, responsive shell, avatar, buttons, inputs, cards,
  sheets, status badges, and other primitives.
- Profile names, usernames, photos, and bios. Keep account email private.
- Existing moderation admin page as an operational starting point.
- Existing private `report-evidence` storage patterns only after tying uploads to authorized report
  records.
- The notifications table if its enum/schema is deliberately extended for connection events.

### Hide from 2.0 navigation

Do not delete these routes or tables during the pivot:

- Dashboard, trust interactions, community, activity, missions, badges, leaderboards, public
  design system, demo-only share page, messages, insights, and the legacy OTP route.
- Gamification, trust/reputation, follow/appreciation/comment, and passport-depth features.

Hiding means removing links and excluding these surfaces from the 2.0 primary journey. Keep
compatibility redirects where bookmarks may exist. Restrict dummy/internal pages from indexing and
from accidental production discovery.

### Add

- Goal onboarding and lifecycle.
- Skill taxonomy plus goal-specific offered/needed skills.
- Goal-specific collaboration preferences.
- Deterministic discovery with match explanations.
- Mutual connection requests with accept/decline/cancel controls.
- Blocks and safety reports that do not automatically alter a reputation score.
- Password reset.
- Database-generated TypeScript types.
- Connection-event notifications if notifications are in MVP scope.
- Audit events and abuse controls for connection, block, and report actions.

## Proposed MVP routes

### `/` — landing page

Public. Explain the specific value proposition: declare what you want to accomplish, find people
with complementary skills and compatible working preferences, mutually connect, and agree on a
first action. CTAs:

- Signed out: create account or sign in.
- Signed in without an active goal: continue to `/onboarding`.
- Signed in with an active goal: continue to `/discover`.

Do not promise guaranteed compatibility or use unverifiable trust claims.

### `/onboarding` — goal and collaboration preferences

Authenticated. A short, resumable form that creates one active goal and its preferences:

1. Goal type (`side_project`, `startup`, or `learning`) and a specific outcome.
2. Short description and current stage.
3. Skills offered and skills needed.
4. Collaboration styles, weekly availability, async/sync preference, timezone, and languages.
5. Visibility/consent preview before publishing to discovery.

Save drafts as non-discoverable. Publishing requires at least one offered skill, one needed skill,
a language, and explicit consent to discovery. Returning users may use this route to finish an
incomplete first goal; later goal management belongs in `/goals`.

### `/discover` — compatible people

Authenticated and requires an active discoverable goal. Return a paginated, safe projection of
candidate profile + goal data with:

- Shared/compatible goal context.
- Complementary skills in both directions.
- Collaboration-style, availability, timezone, and language explanation.
- A bounded match score labeled as an explanation/ranking signal, not a compatibility guarantee.
- Actions to view limited details, dismiss for the current goal, block, report, or send a
  connection request.

Exclude the current user, disabled/private/paused goals, either-direction blocks, existing pending
or accepted pairs for the same goals, and records the viewer is not authorized to discover.

### `/connections` — mutual connection requests

Authenticated. Tabs for incoming, sent, and accepted:

- Sender proposes an optional note and one concrete first action.
- Recipient accepts or declines.
- Sender may cancel while pending.
- Only an accepted request creates an active connection.
- Either person can later close the connection or block the other.

Do not reveal contact details merely because a request was sent. A decline should not disclose a
reason. Connection state changes must be transactional and idempotent.

### `/goals` — active goal management

Authenticated. List drafts, active, paused, completed, and archived goals. Support create, edit,
publish, pause, complete, archive, and selecting the active goal used for discovery. Avoid hard
deletes in the MVP so connection and moderation records retain referential context.

## Minimal 2.0 data model

Use a new additive migration such as `supabase/migrations/007_trueverse_2_core.sql` only after the
existing migration chain and production schema are reconciled. Names below are proposed; final SQL
should include explicit constraints, indexes, grants, comments, and RLS.

### `goals`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated |
| `owner_id` | `uuid` | FK to `profiles.id`, not null |
| `goal_type` | enum/text check | `side_project`, `startup`, `learning` |
| `title` | `text` | Specific outcome, length-limited |
| `description` | `text` | Length-limited; never allow HTML |
| `stage` | enum/text check | Small controlled vocabulary per goal type |
| `domain_tags` | `text[]` | Controlled slugs for goal compatibility; bounded count |
| `status` | enum/text check | `draft`, `active`, `paused`, `completed`, `archived` |
| `visibility` | enum/text check | `private`, `discoverable` |
| `target_date` | `date` nullable | Optional user intent, not a commitment |
| `created_at`, `updated_at` | `timestamptz` | Server-set |

Index `(owner_id, status)`, discoverable active goals, and normalized domain tags. Owners manage
their rows; other users must not select raw goals directly unless a block-aware discovery policy
or narrow RPC allows it.

### `skills`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigint`/`uuid` | Primary key |
| `slug` | `citext`/`text` | Unique normalized identifier |
| `label` | `text` | Display label |
| `category` | `text` | Controlled grouping |
| `is_active` | `boolean` | Retire without deleting |

Readable by authenticated users. Writable only by admins/service workflows. Seed a compact,
reviewed taxonomy; do not permit free-form skill creation in the first release.

### `goal_skills`

| Column | Type | Notes |
| --- | --- | --- |
| `goal_id` | `uuid` | FK to `goals`, cascade only when a draft is truly deleted |
| `skill_id` | skill PK | FK to `skills` |
| `kind` | enum/text check | `offer` or `need` |
| `level` | enum/text nullable | Optional `beginner`, `intermediate`, `advanced` |

Primary key `(goal_id, skill_id, kind)`. Owners manage rows through their own goals. Discovery
should expose only rows belonging to currently discoverable goals.

### `collaboration_preferences`

One row per goal:

| Column | Type | Notes |
| --- | --- | --- |
| `goal_id` | `uuid` | PK/FK to `goals` |
| `styles` | `text[]` | Controlled values such as `accountability`, `pairing`, `advisor`, `co_builder` |
| `hours_per_week` | `smallint` | Constrained, for example 1–40 |
| `work_mode` | enum/text check | `async`, `sync`, `mixed` |
| `timezone` | `text` | Valid IANA timezone |
| `languages` | `text[]` | BCP 47 language tags, bounded and normalized |
| `created_at`, `updated_at` | `timestamptz` | Server-set |

Do not store precise calendars, home location, or raw availability windows in the first MVP.
Timezone should be used only as a coarse collaboration signal.

### `connection_requests`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `requester_id`, `recipient_id` | `uuid` | Profile FKs; must differ |
| `requester_goal_id`, `recipient_goal_id` | `uuid` | Goal FKs whose owners must match the participants |
| `note` | `text` nullable | Short, plain text |
| `proposed_first_action` | `text` | Required, concrete, length-limited |
| `status` | enum/text check | `pending`, `accepted`, `declined`, `cancelled`, `closed` |
| `responded_at`, `closed_at` | `timestamptz` nullable | State timestamps |
| `created_at`, `updated_at` | `timestamptz` | Server-set |

A transaction/RPC must validate both goals, blocks, visibility, ownership, current state, and the
acting user. Use a canonical participant/goal-pair uniqueness strategy to prevent mirrored or
duplicate active requests. Requester can read/cancel; recipient can read/accept/decline; both can
read accepted/closed history. Neither can mutate participant IDs or goal IDs.

An accepted row is sufficient to represent an MVP connection. Add separate `connections` and
`connection_members` tables only when the product needs group connections, richer lifecycle
history, or multiple request attempts that must coexist.

### No `match_recommendations` table initially

Compute recommendations from current active goals, `goal_skills`, preferences, safe profile fields,
blocks, and connection state. A versioned SQL function/RPC such as
`discover_goal_matches(viewer_goal_id, cursor, limit)` can return candidate IDs, component scores,
and explanation codes.

Reasons not to persist recommendations:

- MVP data volume is expected to be manageable with indexes.
- Goal, skill, preference, block, and connection changes should affect results immediately.
- Stored recommendations become stale and add refresh jobs, retention questions, and more private
  relationship data.

Add a cache/materialized recommendation table later only after query measurements show it is
needed. If added, include `viewer_goal_id`, `candidate_goal_id`, algorithm version, component
scores, generated/expiry timestamps, and RLS limiting rows to the viewer.

### Safety support tables

`user_blocks`:

- `blocker_id`, `blocked_id`, `created_at`; primary key `(blocker_id, blocked_id)`.
- Owner can create/read/delete their blocks.
- The blocked person must not be able to enumerate who blocked them.
- Either-direction blocks exclude discovery, new requests, accepted-connection interaction, and
  future messaging. Blocking should cancel pending requests and close active connections in the
  same transaction or through an idempotent follow-up.

`safety_reports`:

- `id`, `reporter_id`, `reported_user_id`, optional related goal/request ID, controlled reason,
  description, status, assigned/reviewed metadata, timestamps.
- Reporter can create and read their own report; the reported user cannot read it; admins can read
  and review it.
- Keep this separate from `negative_reports`, whose existing workflow can change trust scores.
  A safety report should not automatically penalize reputation.
- Evidence belongs in a private bucket and must reference an authorized report record before an
  upload is accepted.

Optional `discovery_dismissals` can record `(viewer_goal_id, candidate_goal_id)` to hide a
recommendation without implying a block.

## Initial matching rules

Use deterministic scoring with visible explanation labels. Version the formula so it can change
without pretending scores are timeless.

Eligibility gates:

1. Viewer and candidate are different, active, non-disabled users.
2. Both goals are active and discoverable.
3. Neither user has blocked the other.
4. At least one normalized language overlaps.
5. At least one needed skill is offered in either direction.
6. No pending/accepted request already exists for the same goal pair.

Suggested 100-point ranking:

- **40 points — complementary skills.** Reward coverage of the viewer's needed skills by the
  candidate's offers and, separately, the candidate's needs by the viewer's offers. Show the
  matching skill labels. Do not reward self-declared level beyond a small tie-break until the
  product has evidence that it is useful.
- **30 points — compatible goals.** Compare goal type, controlled domain tags, and compatible
  stages. Compatible does not always mean identical: for example, two builders in adjacent stages
  may align, while a learning goal can complement a side project when the needed/offered skills
  overlap.
- **20 points — availability and collaboration style.** Compare weekly commitment bands, work mode,
  style overlap, and coarse timezone distance for sync-preferring users. Async-compatible users
  should not be penalized heavily for timezone.
- **10 points — language.** Require one shared language and use additional overlap only as a small
  ranking signal.

Return component scores and explanation codes, not only a total. Use stable pagination with a
deterministic tie-breaker. Do not use protected traits, inferred sensitive attributes, public email,
trust score, popularity, or willingness to pay. Do not describe this as an AI guarantee. Measure
request acceptance, blocks/reports, and completed first actions before tuning weights.

## Consent, privacy, safety, and access control

### Mutual consent

- Discovery is opt-in per goal through `visibility = discoverable`.
- Viewing a recommendation or sending a request does not create a connection.
- Only the named recipient can accept. Acceptance must be an atomic server-side transition from
  `pending` to `accepted`.
- Declines are private and do not affect ranking/reputation.
- Contact information and future messaging unlock only after acceptance, and only to the minimum
  extent explicitly chosen by users.
- Either person can close a connection or block the other.

### Privacy

- Remove `email` from all public/discovery access. Narrow the base `profiles` RLS and expose only a
  safe projection: ID, username, display name, avatar, short bio, and explicitly discoverable goal
  data.
- Goal drafts/private/paused rows are owner/admin only.
- Do not expose exact calendars, IP-derived location, report content, block relationships, declined
  requests, or private profile fields.
- Avoid logging free-text goals, notes, or reports in analytics and server logs.
- Define retention for declined/cancelled requests, archived goals, reports, and account deletion
  before launch.
- Public profile and discovery visibility are separate controls.

### Blocking and reporting

- Check blocks in both directions in discovery, request creation/acceptance, connection reads, and
  future message policies. UI filtering alone is insufficient.
- Block creation should be immediately effective and should not notify the blocked user.
- Reports must be private, rate-limited, auditable, and reviewed without automatic compatibility or
  reputation penalties.
- Preserve moderation context even if a user archives a goal. Restrict evidence access and use
  signed URLs.
- Add admin audit events for report state changes and sensitive account actions.

### Supabase RLS and function rules

- Enable RLS before exposing every new table.
- Base policies on `auth.uid()`, ownership joins, participant membership, and block checks.
- Prefer a narrow `SECURITY INVOKER` discovery query. If a `SECURITY DEFINER` function is required,
  set a fixed `search_path`, derive the actor from `auth.uid()`, validate every referenced row, and
  explicitly revoke public/anon execute privileges.
- Do not accept an acting user UUID from the client.
- Put connection state transitions and block side effects in transactional RPCs; disallow direct
  status updates through broad table policies.
- Keep service-role use server-only and exceptional. Never expose it through `NEXT_PUBLIC_*`.
- Add policy tests with two normal users, a blocked pair, an unrelated user, an admin, and anon.
- Generate Supabase types after migrations and use them in server and client queries.

## Specific files to modify during implementation

### Existing application files

- `src/app/page.tsx`: replace legacy trust landing content and route CTAs by session/onboarding
  state.
- `src/app/layout.tsx`: update metadata; configure analytics rather than hard-code it.
- `src/components/layout/app-shell.tsx`: replace dashboard/passport/community/alerts navigation
  with Discover, Connections, Goals, and Profile; hide legacy surfaces.
- `src/lib/supabase/middleware.ts`: protect the five MVP app routes and route authenticated users
  according to onboarding state without relying on middleware for authorization.
- `src/components/auth-form.tsx`: support validated return destinations and onboarding redirect.
- `src/app/auth/callback/route.ts`: restrict return paths to same-origin relative paths and direct
  first-time users to onboarding.
- `src/lib/auth.ts`: use generated types, expose onboarding-state helpers, and remove the
  RLS-incompatible profile insert fallback after verifying trigger provisioning.
- `src/app/api/profile/route.ts`, `src/components/profile-form.tsx`: keep identity fields separate
  from goal/preferences; tighten URL and privacy handling.
- `src/lib/types.ts`: replace or reduce hand-written database types after type generation.
- `README.md`, `supabase/README.md`, and `DEPLOY.md`: reconcile migration/auth documentation and
  update smoke tests.
- `next.config.ts` or a new `vercel.json`: add reviewed security headers and deployment behavior.

### New application files

- `src/app/onboarding/page.tsx` and focused onboarding form components.
- `src/app/discover/page.tsx` and match-card/filter components.
- `src/app/connections/page.tsx` and request/response components.
- `src/app/goals/page.tsx` plus goal create/edit components.
- `src/app/api/goals/route.ts` and `src/app/api/goals/[id]/route.ts`.
- `src/app/api/discover/route.ts` if a route handler is preferred over direct server-component RPC.
- `src/app/api/connections/route.ts` and action routes/RPC callers for accept, decline, cancel, and
  close.
- `src/app/api/blocks/route.ts` and `src/app/api/reports/route.ts`.
- `src/app/auth/forgot-password/page.tsx` and `src/app/auth/update-password/page.tsx`.
- `src/lib/matching.ts` for score/explanation contracts shared with UI; authoritative eligibility
  remains in SQL.
- Generated Supabase database type file, for example `src/lib/supabase/database.types.ts`.

### New database/test files

- A hardening migration that fixes current function authorization, profile privacy, execute grants,
  and the `is_admin` signature mismatch without changing production data unexpectedly.
- `supabase/migrations/007_trueverse_2_core.sql` (or the next verified migration number) for goals,
  skills, preferences, connections, blocks, reports, indexes, functions, grants, and RLS.
- A separate seed migration/data file for the reviewed skill taxonomy.
- Database/RLS tests for ownership, discovery visibility, mutual consent, blocks, reports, and
  cross-user denial.
- Application tests for matching score components, onboarding validation, and connection state
  transitions.

## Ordered implementation sequence

1. **Reconcile the deployed schema.** Inventory the actual production migration history and
   function signatures. Run the current chain against a fresh disposable database. Do not proceed
   by assuming repository SQL equals production.
2. **Harden the existing foundation.** Fix `is_admin`, function actor validation/execute grants,
   positive-interaction direct updates, public email/verification detail exposure, callback
   redirects, and misleading demo-success API behavior. Add regression/RLS tests.
3. **Add generated database types and CI checks.** Typecheck, lint, build, migration smoke test, and
   policy tests should run before deployment.
4. **Add the 2.0 core schema additively.** Create goals, skills, goal skills, preferences,
   connection requests, blocks, safety reports, indexes, grants, RLS, and transactional state
   functions. Seed only the approved skill taxonomy.
5. **Implement account completion.** Add password reset, safe post-auth routing, and onboarding
   state detection.
6. **Build `/onboarding` and `/goals`.** Establish validated writes and lifecycle rules before
   discovery reads depend on them.
7. **Build computed discovery.** Implement eligibility gates, versioned component scoring,
   explanations, stable pagination, and block-aware safe projections. Load-test representative
   query sizes before considering stored recommendations.
8. **Build `/connections`.** Add request, accept, decline, cancel, close, and first-action flows.
   Verify mutual consent and idempotency under concurrent requests.
9. **Build safety controls.** Put block/report actions on discovery and connection surfaces; connect
   reports to a private admin workflow and audit trail.
10. **Pivot the shell and landing page.** Make the five MVP routes primary. Hide, do not delete,
    legacy/dummy surfaces and prevent indexing where appropriate.
11. **Add minimal notifications if needed.** Limit the first set to incoming request, accepted
    request, and safety/admin outcomes; enforce recipient-only access.
12. **Verify end to end in a non-production environment.** Test two users through signup,
    onboarding, discovery, request, acceptance, first action, decline, pause, block, and report;
    test anon/unrelated/admin access; run accessibility, mobile, migration, build, and Vercel
    preview checks.
13. **Deploy with an explicit migration/runbook review.** Back up first, apply reviewed additive
    migrations, verify policies, then release routes behind a controlled flag. Do not migrate or
    delete legacy production data as part of the initial pivot.

## Key risks and decisions

| Risk/decision | Recommendation |
| --- | --- |
| Repository schema may differ from production | Compare catalogs/migration history before writing corrective SQL |
| Existing RLS exposes email and permits bypasses | Treat hardening as a launch prerequisite |
| Dummy pages look production-ready | Hide and noindex them; never return fake success from 2.0 APIs |
| Sparse early network | Let users broaden controlled goal/skill filters; do not fabricate matches |
| Match score overconfidence | Show reasons and component labels; state that ranking does not guarantee compatibility |
| Free-text abuse/PII | Length-limit, escape, moderate/report, and exclude from analytics logs |
| Mirrored connection races | Enforce canonical uniqueness and transactional, idempotent RPC transitions |
| Blocking only in UI | Enforce either-direction exclusion in RLS/RPCs and future messaging |
| Premature recommendation storage | Start computed; add caching only from measured query evidence |
| Legacy trust and new safety reports become coupled | Keep safety moderation separate from automatic reputation changes |
| Migration rollback | Use additive migrations, preflight checks, backups, and separately reviewed data backfills |

## MVP completion criteria

- A new user can confirm email, complete one discoverable goal, and recover a password.
- Discovery returns only eligible, unblocked people through a privacy-safe projection and explains
  each deterministic score.
- A request does not become a connection without recipient acceptance.
- Both users can close a connection; either can block without revealing block metadata.
- Reports are private to reporter/admin and do not automatically change reputation.
- Anon, unrelated users, blocked users, and direct Supabase clients cannot bypass access rules.
- No production screen depends on dummy success responses or claims guaranteed compatibility.
- The full migration chain succeeds on a clean database, generated types match it, and lint,
  typecheck, build, RLS tests, and the two-user end-to-end flow pass before deployment.
