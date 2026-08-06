# Trueverse MVP Launch Plan

**Status:** Active priority  
**Goal:** Ship a polished public beta people can demo and use  
**Out of scope until post-feedback:** Trust Engine v1 ([`TRUST_ENGINE_V1.md`](./TRUST_ENGINE_V1.md))  

Beta continues using the **current simple trust calculation**. Public UI shows **Trust Level** only; XP never increases Trust.

---

## Priority order

1. Polish the MVP  
2. Remove unfinished features  
3. Fix bugs  
4. Improve onboarding  
5. Improve the Passport  
6. Prepare deployment  
7. Create demo data  
8. Prepare public beta  

---

## 1. Polish the MVP

**Ship a tight core loop — not every route in the repo.**

### Beta core (keep & polish)

| Surface | Route | Intent |
|---------|-------|--------|
| Landing | `/` | Brand-first conversion |
| Auth | `/auth/*` | Real signup / login / verify |
| Home | `/dashboard` | Greeting, Trust Level, XP, streak, 3 missions |
| Passport | `/profile`, `/u/[username]` | Premium digital identity |
| Share | `/u/[username]/share` | Link + QR |
| Community | `/community` | Discovery without dead buttons |
| Notifications | `/notifications` | Clear, honest states |
| Missions / Badges | `/missions`, `/badges` | Habit + cosmetics (XP only) |

### Polish bar

- One visual language (Phase 0+ design system) on every beta route  
- Mobile-first; bottom nav matches desktop affordances  
- Empty states that feel finished  
- Product disclaimer on reputation surfaces  
- No “prototype / dummy” labels in UI copy for beta builds  

---

## 2. Remove unfinished features

Hide or demote anything that looks broken to a first-time user.

| Surface | Action for beta |
|---------|-----------------|
| Messages (`/messages`) | Remove from nav; keep soft “coming later” page or redirect Home |
| Admin (`/admin`) | Not in member nav; require admin auth or disable in public beta |
| Insights (`/insights`) | Remove from product paths / noindex |
| Design system (`/design-system`) | Internal only; noindex |
| Legacy Feed (`/feed`) | Remove from Community links; do not promote |
| Interactions prototype pages | Gate behind auth + wire, or hide until Trust Acts UX is ready |
| Activity (if unwired) | Hide until social actions work |
| Leaderboards (if broken tabs) | Fix XP-only demo or hide |
| Dead buttons (Follow, Offer help, Copy link, Approve/Reject) | Wire or remove — never leave inert primary CTAs |

**Rule:** If a control does nothing, it does not ship in beta.

---

## 3. Fix bugs

Known high-impact issues to clear before beta:

1. **Auth UI bypass** — login/signup/verify pages must use live `AuthForm` / `VerifyOtpForm`, not click-through Links  
2. **Nav inconsistency** — Messages “soon” on desktop but still tappable on mobile  
3. **Share** — Copy link + QR must work  
4. **Community / Activity** — remove or wire inert actions  
5. **Leaderboards** — Friends / All-time must not show wrong datasets  
6. **Dual UI stacks** — migrate leftover `glass-card` / old auth-admin-feed pages to current tokens  
7. **Route protection** — use `requireUser` / middleware for member areas; admin gated  
8. **Orphan components** — one stack: pages call the live forms/APIs that already exist  

---

## 4. Improve onboarding

Target: new user → verified session → Home → first mission in under a few minutes.

| Step | Work |
|------|------|
| Landing CTA | “Get Started” → real signup |
| Signup / Login | Mount Supabase-backed forms; clear errors |
| Email OTP / verify | Mount `VerifyOtpForm`; success → `/dashboard` |
| Auth callback | Keep `exchangeCodeForSession`; support magic link if enabled |
| First-run Home | Greeting + Trust Level New + 3 missions; no admin chrome |
| Profile spark | Prompt photo / display name without feeling like a settings dump |
| Guardrails | Logged-out users hitting `/dashboard` or `/profile` → login with return URL |

Do **not** block onboarding on Trust Engine v1.

---

## 5. Improve the Passport

Passport is the core product story for beta.

| Work | Notes |
|------|-------|
| Merge / land Milestone 3 Passport onto the release branch | Hero, DNA, verification, badges, timeline, stats, share |
| Public `/u/[username]` | Privacy-respecting; disclaimer present |
| Share + QR | Working copy + scannable QR |
| Demo Passport | At least one rich public demo (e.g. Sarah / Aria) with photos |
| Trust presentation | Level + verification + factual counts — **not** raw score, **not** TE v1 factors |
| Remove settings/dashboard feel | Keep Apple Wallet / host-profile energy |

Beta may keep simple trust under the hood; Passport must still feel premium.

---

## 6. Prepare deployment

| Item | Done when |
|------|-----------|
| Env checklist | `.env.example` complete; production secrets documented |
| Hosting | Vercel (or chosen host) project + preview deploys |
| Supabase | Prod project; migrations `001+` applied; Auth URLs set |
| Site URL | `NEXT_PUBLIC_SITE_URL` correct for callbacks & share links |
| Images | Avatar remote patterns / storage buckets ready |
| README | Deploy + migrate + env sections (replace outdated map) |
| Health | `npm run build` + `npm run lint` clean on release branch |
| Optional | Basic uptime check on `/` and `/auth/login` |

No Trust Engine migration (`006_…`) in the beta deploy path.

---

## 7. Create demo data

Beta demos must not look empty or like a spreadsheet.

| Need | Detail |
|------|--------|
| Seed script or SQL seed | 5–8 believable profiles with photos |
| One Exceptional / Highly Established demo | For “View Demo Profile” |
| Owner demo account | Documented test login for internal QA only |
| Trust Acts & timeline | Enough events for Passport story |
| Missions / badges / notifications | Partial progress states |
| Community cards | People worth following (even if follow is read-only initially) |
| Dates | Relative times feel recent |
| Disclaimer | Visible on public Passport |

Keep seed data clearly separable from production user data.

---

## 8. Prepare public beta

Launch checklist:

- [ ] Core routes polished; unfinished routes hidden  
- [ ] Real auth onboarding works end-to-end  
- [ ] Passport + share demo-ready  
- [ ] Simple trust still correct (accept → level path unchanged; XP ≠ Trust)  
- [ ] Production Supabase + hosting live  
- [ ] Demo profiles seeded  
- [ ] Analytics/error monitoring baseline (even lightweight)  
- [ ] Beta access mode decided (open / waitlist / invite)  
- [ ] Support path (email or form)  
- [ ] Product disclaimer + privacy basics linked  
- [ ] Internal dogfood day completed  
- [ ] “Known limitations” note for beta (Messages later; Trust Engine v1 later; etc.)

### Explicit beta non-goals

- Trust Engine v1 multi-factor recompute  
- Private weight/policy system  
- Full messaging  
- Heavy admin console for all members  
- Pay-to-win or sold Trust  

---

## Suggested implementation sequence

```text
A. Cut unfinished nav/routes + fix critical bugs
B. Wire real onboarding (auth)
C. Land Passport polish + share/QR + demo profile
D. Seed demo data
E. Deployment + prod env
F. Dogfood → public beta
```

Trust Engine v1 remains documented and frozen until a post-beta kickoff.

---

## Success criteria for public beta

1. A stranger can create an account and reach Home without a dead end.  
2. They can open a demo Passport that feels like a premium identity product.  
3. They never see a primary button that does nothing.  
4. Trust Level and XP are visually and verbally distinct.  
5. The team can deploy and reseeds demos without heroics.  

---

*When MVP launch work starts, open implementation PRs against this plan — not against Trust Engine v1.*
