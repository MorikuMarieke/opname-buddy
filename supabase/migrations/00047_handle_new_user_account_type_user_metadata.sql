-- =============================================================================
-- OpnameBuddy: read account_type from user_metadata in handle_new_user
-- =============================================================================
-- admin.createUser sets app_metadata in a follow-up UPDATE, so AFTER INSERT
-- triggers only see provider/providers in raw_app_meta_data. Pass account_type
-- in user_metadata for admin-created accounts and fall back to it here.
-- =============================================================================

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

  v_account_type := coalesce(
    new.raw_app_meta_data->>'account_type',
    new.raw_user_meta_data->>'account_type',
    'patient'
  );

  if v_account_type not in ('staff', 'volunteer') then
    insert into public.user_roles (user_id, role_id)
    select new.id, r.id
    from public.roles r
    where r.name = 'patient'
    on conflict do nothing;
  end if;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates profile on signup. Auto-assigns patient role unless account_type is staff or volunteer (read from app or user metadata).';

-- Remove patient role incorrectly assigned by the INSERT trigger to admin-created
-- volunteer/staff accounts that have not gone through patient linking.
delete from public.user_roles ur
using public.roles r, auth.users au
where ur.role_id = r.id
  and r.name = 'patient'
  and ur.user_id = au.id
  and coalesce(au.raw_app_meta_data->>'account_type', '') in ('staff', 'volunteer')
  and not exists (
    select 1
    from public.patient_account_links pal
    where pal.user_id = ur.user_id
  );
