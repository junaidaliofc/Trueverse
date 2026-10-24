# Trueverse 2.0 — Repository Audit & Implementation Plan

**Status:** Audit + plan only (no feature implementation in this document’s delivery)  
**Date:** 2026-10-24  
**Branch audited:** `main` @ `5bbcddb` (`Add GA4 site-wide via Next.js App Router GoogleAnalytics (#8)`)  
**Working tree at audit:** clean (nothing to commit; safe to plan without overwriting uncommitted work)  
**Constraint for this phase:** Do not delete existing pages/tables, modify production data, execute migrations, deploy, or implement product features yet.

---

## 1. Product pivot summary

### Current product (shipped in repo)

Trueverse 1.x is a **portable trust / reputation** platform: Trust Acts, evidence-backed reports, XP/missions/streaks, passport profiles, follows, and a community/help feed. Canonical product spec remains `PRODUCT_BIBLE.md` (trust infrastructure, not entertainment social).

### Trueverse 2.0 MVP vision (this pivot)

Trueverse connects people based on **what they want to accomplish next**. Users express:

- a specific **goal**
- **skills they offer**
- **help they need**
- desired **collaboration style**

Then they **discover compatible people**, send **mutual connection requests**, and take a **concrete first action** together.

**Initial audience:** people building side projects, launching startups, and learning useful skills.

**Important positioning:** Matching is heuristic discovery, not a guarantee of compatibility. Do not claim AI (or any algorithm) guarantees fit, safety, or successful collaboration. Retain dignity/privacy principles from the Product Bible where they still apply.

---

## 2. Current state audit

### 2.1 Stack & configuration

| Area | Finding |
|------|---------|
| Framework | Next.js `^16.2.9` App Router, React `^19.2.7`, TypeScript strict, Tailwind CSS 4, shadcn/Radix UI, Framer Motion, Zod |
| Auth / DB | Supabase Auth + PostgreSQL via `@supabase/ssr` / `@supabase/supabase-js` |
| Path alias | `@/*` → `./src/*` |
| Middleware | Root `middleware.ts` → `src/lib/supabase/middleware.ts` (session refresh + route guards) |
| Images | `next.config.ts` allows `*.supabase.co` and `images.unsplash.com` |
| Env | `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` |
| Deploy | **No `vercel.json`**. Deploy guidance in `DEPLOY.md` (Vercel import / CLI + env + migration order). GA hardcoded in `src/app/layout.tsx` |
| Docs drift | `README.md` still describes OTP verify and only migration `001`; actual auth is email/password + callback; migrations run through `006` |

### 2.2 Routes (App Router)

#### Public / marketing

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Brand-first landing: “Portable trust for the real world” |
| `/design-system` | `src/app/design-system/page.tsx` | Living style guide |
| `/u/[username]` | `src/app/u/[username]/page.tsx` | Public passport (demo slug or live profile) |
| `/u/[username]/share` | `src/app/u/[username]/share/page.tsx` | Share/QR (demo profiles) |

#### Auth

| Route | File | Notes |
|-------|------|-------|
| `/auth/login` | `src/app/auth/login/page.tsx` | Email/password via `AuthForm` |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | Signup + email redirect to callback |
| `/auth/check-email` | `src/app/auth/check-email/page.tsx` | Post-signup messaging |
| `/auth/callback` | `src/app/auth/callback/route.ts` | `exchangeCodeForSession` |
| `/auth/verify` | `src/app/auth/verify/page.tsx` | **Hard redirect to login** (OTP removed) |

**Password reset:** **Not implemented** (no forgot-password UI, no `resetPasswordForEmail` / recovery route). Must be added for MVP production readiness.

#### Authenticated product (1.x)

| Route | Status |
|-------|--------|
| `/dashboard` | Live home: trust, XP, streak, missions |
| `/profile` | Owner passport + edit + logout |
| `/interactions`, `/interactions/create`, `/interactions/[id]` | Trust Acts (Supabase) |
| `/community`, `/activity` | UI; much of community/activity still uses dummy data |
| `/notifications` | Shell; empty list |
| `/missions`, `/badges`, `/leaderboards` | Dummy-data heavy |
| `/admin` | Report queue (Supabase `negative_reports`) |

#### Deferred / redirect stubs

| Route | Behavior |
|-------|----------|
| `/messages` | Redirect → `/dashboard` (“Messaging deferred for public beta”) |
| `/feed` | Redirect → `/community` |
| `/insights` | Redirect → `/dashboard` |

#### API routes

- `GET/PATCH /api/profile`
- `GET/POST /api/feed`, `POST /api/feed/[id]/responses`
- Trust Acts: `POST /api/interactions/positive`, accept/reject, `POST /api/interactions/negative`
- Social: follow, appreciate, comments
- Admin: users list, report review
- Auth callback (route handler)

### 2.3 Navigation & shell

`src/components/layout/app-shell.tsx` (wrapped by `src/app/layout.tsx`):

- **Marketing** (`/`, `/auth/*`, `/design-system`): Sign in / Get Started
- **App nav:** Home → `/dashboard`, Passport → `/profile`, Community → `/community`, Alerts → `/notifications`
- Messages not in nav

**Middleware protected prefixes** (`src/lib/supabase/middleware.ts`):  
`/dashboard`, `/profile`, `/interactions`, `/notifications`, `/missions`, `/badges`, `/community`, `/activity`, `/admin`  
Authed users hitting login/signup redirect to **`/dashboard`** (not onboarding).

### 2.4 Auth / profiles / messaging (detail)

| Capability | Status | Key files |
|------------|--------|-----------|
| Signup / login | Working (Supabase password) | `auth-form.tsx`, login/signup pages |
| Email confirm callback | Working | `auth/callback/route.ts` |
| Password reset | **Missing** | — |
| Session refresh | Working | `lib/supabase/middleware.ts` |
| Profile ensure | Working | `lib/auth.ts` (`ensureProfile`, `requireProfile`, `requireAdmin`) |
| Profile edit API | Working | `api/profile/route.ts`, `profile-form.tsx` |
| Public passport | Partial (demo + live) | `u/[username]`, `lib/passport.ts` |
| Messaging / DMs | **Not built** | `messages/page.tsx` redirect only; no tables |

### 2.5 Supabase schema & RLS

Migrations (apply order per `DEPLOY.md`; `006` exists but is omitted from DEPLOY list):

| Migration | Purpose |
|-----------|---------|
| `001_trueverse_schema.sql` | profiles, trust events, positive_interactions, negative_reports, evidence, disputes, help_requests, community_responses, admin_actions, notifications, storage, core RLS + RPCs |
| `002_trust_xp_reputation_dna.sql` | trust_index/level, username, reputation_dna, XP, badges/achievements |
| `003_core_loop.sql` | missions, activity_events, streaks |
| `004_social_graph.sql` | **unilateral** `follows`, appreciations, comments |
| `005_passport.sql` | verifications, `passport_privacy` |
| `006_auth_profile_name.sql` | `handle_new_user` name metadata fix |

**Exists and reusable for safety:** reporting (`negative_reports` + evidence + admin review), profile disable (`is_disabled`), admin roles, notifications pattern, passport privacy toggles.

**Does not exist:** goals, skills catalog/offer/need, collaboration preferences, mutual connection requests, blocks/mutes, match recommendation storage, DM/messaging tables.

**Closest mutual-consent template:** `positive_interactions` — directed pair, `pending` → `accepted`/`rejected`/`expired`, recipient-only accept/reject RPCs, participant RLS, notifications on state change. Reuse this **pattern**, not the trust-delta side effects, for connection requests.

`seed.sql` is placeholder-only; demo passport uses `src/lib/dummy-data.ts`.

### 2.6 Product Bible conflict (explicit)

`PRODUCT_BIBLE.md` defines Trueverse as portable **reputation infrastructure**. Trueverse 2.0 pivots primary UX to **goal-based collaboration matching**.

**Plan recommendation:** Keep Bible trust/safety invariants (signals ≠ guarantees, server authority, privacy, reporting) as constraints. Formally revise or add a `PRODUCT_BIBLE` addendum for 2.0 so product/engineering do not fight the old “not a social network” framing while shipping Discover/Connections. Do **not** delete the Bible in MVP; version the product narrative.

---

## 3. Reuse / hide / add matrix

### 3.1 REUSE (keep and build on)

| Asset | Why |
|-------|-----|
| Next.js + Supabase auth clients (`lib/supabase/*`, `lib/auth.ts`) | Solid session/profile foundation |
| Auth login/signup/callback/check-email | Keep; extend with password reset |
| `profiles` + username/photo/bio | Identity for discovery cards |
| `passport_privacy` pattern | Model for goal/profile visibility toggles |
| `positive_interactions` consent flow | Blueprint for `connection_requests` |
| `negative_reports` + admin queue | Reporting for abuse on matches/connections |
| `notifications` table + types (extend enum) | Inbox for connection events |
| `ensure_active_user` / `is_disabled` | Gate disabled users out of matching |
| UI primitives (`components/ui/*`), motion primitives, theme | Speed to ship polished MVP UI |
| Rate limiting (`lib/rate-limit.ts`), Zod validators pattern | Apply to new APIs |
| Design tokens (`lib/design.ts`, `globals.css`) | Visual continuity; retarget copy |
| Vercel + env deploy path (`DEPLOY.md`) | Same host; update smoke tests later |

### 3.2 HIDE (do not delete; demote from primary UX)

Keep routes/tables; remove from primary nav and post-login default. Prefer soft-hide (nav, CTAs, redirects) over file deletion.

| Surface | How to hide in MVP |
|---------|-------------------|
| Trust-first landing copy | Rewrite `/` for goal/collaboration vision; keep old demo CTA secondary or remove from hero |
| `/dashboard` XP/missions/streak home | Stop using as default post-auth destination; optionally redirect to `/discover` or `/goals` |
| App nav: Community / Passport-as-primary | Replace with Discover / Connections / Goals |
| `/missions`, `/badges`, `/leaderboards`, `/activity` | Keep reachable by URL; drop from nav |
| `/interactions` Trust Acts | Keep for trust operators / later; not MVP core loop |
| Unilateral `/api/social/follow` as “connection” | Do not present follows as mutual collaboration connections |
| Help-request feed as primary discovery | Do not use as substitute for goal matching |
| Product Bible “portable trust” as sole story | Add 2.0 narrative; keep trust as optional signal later |

### 3.3 ADD (MVP)

| Area | Deliverable |
|------|-------------|
| Routes | `/onboarding`, `/discover`, `/connections`, `/goals` (+ APIs) |
| Auth | Password reset request + update flow |
| Schema | goals, skills, user_skills, collaboration_preferences, connection_requests, user_blocks (+ RLS) |
| Matching | Server-side computed recommendations (no persisted match table by default) |
| Safety | Block + report entry points on discover/connection UIs; RLS respects blocks |
| Shell | New nav; protect new routes in middleware; onboarding gate |
| Copy / landing | Goal-collaboration positioning; no compatibility guarantees |
| Docs | Update README/DEPLOY smoke tests when implementing (not in this audit commit beyond this plan) |

---

## 4. Proposed MVP routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | Public | Landing: brand + one headline about accomplishing goals with compatible collaborators + CTAs (Get Started / Sign in). No dashboard clutter. |
| `/onboarding` | Required | Create primary goal, skills offer/need, collaboration preferences (availability, style, languages). Completes when minimum profile exists. |
| `/discover` | Required | List compatible people for active goal(s); show why they ranked (skills/goal/availability/language). Explicit disclaimer: suggestions ≠ guaranteed fit. |
| `/connections` | Required | Outgoing/incoming mutual connection requests; accept/decline; list mutual connections; CTA for “first action together.” |
| `/goals` | Required | Create/edit/archive active goals; manage skills attached to goals. |

**Post-auth default (recommended):**

1. If no completed onboarding → `/onboarding`
2. Else → `/discover`

**Auth routes to keep/extend:** `/auth/login`, `/auth/signup`, `/auth/check-email`, `/auth/callback`, plus new `/auth/forgot-password` and `/auth/reset-password` (names flexible).

**Messaging:** Still deferred for first slice unless “first action” requires a channel. Prefer structured first-action fields on accepted connections (e.g. suggested next step text + optional link) before full DMs. Leave `/messages` stub until a later phase.

---

## 5. Minimal schema design

**Principle:** Additive migrations only (`007_…` onward). Do not drop 1.x tables. Prefer **computed matching** over storing recommendations.

### 5.1 Tables to add

#### `skills` (catalog)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | citext unique | e.g. `react`, `fundraising` |
| `label` | text | Display name |
| `category` | text nullable | e.g. `engineering`, `design`, `growth` |
| `created_at` | timestamptz | |

Seed a small curated catalog for side-project / startup / learning audience; allow free-text only if normalized carefully (MVP: catalog + “other” later).

#### `goals`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `profile_id` | uuid → profiles | Owner |
| `title` | text (4–120) | Specific goal |
| `description` | text (optional, ≤1000) | |
| `status` | enum | `active`, `paused`, `completed`, `archived` |
| `visibility` | enum | `discoverable`, `connections_only`, `private` |
| `category` | text nullable | startup / side_project / learning |
| `created_at` / `updated_at` | timestamptz | |

#### `goal_skills`

| Column | Type | Notes |
|--------|------|-------|
| `goal_id` | uuid → goals | |
| `skill_id` | uuid → skills | |
| `kind` | enum | `offer` \| `need` |
| Unique | `(goal_id, skill_id, kind)` | |

#### `collaboration_preferences`

One row per profile (or per goal if needed later; MVP: **per profile**).

| Column | Type | Notes |
|--------|------|-------|
| `profile_id` | uuid PK → profiles | |
| `style` | enum | e.g. `async_chat`, `scheduled_calls`, `pair_sessions`, `mentor_mentee`, `cofounder_explore` |
| `availability` | enum | e.g. `few_hours_week`, `evenings`, `weekends`, `flexible` |
| `hours_per_week_min/max` | int nullable | Optional fine grain |
| `languages` | text[] | BCP-47 or simple codes: `en`, `es`, … |
| `timezone` | text nullable | IANA |
| `looking_for` | text nullable | Short freeform |
| `open_to_discover` | boolean default true | Soft opt-out of matching |
| `updated_at` | timestamptz | |

#### `connection_requests` (mutual consent)

Mirror Trust Act consent without trust deltas.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `requester_id` | uuid → profiles | |
| `recipient_id` | uuid → profiles | |
| `from_goal_id` | uuid → goals nullable | Context |
| `to_goal_id` | uuid → goals nullable | Optional recipient goal |
| `message` | text (≤500) | Why connect / proposed first action |
| `proposed_first_action` | text (≤280) | Concrete next step |
| `status` | reuse `interaction_status` or new enum | `pending`/`accepted`/`rejected`/`expired`/`withdrawn` |
| `expires_at` | timestamptz | e.g. 14 days |
| `accepted_at` / `rejected_at` | timestamptz | |
| Constraints | no self; unique pending pair | Prevent spam duplicates |

RPCs: `accept_connection_request`, `reject_connection_request`, `withdraw_connection_request` (requester), with notifications.

#### `user_blocks` (required for safe discovery)

| Column | Type | Notes |
|--------|------|-------|
| `blocker_id` | uuid → profiles | |
| `blocked_id` | uuid → profiles | |
| `created_at` | timestamptz | |
| Unique | `(blocker_id, blocked_id)` | no self |

### 5.2 Do **not** add in MVP (unless later justified)

| Table | Decision |
|-------|----------|
| `match_recommendations` | **Skip.** Compute at read time in `/api/discover` (or SQL function). Persist only if we need analytics, caching at scale, or admin audit of scores. |
| `messages` / threads | Defer; use `proposed_first_action` + external link or later DM phase |
| Altering/dropping 1.x trust tables | Forbidden for this pivot phase |

### 5.3 Enum / notification extensions

Extend `notification_type` (new migration) with e.g.:

- `connection_request_received`
- `connection_request_accepted`
- `connection_request_rejected`

Optional later: `goal_expiring`, etc.

### 5.4 Profiles additive fields (optional, light)

Prefer separate tables above. If needed for gating:

- `profiles.onboarding_completed_at timestamptz` — simple gate without joining many tables

Do not overload `bio` as the sole skills/goals store.

---

## 6. Initial matching rules (computed)

**Disclaimer (product + UI):** Recommendations help people find plausible collaborators. They do **not** guarantee compatibility, safety, skill level, or outcome. No “AI matched you perfectly” claims.

### 6.1 Eligibility filters (hard)

Exclude candidates when any is true:

1. Same user as viewer  
2. `profiles.is_disabled`  
3. Either side has a `user_blocks` row involving the other  
4. Candidate `open_to_discover = false`  
5. Candidate has no `active` goal with `visibility = discoverable`  
6. Existing **pending or accepted** connection between the pair (optional: still show accepted under Connections, not Discover)  
7. Viewer has not completed onboarding  

### 6.2 Scoring signals (soft, weighted)

Compute a score from viewer’s active goal(s) + prefs vs candidate’s:

| Signal | Idea | Weight (starting) |
|--------|------|-------------------|
| Complementary skills | Overlap of viewer `need` ↔ candidate `offer` (and reverse) | High |
| Compatible goals | Shared category / token overlap on title+description (simple ILIKE/tsvector later) | High |
| Availability | Same or compatible `availability` / overlapping hours | Medium |
| Language | Non-empty intersection of `languages` | Medium (hard-filter if viewer requires intersection) |
| Collaboration style | Exact or adjacent `style` | Low–medium |
| Recency / completeness | Active goal updated recently; profile has photo/name | Low tie-breaker |

**Not used as compatibility proof:** trust score, XP, streaks, follows. Trust may appear later as an optional **signal badge**, never as “safe to collaborate.”

### 6.3 Ranking & presentation

1. Apply hard filters  
2. Score remaining candidates  
3. Return top N (e.g. 20) with **explain chips**: “Offers React you need”, “Both building side projects”, “Shares English”, “Evenings overlap”  
4. Empty state: prompt to broaden skills/prefs or create another goal  

### 6.4 Implementation shape

- Prefer `GET /api/discover?goal_id=` server route using user’s session  
- SQL function `discover_candidates(viewer_id, goal_id)` **or** application-side query + score in TypeScript for MVP clarity  
- Rate-limit discover and connection-create endpoints  

---

## 7. Mutual consent, privacy, blocking, reporting, access control & RLS

### 7.1 Mutual consent

- Connection is **not** complete until recipient accepts  
- Requester can withdraw while pending  
- Rejected/expired requests do not create a connection  
- Follows remain unilateral and **must not** unlock connection-only content  
- First action text is a proposal, not a commitment  

### 7.2 Privacy

- Goals: `discoverable` | `connections_only` | `private`  
- Discover only shows discoverable active goals + public profile fields (name, username, photo, limited bio)  
- Collaboration preferences: readable by authenticated discoverers only if `open_to_discover`; never expose email via discover API  
- Reuse/adapt `passport_privacy` ideas for which passport sections show on `/u/[username]`  
- Public landing and cards: no private goal descriptions  

### 7.3 Blocking

- Any authenticated user can block another → write `user_blocks`  
- Block hides both directions from Discover and prevents new connection requests (enforce in RPC + RLS)  
- Existing pending requests involving a block: auto-expire or reject in RPC  
- Blocked users should not see that they were blocked (generic errors)  

### 7.4 Reporting

- Reuse `negative_reports` (+ evidence) for abuse from discover/connection surfaces  
- Add UI entry points: report from profile card / connection thread  
- Admin continues via `/admin` + `review_negative_report`  
- Do not auto-adjust trust from collaboration disputes in MVP unless product explicitly wants that coupling later  

### 7.5 Access control (app layer)

| Route / API | Rule |
|-------------|------|
| `/onboarding`, `/discover`, `/connections`, `/goals` | Middleware-protected; require session |
| Goal CRUD | Owner only |
| Connection create | Authenticated, not blocked, not self, rate-limited |
| Accept/reject | Recipient only (RPC) |
| Discover | Authenticated + onboarding complete |
| Admin | Existing `requireAdmin` |

Update `PROTECTED_PREFIXES` and post-login redirects accordingly.

### 7.6 Supabase RLS (target policies)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `skills` | Public or authenticated read | Admin/service only | Admin | Admin |
| `goals` | Owner always; others if `discoverable` and not blocked; connections may see `connections_only` if accepted | Owner | Owner | Owner (or soft archive) |
| `goal_skills` | Same visibility as parent goal | Owner | Owner | Owner |
| `collaboration_preferences` | Owner; authenticated discoverers if `open_to_discover` and not blocked | Owner | Owner | Owner |
| `connection_requests` | Participants (+ admin) | Requester (checks) | Via RPC only preferred | No hard delete |
| `user_blocks` | Blocker sees own blocks | Blocker | — | Blocker can unblock |

**Defense in depth:** Prefer SECURITY DEFINER RPCs for accept/reject (like Trust Acts) so clients cannot forge status transitions. Service role only in trusted server admin paths.

**Disabled users:** `ensure_active_user`-style checks on write RPCs.

---

## 8. Specific files to modify (when implementation starts)

> This section is a map for future PRs. **This audit delivers documentation only.**

### 8.1 New files (expected)

- `src/app/onboarding/page.tsx` (+ step components under `src/components/onboarding/`)  
- `src/app/discover/page.tsx` + `src/components/discover/*`  
- `src/app/connections/page.tsx` + `src/components/connections/*`  
- `src/app/goals/page.tsx` + `src/components/goals/*`  
- `src/app/api/goals/route.ts`, `src/app/api/goals/[id]/route.ts`  
- `src/app/api/discover/route.ts`  
- `src/app/api/connections/route.ts`, `.../[id]/accept`, `.../[id]/reject`  
- `src/app/api/blocks/route.ts`  
- `src/app/auth/forgot-password/page.tsx`, `src/app/auth/reset-password/page.tsx`  
- `src/lib/matching.ts` (scoring + explain)  
- `src/lib/validators.ts` extensions (or `validators-goals.ts`)  
- `supabase/migrations/007_goals_skills_collaboration.sql`  
- `supabase/migrations/008_connection_requests_blocks.sql` (or combine carefully)  
- Optional: `docs/trueverse-2-product-addendum.md` for Bible revision  

### 8.2 Existing files to change

| File | Change |
|------|--------|
| `src/app/page.tsx` | Rewrite hero for goal/collaboration MVP |
| `src/components/layout/app-shell.tsx` | Nav → Discover / Connections / Goals (+ Alerts optional) |
| `src/lib/supabase/middleware.ts` | Protect new routes; redirect incomplete onboarding; post-auth → onboarding/discover |
| `src/components/auth-form.tsx` + auth pages | Links to password reset; copy |
| `src/lib/types.ts` | Types for goals/skills/prefs/connections |
| `src/lib/validators.ts` | Zod schemas for new APIs |
| `src/app/layout.tsx` | Only if shell/marketing detection needs new public paths |
| `README.md`, `DEPLOY.md` | Document 2.0 routes, new migrations, smoke tests (implementation PR) |
| `PRODUCT_BIBLE.md` | Formal addendum/revision in a dedicated product PR |

### 8.3 Leave in place (hidden, not deleted)

All 1.x pages/APIs/migrations listed in §2; `/messages` stub; Trust Act stack; XP/missions components; social follow APIs.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Product Bible vs 2.0 narrative conflict | Explicit addendum; engineering follows this plan + addendum for MVP scope |
| Accidental deletion of 1.x surfaces | Hide via nav/defaults only; no DROP TABLE; no `rm` of route folders in MVP |
| Public profiles oversharing goals | Default new goals to conscious visibility; RLS + API field allowlists |
| Spam connection requests | Rate limits, expiry, unique pending pair, blocks |
| Matching feels like “AI dating” | Copy + explain chips; no guarantee language; complementary skills framing |
| Storing match rows early | Compute on read; add cache table only with metrics justifying it |
| Password reset gap | Ship reset with auth hardening before broad invite |
| Blocking vs existing follows | Blocks must override follows and discover independently |
| Middleware redirect loops | Centralize onboarding completion check; careful `next` param handling |
| Doc/ops drift (`README` OTP, DEPLOY missing `006`) | Fix docs in implementation PR; include `006`+new migrations in apply order |
| Coupling Trust Acts to connections | Keep separate tables/RPCs; optional later “Trust Act after collab” |
| Empty marketplace (cold start) | Seed skills catalog; encourage multiple goals; quality empty states; possible waitlist |

---

## 10. Ordered implementation sequence

Do **not** start step 2 until product agrees this plan. Each step should be its own PR where practical.

### Phase 0 — Align (docs / product)

1. Review and accept this plan  
2. Draft Product Bible 2.0 addendum (goals, matching disclaimer, audience)  
3. Confirm messaging deferred vs minimal first-action field only  

### Phase 1 — Schema + RLS (no UI)

1. Write migrations `007`(+`008`) for skills, goals, goal_skills, collaboration_preferences, connection_requests, user_blocks, notification types, optional `onboarding_completed_at`  
2. Seed skills catalog  
3. Apply in **staging only**; never in this audit phase  
4. Verify RLS with authenticated role tests  

### Phase 2 — Auth hardening

1. Forgot/reset password flows + Supabase redirect URLs  
2. Middleware: protect `/onboarding|/discover|/connections|/goals`  
3. Onboarding completion gate  

### Phase 3 — Onboarding + Goals

1. `/onboarding` multi-step create goal + skills + prefs  
2. `/goals` manage active goals  
3. APIs + validators + rate limits  

### Phase 4 — Discover (computed matching)

1. Matching lib + `/api/discover`  
2. `/discover` UI with explain chips + disclaimer  
3. Block/report actions on cards  

### Phase 5 — Connections (mutual consent)

1. Request / accept / reject / withdraw RPCs + APIs  
2. `/connections` inbox + mutual list + first-action display  
3. Notifications wired  

### Phase 6 — Shell + landing pivot

1. Rewrite `/` for 2.0  
2. Replace app nav; change post-login default  
3. Soft-hide 1.x primary entry points  

### Phase 7 — Hardening & docs

1. Update `README.md` / `DEPLOY.md` smoke tests  
2. Lint/build; staging QA checklist  
3. Production migration + deploy **only after** explicit approval  

---

## 11. Out of scope for this deliverable (explicit)

- Implementing any of the routes/APIs/schema above  
- Running `supabase db push` or altering production data  
- Deleting pages or tables  
- Deploying to Vercel  
- Building messaging, AI ranking models, or match persistence  
- Revising Product Bible text in this same change set (recommended as follow-up)  

---

## 12. Audit evidence checklist

| Item | Result |
|------|--------|
| Branch | `main`, clean, synced with `origin/main` @ `5bbcddb` |
| Framework | Next.js 16 App Router + Supabase |
| Routes | Catalogued in §2.2 |
| Components | Shell, auth, passport, trust, social, XP, UI kit present |
| Migrations | `001`–`006` present under `supabase/migrations/` |
| RLS | Present on core tables; gaps for goals/blocks/connections |
| Login/signup | Present; password reset **absent** |
| Profiles | Present (private + public passport) |
| Messaging | Stub redirect only |
| Vercel | No `vercel.json`; `DEPLOY.md` documents Vercel env + deploy |
| Uncommitted work | None at audit time |

---

## 13. Success criteria for the eventual MVP (definition of done)

1. New user can sign up, reset password, complete onboarding (goal + skills + prefs)  
2. User sees discover results with transparent reasons and no compatibility guarantees  
3. Mutual connection requires accept; blocks and reports work end-to-end  
4. Goals can be managed on `/goals`  
5. 1.x tables/pages remain in repo; primary nav is 2.0 surfaces  
6. RLS prevents reading others’ private goals and forging connection accepts  

---

*End of Trueverse 2.0 implementation plan (audit-only delivery).*
