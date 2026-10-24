# Trueverse Product Bible

**Status:** Canonical — Trueverse 2.0

**Revised:** October 24, 2026 (America/Los_Angeles)

**Audience:** Product, Design, Engineering, Trust & Safety, Growth

**Engineering companion:** `docs/trueverse-2-implementation-plan.md`

**Rule:** Every feature, screen, API, and migration must comply with this document. When implementation conflicts with this Bible, the Bible wins until it is formally revised.

This revision replaces the portable-reputation product definition. Existing trust, Passport, XP, mission, and social-feed code and tables remain in the repository. They are retained infrastructure, not the current product.

---

## 1. Mission

Trueverse connects people based on what they want to accomplish next.

A member describes a goal, the skills they offer, the help they need, and how they want to collaborate. Trueverse helps them discover suitable people, exchange a mutual connection request, and agree on a concrete first action.

Trueverse is a goal-based human collaboration network. It is not an entertainment social network, a dating product, an advertising network, or a public reputation score.

---

## 2. Vision

### Initial audience

People starting businesses, building applications, creating side projects, or learning useful skills.

### Long-term vision

After the initial market is validated, expand the same collaboration model to other meaningful personal goals. Validation means people repeatedly discover relevant collaborators, accept mutual requests, and complete first actions. Expansion does not begin by adding unrelated social, scoring, advertising, or dating products.

### Product promise

Trueverse helps people find a practical collaborator for a stated goal. Recommendations explain why two goals overlap. They do not predict personal compatibility, character, or safety, and they do not guarantee an outcome.

Canonical disclaimer:

> Recommendations are based on the goals, skills, availability, and languages members choose to share. They do not predict compatibility or guarantee outcomes or safety.

---

## 3. What members can do

1. Describe a goal or project.
2. Explain what skills they have.
3. Explain what help they need.
4. Discover people based on complementary skills, shared objectives, and availability.
5. Send and accept mutual connection requests.
6. Collaborate toward a real outcome, beginning with one concrete first action.

---

## 4. MVP features

The first release contains these five features and the safety controls required to operate them.

| Order | Feature | Member outcome | Routes |
| --- | --- | --- | --- |
| 1 | Authentication | Create an account, confirm email, sign in, recover a password, and reach the correct next step | `/auth/signup`, `/auth/login`, `/auth/check-email`, `/auth/callback`, password reset |
| 2 | Goal-based onboarding | Create a goal, record offered and needed skills, and set collaboration preferences | `/onboarding`, `/goals` |
| 3 | User discovery | Review explainable, privacy-safe recommendations for one active goal | `/discover` |
| 4 | Mutual connections | Send, decline, cancel, and accept a request only with the recipient’s consent | `/connections` |
| 5 | First collaboration action | Propose one concrete action with the request and track it after acceptance | Included in the connection request and accepted connection |

The public entry point is `/`. It explains the product and leads to signup or sign-in. It does not show member data.

### 4.1 Authentication

- Email and password signup and login remain the account mechanism.
- Email confirmation is required before a goal can become discoverable or discovery can be used.
- Password reset is part of this feature. Authentication is incomplete until a member can request a reset and set a new password through a same-origin completion page.
- Successful authentication opens the requested safe relative path. A member without an active goal goes to `/onboarding`; a member with one goes to `/discover`.
- A disabled account cannot authenticate into member surfaces.
- `profiles.id` remains the same identifier as the Supabase Auth user. Do not create a second user table.

### 4.2 Goal-based onboarding

Onboarding collects:

- a specific goal or project;
- skills offered;
- skills needed;
- collaboration style;
- coarse availability, hours per week, timezone, work mode, and communication cadence;
- one or more languages.

A goal stays private until the member explicitly makes it discoverable. A member may manage more than one goal at `/goals`. Discovery uses one selected active goal at a time. Goals with connection history are archived rather than destroyed.

### 4.3 User discovery

Discovery compares the member’s selected goal with other active, discoverable goals. It prioritizes:

1. complementary skills, where one person offers a skill the other needs;
2. compatible goals and categories;
3. compatible coarse availability and collaboration constraints;
4. shared language.

At least one shared language is required. A member-selected hard constraint, such as remote-only collaboration, removes incompatible candidates. The same person, disabled accounts, either-direction blocks, and pending or accepted connections are also excluded.

The ranking is deterministic and computed when requested. The MVP does not store match recommendations. The interface leads with two or three factual reasons. An internal numeric weight may order results, but the interface must not present a public score, percentage, or verdict. Copy may say “Potential fit.” It must include the canonical disclaimer and must not claim that an algorithm or AI system guarantees compatibility.

### 4.4 Mutual connections

- Seeing a recommendation does not create a connection.
- The requester sends one request, an introduction, and a proposed first action.
- The recipient alone can accept or decline it.
- The requester can cancel a pending request.
- A decline needs no reason, and private feedback is not shown to the requester.
- Contact details and any richer collaboration channel remain hidden until acceptance and a separate consent decision.
- One pending or accepted relationship exists for each unordered pair of members.
- Participants cannot rewrite the participants, goals, or original proposal after sending.

### 4.5 First collaboration action

Every request proposes one concrete next step, such as a 20-minute introduction, a scope review, a one-week milestone, or a learning-plan exchange. The recipient sees that proposal before accepting.

After acceptance, both people see the agreed action and can mark it complete. Completion is a private record of progress. It creates no public score and no reputation change. Direct messaging is a later project; the MVP coordinates the first action on the connection record.

---

## 5. Outside the MVP

The following are outside the MVP and must not be presented as current Trueverse features:

| Area | Product boundary |
| --- | --- |
| Social feed | Community feeds, follows, appreciations, comments, activity timelines, and leaderboards stay out of primary navigation and marketing. |
| Public TrueScore | Trust scores, trust levels, stars, Trust Acts, and reputation ledgers are not public profile or discovery content. |
| Generic reputation scoring | Reputation DNA, XP, levels, streaks, missions, badges, and achievements do not rank collaborators or imply suitability. |
| Advertising | There are no ads, sponsored rankings, or paid placements. |
| Dating | Trueverse does not offer dating, romantic matching, or relationship-readiness features. |

Existing routes and tables for these areas stay in place until a separate approved cleanup. New MVP screens must not import their dummy data or use their scores.

Also deferred: direct messaging, AI-generated compatibility claims, organization tools, partner APIs, and expansion beyond the initial audience.

---

## 6. Principles

1. **A goal comes first.** Every discovery result and connection is anchored to a specific goal.
2. **Consent is mutual.** One member’s interest never exposes the other member’s contact details.
3. **Recommendations are explainable.** Members can see the skills, goal overlap, availability, and language facts used.
4. **Privacy is the default.** Goals are private until published, and discovery receives an explicit safe field list.
5. **Safety precedes growth.** Blocking, reporting, access control, and audit trails ship with discovery, not after it.
6. **Servers decide authorization.** Route protection improves usability; Supabase RLS and checked server actions decide access.
7. **One job per screen.** Mobile screens ask for the next meaningful action without dashboards or metric walls.
8. **Craft over clutter.** The interface is calm, premium, and polished, with no deceptive urgency.

---

## 7. Initial personas

### Builder

A person creating an application or side project who needs a complementary skill and can offer one in return.

### Founder

A person starting a business who wants a collaborator for a defined launch goal, with limited weekly availability.

### Learner

A person developing a useful skill who wants peer accountability or guidance tied to a specific learning goal.

### Safety operator

An internal reviewer who handles reports, disputes, disabling, and appeals through an audited admin surface that never appears in member navigation.

---

## 8. Visual direction

The MVP is mobile-first and intentionally simple. Desktop widens the same hierarchy; it does not introduce a second product.

- Use the existing Outfit display face, Plus Jakarta Sans body face, teal primary actions, neutral surfaces, and dark mode.
- Keep large headlines, short copy, generous whitespace, rounded surfaces, and subtle borders.
- Make the primary action full width on mobile, with a target of at least 44px.
- Use Framer Motion for entrance and confirmation, and honor reduced motion.
- Lead each member screen with its purpose: goal, person, or connection state.
- Show a person through their name, relevant goal, offered skill, needed skill, and a few reasons.
- Use one overflow path for block and report actions.
- Keep empty states brief and give each one a single next action.
- Meet WCAG 2.2 AA contrast, visible focus, labels, semantic headings, and non-color status cues.

The landing page contains the Trueverse name, the mission sentence, one short audience sentence, and two actions: create an account and sign in. It does not show a demo Passport, a score, a feed, an advertisement, or member recommendations.

Member navigation is Discover, Connections, and Goals, with account access through the session avatar. Admin remains outside member navigation.

---

## 9. Privacy

1. Collect the goal, skills, and collaboration details needed for discovery, not a general personal dossier.
2. New goals and preference records default to private.
3. Discovery is available only to an authenticated member with a confirmed email and an active account.
4. A recommendation may show display name, avatar, goal title and summary, offered and needed skills, shared languages, and coarse overlap. It omits email, precise schedule, timezone, private notes, role, report history, block data, and legacy reputation data.
5. Publishing a goal is a separate choice from making any legacy public profile available.
6. Pausing or hiding a goal removes it from new discovery without erasing connection history.
7. Connection content is visible only to its participants and authorized reviewers.
8. Block records are visible only to the blocker.
9. Analytics must not record goal text, report text, tokens, or private connection content.
10. Members need a documented path to export and delete collaboration content. Audit records may be retained only for safety, security, and legal duties, and the retention rule must be stated in the privacy policy.

---

## 10. Account protection

- Supabase Auth remains the identity provider.
- Signup metadata may supply the initial profile name; the database trigger remains the provisioning path.
- Sessions are refreshed in middleware, and member routes require an authenticated session.
- Password reset uses a single-use, expiring link and a same-origin completion page.
- Auth redirects accept only safe relative application paths.
- Email confirmation, password reset, connection requests, and reports have rate limits that hold across server instances.
- A disabled member loses member access and is removed from discovery and new requests.
- Service-role credentials stay on the server and are reserved for operations that RLS cannot safely express.
- The client is treated as hostile: hidden controls, profile fields, and query parameters are not authorization.

---

## 11. Trust and safety

Safety is account integrity, consent, and moderation. It is not a public reputation score.

### Required controls

- Every discovery and connection surface can block or report the other member.
- A block works in both directions immediately. It removes both people from new discovery, prevents new requests, and makes pending requests non-actionable.
- Blocking an accepted connection cancels that connection in the same server action. The interface does not reveal which person created the block.
- Reports reuse the existing report, evidence, dispute, admin-review, and audit flow.
- A report may refer to a discovery result or connection. An external evidence URL is optional when the product context identifies the event.
- Report content is visible to the reporter and authorized reviewers at submission. The reported member receives a factual notice and a contest path when a reviewed action affects their account or connection; raw allegations are not disclosed automatically.
- Submitting a report does not by itself change discovery, disable an account, or alter any legacy score.
- Consequential actions are admin actions recorded in the audit log.
- Admins can disable an account or role through the existing audited operations.
- Members cannot edit another member’s goal, preferences, identity, role, or safety state.

### Legacy trust data

Existing trust and moderation tables remain available for security and audit continuity. MVP screens do not read them for ranking, public display, or collaboration eligibility. Any future use requires a new Bible revision. Members still cannot write trust or reputation fields directly.

---

## 12. Access control

RLS is enabled on every member-data table before a feature is exposed. The implementation plan’s policy matrix is the engineering baseline:

- owners manage their goals, skills, and preferences;
- the active skill catalog is read-only to members;
- cross-member discovery uses a checked function that returns a fixed safe column set;
- connection participants, and authorized admins where required, can read a request;
- only the requester creates or cancels, and only the recipient accepts or declines;
- only the blocker can read or change a block;
- security-definer functions use a fixed search path, verify the caller and active account, and have explicit execute grants.

Anonymous, unrelated, blocked, and disabled callers are part of the acceptance tests. UI checks do not replace these controls.

---

## 13. Data boundaries

The MVP adds goals, a canonical skill catalog, goal skills, goal-scoped collaboration preferences, connection requests, and blocks. It does not add a stored recommendation table. Accepted requests represent connections. Schema changes are new migrations; existing migrations and production data remain untouched by planning and specification work.

The detailed columns, indexes, grants, and file sequence live in `docs/trueverse-2-implementation-plan.md`.

---

## 14. API and release boundaries

MVP writes pass through validated server endpoints or checked database functions. Discovery reads return only the safe field list. Clients cannot set authorization fields, connection status, or another member’s identifiers.

No migration is applied to production as part of documentation work. Production migration and deployment require a separate approved release after non-production RLS and end-to-end tests pass.

---

## 15. Monetization boundary

The MVP has no advertising and no paid ranking. Future revenue must not sell private information, charge for safety or privacy controls, or let payment influence discovery. Existing prohibitions on buying a reputation outcome remain in force for legacy data.

---

## 16. Roadmap

### Now

Ship the five MVP features with privacy, account protection, blocking, reporting, and RLS.

### After validation

Improve skill taxonomy, ranking quality, notifications, and the first-action completion experience. Consider a consented messaging system only after the connection model is proven.

### Later

Extend goal categories to other meaningful personal goals. Revisit retained legacy surfaces only through an explicit product revision.

---

## Governance

### Change control

Changes to consent, discovery exposure, blocking, report disclosure, account recovery, or RLS require a Bible revision and an implementation-plan update.

### Checklist

- [ ] The change serves one of the five MVP features or a required safety control.
- [ ] It leaves social feed, public TrueScore, generic reputation scoring, advertising, and dating outside the member experience.
- [ ] Recommendations remain explainable and make no compatibility or safety guarantee.
- [ ] Mutual consent is preserved.
- [ ] Privacy defaults and the safe discovery field list are preserved.
- [ ] RLS, grants, account checks, and audit behavior are tested.
- [ ] The interface remains mobile-first, simple, and accessible.
- [ ] No existing route, table, or production data is deleted by the change.

---

## Closing standard

Trueverse should leave a member thinking:

**“I found someone to take the next step on this goal.”**

It should not leave them thinking that a feed, a public score, an advertisement, or a dating decision brought them there.
