-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 2) — current_admission_ids() helper
-- =============================================================================
-- Returns the admission ids that belong to the clinical patient(s) linked to the
-- calling account. Mirrors current_patient_ids() (00016) and is the basis for
-- admission-scoped care-table RLS (added in 00022).
--
-- Returns ALL admissions of the linked patient(s), not only active ones, so a
-- patient keeps access to care data across every stay (parity with the old
-- patient_id = auth.uid() model, which was not admission-scoped at all).
--
-- SECURITY DEFINER so it can resolve links/admissions regardless of the caller's
-- row visibility; it only ever exposes ids for the calling account.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. Requires explicit approval before
-- running. Depends on 00015 (admissions) and 00016 (current_patient_ids).
--
-- Idempotent: create or replace.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 2 plan).
-- =============================================================================

create or replace function public.current_admission_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id
  from public.admissions a
  where a.patient_id in (select public.current_patient_ids());
$$;

comment on function public.current_admission_ids() is
  'Admission ids for the patient(s) linked to auth.uid() (all stays). For admission-scoped care-table RLS (Phase 2).';

revoke all on function public.current_admission_ids() from public;
grant execute on function public.current_admission_ids() to authenticated;
