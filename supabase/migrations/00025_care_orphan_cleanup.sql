-- =============================================================================
-- OpnameBuddy: Phase 3 (checkpoint 1) — clean orphaned patient_context rows
-- =============================================================================
-- Removes patient_context rows that have no owning admission. These are the
-- staff self-attributions (caregiver@test.com / staff@test.com) created before
-- the admission ownership model existed: their patient_id points at a login
-- account that is not a linked patient, so no admission can ever be resolved.
--
-- This is the prerequisite for making admission_id NOT NULL (checkpoint 3):
-- afterwards every care row has a resolvable owning admission.
--
-- SCOPE / SAFETY (per Phase 3 constraints):
--   * A defensive, idempotent backfill runs first so any row that DOES have a
--     linkable active admission is repaired rather than deleted.
--   * Only rows still lacking an admission after backfill are deleted.
--   * Legacy patient_id COLUMNS are still kept here — dropped in checkpoint 3.
--
-- APPLIED 2026-07-03 (with approval). Destructive. Depends on 00019–00024.
-- Result: patient_context 3 -> 1 row; all four care tables now have zero null
-- admission_id (verified), unblocking the NOT NULL flip in checkpoint 3.
--
-- Idempotent: re-running is a no-op once orphans are gone.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 3 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Defensive backfill (idempotent) — repair any linkable row before deleting
-- -----------------------------------------------------------------------------

update public.patient_context c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a on a.patient_id = pal.patient_id and a.status = 'active'
where c.admission_id is null and pal.user_id = c.patient_id;

-- -----------------------------------------------------------------------------
-- 2. Delete remaining orphans (no owning admission = not patient-owned care)
-- -----------------------------------------------------------------------------

delete from public.patient_context
where admission_id is null;
