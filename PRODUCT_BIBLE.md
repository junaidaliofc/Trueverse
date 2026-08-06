# Trueverse Product Bible

**Status:** Canonical  
**Audience:** Product, Design, Engineering, Trust & Safety, Growth  
**Rule:** Every feature, screen, API, and migration must comply with this document. When implementation conflicts with this Bible, the Bible wins until it is formally revised.

---

## 1. Mission

Help people make safer and more informed decisions by providing transparent, verified reputation signals based on real-world interactions.

Trueverse is not a social network for entertainment. It is infrastructure for portable digital trust.

---

## 2. Vision

Become the world’s default portable reputation layer — a profile people can carry into dating, marketplaces, freelance work, universities, professional networks, communities, and volunteer organizations.

In the long term, Trueverse should feel as natural to share as a LinkedIn URL, as emotionally engaging as Duolingo, and as trustworthy as a well-run financial product.

---

## 3. Core Values

1. **Signals over judgments** — Present verified evidence. Never declare someone “safe,” “good,” or “dateable.”
2. **Trust is earned** — Trust changes only through verified, server-side processes.
3. **Engagement is separate** — XP, streaks, and cosmetics never alter trust.
4. **Dignity by default** — Design for real people in high-stakes contexts, not for gamified cruelty.
5. **Privacy is a feature** — Portable reputation must respect what users choose to reveal.
6. **Clarity over cleverness** — Prefer calm, premium interfaces over dense dashboards.
7. **Accountability with fairness** — Evidence, review, and dispute paths exist before punishment.
8. **Long-term integrity** — Prefer slower, correct trust systems over viral shortcuts.

---

## 4. Product Principles

1. **Not another social feed first** — Community features support reputation; they do not redefine the product as entertainment social media.
2. **Consumer, not admin** — Member experiences must feel like Apple / Airbnb / Instagram quality. Moderation tools stay in a separate admin shell.
3. **Mobile-first habit loop** — Daily return should feel natural: greeting → streak → trust snapshot → XP → three missions.
4. **One job per screen region** — Avoid dashboard clutter, metric walls, and competing CTAs.
5. **Reusable systems** — Components, tokens, and engines must scale across pages and platforms.
6. **Server authority for trust** — Clients display trust; servers compute trust.
7. **Delight without deception** — Animation and gamification increase retention, never misrepresent reputation.
8. **Disclaimer always available** — Public and sensitive surfaces remind users that signals ≠ guarantees.

Canonical product disclaimer:

> Trueverse presents verified reputation signals only. It does not claim anyone is safe, trustworthy, or a good dating partner, and it does not predict compatibility or guarantee safety.

---

## 5. User Personas

### Persona A — “Portable Professional” (Primary)

- Freelancer, seller, or community organizer
- Needs credibility that travels across platforms
- Values verified interactions, badges, and a clean public profile
- Fear: fake reviews and opaque scores

### Persona B — “Careful Connector”

- Meeting people for dating, housing, or local help
- Wants signals before real-world interaction
- Values identity verification, references, and privacy controls
- Fear: being manipulated by vanity metrics

### Persona C — “Community Builder”

- Runs mutual aid, campus, faith, or neighborhood groups
- Wants appreciation, missions, and leaderboards as optional motivation
- Values contribution visibility without toxic competition
- Fear: admin-heavy tools that kill participation

### Persona D — “Trust Operator” (Internal)

- Reviews evidence-backed reports and disputes
- Needs audit trails, role controls, and clear workflows
- Success metric: fair, explainable outcomes — not volume throughput alone

---

## 6. Trust Philosophy

Trust is a **reputation signal**, not a moral score and not a safety certificate.

### What Trust is

- A level derived from verified real-world behavior and account integrity signals
- Computed server-side
- Immutable by the user
- Shown publicly as a **level**, not a vanity number people can obsess over

### What Trust is not

- Not a dating score
- Not a guarantee of safety or character
- Not increased by daily login, streaks, or XP
- Not manually editable by members
- Not a substitute for personal judgment

### Public Trust Levels (0–100 index)

| Level | Index range |
|-------|-------------|
| New | 0–20 |
| Developing | 21–40 |
| Established | 41–65 |
| Highly Established | 66–85 |
| Exceptional | 86–100 |

Stars may visualize level rank (1–5). The public UI emphasizes the **level name**, verification state, Trust Acts, appreciations, and community rank — not an intimidating credit-score aesthetic.

### Inputs that may affect Trust

- Verified interactions (Trust Acts)
- Identity verification
- Account age
- Community consistency
- Successful dispute resolution
- Report history

### Hard rule

**XP never increases Trust. Daily login never increases Trust.**

---

## 7. Reputation Engine Philosophy

Reputation is multi-dimensional. A single number is insufficient for human context.

### Reputation DNA (Trust dimensions)

Trust-related contribution is expressed across:

1. Helping Others  
2. Reliability  
3. Communication  
4. Professionalism  
5. Safety  
6. Community  
7. Leadership  

Each dimension is a 0–100 signal used for explanation and profile storytelling. Dimensions inform understanding; they do not replace the Trust Level.

### Reputation DNA UX

- Visual bars (“Your Reputation DNA”)
- Expandable explanation: “How does this person earn trust?”
- Never imply destiny, compatibility, or absolute safety

### Separation of engines

| Engine | Purpose | Affects Trust? |
|--------|---------|----------------|
| Trust Engine | Verified reputation signals | Yes |
| XP Engine | Habit, cosmetics, progression | No |
| Mission Engine | Daily/weekly participation | No (XP/badges only) |
| Moderation Engine | Reports, disputes, admin actions | Yes (via reviewed outcomes) |

---

## 8. Design System

Trueverse uses a layered design architecture:

1. **Tokens** — color, type, radius, spacing, motion  
2. **Primitives** — shadcn/ui (Radix) components  
3. **Product components** — Trust, XP, Missions, Timeline, Notifications  
4. **Screens** — compose product components only; no one-off visual languages  

### Design north stars

- Apple: restraint, spacing, typography  
- Linear: clarity and speed  
- Airbnb: hospitality and trust in real-world contexts  
- Instagram: mobile habit and visual hierarchy  
- Duolingo: daily loop energy — without childish clutter  

### Surface language

- Soft gradients and atmospheric backgrounds  
- Rounded cards (`rounded-2xl` / `rounded-3xl`)  
- Glass surfaces where appropriate  
- Generous whitespace  
- Premium empty states  
- Dark mode as a first-class peer to light mode  

### Anti-patterns (forbidden in member UI)

- Enterprise dashboard chrome  
- Dense admin tables on consumer home  
- Purple-on-white generic AI aesthetics  
- Metric walls above the fold  
- Floating promo stickers on hero media  
- Cards used where plain layout would suffice (except interactive containers)

---

## 9. Color System

### Brand role

Teal/green signals **trust, calm, and integrity** — not entertainment purple, not alarm-red primary.

### Semantic roles

| Token role | Meaning |
|------------|---------|
| Primary / Brand | Trust actions, key CTAs, trust accents |
| XP / Accent warm | Progression, streaks, missions (distinct from trust) |
| Success | Verification, completed missions, positive confirmations |
| Warning | Caution states, pending review |
| Danger | Reports, destructive actions |
| Muted | Secondary text and quiet UI |
| Surface / Glass | Cards and overlays |

### Rules

- Trust UI uses brand/success tones  
- XP UI uses XP/warm tones so users never confuse progression with trust  
- Dark mode must preserve AA contrast for text and critical badges  
- Do not invent new brand hues per feature  

---

## 10. Typography

| Role | Guidance |
|------|----------|
| Display / Brand | Expressive sans (e.g. Outfit) for Trueverse wordmark and major titles |
| UI / Body | Premium humanistic sans (e.g. Plus Jakarta Sans) |
| Mono | Trueverse IDs and technical identifiers only |

### Rules

- Large, confident type on consumer screens  
- Tight tracking on display headlines  
- Avoid Inter/Roboto/Arial as the defining brand voice  
- One primary headline per section  
- Body copy stays short; details expand progressively  

---

## 11. Component Library

### Primitive layer (shadcn/ui)

Button, Input, Textarea, Label, Card, Badge, Avatar, Progress, Tabs, Sheet, Dialog, Dropdown, Tooltip, Separator, Skeleton, Scroll Area, Theme Toggle.

### Product layer (required reusable systems)

| Component | Purpose |
|-----------|---------|
| TrustLevelBadge | Public trust level chip |
| TrustReputationCard | Level, stars, verification, Trust Acts, appreciations, rank |
| ReputationDnaCard | Dimensional trust signals |
| XPJourney / XPProgress | Level progress and unlocks |
| StreakHero / StreakPill | Daily/weekly/monthly streak presentation |
| DailyMissions / MissionCard | Habit loop missions |
| ActivityTimeline | LinkedIn-like reputation/activity story |
| AchievementGrid | Cosmetic milestone collection |
| NotificationCenter | Typed notification list |
| UserAvatar | Consistent person avatar |
| Surface | Consumer glass/elevated card wrapper |
| Motion primitives | Page/item/card motion standards |

### Rules

- Prefer composition over page-local styling  
- No duplicate badge/progress/avatar implementations  
- Admin-only components stay out of the member shell  

---

## 12. UX Rules

1. **Above-the-fold discipline**  
   - Landing: brand, one headline, one sentence, two CTAs. No trust stats.  
   - Home: greeting, trust snapshot, XP, streak, today’s missions. No tables/forms/admin widgets.
2. **Encourage continuation** — Primary CTA should invite the next meaningful action (“Continue · …”).
3. **Empty states are product moments** — Beautiful, brief, with one clear next step.
4. **Motion with purpose** — Framer Motion for presence, progress, and feedback; respect `prefers-reduced-motion`.
5. **Thumb-first targets** — Minimum ~44px interactive targets on mobile.
6. **No false urgency** — Do not shame users for broken streaks in a punitive tone.
7. **Explain sensitive signals** — Trust and relationship-adjacent sections always carry disclaimers.
8. **Progressive disclosure** — Advanced settings and DNA details expand; they do not dominate.

---

## 13. Navigation Rules

### Member app navigation (canonical)

- Home  
- Profile  
- Community  
- Notifications  
- Messages *(future; may appear disabled/soon)*  

### Rules

- Admin is **never** in the normal member nav  
- Marketing shell ≠ app shell  
- Bottom navigation on mobile; simplified top nav on desktop  
- Deep links (missions, badges, insights) may exist, but primary IA stays five items  
- Do not add nav items for every feature  

---

## 14. Notification Guidelines

### Goals

- Re-engage without anxiety spam  
- Celebrate progress and social reciprocity  
- Clearly distinguish Trust events from XP events  

### Supported notification types

- Appreciation received  
- Mission completed  
- Trust level changed  
- Badge unlocked  
- Streak milestone  
- Weekly recap  
- Friend/community join *(optional, low priority)*  

### Rules

- Group or rate-limit low-value notifications  
- Weekly recap is digest-style, not a firehose  
- Trust notifications must never claim safety  
- Unread state should be obvious but calm  
- Notifications are actionable when possible (deep link to relevant surface)

---

## 15. Badge Philosophy

Badges are **recognition ornaments and social proof of participation**, not Trust.

### Examples

Helpful Neighbor · Reliable Seller · Blood Donor · Community Leader · Volunteer · Mentor · Verified Professional · Safe Driver · Early Member · Top Contributor · Community Helper · Reliable Neighbor  

### Rules

- Badges can be unlocked via XP, missions, or verified actions  
- Earning a badge does **not** by itself raise Trust Level unless the underlying verified action also enters the Trust Engine  
- Badge copy celebrates contribution, never superiority or purity  
- Locked badges may show gentle progress, not shame  

---

## 16. Mission System

### Purpose

Create a daily habit of meaningful participation.

### Daily missions

Every user receives **exactly three** daily missions.

Example pool:

- Appreciate someone  
- Help one person  
- Complete profile  
- Upload profile photo  
- Verify email  
- Finish one Trust Act  

### Weekly missions

Longer arcs (volunteer, identity verification, referral, safety course).

### Rewards

- XP (required)  
- Badges (optional)  
- Coins *(future)*  
- Cosmetics *(future)*  

### Rules

- Missions never modify Trust directly  
- Mission UI lives primarily on Home; Missions screen elaborates, it does not invent a second product  
- Completion should feel delightful and immediate  

---

## 17. XP System

### Purpose

Habit formation and cosmetic progression.

### Independence

XP is completely separate from Trust.  
**XP never increases Trust.**

### Example rewards

| Action | Intent |
|--------|--------|
| Complete profile | Onboarding momentum |
| Daily login | Habit spark (XP only) |
| Complete mission | Core loop |
| Receive appreciation | Social reciprocity |
| Help someone | Contribution |
| Volunteer | Community depth |
| Verify identity | Integrity motivation (XP); Trust handled separately by Trust Engine |
| Weekly streak | Retention |

### Levels (canonical thresholds)

| Level | XP |
|------|-----|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| 4 | 700 |
| 5 | 1200 |
| 6 | 2000 |
| 7 | 3200 |
| 8 | 5000 |
| 9 | 7500 |
| 10 | 10000 |

### Unlocks

Levels · Badges · Themes · Profile decorations · Animations  

### UX requirements

- Beautiful XP progress bar  
- Clear “XP to next level”  
- Next unlock and upcoming badge visibility  
- Always remind: XP ≠ Trust  

---

## 18. Trust System

### Public presentation

- Trust Level name  
- Stars (level visualization)  
- Verified Identity state  
- Trust Acts count  
- Appreciations count  
- Community Rank *(optional, contextual)*  

### Internal mechanics

- Maintain auditable events for trust mutations  
- Positive interactions require recipient acceptance before trust impact  
- Negative reports require evidence and admin review before trust impact  
- Disputes can restore or adjust trust only through server-side resolution  
- Users cannot PATCH trust fields  

### Reputation DNA

Shown as explanatory signals under Trust Philosophy / Reputation Engine sections.

---

## 19. Verification Levels

Verification increases confidence in **identity and process**, not moral worth.

| Tier | Meaning |
|------|---------|
| Unverified | Basic account |
| Email verified | Contactable account |
| Identity verified | Government/ID or approved identity flow completed |
| Selfie verified *(optional contexts)* | Liveness/selfie check for higher-risk contexts |
| Reference verified *(optional)* | Attestations from verified members |

### Rules

- Verification badges are factual (“Verified Identity”), not praise (“Trusted Person”)  
- Higher verification may unlock features or improve Trust inputs, but UI must not equate verification with safety  
- Relationship-adjacent verification sections require the relationship disclaimer  

Relationship disclaimer:

> This information provides verified signals only. It does not predict compatibility or guarantee safety.

---

## 20. Privacy Principles

1. **Minimum necessary exposure** — Public profiles show only what the user allows and what is essential for portable reputation.  
2. **Section-level controls** — Relationship readiness, contact details, and sensitive stats can be hidden.  
3. **No dark patterns** — Do not force public oversharing to use core features.  
4. **Portable ≠ fully public** — Sharing a profile link must still honor privacy settings.  
5. **Data retention clarity** — Trust/moderation audit logs may persist longer than cosmetic preferences; communicate this in policy.  
6. **Right to contest** — Users can dispute harmful reports through product flows.  

---

## 21. Security Principles

1. **Supabase RLS on all user data tables**  
2. **Trust calculations server-side only** (security definer RPCs / trusted backend)  
3. **No client-side trust mutation**  
4. **XP award paths isolated from trust functions**  
5. **Admin actions audited**  
6. **Evidence storage private by default**  
7. **Auth session refresh via middleware; route protection for member/admin areas**  
8. **Principle of least privilege** for service role usage  
9. **Input validation** with schema validators (e.g. Zod) at API boundaries  
10. **Assume hostile clients** — UI convenience never equals authorization  

---

## 22. Public Profile Standards

Route pattern: `/u/{trueverseId}` (and future `/u/{username}` if usernames ship).

### Must show (when privacy allows)

- Display name  
- Trueverse ID  
- Trust Level  
- Verification status  
- Badges / achievements *(as permitted)*  
- Verified interaction highlights  
- Community contributions  
- Recent public activities  
- Share + QR affordances  

### Must include

- Product disclaimer on public reputation surfaces  

### Must not show

- Private contact data  
- Internal numeric trust ledgers by default  
- Admin notes  
- Hidden relationship fields  
- Unpublished reports  

### Tone

Calm, premium, portable. Feels shareable on dating apps and marketplaces without looking like a rap sheet or a game scoreboard.

---

## 23. Accessibility Standards

1. WCAG 2.2 AA contrast minimum for text and essential controls  
2. Visible focus states on all interactive elements  
3. Semantic headings and landmarks  
4. `aria` labels for icon-only controls  
5. Respect `prefers-reduced-motion`  
6. Form inputs have labels  
7. Status is not conveyed by color alone (icons/text too)  
8. Hit targets sized for mobile  
9. Screen-reader friendly trust/XP distinctions (“Trust level Established”, “XP Level 5”)  
10. Do not autoplay disruptive motion  

---

## 24. Future API Strategy

### Principles

- Clean resource-oriented HTTP APIs under `/api/*` for web  
- Server Components + route handlers for first-party web reads where practical  
- Zod (or equivalent) validation at boundaries  
- Idempotent writes for mission completion and XP awards where retries are likely  

### Domain APIs (target)

| Domain | Examples |
|--------|----------|
| Profile | GET/PATCH profile, public profile by ID |
| Trust | timeline/events (read), never client write of score |
| XP | balance, history, award via trusted server procedures |
| Missions | today’s missions, complete mission |
| Social | follow, appreciate, comment |
| Activity | timeline feed |
| Notifications | list, mark read |
| Admin | reports, disputes, user management |

### Contracts

- Trust endpoints never accept “set trust to X” from clients  
- XP award endpoints reject any field that attempts to alter trust  
- Public APIs honor privacy flags server-side  

### Future platform APIs

- Partner embed / verify widget for marketplaces and campuses  
- Read-only reputation token or signed profile snapshot for third parties  
- Webhooks for “verification completed” / “trust level changed” to consented partners  

---

## 25. Mobile Strategy

1. **Mobile-first design and QA** — Desktop enhances; mobile defines.  
2. Bottom tab IA for core loops  
3. Home is the daily habit surface  
4. Offline-tolerant reads later; writes remain explicit and confirmed  
5. Share sheets + QR for portable profiles  
6. Push notifications (future) follow Notification Guidelines and frequency caps  
7. Performance budgets: fast first paint, light images, deferred non-critical motion  
8. Native apps only after web habit loop is proven — architecture should not block them (clean APIs, tokenized UI)  

---

## 26. Monetization Ideas

Monetization must never sell Trust or allow pay-to-win reputation.

### Acceptable directions

1. **Premium cosmetics** — themes, decorations, animations (XP-adjacent, not Trust)  
2. **Verified organization seats** — universities, companies, nonprofits managing communities  
3. **Partner API access** — marketplaces/dating platforms consuming consented reputation signals  
4. **Advanced insights** — deeper weekly summaries for power users  
5. **Priority review SLA** — faster evidence review for organizations *(not buying outcomes)*  

### Forbidden

- Paying to raise Trust Level  
- Paying to remove legitimate reports without review  
- Selling private user data  
- Dark-pattern subscriptions that block basic safety/privacy controls  

---

## 27. Long-Term Roadmap

### Horizon A — Foundation (complete / in progress)

- Design system and consumer shell  
- Landing + Home habit composition  
- Trust levels + Reputation DNA  
- XP engine + missions + streaks  
- Profile timeline + notifications  

### Horizon B — Social reputation graph

- Follow graph  
- Appreciations + comments on activities  
- Community feed quality and ranking  
- Leaderboards as optional, non-trust rankings  

### Horizon C — Portable verification network

- Stronger identity rails  
- Relationship readiness (optional, disclaimer-first)  
- Shareable profile cards + QR everywhere  
- Partner embeds  

### Horizon D — Platform

- Public developer API  
- Organization dashboards  
- Cross-platform reputation export  
- AI insights that summarize signals without making safety claims  

### Permanent constraints across all horizons

- Trust ≠ XP  
- Signals ≠ guarantees  
- Privacy and RLS first  
- Consumer craft over admin sprawl  

---

## Governance

### Change control

Material changes to Trust rules, XP→Trust boundaries, privacy defaults, or public profile standards require an explicit Product Bible revision and engineering checklist update.

### Implementation checklist (every PR)

- [ ] Does this change Trust? If yes: server-side only, audited, documented.  
- [ ] Does this award XP? If yes: confirm it cannot mutate Trust.  
- [ ] Is the UI consumer-grade and mobile-first?  
- [ ] Are disclaimers present on sensitive surfaces?  
- [ ] Are components reused from the design system?  
- [ ] Are privacy and RLS implications handled?  
- [ ] Does navigation remain simple?  

---

## Closing Standard

Trueverse should always create the feeling:

**“I want to keep building a reputation I can carry with me.”**

Never:

**“I optimized a dashboard metric.”**

And never:

**“This app told me someone is safe.”**

---

*End of Trueverse Product Bible*
