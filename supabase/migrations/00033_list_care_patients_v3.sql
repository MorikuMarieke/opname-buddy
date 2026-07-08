-- =============================================================================
-- OpnameBuddy: list_care_patients() v3 — structured demographics
-- =============================================================================
-- Returns first/last name, birth_date, sex, and expected_discharge_on from
-- the active admission. Drops full_name from the return signature.
-- Idempotent: drop function if exists + create.
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

drop function if exists public.list_care_patients();

create function public.list_care_patients()
returns table (
  id uuid,
  first_name text,
  last_name text,
  birth_date date,
  sex text,
  admission_id uuid,
  expected_discharge_on date,
  user_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pt.id,
    pt.first_name,
    pt.last_name,
    pt.birth_date,
    pt.sex,
    active_admission.id as admission_id,
    active_admission.expected_discharge_on,
    (
      select pal.user_id
      from public.patient_account_links pal
      where pal.patient_id = pt.id
      order by pal.linked_at asc
      limit 1
    ) as user_id
  from public.patients pt
  left join lateral (
    select a.id, a.expected_discharge_on
    from public.admissions a
    where a.patient_id = pt.id
      and a.status = 'active'
    order by a.admitted_on desc, a.created_at desc
    limit 1
  ) active_admission on true
  where public.has_role('caregiver')
  order by pt.last_name asc nulls last, pt.first_name asc nulls last;
$$;

comment on function public.list_care_patients() is
  'Caregiver patient list: clinical patient demographics, active admission, linked account. SECURITY DEFINER.';

revoke all on function public.list_care_patients() from public;
grant execute on function public.list_care_patients() to authenticated;
