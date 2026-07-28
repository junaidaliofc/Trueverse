# Trueverse Supabase Schema

Apply `migrations/001_trueverse_schema.sql` to a fresh Supabase project to create the complete
Trueverse database layer.

## Identity and profiles

- Supabase Auth remains the source of identity in `auth.users`.
- `public.profiles` mirrors Auth users and stores public reputation data:
  - `email`
  - `full_name`
  - `photo_url`
  - `bio`
  - `trust_score`
  - `streak`
  - `trueverse_id`
  - `role`
  - `is_disabled`
- `handle_new_user()` provisions profiles after signup.
- `sync_profile_email()` keeps profile email synchronized when Auth email changes.
- `protect_profile_system_fields()` prevents members from editing protected fields such as role,
  trust score, streak, Trueverse ID, and disabled state.

## Trust and reputation

- `positive_interactions` stores submitted positive interactions.
  - Recipient acceptance calls `accept_positive_interaction()`.
  - Acceptance applies `+3` to the submitter and writes `trust_score_events`.
  - Recipient rejection calls `reject_positive_interaction()` and does not change score.
- `negative_reports` stores evidence-required negative interactions.
  - Admin review calls `review_negative_report()`.
  - Approval applies `-5` to the reported user and writes `trust_score_events`.
  - Rejection/dispute status changes do not change score.
- `trust_score_events` is the immutable audit ledger for every score mutation.
- `admin_adjust_trust()` supports audited manual admin score corrections.

## Evidence, disputes, and moderation

- `report_evidence` stores structured evidence metadata for report files and URLs.
- `disputes` stores dispute requests and resolution metadata.
- `resolve_dispute()` lets admins resolve or reject disputes and optionally restore trust score.
- `admin_actions` stores moderation audit events for report reviews, dispute reviews, role
  changes, and trust adjustments.
- `set_user_role()` and `set_user_disabled()` manage user administration through audited
  security-definer functions rather than broad profile update policies.

## Feed

- `help_requests` stores public help requests.
- `community_responses` stores community replies and supports admin hiding.

## Notifications

- `notifications` stores user-facing events for accepted positive interactions, report review,
  disputes, and feed responses.

## Row-level security

RLS is enabled on every public table. Policies cover:

- Public read access for active profiles and feed content.
- Owner-only profile updates with protected-field trigger enforcement.
- Participant/admin visibility for positive interactions, negative reports, evidence, and disputes.
- Admin-only report/dispute moderation and admin audit visibility.
- Recipient-only notification reads/updates.

## Storage

The migration creates two Supabase Storage buckets:

- `avatars`: public, image-only, 5 MB limit.
- `report-evidence`: private, images/PDF/text/video, 20 MB limit.

Storage policies allow users to manage files under their own user-ID folder and allow private
report evidence reads only for involved users and admins.
