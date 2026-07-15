-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 3) — list_care_patients() over clinical patients
-- =============================================================================
-- Re-points the caregiver patient list from login accounts (profiles) to the
-- clinical patient entity (patients), and returns the active admission plus the
-- linked login account so the caregiver UI can:
--   * key routes by patients.id (clinical patient),
--   * read/write care data by admission_id,
--   * still populate the legacy patient_id column via the linked account.
--
-- SECURITY DEFINER: resolves admissions/links the caregiver cannot read
-- row-by-row. Only patients (clinical entities) are returned, and only to
-- caregivers — staff/self accounts never appear (they are not in `patients`).
--
-- The return signature changes, so the function is dropped and recreated.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. Requires explicit approval before
-- running. Depends on 00015 (patients/admissions) and 00016 (links).
--
-- Idempotent: drop function if exists + create.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 2 plan).
-- =============================================================================

drop function if exists public.list_care_patients();

create function public.list_care_patients()
returns table (
  id uuid,
  full_name text,
  admission_id uuid,
  user_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pt.id,
    pt.full_name,
    (
      select a.id
      from public.admissions a
      where a.patient_id = pt.id
        and a.status = 'active'
      order by a.admitted_on desc, a.created_at desc
      limit 1
    ) as admission_id,
    (
      select pal.user_id
      from public.patient_account_links pal
      where pal.patient_id = pt.id
      order by pal.linked_at asc
      limit 1
    ) as user_id
  from public.patients pt
  where public.has_role('caregiver')
  order by pt.full_name asc nulls last;
$$;

comment on function public.list_care_patients() is
  'Caregiver patient list over clinical patients: returns patient id, name, active admission id, and linked account (if any). SECURITY DEFINER.';

revoke all on function public.list_care_patients() from public;
grant execute on function public.list_care_patients() to authenticated;
