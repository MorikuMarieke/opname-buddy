-- =============================================================================
-- OpnameBuddy: list_care_patients()
-- =============================================================================
-- The caregiver patient list must contain ONLY patient-role profiles.
-- It cannot be filtered client-side: user_roles RLS hides other users' roles,
-- and profiles RLS also exposes staff/self to caregivers (for name resolution).
-- This security-definer function returns patient-role profiles for caregivers.
-- Idempotent: safe to re-run.
-- =============================================================================

create or replace function public.list_care_patients()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from public.profiles p
  where public.has_role('caregiver')
    and exists (
      select 1
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = p.id
        and r.name = 'patient'
    )
  order by p.full_name asc nulls last;
$$;

revoke all on function public.list_care_patients() from public;
grant execute on function public.list_care_patients() to authenticated;

-- TODO (test data): caregiver@test.com (0c90b156) and staff@test.com (0bde471c)
-- have orphaned patient_context rows from testing (patient_id points at a staff
-- account). Do NOT delete yet; remove only after confirmation. Tracked in
-- DEFERRED.md under feature/patient-entity-account-linking.
