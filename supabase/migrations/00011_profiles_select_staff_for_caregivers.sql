-- Caregivers need to read staff profile names for patient_context.updated_by audit display.

drop policy if exists profiles_select_staff_for_caregivers on public.profiles;
create policy profiles_select_staff_for_caregivers
  on public.profiles
  for select
  to authenticated
  using (
    public.has_role('caregiver')
    and exists (
      select 1
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = profiles.id
        and r.name in ('caregiver', 'activity_coordinator', 'admin')
    )
  );
