-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 1) — add admission_id to care tables
-- =============================================================================
-- Additive only. Adds a nullable admission_id FK to every patient-owned care
-- table so care data can be re-homed onto the clinical admission (and thus the
-- clinical patient) instead of the login account (patient_id -> profiles).
--
-- Nothing is dropped. The existing patient_id columns and RLS remain in place
-- and authoritative until the RLS cutover checkpoint. Backfill runs in 00020.
-- admission_id stays NULLABLE for all of Phase 2 (orphaned/staff-authored rows
-- and the NOT NULL flip are handled later, after orphan cleanup).
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. High-impact; requires explicit
-- approval before running. Depends on 00015 (admissions) and the care tables
-- (00003 checkins/questions, 00006 evaluations, 00008 patient_context).
--
-- Idempotent: safe to re-run (add column if not exists, create index if not exists).
-- Table-level grants (00004/00007/00009) already cover new columns.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 2 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Columns
-- -----------------------------------------------------------------------------

alter table public.patient_context
  add column if not exists admission_id uuid
  references public.admissions (id) on delete cascade;

alter table public.patient_checkins
  add column if not exists admission_id uuid
  references public.admissions (id) on delete cascade;

alter table public.patient_questions
  add column if not exists admission_id uuid
  references public.admissions (id) on delete cascade;

alter table public.patient_participation_evaluations
  add column if not exists admission_id uuid
  references public.admissions (id) on delete cascade;

comment on column public.patient_context.admission_id is
  'Owning admission (Phase 2). Nullable during migration; becomes the ownership key at cutover. patient_id kept temporarily for provenance.';
comment on column public.patient_checkins.admission_id is
  'Owning admission (Phase 2). Nullable during migration; patient_id kept temporarily for provenance.';
comment on column public.patient_questions.admission_id is
  'Owning admission (Phase 2). Nullable during migration; patient_id kept temporarily for provenance.';
comment on column public.patient_participation_evaluations.admission_id is
  'Owning admission (Phase 2). Nullable during migration; patient_id kept temporarily for provenance.';

-- -----------------------------------------------------------------------------
-- Indexes (mirror the existing patient_id access paths, keyed by admission)
-- -----------------------------------------------------------------------------

create index if not exists patient_context_admission_id_idx
  on public.patient_context (admission_id);

create index if not exists patient_checkins_admission_date_idx
  on public.patient_checkins (admission_id, check_in_date desc);

create index if not exists patient_questions_admission_status_idx
  on public.patient_questions (admission_id, status, created_at desc);

create index if not exists patient_participation_evaluations_admission_date_idx
  on public.patient_participation_evaluations (admission_id, evaluation_date desc);
