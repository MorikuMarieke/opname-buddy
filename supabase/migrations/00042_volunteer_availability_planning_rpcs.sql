-- =============================================================================
-- OpnameBuddy: volunteer availability + planning read RPCs
-- =============================================================================
-- Volunteer-owned availability; coordinator read. SECURITY DEFINER RPCs for
-- role-scoped session/patient read models. Participation eval FK.
-- Idempotent. See docs/branch-plans/branch-07-activity-planning-volunteers.md
-- =============================================================================

create table if not exists public.volunteer_recurring_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_recurring_availability_dow_check check (
    day_of_week between 0 and 6
  ),
  constraint volunteer_recurring_availability_time_check check (end_time > start_time)
);

comment on table public.volunteer_recurring_availability is
  'Volunteer weekly availability windows. Owned by volunteer; readable by coordinators.';

create index if not exists volunteer_recurring_availability_user_idx
  on public.volunteer_recurring_availability (user_id, day_of_week, is_active);

drop trigger if exists volunteer_recurring_availability_set_updated_at
  on public.volunteer_recurring_availability;
create trigger volunteer_recurring_availability_set_updated_at
  before update on public.volunteer_recurring_availability
  for each row
  execute function public.set_updated_at();

create table if not exists public.volunteer_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exception_date date not null,
  start_time time not null,
  end_time time not null,
  kind text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_availability_exceptions_kind_check check (
    kind in ('extra', 'unavailable')
  ),
  constraint volunteer_availability_exceptions_time_check check (end_time > start_time)
);

comment on table public.volunteer_availability_exceptions is
  'One-off volunteer availability extras or unavailability blocks.';

create index if not exists volunteer_availability_exceptions_user_date_idx
  on public.volunteer_availability_exceptions (user_id, exception_date);

drop trigger if exists volunteer_availability_exceptions_set_updated_at
  on public.volunteer_availability_exceptions;
create trigger volunteer_availability_exceptions_set_updated_at
  before update on public.volunteer_availability_exceptions
  for each row
  execute function public.set_updated_at();

alter table public.volunteer_recurring_availability enable row level security;
alter table public.volunteer_availability_exceptions enable row level security;

drop policy if exists volunteer_recurring_availability_select_coordinator
  on public.volunteer_recurring_availability;
create policy volunteer_recurring_availability_select_coordinator
  on public.volunteer_recurring_availability
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists volunteer_recurring_availability_select_own
  on public.volunteer_recurring_availability;
create policy volunteer_recurring_availability_select_own
  on public.volunteer_recurring_availability
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists volunteer_recurring_availability_insert_own
  on public.volunteer_recurring_availability;
create policy volunteer_recurring_availability_insert_own
  on public.volunteer_recurring_availability
  for insert
  to authenticated
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_recurring_availability_update_own
  on public.volunteer_recurring_availability;
create policy volunteer_recurring_availability_update_own
  on public.volunteer_recurring_availability
  for update
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid())
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_availability_exceptions_select_coordinator
  on public.volunteer_availability_exceptions;
create policy volunteer_availability_exceptions_select_coordinator
  on public.volunteer_availability_exceptions
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists volunteer_availability_exceptions_select_own
  on public.volunteer_availability_exceptions;
create policy volunteer_availability_exceptions_select_own
  on public.volunteer_availability_exceptions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists volunteer_availability_exceptions_insert_own
  on public.volunteer_availability_exceptions;
create policy volunteer_availability_exceptions_insert_own
  on public.volunteer_availability_exceptions
  for insert
  to authenticated
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_availability_exceptions_update_own
  on public.volunteer_availability_exceptions;
create policy volunteer_availability_exceptions_update_own
  on public.volunteer_availability_exceptions
  for update
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid())
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_availability_exceptions_delete_own
  on public.volunteer_availability_exceptions;
create policy volunteer_availability_exceptions_delete_own
  on public.volunteer_availability_exceptions
  for delete
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid());

grant select, insert, update on public.volunteer_recurring_availability to authenticated;
grant select, insert, update, delete on public.volunteer_availability_exceptions to authenticated;
grant all on public.volunteer_recurring_availability to service_role;
grant all on public.volunteer_availability_exceptions to service_role;

-- Coordinator: active admissions for patient assignment (minimal fields).
drop function if exists public.list_planning_patients();

create function public.list_planning_patients()
returns table (
  admission_id uuid,
  patient_display_name text,
  department_id uuid,
  department_name text,
  room_number text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id as admission_id,
    trim(both from coalesce(pt.first_name, '') || ' ' || coalesce(pt.last_name, '')) as patient_display_name,
    a.department_id,
    d.name as department_name,
    a.room_number
  from public.admissions a
  join public.patients pt on pt.id = a.patient_id
  left join public.departments d on d.id = a.department_id
  where a.status = 'active'
    and public.has_role('activity_coordinator')
  order by pt.last_name asc nulls last, pt.first_name asc nulls last;
$$;

comment on function public.list_planning_patients() is
  'Active admissions for coordinator session assignment. SECURITY DEFINER.';

revoke all on function public.list_planning_patients() from public;
grant execute on function public.list_planning_patients() to authenticated;

-- Coordinator: volunteer accounts list.
drop function if exists public.list_planning_volunteers();

create function public.list_planning_volunteers()
returns table (
  user_id uuid,
  full_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.full_name
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

-- Coordinator: denormalized sessions for overview and lists.
drop function if exists public.list_planning_sessions(timestamptz, timestamptz, text, text);

create function public.list_planning_sessions(
  p_from timestamptz default now(),
  p_to timestamptz default (now() + interval '30 days'),
  p_status text default null,
  p_session_kind text default null
)
returns table (
  session_id uuid,
  activity_id uuid,
  activity_title text,
  activity_description text,
  activity_category text,
  activity_intensity text,
  session_kind text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  min_participants int,
  max_participants int,
  participant_count bigint,
  volunteer_count bigint,
  recurring_schedule_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id as session_id,
    a.id as activity_id,
    a.title as activity_title,
    a.description as activity_description,
    a.category as activity_category,
    a.intensity as activity_intensity,
    s.session_kind,
    s.status,
    s.starts_at,
    s.ends_at,
    s.location,
    s.min_participants,
    s.max_participants,
    coalesce(p.cnt, 0) as participant_count,
    coalesce(v.cnt, 0) as volunteer_count,
    s.recurring_schedule_id
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  left join lateral (
    select count(*) as cnt
    from public.activity_session_participants asp
    where asp.session_id = s.id
  ) p on true
  left join lateral (
    select count(*) as cnt
    from public.activity_session_volunteers asv
    where asv.session_id = s.id
  ) v on true
  where public.has_role('activity_coordinator')
    and s.starts_at >= p_from
    and s.starts_at < p_to
    and (p_status is null or s.status = p_status)
    and (p_session_kind is null or s.session_kind = p_session_kind)
  order by s.starts_at asc;
$$;

comment on function public.list_planning_sessions(timestamptz, timestamptz, text, text) is
  'Coordinator planning session list with activity context and assignment counts. SECURITY DEFINER.';

revoke all on function public.list_planning_sessions(timestamptz, timestamptz, text, text) from public;
grant execute on function public.list_planning_sessions(timestamptz, timestamptz, text, text) to authenticated;

-- Volunteer: assigned sessions with minimal patient pickup info.
drop function if exists public.list_volunteer_sessions(timestamptz, timestamptz);

create function public.list_volunteer_sessions(
  p_from timestamptz default now(),
  p_to timestamptz default (now() + interval '30 days')
)
returns table (
  session_id uuid,
  activity_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  status text,
  participants jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id as session_id,
    a.title as activity_title,
    s.starts_at,
    s.ends_at,
    s.location,
    s.status,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'display_name', trim(both from coalesce(pt.first_name, '') || ' ' || coalesce(pt.last_name, '')),
            'department_name', d.name,
            'room_number', adm.room_number
          )
          order by pt.last_name, pt.first_name
        )
        from public.activity_session_participants asp
        join public.admissions adm on adm.id = asp.admission_id
        join public.patients pt on pt.id = adm.patient_id
        left join public.departments d on d.id = adm.department_id
        where asp.session_id = s.id
      ),
      '[]'::jsonb
    ) as participants
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  join public.activity_session_volunteers asv on asv.session_id = s.id and asv.user_id = auth.uid()
  where public.has_role('volunteer')
    and s.starts_at >= p_from
    and s.starts_at < p_to
    and s.status in ('proposed', 'confirmed')
  order by s.starts_at asc;
$$;

comment on function public.list_volunteer_sessions(timestamptz, timestamptz) is
  'Volunteer assigned sessions with minimal patient pickup fields. SECURITY DEFINER.';

revoke all on function public.list_volunteer_sessions(timestamptz, timestamptz) from public;
grant execute on function public.list_volunteer_sessions(timestamptz, timestamptz) to authenticated;

-- Patient: confirmed upcoming sessions for linked admission.
drop function if exists public.list_patient_activity_sessions();

create function public.list_patient_activity_sessions()
returns table (
  session_id uuid,
  activity_title text,
  activity_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    s.id as session_id,
    a.title as activity_title,
    a.description as activity_description,
    s.starts_at,
    s.ends_at,
    s.location
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  join public.activity_session_participants asp on asp.session_id = s.id
  where asp.admission_id in (select public.current_admission_ids())
    and s.status = 'confirmed'
    and s.starts_at >= now()
  order by s.starts_at asc;
$$;

comment on function public.list_patient_activity_sessions() is
  'Confirmed upcoming sessions for the linked patient admission. SECURITY DEFINER.';

revoke all on function public.list_patient_activity_sessions() from public;
grant execute on function public.list_patient_activity_sessions() to authenticated;

-- Link participation evaluations to sessions when they exist.
alter table public.patient_participation_evaluations
  drop constraint if exists patient_participation_evaluations_activity_session_id_fkey;

alter table public.patient_participation_evaluations
  add constraint patient_participation_evaluations_activity_session_id_fkey
  foreign key (activity_session_id)
  references public.activity_sessions (id)
  on delete set null;

-- Coordinators can read volunteer profiles for planning UI.
drop policy if exists profiles_select_volunteers_for_coordinators on public.profiles;
create policy profiles_select_volunteers_for_coordinators
  on public.profiles
  for select
  to authenticated
  using (
    public.has_role('activity_coordinator')
    and exists (
      select 1
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = profiles.id
        and r.name = 'volunteer'
    )
  );
