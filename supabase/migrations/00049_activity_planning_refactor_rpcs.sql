-- =============================================================================
-- OpnameBuddy: activity planning refactor — RPCs and authorization (phase 2)
-- =============================================================================

-- Eligible account roles for facilitator assignment (not a separate auth role).
create or replace function public.is_facilitator_eligible_role(p_role_name text)
returns boolean
language sql
immutable
as $$
  select p_role_name in (
    'volunteer',
    'caregiver',
    'activity_coordinator',
    'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Materialize recurring sessions (interval, series bounds, occurrence idempotency)
-- -----------------------------------------------------------------------------

create or replace function public.materialize_recurring_sessions(
  p_schedule_id uuid,
  p_weeks_ahead int default 4
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_schedule public.activity_recurring_schedules%rowtype;
  v_activity public.activities%rowtype;
  v_today date;
  v_horizon_end date;
  v_series_end date;
  v_occurrence date;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_location text;
  v_min int;
  v_max int;
  v_inserted int := 0;
  v_new_session_id uuid;
begin
  if not public.has_role('activity_coordinator') then
    raise exception 'not authorized';
  end if;

  if p_weeks_ahead < 1 or p_weeks_ahead > 52 then
    raise exception 'weeks_ahead must be between 1 and 52';
  end if;

  select * into v_schedule
  from public.activity_recurring_schedules
  where id = p_schedule_id and is_active = true;

  if not found then
    return 0;
  end if;

  select * into v_activity
  from public.activities
  where id = v_schedule.activity_id and is_active = true;

  if not found then
    return 0;
  end if;

  v_location := coalesce(
    nullif(trim(v_schedule.location), ''),
    nullif(trim(v_activity.location), ''),
    'Onbekende locatie'
  );
  v_min := coalesce(v_schedule.min_participants, v_activity.min_participants);
  v_max := coalesce(v_schedule.max_participants, v_activity.max_participants);

  v_today := (timezone('Europe/Amsterdam', now()))::date;
  v_horizon_end := v_today + (p_weeks_ahead * 7);
  v_series_end := least(v_schedule.series_ends_on, v_horizon_end);

  if v_series_end < v_schedule.series_starts_on then
    return 0;
  end if;

  v_occurrence := v_schedule.series_starts_on
    + (
      (v_schedule.day_of_week - extract(dow from v_schedule.series_starts_on)::int + 7) % 7
    );

  if v_occurrence < v_schedule.series_starts_on then
    v_occurrence := v_occurrence + 7;
  end if;

  while v_occurrence <= v_series_end loop
    if v_occurrence >= v_today then
      if not exists (
        select 1
        from public.activity_sessions s
        where s.recurring_schedule_id = v_schedule.id
          and s.recurring_occurrence_date = v_occurrence
      ) then
        v_starts_at := (v_occurrence::timestamp + v_schedule.start_time)
          at time zone 'Europe/Amsterdam';
        v_ends_at := (v_occurrence::timestamp + v_schedule.end_time)
          at time zone 'Europe/Amsterdam';

        insert into public.activity_sessions (
          activity_id,
          recurring_schedule_id,
          session_kind,
          starts_at,
          ends_at,
          location,
          min_participants,
          max_participants,
          recurring_occurrence_date,
          status,
          created_by_staff_id
        )
        values (
          v_schedule.activity_id,
          v_schedule.id,
          'recurring_instance',
          v_starts_at,
          v_ends_at,
          v_location,
          v_min,
          v_max,
          v_occurrence,
          'draft',
          auth.uid()
        )
        returning id into v_new_session_id;

        insert into public.activity_session_facilitators (
          session_id,
          user_id,
          assigned_by_staff_id
        )
        select
          v_new_session_id,
          rsf.user_id,
          rsf.assigned_by_staff_id
        from public.activity_recurring_schedule_facilitators rsf
        where rsf.recurring_schedule_id = v_schedule.id
        on conflict (session_id, user_id) do nothing;

        v_inserted := v_inserted + 1;
      end if;
    end if;

    v_occurrence := v_occurrence + (v_schedule.interval_weeks * 7);
  end loop;

  return v_inserted;
end;
$$;

comment on function public.materialize_recurring_sessions(uuid, int) is
  'Creates missing draft sessions within series bounds (Europe/Amsterdam). Copies series facilitators.';

-- -----------------------------------------------------------------------------
-- Coordinator: facilitator candidate search
-- -----------------------------------------------------------------------------

drop function if exists public.list_planning_facilitator_candidates(text);

create function public.list_planning_facilitator_candidates(p_search text default null)
returns table (
  user_id uuid,
  full_name text,
  role_names text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.full_name,
    array_agg(distinct r.name order by r.name) as role_names
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  join public.roles r on r.id = ur.role_id
  where p.is_active = true
    and public.is_facilitator_eligible_role(r.name)
    and public.has_role('activity_coordinator')
    and (
      p_search is null
      or trim(p_search) = ''
      or p.full_name ilike '%' || trim(p_search) || '%'
    )
  group by p.id, p.full_name
  order by p.full_name asc nulls last;
$$;

comment on function public.list_planning_facilitator_candidates(text) is
  'Active staff/volunteer accounts eligible for facilitator assignment. SECURITY DEFINER.';

revoke all on function public.list_planning_facilitator_candidates(text) from public;
grant execute on function public.list_planning_facilitator_candidates(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Coordinator: session list (facilitator count)
-- -----------------------------------------------------------------------------

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
  facilitator_count bigint,
  recurring_schedule_id uuid,
  is_detached boolean
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
    coalesce(f.cnt, 0) as facilitator_count,
    s.recurring_schedule_id,
    s.is_detached
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  left join lateral (
    select count(*) as cnt
    from public.activity_session_participants asp
    where asp.session_id = s.id
  ) p on true
  left join lateral (
    select count(*) as cnt
    from public.activity_session_facilitators asf
    where asf.session_id = s.id
  ) f on true
  where public.has_role('activity_coordinator')
    and s.starts_at >= p_from
    and s.starts_at < p_to
    and (p_status is null or s.status = p_status)
    and (p_session_kind is null or s.session_kind = p_session_kind)
  order by s.starts_at asc;
$$;

revoke all on function public.list_planning_sessions(timestamptz, timestamptz, text, text) from public;
grant execute on function public.list_planning_sessions(timestamptz, timestamptz, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Facilitator: assigned sessions (assignment-based, any eligible account role)
-- -----------------------------------------------------------------------------

drop function if exists public.list_volunteer_sessions(timestamptz, timestamptz);

create function public.list_facilitator_sessions(
  p_from timestamptz default now(),
  p_to timestamptz default (now() + interval '30 days')
)
returns table (
  session_id uuid,
  activity_title text,
  activity_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  status text,
  participant_count bigint,
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
    a.description as activity_description,
    s.starts_at,
    s.ends_at,
    s.location,
    s.status,
    coalesce(pc.cnt, 0) as participant_count,
    case
      when s.status = 'confirmed' then coalesce(
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
      )
      else '[]'::jsonb
    end as participants
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  join public.activity_session_facilitators asf
    on asf.session_id = s.id
    and asf.user_id = auth.uid()
  left join lateral (
    select count(*) as cnt
    from public.activity_session_participants asp
    where asp.session_id = s.id
  ) pc on true
  where s.starts_at >= p_from
    and s.starts_at < p_to
    and s.status in ('draft', 'confirmed')
  order by s.starts_at asc;
$$;

comment on function public.list_facilitator_sessions(timestamptz, timestamptz) is
  'Sessions the current user facilitates. Assignment-scoped read access. SECURITY DEFINER.';

revoke all on function public.list_facilitator_sessions(timestamptz, timestamptz) from public;
grant execute on function public.list_facilitator_sessions(timestamptz, timestamptz) to authenticated;

-- -----------------------------------------------------------------------------
-- Patient: confirmed sessions with facilitator names
-- -----------------------------------------------------------------------------

drop function if exists public.list_patient_activity_sessions();

create function public.list_patient_activity_sessions()
returns table (
  session_id uuid,
  activity_title text,
  activity_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  facilitator_names text
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
    s.location,
    nullif(
      (
        select string_agg(p.full_name, ', ' order by p.full_name)
        from public.activity_session_facilitators asf
        join public.profiles p on p.id = asf.user_id
        where asf.session_id = s.id
      ),
      ''
    ) as facilitator_names
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  join public.activity_session_participants asp on asp.session_id = s.id
  where asp.admission_id in (select public.current_admission_ids())
    and s.status = 'confirmed'
    and s.starts_at >= now()
  order by s.starts_at asc;
$$;

comment on function public.list_patient_activity_sessions() is
  'Confirmed upcoming sessions for the linked patient admission with facilitator names. SECURITY DEFINER.';

revoke all on function public.list_patient_activity_sessions() from public;
grant execute on function public.list_patient_activity_sessions() to authenticated;

-- Coordinators can read eligible facilitator profiles (picker display).
drop policy if exists profiles_select_facilitator_candidates_for_coordinators on public.profiles;
create policy profiles_select_facilitator_candidates_for_coordinators
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
        and public.is_facilitator_eligible_role(r.name)
    )
  );
