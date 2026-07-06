-- =============================================================================
-- OpnameBuddy: staff profile RLS for caregivers + patient role on self-signup
-- =============================================================================

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_type text;
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    'nl'
  )
  on conflict (id) do nothing;

  v_account_type := coalesce(new.raw_app_meta_data->>'account_type', 'patient');

  if v_account_type <> 'staff' then
    insert into public.user_roles (user_id, role_id)
    select new.id, r.id
    from public.roles r
    where r.name = 'patient'
    on conflict do nothing;
  end if;

  return new;
end;
$$;
