-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 4) — RLS cutover to admission ownership
-- =============================================================================
-- Makes admission ownership the sole patient-side guard for care data by
-- dropping the legacy `patient_id = auth.uid()` policies. The admission-scoped
-- policies from 00022 (patient) and the caregiver/coordinator policies remain.
--
-- SCOPE / SAFETY (per Phase 2 constraints):
--   * Old patient_id COLUMNS are kept (provenance) — not dropped here.
--   * admission_id stays NULLABLE — no NOT NULL flip.
--   * Orphaned rows are NOT cleaned here.
--   * Caregiver access stays global has_role('caregiver') — no org scoping.
--
-- A defensive, idempotent backfill runs first so no patient-owned row created
-- after 00020 is stranded when the old policies are dropped. Rows without a
-- resolvable admission (e.g. staff-authored orphan patient_context) stay NULL
-- and are simply no longer patient-readable — intended, cleanup is deferred.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. High-impact; requires explicit
-- approval before running. Depends on 00019–00023.
--
-- Idempotent: drop policy if exists + guarded UPDATEs.
-- See docs/branch-plans/branch-account-domain-model.md (Phase 2 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Defensive backfill (idempotent) — catch rows created after 00020
-- -----------------------------------------------------------------------------

update public.patient_context c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a on a.patient_id = pal.patient_id and a.status = 'active'
where c.admission_id is null and pal.user_id = c.patient_id;

update public.patient_checkins c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a on a.patient_id = pal.patient_id and a.status = 'active'
where c.admission_id is null and pal.user_id = c.patient_id;

update public.patient_questions c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a on a.patient_id = pal.patient_id and a.status = 'active'
where c.admission_id is null and pal.user_id = c.patient_id;

update public.patient_participation_evaluations c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a on a.patient_id = pal.patient_id and a.status = 'active'
where c.admission_id is null and pal.user_id = c.patient_id;

-- -----------------------------------------------------------------------------
-- 2. Drop legacy patient_id = auth.uid() policies (admission policies remain)
-- -----------------------------------------------------------------------------

-- patient_checkins
drop policy if exists patient_checkins_select_own on public.patient_checkins;
drop policy if exists patient_checkins_insert_own on public.patient_checkins;
drop policy if exists patient_checkins_update_own on public.patient_checkins;

-- patient_questions
drop policy if exists patient_questions_select_own on public.patient_questions;
drop policy if exists patient_questions_insert_own on public.patient_questions;
drop policy if exists patient_questions_update_own_open on public.patient_questions;
drop policy if exists patient_questions_delete_own_open on public.patient_questions;

-- patient_participation_evaluations
drop policy if exists patient_participation_evaluations_select_own
  on public.patient_participation_evaluations;
drop policy if exists patient_participation_evaluations_insert_own
  on public.patient_participation_evaluations;
drop policy if exists patient_participation_evaluations_update_own
  on public.patient_participation_evaluations;

-- patient_context (patient-owned SELECT only; caregiver writes unchanged)
drop policy if exists patient_context_select_own on public.patient_context;
