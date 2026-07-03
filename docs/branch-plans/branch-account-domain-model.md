# Branch plan — feature/account-domain-model

Foundation-first refactor separating login identity, authorization, and clinical
patient identity. **Docs + scaffolding only in the first commit.** No migrations
applied, no RLS rewritten, no runtime code changed, no data deleted.

Durable source: this file. Parked origin: `DEFERRED.md` →
"Patient entity vs account: feature/account-domain-model".

---

## Goal

Prepare the foundation to stop conflating the login account with the clinical
patient, without breaking existing patient/caregiver flows.

## Entity ownership map (target)

| Concept | Table(s) | Represents | Owner / actor rule |
|---------|----------|------------|--------------------|
| Login identity | `auth.users`, `profiles` | Who is authenticated | Owns own profile row |
| Authorization | `roles`, `user_roles` | What an account may do | Admin-managed; read-only to clients |
| Clinical patient | `patients` (new) | The person receiving care | Managed by staff; `created_by_staff_id` |
| Admission / stay | `admissions` (new) | One hospital stay | Belongs to a `patient`; `created_by_staff_id` |
| Account↔patient link | `patient_account_links` (new) | Connects a login to a patient | One `user_id` ↔ patient |
| Secure link codes | `patient_link_codes` (new) | Short-TTL redemption codes | Hashed (pgcrypto); staff-issued |
| Patient-owned care data | `patient_context`, `patient_checkins`, `patient_questions`, `patient_participation_evaluations` | Care records | Owned by patient/admission; staff only via audit fields |

Key rule: **care data belongs to a patient/admission, never to the acting staff
login.** Staff appear only as `created_by_staff_id` / `updated_by_staff_id`.

## Tables still on the old profile-based model

These currently use `patient_id uuid → profiles(id)` with RLS `patient_id = auth.uid()`:

| Table | Migration | Ownership today | Notes |
|-------|-----------|-----------------|-------|
| `patient_context` | `00008` | `patient_id → profiles`, `updated_by → profiles` | `patient_id` caregiver-supplied from URL — real mis-attribution risk |
| `patient_checkins` | `00003` | `patient_id → profiles` | Protected by `patient_id = auth.uid()` + patient route guard |
| `patient_questions` | `00003` | `patient_id → profiles` | Same |
| `patient_participation_evaluations` | `00006` | `patient_id → profiles` | Same |

Dependency to bridge later: `list_care_patients()` (`00014`) resolves patients
via `profiles` + `user_roles` role membership.

## Migration sequence — Phase 1 (APPLIED 2026-07-03)

The SQL files below were reviewed, applied to the remote OpnameBuddy project
(`rszlvszlkivbguxuvvvm`), and `types/database.ts` was regenerated from the live
schema. Backfill created 1 patient + 1 active admission + 1 link for the single
existing patient-role account. Security advisors after apply showed only
expected/by-design notices (see below).

| Seq | File | Status | Purpose |
|-----|------|--------|---------|
| 1 | `supabase/migrations/00015_patient_entity.sql` | Applied | `patients` + `admissions` (+ `set_updated_at` triggers, one-active-admission index) |
| 2 | `supabase/migrations/00016_patient_account_linking.sql` | Applied | `patient_account_links`, `patient_link_codes` (hashed), helpers `current_patient_ids()`, `redeem_patient_link_code()` |
| 3 | `supabase/migrations/00017_patient_entity_grants_rls.sql` | Applied | Grants (like `00002`/`00009`) + RLS; `code_hash` never granted/selectable |
| 4 | `supabase/migrations/00018_patient_entity_backfill.sql` | Applied | Idempotent: one `patients` + active `admissions` + `patient_account_links` per existing patient-role profile |

### Expected post-apply security advisories (not defects)

- `patient_link_codes`: RLS enabled with no policy (INFO) — intentional deny-all protecting `code_hash`.
- `current_patient_ids()` / `redeem_patient_link_code()` executable by `authenticated` (WARN) — intentional; same pattern as existing `has_role()` / `list_care_patients()`.

### Design notes for reviewers

- **Staff as actors, not owners:** `patients`/`admissions` carry `created_by_staff_id` (audit only). Care-data ownership is untouched in Phase 1.
- **Link codes:** stored as bcrypt hashes via pgcrypto `crypt()`; raw codes never persisted. `patient_link_codes` has no `authenticated` grant and no `authenticated` RLS policy, so `code_hash` is unreachable from clients. Codes are generated server-side (service role) and redeemed via the SECURITY DEFINER `redeem_patient_link_code()`.
- **`current_patient_ids()`** exists now for Phase 2 care-table RLS but is already used to let a linked patient read their own `patients`/`admissions` rows.
- **Backfill safety:** keyed on absence of a `patient_account_links` row (unique `user_id`), so re-runs are no-ops. No care data is moved or deleted.

## Out of scope for this first commit

- Applying ANY migration or running backfill
- Any RLS change or new policy
- Runtime code: services, hooks, UI, `types/database.ts`
- Adding `admission_id` to care tables (Phase 2)
- Renaming `patient_context.updated_by` → `updated_by_staff_id` (Phase 2)
- Deleting/cleaning orphaned `patient_context` rows (staff/self accounts)

## Deferred to next commits (Phase 2)

- `admission_id` / `patient_entity_id` on all four care tables + backfill + dual-write
- Standardize `created_by_staff_id` + `updated_by_staff_id` across care tables
- Rewrite care-table RLS from `patient_id = auth.uid()` to admission ownership via `current_patient_ids()`
- Retire `requireRole("patient")`-only protection for care data
- Bridge `list_care_patients()` to the new entities
- Cleanup of orphaned test `patient_context` rows (only after confirmation)
