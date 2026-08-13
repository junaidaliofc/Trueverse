# Trueverse beta deploy

## 1) Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Set the same values in Vercel (or your host). Never commit `.env*`.

In Supabase Auth, add redirect URLs:
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback` (local)

## 2) Database migrations (order)

```
supabase db push
```

Or apply in order:
1. `001_trueverse_schema.sql`
2. `002_trust_xp_reputation_dna.sql`
3. `003_core_loop.sql`
4. `004_social_graph.sql`
5. `005_passport.sql`
6. `006_auth_profile_name.sql`
7. `007_passport_profile_fields.sql`
8. `008_community_feed.sql`

Optional: `supabase/seed.sql`

## 3) Seed / demo

- Public demo Passport: `/u/sarahkim` (bundled fictional demo data)
- Landing CTA: **View Demo Profile**
- SQL placeholders: `supabase/seed.sql`

## 4) Build

```
npm ci
npm run build
```

## 5) Deploy

Vercel: Import the GitHub repo → set env vars → Deploy.  
Or: `vercel --prod` if the CLI is linked.

## 6) Smoke test

1. Open `/` — Beta label, Get Started, View Demo Profile  
2. Open `/u/sarahkim` — public Passport + disclaimer + share/QR  
3. Sign up → verify if required → land on `/dashboard`  
4. `/passport` — set username, name, photo URL, bio → save  
5. Log out → log in  
6. Create Trust Act → recipient accept → trust updates; appears in `/interactions`  
7. Follow / appreciate on Community or Activity  
8. `/admin` as non-admin redirects away  
9. Mobile: bottom nav (Home, Passport, Community, Messages, Alerts)  
10. `/messages` shows Coming soon (no messenger yet)  
