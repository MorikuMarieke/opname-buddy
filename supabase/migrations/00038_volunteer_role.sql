-- =============================================================================
-- OpnameBuddy: volunteer role + signup handling
-- =============================================================================
-- Adds volunteer as a canonical role. Volunteer accounts use app_metadata
-- account_type = 'volunteer' and do not receive auto-patient role on signup.
-- Idempotent. See docs/branch-plans/branch-07-activity-planning-volunteers.md
-- =============================================================================

insert into public.roles (name)
values ('volunteer')
on conflict (name) do nothing;

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
  'Creates profile on signup. Auto-assigns patient role unless account_type is staff or volunteer.';
