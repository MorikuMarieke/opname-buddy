-- =============================================================================
-- OpnameBuddy: Phase 3 (checkpoint 2) — drop legacy care patient_id, harden
-- admission ownership
-- =============================================================================
-- Admission ownership has been the sole patient-side RLS guard since Phase 2
-- (00024) and all care rows now have an admission_id (00025). This migration
-- retires the legacy profile-based ownership column for good:
--
--   * Drops patient_id from all four care tables. This also drops the columns'
--     dependent objects automatically: the patient_id FKs, the
--     patient_context UNIQUE(patient_id), and the patient_id indexes.
--   * Adds UNIQUE(admission_id) on patient_context (one Zorgcontext per
--     admission — replaces the old UNIQUE(patient_id)).
--   * Flips admission_id to NOT NULL on all four tables now that it is the
--     ownership key and no row is null.
--
-- SAFETY: no view/function/RLS policy references the care tables' patient_id
-- (verified), so the drop is non-breaking at the DB layer. The application code
-- that wrote/read patient_id is updated in the same checkpoint.
--
-- APPLIED 2026-07-03 (with approval). Destructive DDL. Depends on 00019–00025.
--
-- Idempotent: `drop column if exists` + guarded constraint add.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 3 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Drop legacy patient_id (cascades its FK, unique, and indexes)
-- -----------------------------------------------------------------------------

alter table public.patient_checkins drop column if exists patient_id;
alter table public.patient_questions drop column if exists patient_id;
alter table public.patient_participation_evaluations drop column if exists patient_id;
alter table public.patient_context drop column if exists patient_id;

-- -----------------------------------------------------------------------------
-- 2. One Zorgcontext per admission (replaces old UNIQUE(patient_id))
-- -----------------------------------------------------------------------------

alter table public.patient_context
  drop constraint if exists patient_context_admission_id_unique;
alter table public.patient_context
  add constraint patient_context_admission_id_unique unique (admission_id);

-- -----------------------------------------------------------------------------
-- 3. admission_id is the ownership key — enforce presence
-- -----------------------------------------------------------------------------

alter table public.patient_checkins alter column admission_id set not null;
alter table public.patient_questions alter column admission_id set not null;
alter table public.patient_participation_evaluations alter column admission_id set not null;
alter table public.patient_context alter column admission_id set not null;
