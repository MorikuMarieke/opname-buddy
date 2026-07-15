# Branch plan — feature/account-domain-model

Foundation-first refactor separating login identity, authorization, and clinical
patient identity.

**Status: Phase 1–3 shipped (2026-07-03).** Migrations `00015`–`00027` are applied
on remote. Care data is owned solely by `admission_id` (`NOT NULL`); the legacy
`patient_id` columns and their policies are dropped; `patient_context` is one row
per admission with the `updated_by_staff_id` audit field. The only remaining
deferral is **organizational (department/team) caregiver access**, tracked as its
own future branch (see [`DEFERRED.md`](../../DEFERRED.md) → "Patient entity vs
account"). Sections below marked with historical scope notes (e.g. "first commit",
"Phase 2") describe the state at that commit and are kept as a record.

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

## Phase 2 plan — move care data onto patient/admission ownership

Phase 1 introduced the clinical entities but left the four care tables on the
old `patient_id = auth.uid()` model. Phase 2 re-homes care data onto the
**admission** (and therefore the clinical patient), removes the login-account
conflation from the caregiver read path, and hardens RLS.

### Guardrails (same discipline as Phase 1)

- Every migration is **additive first**; nothing is dropped until reads/writes have moved and been verified.
- Each migration is a high-impact remote write and is applied only with explicit approval, then `types/database.ts` is regenerated and `tsc --noEmit` must pass.
- No care data is deleted. Old columns/policies are removed only in the final cutover step, after the app runs on the new model.
- Keep patient/caregiver flows working at every commit (dual-run old + new).

### Target end state

- Care rows (`patient_checkins`, `patient_questions`, `patient_participation_evaluations`, `patient_context`, and future `daily_advice`) are owned by an **`admission`** (which resolves to a clinical `patients` row).
- Patients access their own care data via `admission_id in (select public.current_admission_ids())`, not `patient_id = auth.uid()`.
- Staff appear only in audit fields (`created_by_staff_id`, `updated_by_staff_id`).
- The caregiver list/detail flow is keyed by clinical `patients.id` (not `profiles.id`); care data is queried by the patient's active admission.
- `requireRole("patient")`-only protection is no longer the sole safeguard for care data.

### New DB helper (planned)

`current_admission_ids()` — SECURITY DEFINER, mirrors `current_patient_ids()`:

```sql
-- returns admission ids belonging to the patients linked to auth.uid()
select a.id
from public.admissions a
where a.patient_id in (select public.current_patient_ids());
```

Grant execute to `authenticated`; used by the new patient-side care-table RLS.

### Commit checkpoints

Phase 2 is delivered as five local commit checkpoints. Migrations continue at
`00019`; order matters; do not reorder. Remote applies happen only with explicit
approval.

**Checkpoint 1 — schema additions and backfill — APPLIED 2026-07-03**

| File | Type | Status | Purpose |
|------|------|--------|---------|
| `00019_care_admission_columns.sql` | Additive DDL | Applied | Nullable `admission_id uuid → admissions(id) on delete cascade` on all four care tables + admission-keyed indexes. Table grants already cover new columns. |
| `00020_care_admission_backfill.sql` | Data (idempotent) | Applied | Set `admission_id` from `care.patient_id` (= `profiles.id`) → `patient_account_links.user_id` → `patient_id` → that patient's `active` admission. Only where `admission_id is null`. |

Verified: `patient_checkins` 2/2, `patient_questions` 3/3 backfilled; `patient_context` 1/3 (the 2 nulls are the known staff/self orphan rows `0bde471c`, `0c90b156` — cleanup deferred); `patient_participation_evaluations` 0 rows. Advisors: only the expected Phase 1 notices. `tsc --noEmit` passes.

**Checkpoint 2 — helper functions and RLS preparation — APPLIED 2026-07-03**

| File | Type | Status | Purpose |
|------|------|--------|---------|
| `00021_current_admission_ids.sql` | DDL (function) | Applied | SECURITY DEFINER `current_admission_ids()` (mirrors `current_patient_ids()`, returns all stays); execute granted to `authenticated`. |
| `00022_care_admission_rls.sql` | Additive RLS | Applied | Patient policies scoped by `admission_id in (select public.current_admission_ids())` added **alongside** the existing `patient_id = auth.uid()` policies (both active during transition). Caregiver/coordinator policies unchanged. |

Verified via `pg_policies`: every care table has both the old `_own` and new `_own_admission` policies per command (nothing dropped). Helper mapping confirmed for the seeded patient (`328d194e` → patient `b7011787` → admission `4f315e8c`, matching backfilled `admission_id`). Advisors: only expected notices plus `current_admission_ids` as an authenticated SECURITY DEFINER function (by design, same as `current_patient_ids`). `tsc --noEmit` passes.

**Checkpoint 3 — service and route updates — APPLIED 2026-07-03**

- Patient writes (`patient-checkins`, `patient-questions`, `patient-participation-evaluations`) now stamp `admission_id` via new `getActiveAdmissionId()` (`lib/services/admissions.ts`), alongside `patient_id`.
- Caregiver read path re-keyed to the clinical patient: `00023_list_care_patients_v2.sql` makes `list_care_patients()` return `patients` rows with active `admission_id` + linked `user_id`. `/care/patients/[patientId]` is now `patients.id`.
- `patient_context` read/write for caregivers is admission-based (`getPatientContextByAdmission`, `upsertPatientContextByAdmission`); the legacy `patient_id` column is still written from the linked account and `updated_by` audit is unchanged.
- Patient's own context read (`useOwnPatientContext`, read-only) left on the old path.

Verified: `list_care_patients()` signature `TABLE(id, full_name, admission_id, user_id)`; projection returns the seeded patient `b7011787` → admission `4f315e8c` → account `328d194e`. `tsc --noEmit` passes; no lint errors.

Follow-up for checkpoint 4: any care rows created in the window between checkpoints 2 and 3 could have a null `admission_id`; re-run the `00020` backfill before the RLS cutover so no patient-owned row is stranded when the old policies are dropped.

**Checkpoint 4 — RLS cutover and verification — APPLIED 2026-07-03**

`00024_care_retire_old_policies.sql`: defensive idempotent backfill, then **dropped the `patient_id = auth.uid()` care policies**. Admission-scoped patient policies + caregiver/coordinator policies are now the only care policies. Old `patient_id` columns kept (provenance); `admission_id` left **nullable** (NOT NULL deferred); no orphan cleanup; caregiver access unchanged.

Verified via `pg_policies` (no `_own` policies remain) and RLS simulation (`set local role authenticated` + JWT `sub`):

| Signed-in as | checkins | questions | evals | context |
|---|---|---|---|---|
| Patient `328d194e` (linked) | 2 | 3 | 0 | 1 (own) |
| Unrelated `03b3c749` (no role/link) | 0 | 0 | 0 | 0 |
| Caregiver `0c90b156` | 2 | 3 | 0 | 3 (all, incl. 2 orphans) |

Isolation holds under admission-only ownership; patient and caregiver flows keep working. Advisors: only the pre-existing expected notices.

**Checkpoint 5 — documentation cleanup — DONE 2026-07-03** — reconciled `docs/project-context.md`, `docs/domain-model.md`, `DEFERRED.md`, and this plan to the shipped Phase 2 state: care-table blueprints and ownership rows now show `admission_id` as the ownership key with `patient_id` retained for provenance; the RLS-patterns section reflects `current_admission_ids()`; the identity/access narrative is stated as implemented; and remaining items are captured as Phase 3 deferrals. Docs-only; no migrations.

**Deferred beyond Phase 2 (do not do now):** drop old care `patient_id` columns; `admission_id` NOT NULL flip; clean orphaned `patient_context` rows (`0c90b156`, `0bde471c`); rename `patient_context.updated_by` → `updated_by_staff_id`. *(All of these shipped in Phase 3 — see below.)*

## Phase 3 — care schema hardening (SHIPPED 2026-07-03)

Retires the transitional dual-model state from Phase 2. Delivered as three local
commit checkpoints; migrations `00025`–`00027`, applied to remote with approval.

**Checkpoint 1 — orphan cleanup — APPLIED**

`00025_care_orphan_cleanup.sql`: defensive backfill, then deleted the two
staff-authored `patient_context` rows with no owning admission
(`caregiver@test.com` `0c90b156`, `staff@test.com` `0bde471c`). Result:
`patient_context` 3 → 1 row; all four care tables have zero null `admission_id`.

**Checkpoint 2 — drop legacy `patient_id` + harden — APPLIED**

`00026_care_drop_legacy_patient_id.sql`: dropped `patient_id` from all four care
tables (cascading its FKs, the `patient_context` `UNIQUE(patient_id)`, and
`patient_id` indexes), added `UNIQUE(admission_id)` on `patient_context`, and
flipped `admission_id` to `NOT NULL` everywhere. Code cutover in the same
checkpoint: patient write services stamp only `admission_id` (with a
no-active-admission guard); the patient's own-context read resolves the active
admission instead of the login account. Types updated; `tsc`/lint clean.
Verified: no `patient_id` columns remain, `admission_id` `NOT NULL` on all four,
`UNIQUE(admission_id)` present, no new security advisories.

**Checkpoint 3 — audit-field rename — APPLIED**

`00027_patient_context_updated_by_staff_id.sql`: `updated_by` →
`updated_by_staff_id` via add-new + backfill + recreate the two caregiver
policies + drop (never in-place). Service payload/audit join and types updated.
Verified: only `updated_by_staff_id` remains; FK `patient_context_updated_by_staff_id_fkey`.

**Checkpoint 4 — documentation cleanup — DONE** — reconciled `docs/project-context.md`,
`docs/domain-model.md`, `DEFERRED.md`, and this plan to the shipped Phase 3 state.

### Audit-field decision (updated_by)

`patient_context.updated_by` was **kept as-is** in Phase 2 and **renamed to
`updated_by_staff_id` in Phase 3** (checkpoint 3 above), using add-new + backfill
+ switch + drop — never an in-place rename.

### Runtime code touch list

- `lib/services/patient-checkins.ts`, `patient-questions.ts`, `patient-participation-evaluations.ts`: add `admission_id` + audit fields on writes; reads move from implicit `auth.uid()` scoping to admission scoping (RLS handles it).
- `lib/services/patient-context.ts`: key context on `admission_id`; `getPatientContext(patientId)` becomes admission-based; keep writing `updated_by` (staff audit field, unchanged this phase); update `list_care_patients()` consumer to the new patient-entity shape.
- `hooks/use-care-patients.ts`, `components/dashboard/care-patient-shell.tsx`, `components/dashboard/care-patient-overview-view.tsx`: consume clinical `patients` + active admission.
- `app/care/patients/[patientId]/…`: `patientId` now = clinical `patients.id`.
- Patient dashboard: resolve the caller's active admission (via a small `getActiveAdmission()` helper using `current_admission_ids()`).

### Testing strategy

- Seed a **second** clinical patient + admission + linked account (current data has only one) to actually exercise cross-patient isolation.
- Verify: patient A cannot read/write patient B's care rows; caregiver can read both; staff never becomes an owner; `code_hash` still unreadable.
- Run `get_advisors` (security) after each DDL step; `tsc --noEmit` after each type regen.

### Risks / watch-outs

- **Caregiver route key change** (`profiles.id` → `patients.id`) is the riskiest step; ship 2.6 as its own commit and smoke-test `/care/patients/*`.
- **`updated_by` rename** is deferred beyond Phase 2; when done, use add-new + backfill + switch + drop, never an in-place rename.
- **NOT NULL flip** on `admission_id` is deferred beyond Phase 2 (blocked on orphan-row cleanup); `admission_id` stays nullable this phase.
- Migration version divergence: remote records timestamped versions; apply via MCP `apply_migration` (not `db push`), consistent with Phase 1.

### Out of scope for Phase 2 (future / Phase 3)

- Organizational caregiver access (department/team/admission-scoped) — caregiver RLS stays global `has_role('caregiver')` for now.
- Multi-admission history UI, discharge workflows, proxy/family access.
- Dropping the care `patient_id` columns entirely (kept temporarily for provenance).
