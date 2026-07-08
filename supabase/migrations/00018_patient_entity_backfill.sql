-- =============================================================================
-- OpnameBuddy: backfill clinical patients for existing patient-role accounts
-- =============================================================================
-- Phase 1 backfill. For every existing profile that holds the 'patient' role and
-- is not yet linked, create:
--   1. a patients row (full_name copied from the profile),
--   2. an active admissions row,
--   3. a patient_account_links row (method = 'backfill') linking the account.
--
-- This keeps existing logins working while introducing the clinical entity.
-- It does NOT change or move any care data (patient_context, patient_checkins,
-- patient_questions, patient_participation_evaluations) — that is Phase 2.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. Requires explicit approval before
-- running. Depends on 00015, 00016, 00017.
--
-- Idempotent: re-running skips accounts that already have a link (unique user_id).
-- No data is deleted.
-- See docs/branch-plans/branch-04-account-domain-model.md
-- =============================================================================

do $$
declare
  r record;
  v_patient_id uuid;
begin
  for r in
    select p.id as user_id, p.full_name
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.roles ro on ro.id = ur.role_id
    where ro.name = 'patient'
      and not exists (
        select 1
        from public.patient_account_links pal
        where pal.user_id = p.id
      )
  loop
    insert into public.patients (full_name)
    values (coalesce(nullif(trim(r.full_name), ''), 'Onbekende patiënt'))
    returning id into v_patient_id;

    insert into public.admissions (patient_id, status)
    values (v_patient_id, 'active');

    insert into public.patient_account_links (patient_id, user_id, method)
    values (v_patient_id, r.user_id, 'backfill')
    on conflict (user_id) do nothing;
  end loop;
end;
$$;
