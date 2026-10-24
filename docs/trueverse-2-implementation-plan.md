# Trueverse 2.0 repository audit and implementation plan

Status: planning only. This document does not apply migrations, change production data, deploy, or implement product features.

## 1. Executive summary

The repository is a Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS 4, shadcn/Radix components, Supabase Auth/Postgres, and Vercel-oriented deployment documentation. It already has a useful authentication and profile foundation, reusable UI primitives, server/client Supabase helpers, validation conventions, and participant-scoped interaction patterns.

The current product is primarily a trust, reputation, Passport, social activity, and gamification beta. Trueverse 2.0 should be an additive pivot: preserve those pages and tables, hide non-MVP surfaces from primary navigation, and add goal-based onboarding, discovery, mutual connection requests, and goal management.

Before discovery is exposed, the existing database authorization model needs hardening. In particular:

- `profiles` is publicly selectable as a whole row, including `email`.
- Several `SECURITY DEFINER` functions authorize a caller-supplied user or admin ID rather than `auth.uid()`.
- Trust and XP mutation helpers are not explicitly revoked from `PUBLIC`.
- A direct recipient update policy can bypass the positive-interaction acceptance RPC.
- Migrations `002` through `004` call `public.is_admin()` without the UUID argument required by the function defined in `001`.

The MVP should compute recommendations at request time from active goals, offered/needed skills, collaboration preferences, availability, language, and safety filters. A persisted `match_recommendations` table is not justified initially. Persist only user intent and state: goals, skill associations, preferences, connection requests, blocks, and reports.

## 2. Audit scope and repository state

Audit basis:

- Branch at the start of the audit: `main`, tracking `origin/main`
- Initial worktree state: clean
- Initial HEAD: `5bbcddb` (`Add GA4 site-wide via Next.js App Router GoogleAnalytics (#8)`)
- No existing uncommitted work was present or overwritten.
- The audit is static. It did not connect to a production Supabase project, inspect production data, apply migrations, or deploy.
- No `AGENTS.md` exists in the repository.

Primary files reviewed:

- Application: `src/app/**`, `src/components/**`, `src/lib/**`, `middleware.ts`
- Database: `supabase/migrations/001_trueverse_schema.sql` through `006_auth_profile_name.sql`, `supabase/seed.sql`
- Configuration: `package.json`, `next.config.ts`, `.env.example`, `tsconfig.json`
- Documentation: `README.md`, `DEPLOY.md`, `PRODUCT_BIBLE.md`, `supabase/README.md`

## 3. Current application architecture

### Framework and runtime

| Area | Current state |
| --- | --- |
| Web framework | Next.js 16 App Router |
| UI runtime | React 19 |
| Language | TypeScript with the `@/*` alias mapped to `src/*` |
| Styling | Tailwind CSS 4, shadcn/Radix, CSS tokens in `src/app/globals.css` |
| Motion | Framer Motion primitives in `src/components/motion/primitives.tsx` |
| Validation | Zod schemas in `src/lib/validators.ts` |
| Authentication/data | Supabase Auth, Postgres, `@supabase/ssr`, and `@supabase/supabase-js` |
| Analytics | Google Analytics is rendered from `src/app/layout.tsx` with a hard-coded ID |
| Deployment | Vercel is documented, but no `vercel.json` is present |

`src/app/layout.tsx` wraps every page in the theme provider, tooltip provider, and `AppShell`. `src/components/layout/app-shell.tsx` controls the marketing shell and the authenticated desktop/mobile navigation.

### Existing page routes

| Route | Current behavior | Data/auth notes | 2.0 disposition |
| --- | --- | --- | --- |
| `/` | Trust/reputation landing page | Public, static | Replace content for the goal-collaboration value proposition |
| `/dashboard` | Trust, XP, streak, and mission home | Protected; live profile/XP plus dummy missions | Keep accessible but remove from primary 2.0 navigation initially |
| `/profile` | Edit profile and view owner Passport | Protected; live Supabase data | Reuse as profile/settings support |
| `/u/[username]` | Public Passport | Dummy-first lookup; live fallback still builds synthetic signals | Keep, but fix live/public data and privacy before linking from discovery |
| `/u/[username]/share` | Share card and QR | Dummy profiles only; hard-coded production origin | Hide until it supports real profiles safely |
| `/auth/login` | Email/password login | Supabase Auth | Reuse and update redirect behavior/copy |
| `/auth/signup` | Email/password signup with name metadata | Supabase Auth | Reuse; send successful users to onboarding |
| `/auth/check-email` | Confirmation-email instructions | Public | Reuse; update post-confirmation copy |
| `/auth/verify` | Redirect to login | Deprecated OTP page | Keep hidden/redirected |
| `/auth/callback` | Exchange auth code for session | Public route handler | Reuse; validate safe `next` and default to onboarding when incomplete |
| `/interactions` | Trust Act list | Protected, live | Preserve, hide from primary MVP navigation |
| `/interactions/create` | Positive interaction and negative report forms | Protected, live APIs | Preserve, hide from primary MVP navigation |
| `/interactions/[id]` | Trust Act details | Protected and participant-scoped | Preserve |
| `/community` | Help/activity community | Protected, dummy data | Hide from primary MVP navigation |
| `/activity` | Activity feed | Protected, dummy data | Hide from primary MVP navigation |
| `/notifications` | Notification center | Protected but currently receives an empty list | Hide until connection notifications are live |
| `/missions` | Daily/weekly missions | Protected, dummy data | Hide |
| `/badges` | Badge and achievement display | Protected, dummy data | Hide |
| `/leaderboards` | XP leaderboard | Public, dummy data | Hide and do not promote |
| `/feed` | Redirect to `/community` | Public | Preserve redirect |
| `/messages` | Redirect to `/dashboard` | No messaging schema or API exists | Keep hidden; messaging is not an MVP dependency |
| `/insights` | Redirect to `/dashboard` | Deferred feature | Keep hidden |
| `/admin` | Negative-report moderation queue | Protected plus page-level admin gate | Preserve and extend for safety reports later |
| `/design-system` | UI catalog | Public | Gate to development/admin or hide in production |

### Existing API routes

The repository has live routes for profile reads/updates, help requests and responses, positive interactions, negative reports, social follows/appreciations/comments, and admin report review. These establish useful patterns for authenticated route handlers, Zod validation, JSON errors, rate-limit calls, and RPC-backed state transitions.

Important limitations:

- The rate limiter in `src/lib/rate-limit.ts` is process-local and is not reliable across Vercel serverless instances.
- Social APIs can return a successful `{ demo: true }` response after database errors, which would mask missing migrations or RLS failures.
- Positive interaction and follow lookups interpolate user input into Supabase `.or(...)` filters.
- `src/lib/supabase/admin.ts` defines a service-role client but no application code imports it. Keep service-role credentials server-only and avoid using them for ordinary user requests.

## 4. Authentication, profiles, messaging, and deployment

### Authentication

Implemented:

- Email/password signup through `supabase.auth.signUp`.
- Name copied into auth metadata as both `name` and `full_name`.
- Email confirmation callback through `exchangeCodeForSession`.
- Email/password login through `signInWithPassword`.
- Cookie/session refresh in root middleware.
- Logout and authenticated page helpers.
- Profile provisioning through an auth trigger, with an application fallback.

Missing or incorrect:

- There is no forgot-password or password-reset route, form, or `resetPasswordForEmail` call.
- Middleware adds a `next` query parameter, but login ignores it and always routes to `/dashboard`.
- Callback `next` is accepted without an explicit same-origin/path allowlist.
- Authenticated users are redirected from login/signup to `/dashboard` without checking onboarding completion.
- `README.md` describes OTP behavior that no longer exists.

Recommended additions:

- `/auth/forgot-password` and `/auth/reset-password`.
- A shared safe-relative-path validator for `next`.
- An onboarding-completion check based on an active goal and collaboration preferences, not a fragile client-only flag.
- Signup/login/callback defaults of `/onboarding` for incomplete users and `/discover` for complete users.

### Profiles and privacy

`profiles` already provides identity, display name, username, image, biography, role, disabled status, and trust-related fields. This is reusable. Email and system fields should not be included in general profile discovery.

The public Passport currently has two data paths:

- Owner `/profile` uses the live `buildLivePassportViewModel`.
- Public `/u/[username]` checks dummy profiles first and can synthesize DNA, verification, and statistics for live users.

Before discovery links to public profiles:

- Use one live public-profile builder.
- Stop inferring verification or reputation data.
- Respect privacy settings.
- Replace broad direct `profiles` reads with narrowly projected database functions or a deliberately safe public projection.
- Remove `email` from every public/authenticated-other-user response.

### Messaging

Messaging is not implemented. `/messages` is only a redirect, and there are no conversation/message tables or APIs. The MVP can satisfy “take a concrete first action together” by requiring a proposed first action in a connection request and revealing an accepted connection in `/connections`. Full chat should remain hidden until it has a separate product and safety design.

### Vercel and environment configuration

Current environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Current deployment guidance uses standard Vercel Next.js defaults. `next.config.ts` only configures remote image sources. There is no `vercel.json`, custom region, scheduled job, or durable rate-limit store.

Before production release:

- Add reset-password and callback URLs to Supabase Auth redirect allowlists.
- Make site URL handling consistent for preview and production deployments.
- Move the GA measurement ID to configuration if separate environments require separate properties.
- Replace in-memory rate limiting for connection, block, and report writes with a shared store or database-enforced limits.
- Update `DEPLOY.md`; its migration list omits `006_auth_profile_name.sql`.

## 5. Current Supabase schema and RLS audit

### Existing schema groups

| Group | Tables/views |
| --- | --- |
| Identity | `profiles` |
| Trust and moderation | `positive_interactions`, `negative_reports`, `report_evidence`, `disputes`, `trust_score_events`, `admin_actions` |
| Community | `help_requests`, `community_responses` |
| Notifications | `notifications` |
| Reputation and XP | `reputation_dna`, `user_xp`, `xp_events`, `badges`, `user_badges`, `achievements`, `user_achievements` |
| Missions/activity | `mission_templates`, `user_missions`, `activity_events`, `user_streaks` |
| Social graph | `follows`, `activity_appreciations`, `activity_comments`, `xp_leaderboard_weekly` |
| Passport | `profile_verifications`, `passport_privacy` |

All application tables have RLS enabled in the migration files. Existing useful policy patterns include owner-only profile updates, participant-only interaction reads, reporter/involved-party report reads, recipient-only notification reads, and admin checks.

### Security and correctness issues to resolve first

1. `profiles` has a policy named `profiles are public` that exposes every column for active users, including `email`, to direct selects.
2. `accept_positive_interaction`, `reject_positive_interaction`, and admin RPCs trust user IDs passed as arguments. A definer function must derive the actor from `auth.uid()`.
3. `apply_trust_delta`, `award_xp`, and other definer helpers are not consistently revoked from `PUBLIC`.
4. Recipients can directly update pending positive interactions, allowing state changes outside the acceptance/rejection RPC and trust ledger.
5. Policies and triggers in migrations `002`, `003`, and `004` call `public.is_admin()` with no argument, while `001` defines only `public.is_admin(user_id uuid)`.
6. `profile_verifications` is globally readable and its unstructured `detail` field could contain private data.
7. The trust flow mutates legacy `trust_score`; UI generally prefers `trust_index`. These models can diverge.
8. There is no user block model, general safety report, or exclusion from social/discovery reads.
9. Existing report evidence storage permits user-folder uploads without proving that the object belongs to an open report.
10. The schema has three streak representations: `profiles.streak`, `user_xp.daily_streak`, and `user_streaks`.

Do not rewrite old migration files after they may have reached production. Add forward-only hardening migrations after first comparing the migration history and live schema in a non-production environment.

## 6. Reuse, hide, and add

### Reuse

- Supabase Auth, cookie middleware, `requireUser`, `requireProfile`, and the auth callback.
- `profiles` as the identity root, after public-column access is fixed.
- App shell, theme, responsive navigation structure, design tokens, buttons, cards, forms, avatars, badges, dialogs, sheets, skeletons, and motion primitives.
- Zod/API error conventions in `src/lib/validators.ts` and `src/lib/api.ts`.
- Participant-scoped read patterns and RPC state transitions from Trust Acts, after actor authorization is corrected.
- `notifications` for connection-request and acceptance events.
- `admin_actions` and `/admin` as the basis for auditable moderation.
- `passport_privacy` as a pattern, while keeping discovery visibility explicit in collaboration preferences.
- Public username/profile URLs once live projection and privacy are corrected.

### Preserve but hide from the 2.0 MVP navigation

- Dashboard trust/XP home.
- Community, activity, missions, badges, leaderboards, Trust Acts, insights, messages, and the design system.
- Dummy-data-backed public sharing.
- Notification navigation until it displays live connection events.

“Hide” means remove links and discovery surfaces, not delete routes, components, or tables. Existing deep links should continue to work where they are safe.

### Add

- Goal-based onboarding and goal management.
- Skills catalog and per-goal offered/needed skill associations.
- Collaboration style, availability, language, and discovery visibility preferences.
- Authenticated computed discovery with clear match-factor explanations.
- Mutual connection requests with an explicit proposed first action.
- Blocks and general safety reports that are separate from trust-score reports.
- Password reset.
- Safe public-profile projection and onboarding-aware redirects.
- Live connection notifications and admin handling for safety reports.

## 7. Proposed MVP routes

### `/` — landing page

Purpose: explain that Trueverse connects people around what they want to accomplish next.

Content:

- Audience-specific examples: side project, startup, and skill learning.
- Four concrete inputs: goal, skills offered, help needed, collaboration style.
- Honest explanation that recommendations rank stated compatibility factors; they do not guarantee compatibility.
- Primary CTA to signup and secondary CTA to login.
- Safety/privacy summary: discovery visibility is user-controlled and contact is not shared before mutual consent.

Files:

- Modify `src/app/page.tsx`.
- Modify metadata in `src/app/layout.tsx`.
- Reuse `src/components/ui/**` and `src/components/motion/primitives.tsx`.

### `/onboarding` — create goal and preferences

Purpose: collect the minimum viable discovery profile.

Flow:

1. State one specific outcome and choose `side_project`, `startup`, or `learning`.
2. Select skills offered and skills/help needed.
3. Choose collaboration styles.
4. Add weekly availability, time zone, remote/in-person preference, and languages.
5. Review discovery visibility and consent text.

Behavior:

- Authentication required.
- Save drafts without making them discoverable.
- Mark the goal active only after required fields validate.
- Redirect to `/discover` after successful completion.
- Never infer sensitive attributes or publish email/contact details.

Files:

- Add `src/app/onboarding/page.tsx`.
- Add `src/components/onboarding/onboarding-form.tsx`.
- Add goal/preference schemas to `src/lib/validators.ts`.
- Add authenticated route handlers or server actions for goals/preferences.
- Add `/onboarding` to protected prefixes in `src/lib/supabase/middleware.ts`.

### `/discover` — discover compatible people

Purpose: show ranked candidates for the viewer’s selected active goal.

Each card should show:

- Safe public identity fields.
- Candidate goal summary.
- Skills they offer that the viewer needs.
- Skills the viewer offers that they need, when present.
- Collaboration style, availability, and shared language.
- A factor-based “Why this match” explanation.
- Connect, block, and report actions.

Behavior:

- Authentication and completed onboarding required.
- Exclude the viewer, disabled/hidden profiles, either-direction blocks, already accepted connections, and active duplicate requests.
- Do not expose email, precise location, private schedule, reports, or hidden profile sections.
- Do not display false precision. Prefer “Strong skill complement” and factor chips over a consumer-facing `87% compatible` claim.

Files:

- Add `src/app/discover/page.tsx`.
- Add `src/components/discovery/discovery-card.tsx` and filter/empty-state components.
- Add an authenticated discovery RPC and a thin server data-access module such as `src/lib/discovery.ts`.
- Add `/discover` to protected prefixes.

### `/connections` — mutual connection requests

Purpose: manage incoming, outgoing, and accepted connections.

Tabs:

- Incoming requests: accept, decline, block, report.
- Sent requests: view or cancel pending requests.
- Connected: show mutually accepted connections and the agreed first action.

Behavior:

- Sending a request does not create a connection.
- Only the recipient can accept or decline.
- Only accepted requests appear as connections.
- Blocking immediately removes both people from discovery and prevents new requests. Product policy must decide whether an existing accepted connection is hidden or explicitly ended; the MVP recommendation is to hide/end it for both parties without notifying the blocked person of the block.
- Decline and block reasons are not revealed to the other user.

Files:

- Add `src/app/connections/page.tsx`.
- Add `src/components/connections/**`.
- Add authenticated RPC-backed request handlers.
- Add connection notification rendering.
- Add `/connections` to protected prefixes.

### `/goals` — manage active goals

Purpose: create, edit, pause, complete, and select the active goal used for discovery.

Behavior:

- Authentication required.
- Paused, completed, and draft goals are not matchable.
- Preserve history rather than deleting completed goals.
- Start with one discoverable active goal per profile to keep ranking and connection context clear. Multiple saved goals are allowed.
- Changing the active goal changes future discovery; it does not rewrite existing connection requests.

Files:

- Add `src/app/goals/page.tsx`.
- Add `src/components/goals/**`.
- Reuse the goal fields and skill picker from onboarding.
- Add `/goals` to protected prefixes.

### Primary navigation

For authenticated 2.0 users, change `src/components/layout/app-shell.tsx` to:

- Discover
- Connections
- Goals
- Profile

Onboarding should not be a permanent nav item. Keep legacy routes addressable but out of primary navigation.

## 8. Minimal additive data model

Names below are proposed. Final SQL belongs in new forward-only migrations, not edits to `001`–`006`.

### `goals`

One row represents one outcome a user wants to accomplish.

| Column | Type/constraint |
| --- | --- |
| `id` | UUID primary key |
| `profile_id` | UUID, required FK to `profiles(id)` with cascade |
| `goal_type` | Enum: `side_project`, `startup`, `learning` |
| `title` | Text, 4–120 characters |
| `description` | Text, 20–1000 characters |
| `status` | Enum: `draft`, `active`, `paused`, `completed`, `archived` |
| `target_date` | Optional date |
| `created_at`, `updated_at` | Timestamps |

Indexes:

- `(profile_id, status, updated_at desc)`
- Partial unique index on `profile_id` where `status = 'active'` for the one-active-goal MVP

RLS:

- Direct select/insert/update only for the owner and admins.
- Do not allow hard delete from the client; archive instead.
- Discovery reads other users’ active goals only through the safe discovery function.

### `skills` and `goal_skills`

`skills` is a small curated taxonomy, not free-form user identity data.

`skills`:

- `id` UUID or stable text primary key
- `slug` unique
- `label`
- `category`
- `is_active`

`goal_skills`:

- `goal_id` FK to `goals`
- `skill_id` FK to `skills`
- `relation` enum: `offer` or `need`
- Optional `level` small integer 1–5
- Primary key `(goal_id, skill_id, relation)`

This keeps offered and needed skills contextual to a goal. Avoid a separate `profile_skills` table until users need a durable skill portfolio independent of goals.

RLS:

- Skill catalog is readable by authenticated users; only trusted server/admin paths write it.
- Goal skill rows are directly readable/writable only when the caller owns the parent goal.
- Discovery accesses candidate rows only through the safe discovery function.

### `collaboration_preferences`

One row per profile:

| Column | Type/constraint |
| --- | --- |
| `profile_id` | UUID primary key/FK |
| `styles` | Checked enum array, e.g. `co_builder`, `accountability`, `mentor`, `peer_learning` |
| `interaction_modes` | Checked enum array: `async`, `scheduled_calls`, `live_sessions` |
| `weekly_minutes` | Integer with a bounded range |
| `timezone` | IANA time-zone identifier |
| `location_mode` | Enum: `remote`, `in_person`, `either` |
| `language_codes` | Non-empty, validated BCP 47/ISO language code array |
| `discovery_visibility` | Enum: `discoverable`, `connections_only`, `hidden` |
| `updated_at` | Timestamp |

Store broad availability, not a detailed personal calendar. Exact meeting times can be exchanged after consent.

RLS:

- Owner/admin direct access only.
- The discovery function returns only fields needed to explain a match.

### Match recommendations: compute, do not store

Do not create a `match_recommendations` table for the MVP. Recommendations are derived data and can become stale whenever either user edits a goal, skills, preferences, visibility, connection status, or block.

Add a database function such as `discover_candidates(active_goal_id uuid, result_limit integer, result_offset integer)` that:

- Uses `auth.uid()` as the viewer and verifies ownership of `active_goal_id`.
- Applies privacy, status, consent, and block exclusions before scoring.
- Returns only an explicit safe projection.
- Returns score components/factor labels for internal ordering and UI explanation.
- Is `SECURITY DEFINER` only if needed to read candidate-private source rows; if so, set a fixed `search_path`, revoke execution from `PUBLIC`/`anon`, grant only `authenticated`, derive the actor from `auth.uid()`, validate every argument, and never return base rows.

If request-time computation becomes measurably slow, introduce a versioned cache later with `viewer_id`, `candidate_id`, source-data version/timestamps, factors, and expiry. Do not introduce that operational complexity before query plans and production measurements justify it.

### `connection_requests`

| Column | Type/constraint |
| --- | --- |
| `id` | UUID primary key |
| `requester_id`, `recipient_id` | Required FKs to `profiles`; must differ |
| `requester_goal_id`, `recipient_goal_id` | Required FKs to the goals that produced the recommendation |
| `intro_message` | Optional text, max 500 characters |
| `proposed_first_action` | Required text, 10–280 characters |
| `status` | Enum: `pending`, `accepted`, `declined`, `cancelled` |
| `created_at`, `responded_at`, `updated_at` | Timestamps |

Use a partial unique index over the unordered user pair for `pending` and `accepted` states so reverse duplicate requests cannot coexist. Validate through RPCs that each goal belongs to the corresponding user and was active at request creation.

The accepted request itself is the MVP connection record; a separate `connections` table is unnecessary until connections need independent lifecycle or metadata.

RLS and transitions:

- Participants can select their requests.
- Request creation goes through an RPC that uses `auth.uid()`, checks visibility/blocks/rate limits, and emits a notification.
- Recipient-only accept/decline RPC.
- Requester-only cancel RPC.
- Clients cannot directly update status.
- Admin access should be narrowly justified and audited.

### `user_blocks`

- Composite primary key `(blocker_id, blocked_id)`
- No self-block
- `created_at`

Only the blocker can insert, select, or delete their block row. The blocked person must not be able to enumerate who blocked them. Every discovery and connection function must exclude either direction.

### `user_safety_reports`

The existing `negative_reports` table is evidence-oriented and can change trust scores after admin review. It should not be overloaded for spam, harassment, impersonation, or unsafe profile content.

Add:

- `id`
- `reporter_id`
- `reported_profile_id`
- Optional `connection_request_id`
- Reason enum: `spam`, `harassment`, `impersonation`, `unsafe_content`, `other`
- `details`
- Status: `open`, `under_review`, `resolved`, `dismissed`
- Admin fields and timestamps

RLS should allow reporters to insert and read their own reports, and admins to review them. Reported users must not read reporter identity or report details. Administrative transitions should be RPC-backed and written to `admin_actions`.

### Notification updates

Extend `notification_type` with:

- `connection_request_received`
- `connection_request_accepted`

Declines, cancellations, blocks, and reports should not create notifications to the other party.

## 9. Initial matching rules

### Eligibility filters

Apply these before scoring:

1. Viewer and candidate are different active, non-disabled profiles.
2. Both have an active goal.
3. Candidate visibility is `discoverable`.
4. Neither user has blocked the other.
5. They are not already connected and do not have an active request.
6. They share at least one language.
7. Both declare non-zero availability.
8. Candidate data meets minimum completeness requirements.

Do not use protected or sensitive traits. Do not infer personality, identity, or availability from unrelated behavior.

### Explainable ranking

Initial internal score, subject to validation with real usage:

- 40 points: complementary skills
  - Candidate offers skills the viewer needs.
  - Give an additional reciprocal boost when the viewer also offers skills the candidate needs.
- 30 points: compatible goals
  - Same broad goal type is a useful signal, but not enough by itself.
  - Use explicit structured tags or user-selected collaboration intent; do not claim semantic certainty from title text.
- 20 points: availability and collaboration-style compatibility
  - Overlapping broad weekly capacity, location mode, and at least one shared interaction mode/style.
- 10 points: language
  - At least one shared language is required; more shared languages may break ties but should not dominate.

Rank on the computed score, then use deterministic tie-breakers such as reciprocal complement strength and recently updated active goals. Avoid popularity or trust score as an early matching weight; those can create rich-get-richer effects and are not direct evidence of collaboration fit.

The UI should state why someone appeared, for example:

- “Offers React; you need React”
- “Needs marketing; you offer marketing”
- “Both prefer async co-building”
- “Both available 3–5 hours/week”
- “Shared language: English”

This is an explainable recommendation heuristic, not an AI guarantee of compatibility. Users remain responsible for evaluating fit, communicating boundaries, and deciding whether to connect.

## 10. Consent, privacy, safety, and access control

### Mutual consent

- Discovery is not a connection.
- A request is unilateral and pending.
- Only recipient acceptance creates a connection.
- Email, external contact details, and exact schedule remain private before acceptance.
- A required first-action proposal makes intent concrete without forcing off-platform contact.
- Either participant can cancel/decline as allowed by state; neither owes a reason.

### Privacy

- Replace broad `profiles` selection with safe projections.
- Keep email owner/admin-only and preferably stop mirroring it into a broadly used profile row in a later cleanup.
- Use broad availability and time zone, not precise calendar data.
- Make discoverability explicit and default new/incomplete profiles to hidden until onboarding confirmation.
- Do not reveal block/report state to the subject.
- Public Passport privacy and discovery privacy are separate controls and must not silently override one another.
- Define data retention for declined/cancelled requests and moderation reports before launch.

### Blocking

- A block is immediately effective in both discovery directions.
- Blocked users cannot send requests or interact through new 2.0 endpoints.
- The blocker alone can view/remove the block.
- All RPCs must re-check blocks at write time; filtering only in the UI is insufficient.
- Legacy follows/social endpoints should also enforce blocks before those surfaces are promoted again.

### Reporting

- Offer report actions on discovery cards, connection requests, and accepted connections.
- Separate general safety reports from trust-score-changing negative reports.
- Rate-limit reports, retain an audit trail, and expose them only to reporter/admin roles as appropriate.
- Do not automatically penalize trust or ranking from an unreviewed report.

### Supabase access control

For every new table:

- Enable RLS in the same transaction that creates the table.
- Add explicit policies before granting client access.
- Prefer ownership checks based on `auth.uid()`.
- Use transition RPCs for connection state, moderation, and other multi-row writes.
- In every definer function: fixed `search_path`, actor from `auth.uid()`, argument ownership checks, explicit `REVOKE`/`GRANT`, and a narrow return type.
- Test anonymous, owner, other authenticated user, participant, blocked user, disabled user, and admin cases.
- Keep `SUPABASE_SERVICE_ROLE_KEY` out of browser code and avoid service-role bypass for user-driven requests.

## 11. Specific implementation files

### Existing files to modify

- `src/app/page.tsx` — 2.0 landing content and CTAs.
- `src/app/layout.tsx` — metadata and configurable analytics.
- `src/components/layout/app-shell.tsx` — 2.0 navigation and route grouping.
- `src/components/auth-form.tsx` — safe destination support and onboarding-aware defaults.
- `src/app/auth/login/page.tsx` — password-reset link and `next` propagation.
- `src/app/auth/signup/page.tsx` — updated copy and onboarding destination.
- `src/app/auth/check-email/page.tsx` — onboarding-oriented confirmation copy.
- `src/app/auth/callback/route.ts` — validate `next`; route by onboarding state.
- `src/lib/auth.ts` — onboarding/completion helpers and safe public-profile handling.
- `src/lib/supabase/middleware.ts` — protect new routes.
- `src/lib/validators.ts` — goals, preferences, connections, blocks, and reports.
- `src/lib/types.ts` — generated/aligned 2.0 domain types.
- `src/components/auth/session-avatar.tsx` — route/account menu updates if required.
- `src/app/notifications/page.tsx` and `src/components/notifications/notification-center.tsx` — live connection notifications.
- `src/app/admin/page.tsx` and `src/components/admin-report-queue.tsx` — general safety report queue.
- `src/app/u/[username]/page.tsx` and `src/app/u/[username]/share/page.tsx` — safe live projection and privacy.
- `src/lib/passport.ts` — one live public model with no synthetic verification.
- `src/app/api/social/**` — stop demo-success masking and enforce blocks before re-exposure.
- `README.md`, `DEPLOY.md`, and `supabase/README.md` — accurate auth, migration, and deployment guidance.

### New application files

- `src/app/onboarding/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/connections/page.tsx`
- `src/app/goals/page.tsx`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/components/onboarding/**`
- `src/components/discovery/**`
- `src/components/connections/**`
- `src/components/goals/**`
- `src/lib/discovery.ts`
- Route handlers or server actions under `src/app/api/goals/**`, `src/app/api/connections/**`, `src/app/api/blocks/**`, and `src/app/api/reports/**`

Prefer a thin server data layer over duplicating Supabase queries across pages and route handlers.

### New migrations

Use at least two forward migrations:

1. `supabase/migrations/007_security_hardening.sql`
   - Fix definer function authorization/grants.
   - Remove direct positive-interaction state transitions.
   - Correct `is_admin` calls.
   - Restrict public profile and verification data.
   - Establish safe public profile functions/projections.
2. `supabase/migrations/008_trueverse_2_goals_connections.sql`
   - Add goal, skill, preference, connection, block, and safety-report types/tables.
   - Add indexes, triggers, RLS, safe discovery and transition RPCs.
   - Extend notification types and admin audit behavior.

Before writing either migration, inspect actual remote migration history and schema in a non-production project because repository migrations may not exactly reflect production.

## 12. Ordered implementation sequence

1. **Establish a safe database baseline**
   - Reconcile local migrations with a non-production Supabase schema.
   - Add SQL authorization regression tests.
   - Ship the forward-only security hardening migration.
   - Verify public profile output contains no email/private fields.

2. **Add the 2.0 domain schema**
   - Create enums/tables/indexes/RLS.
   - Seed a small curated skill taxonomy.
   - Implement and test goal/preference CRUD and onboarding completion.

3. **Complete auth essentials**
   - Add forgot/reset password.
   - Validate redirect destinations.
   - Route incomplete users to onboarding and complete users to discovery.

4. **Build onboarding and goals**
   - Share form components and validation.
   - Support draft, active, paused, completed, and archived states.
   - Keep discovery hidden until the user explicitly activates a valid goal.

5. **Implement computed discovery**
   - Add the safe RPC and query-plan indexes.
   - Add explainable cards and empty/error states.
   - Test privacy, blocks, disabled users, and incomplete profiles.
   - Instrument factor distribution and query latency without recording sensitive free text.

6. **Implement mutual connections**
   - Add request/accept/decline/cancel RPCs.
   - Require a concrete first action.
   - Add incoming/sent/connected UI and notifications.
   - Enforce duplicate, race, ownership, and block rules transactionally.

7. **Add safety operations**
   - Implement block/report flows.
   - Extend admin queue and audit records.
   - Define moderation response and retention policies.

8. **Switch the product shell**
   - Update landing, metadata, and primary navigation.
   - Hide legacy/dummy routes from navigation without deleting them.
   - Ensure old deep links remain safe.

9. **Replace synthetic public profile behavior**
   - Use the safe live profile projection for public and share routes.
   - Apply Passport privacy and discovery privacy independently.

10. **Release validation**
    - Run unit/integration tests for matching factors and state transitions.
    - Run RLS tests for every actor matrix.
    - Run Next.js lint/build.
    - Manually smoke-test signup, confirmation, reset, onboarding, discovery, requests, acceptance, decline, block, report, and admin review in a non-production project.
    - Review accessibility, mobile layouts, analytics consent/configuration, and Vercel preview environment variables before deployment.

## 13. Risks and decisions still needed

| Risk/decision | Recommendation |
| --- | --- |
| Live schema may differ from migration files | Reconcile in non-production before authoring forward migrations |
| Existing RPC authorization flaws | Treat hardening as a release blocker |
| Public email/profile leakage | Remove broad row access before discovery |
| Sparse marketplace at launch | Use good empty states and invite/referral prompts; do not weaken safety filters |
| Skill taxonomy quality | Start curated and small; log unmet search terms without auto-publishing tags |
| Matching cold-start | Require one active goal and both offer/need inputs; explain when inputs are insufficient |
| False compatibility confidence | Show factors, not guarantees or overly precise percentages |
| Recommendation query performance | Compute first; cache only after measured need |
| One active goal limitation | Appropriate for MVP clarity; revisit after observing multi-goal demand |
| Location privacy | Store only remote/in-person preference and optional broad region if later justified |
| Messaging scope | Keep deferred; accepted connections plus first action are sufficient for MVP validation |
| Legacy dummy/live split | Keep legacy surfaces hidden until data paths are unified |
| Moderation workload | Define ownership and response process before exposing report actions |
| Serverless rate limiting | Move high-risk write limits to durable infrastructure before launch |

## 14. MVP completion criteria

The pivot is ready for an MVP release when:

- A new user can sign up, confirm/reset credentials, and complete onboarding.
- The user can create and manage an active goal with offered/needed skills and preferences.
- Discovery returns only eligible, privacy-safe, explainable candidates.
- Recommendations honor both-direction blocks and do not claim guaranteed compatibility.
- A user can send one pending request with a first action; only the recipient can accept.
- Both users see an accepted connection, while declined/cancelled/blocked states remain private as designed.
- Users can block and report; admins can review reports without unreviewed reports changing trust.
- RLS and RPC tests prove anonymous and unrelated users cannot read or mutate private data.
- Existing pages/tables remain intact, with non-MVP surfaces hidden rather than deleted.
- Lint, build, automated authorization tests, and non-production end-to-end smoke tests pass.
