-- =============================================================================
-- OpnameBuddy: volunteer bio + recurring availability overlap enforcement
-- =============================================================================

alter table public.profiles
  add column if not exists volunteer_bio text;

comment on column public.profiles.volunteer_bio is
  'Optional free-text bio for volunteers; used in planning and future AI matching.';

alter table public.profiles
  drop constraint if exists profiles_volunteer_bio_length_check;

alter table public.profiles
  add constraint profiles_volunteer_bio_length_check
  check (volunteer_bio is null or char_length(volunteer_bio) <= 500);

create or replace function public.check_volunteer_recurring_availability_overlap()
returns trigger
language plpgsql
as $$
begin
  if new.is_active = false then
    return new;
  end if;

  if exists (
    select 1
    from public.volunteer_recurring_availability existing
    where existing.user_id = new.user_id
      and existing.day_of_week = new.day_of_week
      and existing.is_active = true
      and existing.id is distinct from new.id
      and existing.start_time < new.end_time
      and existing.end_time > new.start_time
  ) then
    raise exception 'overlapping_availability'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists volunteer_recurring_availability_overlap_check
  on public.volunteer_recurring_availability;

create trigger volunteer_recurring_availability_overlap_check
  before insert or update on public.volunteer_recurring_availability
  for each row
  execute function public.check_volunteer_recurring_availability_overlap();

drop function if exists public.list_planning_volunteers();

create function public.list_planning_volunteers()
returns table (
  user_id uuid,
  full_name text,
  volunteer_bio text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.full_name,
    p.volunteer_bio
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  join public.roles r on r.id = ur.role_id
  where r.name = 'volunteer'
    and public.has_role('activity_coordinator')
  order by p.full_name asc nulls last;
$$;

comment on function public.list_planning_volunteers() is
  'Volunteer profiles for coordinator planning. SECURITY DEFINER.';

revoke all on function public.list_planning_volunteers() from public;
grant execute on function public.list_planning_volunteers() to authenticated;
