-- =============================================================================
-- OpnameBuddy: expected discharge date on admissions
-- =============================================================================
-- Indicative planning horizon; not a guaranteed discharge date.
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

alter table public.admissions
  add column if not exists expected_discharge_on date;

comment on column public.admissions.expected_discharge_on is
  'Indicative expected discharge date for care planning. Not guaranteed; may change.';

alter table public.admissions
  drop constraint if exists admissions_expected_discharge_after_admit_check;

alter table public.admissions
  add constraint admissions_expected_discharge_after_admit_check
    check (expected_discharge_on is null or expected_discharge_on >= admitted_on);
