# Trueverse Trust Engine v1 — Technical Specification

**Status:** **Approved as long-term architecture — implementation deferred**  
**Milestone:** 4 (future)  
**Classification:** Confidential — Trueverse intellectual property  
**Audience:** Engineering, product, security, trust & safety  
**Related systems:** XP Engine (isolated), Mission Engine (habit/XP only), Moderation Engine, Passport  

### Implementation freeze

- This specification is the **future design** of the Trueverse Trust Engine.  
- **Do not implement Trust Engine v1** during MVP / public beta.  
- Beta continues to use the **current simple trust calculation** (legacy accept/report deltas + public Trust Level bands).  
- Implementation begins only **after real users provide feedback**, and only with an explicit kickoff.  
- Until then, treat this document as frozen architecture: edit only for clarifications that do not trigger build work.

---

## 0. Purpose

The Trust Engine is the core reputation IP of Trueverse. It converts verified real-world behavior and account integrity signals into a single public **Trust Level**.

This document specifies the engine design, data model, APIs, security boundaries, abuse controls, and server-side calculation strategy for v1.

### Product outcomes

| Goal | How v1 addresses it |
|------|---------------------|
| Prevent manipulation | Multi-signal scoring; no single action can dominate; velocity & graph caps |
| Prevent fake reputation | Identity/standing gates; unique-contributor diversity; sybil signals |
| Prevent trust farming | Reciprocity damping; diminishing returns; cool-downs |
| Reward long-term consistency | Consistency & account-age factors with slow accrual |
| Never expose formula publicly | Public APIs return **Trust Level only**; weights stay server-private |
| Server-side only | All mutations via security-definer RPCs / trusted workers |

### Hard product rules (non-negotiable)

1. **XP never increases Trust.** Daily login, streaks, XP awards, cosmetic unlocks — never Trust inputs.  
2. **Daily habit missions never increase Trust.** (See §1.2 for which “missions” may count.)  
3. **Clients display Trust; servers compute Trust.**  
4. **Members cannot PATCH Trust fields.**  
5. **Public surface = Trust Level only** (plus factual counts/verification as already productized). Never raw score, never factor breakdown, never weights.  
6. **Trust is a reputation signal, not a safety certificate.** All public Trust surfaces retain the product disclaimer.  
7. **Monetization must never sell Trust** or pay-to-win reputation.

### Current state (context)

Today’s schema has a dual stack:

- Legacy `profiles.trust_score` (0–1000) mutated by naïve deltas (`+3` accept, `−5` approved report) in `apply_trust_delta`.  
- Product-facing `trust_index` (0–100) + `trust_level` enum exist, but are **not fully driven** by a multi-factor engine.

v1 replaces naïve fixed deltas with a **private, multi-factor recomputation** that writes only `trust_level` (and internal index for audit). Legacy `trust_score` is deprecated for product use.

---

## 1. Reputation Engine Specification

### 1.1 Public output (contract)

**The only customer-facing Trust output is:**

```text
trust_level ∈ { new, developing, established, highly_established, exceptional }
```

Optional UI presentation derived **only** from that enum:

- Level label: New / Developing / Established / Highly Established / Exceptional  
- Stars: 1–5 mapped 1:1 to level ordinal (presentation only)

**Must never be returned on member or public APIs:**

- Internal trust index / ledger numbers  
- Per-factor scores or contributions  
- Weights, thresholds, decay constants  
- Risk/abuse scores  
- “Why you have this level” algorithmic factor breakdowns that reveal the formula  

Allowed adjacent public facts (not the formula): Trust Acts count, identity verification state, badges, Passport DNA (explanatory dimensions — separate from Trust Level computation exposure), product disclaimer.

### 1.2 Inputs (signal catalog)

All inputs are **server-observed facts**. Clients may submit *events*; they never submit *scores*.

| Signal ID | Input | Trust-eligible? | Source of truth |
|-----------|--------|-----------------|-----------------|
| `S1` | Verified Trust Acts | Yes | Accepted positive interactions (recipient accepted) |
| `S2` | Unique Contributors | Yes | Distinct counterparties on verified Trust Acts |
| `S3` | Identity Verification | Yes | `profile_verifications` / `identity_verified` |
| `S4` | Account Age | Yes | `profiles.created_at` |
| `S5` | Consistency | Yes | Temporal distribution of verified acts over windows |
| `S6` | Mission Completion | **Conditional** | Only **verified community / real-world missions** (moderated). Daily XP habit missions **excluded**. |
| `S7` | Community Participation | Yes | Verified community contributions (help fulfilled, organized events) — not follows/likes |
| `S8` | Verified References | Yes | Accepted references from eligible referrers |
| `S9` | Rejected Reports | Yes (integrity+) | Reports against user that admins reject as unfounded *(bounded)* |
| `S10` | Resolved Disputes | Yes | Dispute outcomes that restore standing or confirm integrity |
| `S11` | False Reports Submitted | Yes (penalty) | Reports the user filed that admins mark false/abusive |
| `S12` | Account Standing | Yes (gate/penalty) | `is_disabled`, suspension flags, severe sanctions |

**Explicit non-inputs (never affect Trust):**

- XP, streaks, daily login  
- Daily/weekly habit mission checkboxes (Appreciate someone, Upload photo, etc.)  
- Follows, comments, feed appreciations (social graph)  
- Profile completion %, cosmetics, themes  
- Self-reported bio text  
- Payment / subscription status  

### 1.3 Internal model (private)

Internally (never public), the engine maintains:

1. **`trust_index`** — integer 0–100, private working score.  
2. **`trust_level`** — derived from index via fixed public bands (bands are product UX; **weights that produce the index are secret**).  
3. **Factor vector `F`** — normalized private features in `[0,1]` or bounded integers.  
4. **Abuse / risk modifiers `R`** — dampening multipliers and hard caps.  
5. **Versioned policy** — `trust_policy_version` so recomputes are reproducible.

#### Public level bands (UX contract — not the formula)

| Level | Internal index band |
|-------|---------------------|
| New | 0–20 |
| Developing | 21–40 |
| Established | 41–65 |
| Highly Established | 66–85 |
| Exceptional | 86–100 |

> Note: Publishing bands is OK for product clarity. Publishing **how** an index is produced from inputs is not.

#### Conceptual computation (illustrative — exact weights stay out of this public repo section)

```text
index' = clamp(0, 100,
  Base
  + Σ (w_i * f_i)          -- positive integrity & contribution factors
  - Σ (p_j * penalty_j)    -- standing / false reports / abuse penalties
)

index  = apply_abuse_modifiers(index', R)
level  = band(index)
```

**Exact `w_i`, `p_j`, saturation curves, and `R` live only in server-private policy storage** (§6).  
This markdown states *structure and intent*; implementation must not hardcode secret weights into client bundles or public docs beyond what is required for internal engineering.

#### Factor intent (engineering guidance, not public copy)

| Factor | Intent | Shape (v1) |
|--------|--------|------------|
| Trust Acts | Reward verified help | Log/saturating count — early acts matter more than farming volume |
| Unique Contributors | Diversity over clique farming | Count of distinct counterparties with eligibility filters |
| Identity Verification | Raise confidence floor | Step / tier boost once identity verified; email-only is weaker |
| Account Age | Slow burn | Soft floor + gradual unlock of higher bands |
| Consistency | Long-term pattern | Ratio of active weeks with verified acts vs bursts |
| Verified Missions / Community | Real-world participation | Count of moderated mission completions & community events |
| References | External attestation | Few high-quality references ≫ many low-quality |
| Rejected Reports | Integrity signal | Small bounded positive when cleared (anti-harassment) |
| Resolved Disputes | Fair process | Restore / partial restore only via moderation outcome |
| False Reports Submitted | Penalty | Escalating penalty + velocity freeze |
| Account Standing | Gate | Disabled/suspended → force New / freeze accrual |

### 1.4 Diminishing returns & consistency

v1 uses saturating transforms so volume alone cannot mint Exceptional:

- Per-signal soft caps (e.g. Trust Acts beyond N contribute near-zero).  
- Unique-contributor ratio: acts from the same counterparty beyond K are heavily damped.  
- Time windows: recent burst without history cannot outrun consistent mid-term behavior.  
- Level promotion hysteresis: require stability window before upgrading (anti-ping-pong).  
- Level demotion: possible on standing/report outcomes; not on social silence alone.

### 1.5 Event-driven triggers

Recompute is **event-driven**, not client-polled:

| Trigger event | Action |
|---------------|--------|
| Trust Act accepted | Recompute recipient? **No** — recompute **author** (giver) per product: acceptance credits the submitter’s verified act. Optionally refresh DNA separately. |
| Report approved / rejected | Recompute reported user and/or reporter as applicable |
| Dispute resolved | Recompute subject |
| Identity verification completed | Recompute subject |
| Reference accepted | Recompute subject |
| Verified community mission completed | Recompute subject |
| Standing change (disable/suspend) | Immediate recompute / freeze |
| Admin trust policy override | Audited recompute |
| Scheduled reconciliation | Nightly job recomputes drifted profiles |

### 1.6 Reputation DNA relationship

Passport / Reputation DNA dimensions (Helping, Reliability, Integrity, Community, Leadership, …) are **explanatory presentation signals**.

v1 rules:

- DNA may be updated by the same trusted events.  
- DNA **must not** be writable by users.  
- DNA **must not** leak Trust formula weights.  
- Public Trust Level remains the sole Trust *output*; DNA is complementary storytelling, not a second Trust score.

### 1.7 Versioning

Every recompute stores:

- `trust_policy_version` (e.g. `te_v1.0.0`)  
- `computed_at`  
- Optional opaque `computation_id` for audit  

Policy changes that alter weights require a new version and a documented migration/backfill plan (§6.5).

---

## 2. Database Changes

> Planned migration: `006_trust_engine_v1.sql` (name reserved; **not created until approval**).

### 2.1 Profiles — Trust fields

| Column | Type | Notes |
|--------|------|-------|
| `trust_level` | `trust_level` enum | **Public** product field |
| `trust_index` | `integer` 0–100 | **Internal only** — RLS: owner may read? **Prefer admin-only / no client select of index** (see §4) |
| `trust_policy_version` | `text` | Last policy used |
| `trust_computed_at` | `timestamptz` | Last successful recompute |
| `trust_frozen` | `boolean` | Abuse / standing freeze |
| `trust_acts` | `integer` | Public factual count |
| `unique_contributors` | `integer` | Public factual count |
| `identity_verified` | `boolean` | Public factual state |
| `account_standing` | enum `good` / `restricted` / `suspended` / `disabled` | Internal + limited public |

**Deprecate for product:** `trust_score` (0–1000). Keep column temporarily for back-compat; stop writing new semantics to it after cutover. Dual-write period optional (§7).

### 2.2 Private policy store

```text
trust_engine_policy
  id, version, status (draft|active|retired)
  config jsonb          -- weights, caps, windows — SERVICE ROLE / security definer ONLY
  notes, created_at, created_by
```

RLS: **no SELECT for `authenticated` / `anon`**. Only `security definer` functions and service role.

### 2.3 Trust computation audit ledger

Replace/extend naïve delta ledger with computation records:

```text
trust_computations
  id uuid PK
  profile_id uuid FK
  policy_version text
  trust_index_before int
  trust_index_after int
  trust_level_before trust_level
  trust_level_after trust_level
  trigger_reason text          -- enum-like: trust_act_accepted, report_approved, ...
  trigger_source_table text
  trigger_source_id uuid
  factor_snapshot jsonb        -- PRIVATE; admin/service only
  abuse_flags text[]
  created_at timestamptz
```

```text
trust_signal_events
  id uuid PK
  profile_id uuid
  signal_id text               -- S1..S12
  delta_hint numeric           -- opaque contribution hint for audit, not public
  meta jsonb                   -- counterparties, mission id, etc.
  created_at timestamptz
```

Legacy `trust_score_events` remains immutable history; new engine writes to `trust_computations`.

### 2.4 Abuse & graph tables

```text
trust_act_edges
  author_id, recipient_id
  accepted_count, last_accepted_at
  damped boolean
  primary key (author_id, recipient_id)
```

```text
trust_abuse_signals
  id, profile_id
  kind enum (
    reciprocity_farming, velocity_spike, sybil_cluster,
    mass_reporting, purchased_interaction_suspected,
    bot_behavior, duplicate_identity_suspected, other
  )
  severity smallint
  status enum (open, confirmed, cleared)
  evidence jsonb
  created_at, reviewed_by, reviewed_at
```

```text
trust_rate_limits
  profile_id, action_key, window_start, action_count
```

### 2.5 References (if not already present)

```text
verified_references
  id, subject_id, referrer_id
  status (pending|accepted|rejected|revoked)
  body, created_at, accepted_at
  constraints: no self-ref; referrer eligibility checked in RPC
```

### 2.6 Verified community missions (Trust-eligible)

Distinct from XP daily missions:

```text
community_mission_completions
  id, profile_id, mission_template_id
  verification_status (pending|verified|rejected)
  verified_at, verified_by
  -- only verified rows feed S6/S7
```

### 2.7 RLS summary for new tables

| Table | `anon`/`authenticated` read | Write |
|-------|----------------------------|-------|
| `trust_engine_policy` | **None** | Service / admin RPC |
| `trust_computations` | Admin only (optional: owner sees level transitions without factors) | Engine only |
| `trust_signal_events` | Admin only | Engine only |
| `trust_act_edges` | None / admin | Engine only |
| `trust_abuse_signals` | Admin | Admin + engine |
| `trust_rate_limits` | None | Engine |
| `verified_references` | Participants + public accepted summary | RPC |
| `community_mission_completions` | Owner + public verified flag | RPC |

### 2.8 Protect triggers

Extend profile protect triggers so non-admin clients cannot update:

`trust_index`, `trust_level`, `trust_policy_version`, `trust_computed_at`, `trust_frozen`, `trust_acts`, `unique_contributors`, `account_standing`, `identity_verified` (except via verification RPCs).

---

## 3. API Design

### 3.1 Principles

- No endpoint accepts “set my trust to X” or weight overrides from members.  
- No endpoint returns formula, weights, factor vector, or (by default) `trust_index`.  
- Trust mutations happen as **side effects of verified domain RPCs**, not dedicated “add trust” member APIs.  
- Admin APIs are separate, audited, never linked from member nav.

### 3.2 Member / public read APIs

#### `GET /api/profile` (owner)

Returns:

```json
{
  "trueverse_id": "tv_ariamorgan",
  "full_name": "Aria Morgan",
  "trust_level": "established",
  "identity_verified": true,
  "trust_acts": 127,
  "unique_contributors": 46
}
```

**Omit:** `trust_index`, factor breakdown, abuse scores, policy version (optional omit).

#### `GET /api/u/:username` (public Passport)

Same Trust fields: `trust_level` + factual counts/verification.  
Never `trust_index` or computation audit.

#### `GET /api/trust/me` (optional thin resource)

```json
{
  "trust_level": "established",
  "stars": 3,
  "identity_verified": true,
  "trust_acts": 127,
  "updated_presentation_at": "2026-08-06T12:00:00Z"
}
```

No recalculation on GET (read replica of last compute).

### 3.3 Domain write APIs (Trust as side effect)

| API | RPC | Trust effect |
|-----|-----|--------------|
| `POST /api/interactions/positive` | create pending | None |
| `POST /api/interactions/positive/:id/accept` | `accept_positive_interaction_v2` | Recompute author |
| `POST /api/interactions/positive/:id/reject` | reject | None |
| `POST /api/interactions/negative` | create report | None until review |
| `POST /api/admin/reports/:id` | `review_negative_report_v2` | Recompute as designed |
| `POST /api/disputes` / admin resolve | `resolve_dispute_v2` | Recompute |
| `POST /api/verifications/:kind/complete` | verification RPC | Recompute |
| `POST /api/references` / accept | reference RPCs | Recompute |
| `POST /api/community-missions/:id/verify` | admin/verifier | Recompute |

Social APIs (`follow`, `appreciate`, `comments`) **must continue to refuse Trust mutation**.

### 3.4 Admin APIs

| API | Purpose |
|-----|---------|
| `GET /api/admin/trust/:profileId` | Index, last computation summary, abuse flags (admin only) |
| `POST /api/admin/trust/:profileId/recompute` | Force recompute with active policy |
| `POST /api/admin/trust/:profileId/freeze` | Set `trust_frozen` |
| `POST /api/admin/trust/policy` | Activate policy version (break-glass; dual control recommended) |
| `POST /api/admin/trust/:profileId/adjust` | Rare audited override — records reason; prefer recompute |

Admin responses may include `trust_index` and redacted factor snapshots. **Never** expose these to member clients.

### 3.5 Explicitly forbidden APIs

- `PATCH` trust level / index from client  
- Any “preview my trust if I do X” that returns numeric index to members  
- Public “Trust calculator” or weight documentation in app  
- Partner APIs that return raw index without contractual + technical controls (future: signed level attestation only)

### 3.6 Partner attestation (future, design note)

Opaque signed payload:

```json
{
  "trueverse_id": "...",
  "trust_level": "established",
  "identity_verified": true,
  "issued_at": "...",
  "exp": "..."
}
```

No index, no factors. Out of scope for v1 implementation unless separately approved.

---

## 4. Security Model

### 4.1 Trust boundaries

```text
┌──────────────┐     display only      ┌─────────────────────┐
│  Web / App   │ ◄──────────────────── │  API (Next.js)      │
│  (untrusted) │  trust_level + facts  │  validates session  │
└──────────────┘                       └──────────┬──────────┘
                                                  │ service role / RPC
                                       ┌──────────▼──────────┐
                                       │ Supabase Postgres   │
                                       │ security definer    │
                                       │ Trust Engine RPCs   │
                                       │ private policy JSON │
                                       └─────────────────────┘
```

### 4.2 Authorization rules

1. **RLS on all tables**; Trust writes only through `SECURITY DEFINER` RPCs.  
2. Profile protect triggers block direct Trust column edits.  
3. Service role used only on server (never in browser).  
4. Admin role checked via `is_admin()` inside RPCs + API middleware.  
5. XP award paths **physically isolated** — separate functions that cannot `UPDATE` Trust columns (revoke grants).  
6. Policy table grants: `REVOKE ALL` from `PUBLIC`, `anon`, `authenticated`.

### 4.3 Confidentiality of IP (formula)

| Asset | Storage | Who can read |
|-------|---------|--------------|
| Weights / caps / windows | `trust_engine_policy.config` | Service role + definer RPCs |
| Factor snapshots | `trust_computations.factor_snapshot` | Admins |
| Abuse evidence | `trust_abuse_signals` | Trust & safety admins |
| Active algorithm code | SQL/TS server modules | Private repo paths / DB functions |

**Repository rule:** Do not commit production weights into client code, Storybook, or public README.  
If engineers need a “shadow” config for local dev, use `.env` / private seed not shipped to browsers.

### 4.4 Integrity & audit

- Every level change → `trust_computations` row.  
- Admin overrides → `admin_actions` + computation row.  
- Immutable ledgers (no UPDATE/DELETE for non-service).  
- Optional hash of policy config stored on computation for forensics.

### 4.5 Availability & safety

- Recompute failures must **not** leave partial public lies: use transactions.  
- If recompute fails, keep previous level; emit alert.  
- `trust_frozen` short-circuits accrual (standing/abuse).  
- Rate-limit Trust-affecting RPCs per profile and per edge.

### 4.6 Privacy

- Public APIs do not reveal who contributed which private factor.  
- Rejected/pending reports stay non-public.  
- False-report penalties visible only as standing/level effects, not as shaming UI.

---

## 5. Abuse Prevention

### 5.1 Threat model (v1)

| Threat | Description | Primary controls |
|--------|-------------|------------------|
| Reciprocal farming | A ↔ B repeatedly accept Trust Acts / appreciate | Edge damping; unique contributor; social appreciate ≠ Trust |
| Fake / sybil accounts | Sockpuppets inflate acts | Identity gates; cluster detection; contribution eligibility |
| Mass reporting | Weaponized reports | Evidence required; admin review; false-report penalties; velocity caps |
| Purchased interactions | Paid strangers accept acts | Velocity + diversity + identity; anomaly review queue |
| Bots | Automated accept/create | Device/IP/velocity heuristics; CAPTCHA/challenges at thresholds |
| Duplicate identities | Same person multi-accounting | Identity verification; duplicate-ID signals; manual merge |

### 5.2 Graph & reciprocity controls

1. **Pair cap:** After `K` accepted Trust Acts on edge `(A→B)`, further accepts on that edge contribute ≈0 to Trust (still may log activity).  
2. **Reciprocity damper:** If A→B and B→A both dense in short window, apply strong dampening to both.  
3. **Unique contributor weight:** Index growth prefers new eligible counterparties over repeat clique.  
4. **Eligibility of counterparty:** Unverified / brand-new / frozen accounts contribute reduced or zero Trust credit to the author.

### 5.3 Velocity & farming controls

- Max Trust-affecting accepts per author per day / week.  
- Max new unique contributors credited per day.  
- Cool-down after rapid multi-accept bursts.  
- Soft anomaly → `trust_abuse_signals` + slower accrual; hard anomaly → `trust_frozen` pending review.

### 5.4 Report abuse controls

- Reports require evidence; no instant Trust drop on file.  
- Caps on reports filed per day.  
- Duplicate report detection (same reporter/target/reason window).  
- `false_report` admin disposition → S11 penalty + possible freeze.  
- Mass-report storms on one target → escalate to T&S, do not auto-stack penalties blindly.

### 5.5 Sybil / bot / duplicate identity

Signals (private):

- Many accounts sharing device fingerprints / payment / phone / ID hash  
- Graph clusters with high internal density and low external diversity  
- Accept latency distributions consistent with bots  
- Reused selfie/ID artifacts  

Actions: reduce factor eligibility, freeze Trust accrual, require step-up verification, admin queue.

### 5.6 Purchased interaction heuristics

- Geographic / graph improbability  
- Counterparties with zero history beyond selling accepts  
- Burst of first-time counterparties all accepting within minutes  

→ dampen + abuse signal; do not publicly accuse in UI.

### 5.7 What social features must not do

Follow, appreciate, comment, streak, XP mission complete → **zero Trust**.  
This removes the easiest farming UI (mutual like rings).

### 5.8 Admin playbook (brief)

| Signal | First response | Escalation |
|--------|----------------|------------|
| Reciprocity_farming | Edge dampening (automatic) | Freeze + warn |
| Velocity_spike | Temporary accrual slowdown | Freeze |
| Sybil_cluster | Eligibility zero for cluster | Disable alts |
| Mass_reporting | Queue priority / merge | Reporter penalty |
| Purchased_interaction_suspected | Dampen + review | Ban networks |
| Duplicate_identity_suspected | Force reverification | Merge/disable |

---

## 6. Server-Side Calculation Strategy

### 6.1 Single writer pattern

```text
recompute_trust(profile_id, trigger)  -- SECURITY DEFINER
  1. Lock profile row
  2. Exit early if trust_frozen (unless standing/admin trigger)
  3. Load active trust_engine_policy
  4. Materialize features F from SQL views / aggregates
  5. Load abuse modifiers R
  6. Compute index' (private)
  7. Apply hysteresis / clamps
  8. Map to trust_level
  9. UPDATE profiles (level, index, version, computed_at)
 10. INSERT trust_computations
 11. Emit notification only on level change (copy never claims “safe”)
```

No other code path updates `trust_level` / `trust_index`.

### 6.2 Feature materialization

Prefer SQL views / functions:

- `trust_features_for(profile_id)` → returns private feature record  
- Aggregates from `positive_interactions`, edges, verifications, references, mission completions, report outcomes, standing  

Features computed in DB keep logic close to data and outside the browser.

### 6.3 Where code lives

| Layer | Responsibility |
|-------|----------------|
| Postgres RPCs | Authoritative recompute, locks, RLS bypass scoped |
| Next.js API | Authn/z, input validation (Zod), call RPC, never reimplement weights in client |
| Worker / cron | Nightly reconciliation, abuse batch scoring |
| Client | Display `trust_level` only |

**v1 recommendation:** Keep the **entire numeric formula in Postgres** (or a private server module invoked only with service role). Do not duplicate weights in TypeScript client-shared packages.

### 6.4 Idempotency

- Accepting the same interaction twice must no-op.  
- Recompute is safe to retry; ledger rows may include `computation_id` keyed by `(trigger_source, policy_version)` where appropriate.  
- Use transactional state transitions on interactions/reports.

### 6.5 Backfill & policy rollout

1. Insert `trust_engine_policy` v1 as `draft`.  
2. Shadow-compute into staging columns / table (no public level change).  
3. Diff vs legacy levels; tune caps.  
4. Mark policy `active`.  
5. Batch `recompute_trust` for all profiles.  
6. Cut over accept/report RPCs to `*_v2`.  
7. Stop writing legacy `trust_score` semantics.

### 6.6 Observability

Metrics (internal):

- Recompute latency / failure rate  
- Level transition histogram  
- Abuse signal volume by kind  
- % of Trust Acts damped  

Alerts: recompute error spikes; sudden Exceptional population jump; freeze queue depth.

### 6.7 Testing strategy (post-approval)

- Unit tests for feature extractors with synthetic fixtures  
- Property tests: XP events never change Trust fixtures  
- Adversarial tests: A↔B loops, sybil cliques, mass reports  
- Golden tests comparing shadow index distributions (fixtures private)  
- RLS tests: authenticated cannot read policy / factor_snapshot  

---

## 7. Migration from Legacy Engine

| Phase | Action |
|-------|--------|
| A | Ship schema + `recompute_trust` + policy table; no cutover |
| B | Shadow mode; dual-read admin comparison |
| C | Cut over accept/report/dispute RPCs to v2 |
| D | Backfill all profiles; Passport/Home read `trust_level` only |
| E | Remove product dependence on `trust_score`; keep column read-only archive |

Compatibility shim: map old 0–1000 score → temporary index only during shadow — **not** a public API.

---

## 8. Non-Goals (v1)

- New consumer pages or redesigns (Passport already exists; do not block on UI)  
- Public Trust “credit score” number  
- Client-side Trust simulation games  
- Selling Trust boosts  
- Fully automated bans without admin path for severe cases  
- Cross-platform partner attestation (design-only in §3.6)  
- Exposing DNA as a substitute Trust Level  

---

## 9. Deliverables (when implementation is kicked off)

**Prerequisite:** Public beta has shipped; real-user feedback reviewed; explicit “start Trust Engine v1” decision.

Then implement in this order (still no vanity pages first):

1. Migration `006_trust_engine_v1.sql` (tables, RLS, `recompute_trust`, v2 interaction RPCs)  
2. Private policy seed (dev weights) + admin recompute tools  
3. Wire API accept/report/dispute/verification paths  
4. Abuse signal jobs + rate limits  
5. Backfill + shadow validation  
6. Cutover + remove naïve `+3`/`−5` as sole logic  
7. Only then: any Passport/Home copy tweaks if presentation needs alignment  

Until that kickoff, engineering priority is **MVP launch** — see [`MVP_LAUNCH_PLAN.md`](./MVP_LAUNCH_PLAN.md).

---

## 10. Approval Record

| Item | Decision |
|------|----------|
| Public output is **Trust Level only** | Approved (future) |
| XP / daily missions / social appreciate remain non-inputs | Approved |
| “Mission Completion” = verified community missions only | Approved |
| Formula/weights in private policy storage | Approved |
| Anti-abuse controls in v1 scope | Approved |
| Admin-only index / factor snapshots | Approved |
| Phased cutover from legacy `+3`/`−5` | Approved (post-beta) |
| Implement now? | **No — deferred until after real-user feedback** |
| Beta trust calculation | Keep current simple engine |

**Approver notes:**

```text
Approved as long-term architecture (2026-08-06).
Do not implement for MVP/beta. Priority is MVP polish and public beta launch.
Trust Engine v1 begins only after real users provide feedback.
```

---

## Appendix A — Public vs private field matrix

| Field | Public Passport | Owner API | Admin API |
|-------|-----------------|-----------|-----------|
| `trust_level` | Yes | Yes | Yes |
| Stars (from level) | Yes | Yes | Yes |
| `trust_acts` | Yes | Yes | Yes |
| `unique_contributors` | Yes | Yes | Yes |
| `identity_verified` | Yes | Yes | Yes |
| `trust_index` | **No** | **No** (v1) | Yes |
| Factor vector | **No** | **No** | Yes (redacted OK) |
| Policy weights | **No** | **No** | Restricted |
| Abuse scores | **No** | **No** | Yes |

---

## Appendix B — Signal → example evidence (engineering)

| Signal | Example evidence rows |
|--------|----------------------|
| S1 Trust Acts | `positive_interactions` status=`accepted` |
| S2 Unique Contributors | Distinct `recipient_id`/`author_id` pairs with eligibility |
| S3 Identity | `profile_verifications.kind='identity' AND status='verified'` |
| S4 Age | `now() - profiles.created_at` |
| S5 Consistency | Weekly buckets with ≥1 verified act |
| S6 Missions | `community_mission_completions.verification_status='verified'` |
| S7 Community | Verified help/events tables |
| S8 References | `verified_references.status='accepted'` |
| S9 Rejected reports | `negative_reports` against user with status rejected |
| S10 Disputes | `disputes` resolved with restore/clear outcome |
| S11 False reports | Reports by user marked false/abusive |
| S12 Standing | `account_standing`, `is_disabled`, freezes |

---

## Appendix C — Copy rules for level-change notifications

Allowed: “Your Trust Level is now Established.”  
Forbidden: “You’re safe to date,” “Trust score: 72,” “You gained +4.2 from helping weight.”

---

*End of Trust Engine v1 specification — awaiting approval before implementation.*
