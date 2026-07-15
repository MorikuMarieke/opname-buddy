-- =============================================================================
-- OpnameBuddy: recurring schedules + activity sessions + materialization
-- =============================================================================
-- Weekly recurring patterns materialize concrete draft sessions. One-off sessions
-- are inserted directly with session_kind = one_off.
-- Idempotent. See docs/branch-plans/branch-07-activity-planning-volunteers.md
-- =============================================================================

create table if not exists public.activity_recurring_schedules (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete restrict,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  location text,
  min_participants int,
  max_participants int,
  is_active boolean not null default true,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_recurring_schedules_dow_check check (
    day_of_week between 0 and 6
  ),
  constraint activity_recurring_schedules_time_check check (end_time > start_time),
  constraint activity_recurring_schedules_participants_check check (
    (min_participants is null and max_participants is null)
    or (
      min_participants is not null
      and max_participants is not null
      and min_participants >= 1
      and max_participants >= min_participants
    )
  )
);

comment on table public.activity_recurring_schedules is
  'Weekly recurring activity pattern. Materializes draft activity_sessions.';

comment on column public.activity_recurring_schedules.day_of_week is
  '0=Sunday … 6=Saturday (PostgreSQL dow convention, Europe/Amsterdam local times).';

create index if not exists activity_recurring_schedules_activity_idx
  on public.activity_recurring_schedules (activity_id, day_of_week, is_active);

drop trigger if exists activity_recurring_schedules_set_updated_at
  on public.activity_recurring_schedules;
create trigger activity_recurring_schedules_set_updated_at
  before update on public.activity_recurring_schedules
  for each row
  execute function public.set_updated_at();

create table if not exists public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete restrict,
  recurring_schedule_id uuid references public.activity_recurring_schedules (id) on delete set null,
  session_kind text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null,
  min_participants int not null,
  max_participants int not null,
  status text not null default 'draft',
  notes text,
  confirmed_at timestamptz,
  confirmed_by_staff_id uuid references public.profiles (id) on delete set null,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_sessions_kind_check check (
    session_kind in ('recurring_instance', 'one_off')
  ),
  constraint activity_sessions_status_check check (
    status in ('draft', 'proposed', 'confirmed', 'completed', 'cancelled')
  ),
  constraint activity_sessions_time_check check (ends_at > starts_at),
  constraint activity_sessions_participants_check check (
    min_participants >= 1 and max_participants >= min_participants
  ),
  constraint activity_sessions_recurring_kind_check check (
    (session_kind = 'one_off' and recurring_schedule_id is null)
    or (session_kind = 'recurring_instance' and recurring_schedule_id is not null)
  )
);

comment on table public.activity_sessions is
  'Scheduled activity instance. Human approval via status workflow before confirmed.';

create unique index if not exists activity_sessions_recurring_starts_unique_idx
  on public.activity_sessions (recurring_schedule_id, starts_at)
  where recurring_schedule_id is not null;

create index if not exists activity_sessions_starts_at_idx
  on public.activity_sessions (starts_at);

create index if not exists activity_sessions_status_starts_idx
  on public.activity_sessions (status, starts_at);

create index if not exists activity_sessions_kind_starts_idx
  on public.activity_sessions (session_kind, starts_at);

drop trigger if exists activity_sessions_set_updated_at on public.activity_sessions;
create trigger activity_sessions_set_updated_at
  before update on public.activity_sessions
  for each row
  execute function public.set_updated_at();

-- Materialize draft sessions for upcoming weeks from a recurring schedule.
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
  v_base_date date;
  v_days_until int;
  v_first_date date;
  v_week int;
  v_target_date date;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_location text;
  v_min int;
  v_max int;
  v_inserted int := 0;
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

  v_location := coalesce(nullif(trim(v_schedule.location), ''), nullif(trim(v_activity.location), ''), 'Onbekende locatie');
  v_min := coalesce(v_schedule.min_participants, v_activity.min_participants);
  v_max := coalesce(v_schedule.max_participants, v_activity.max_participants);

  v_base_date := (timezone('Europe/Amsterdam', now()))::date;
  v_days_until := (v_schedule.day_of_week - extract(dow from v_base_date)::int + 7) % 7;
  v_first_date := v_base_date + v_days_until;

  for v_week in 0..(p_weeks_ahead - 1) loop
    v_target_date := v_first_date + (v_week * 7);

    v_starts_at := (v_target_date::timestamp + v_schedule.start_time) at time zone 'Europe/Amsterdam';
    v_ends_at := (v_target_date::timestamp + v_schedule.end_time) at time zone 'Europe/Amsterdam';

    insert into public.activity_sessions (
      activity_id,
      recurring_schedule_id,
      session_kind,
      starts_at,
      ends_at,
      location,
      min_participants,
      max_participants,
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
      'draft',
      auth.uid()
    )
    on conflict (recurring_schedule_id, starts_at)
    where recurring_schedule_id is not null
    do nothing;

    if found then
      v_inserted := v_inserted + 1;
    end if;
  end loop;

  return v_inserted;
end;
$$;

comment on function public.materialize_recurring_sessions(uuid, int) is
  'Creates missing draft sessions for a recurring schedule (Europe/Amsterdam). Idempotent via unique (schedule, starts_at).';

revoke all on function public.materialize_recurring_sessions(uuid, int) from public;
grant execute on function public.materialize_recurring_sessions(uuid, int) to authenticated;

-- RLS: activity coordinators manage schedules and sessions
alter table public.activity_recurring_schedules enable row level security;
alter table public.activity_sessions enable row level security;

drop policy if exists activity_recurring_schedules_select_coordinator
  on public.activity_recurring_schedules;
create policy activity_recurring_schedules_select_coordinator
  on public.activity_recurring_schedules
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_recurring_schedules_insert_coordinator
  on public.activity_recurring_schedules;
create policy activity_recurring_schedules_insert_coordinator
  on public.activity_recurring_schedules
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and created_by_staff_id = auth.uid()
  );

drop policy if exists activity_recurring_schedules_update_coordinator
  on public.activity_recurring_schedules;
create policy activity_recurring_schedules_update_coordinator
  on public.activity_recurring_schedules
  for update
  to authenticated
  using (public.has_role('activity_coordinator'))
  with check (public.has_role('activity_coordinator'));

drop policy if exists activity_sessions_select_coordinator on public.activity_sessions;
create policy activity_sessions_select_coordinator
  on public.activity_sessions
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_sessions_insert_coordinator on public.activity_sessions;
create policy activity_sessions_insert_coordinator
  on public.activity_sessions
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and created_by_staff_id = auth.uid()
  );

drop policy if exists activity_sessions_update_coordinator on public.activity_sessions;
create policy activity_sessions_update_coordinator
  on public.activity_sessions
  for update
  to authenticated
  using (public.has_role('activity_coordinator'))
  with check (public.has_role('activity_coordinator'));

grant select, insert, update on public.activity_recurring_schedules to authenticated;
grant select, insert, update on public.activity_sessions to authenticated;
grant all on public.activity_recurring_schedules to service_role;
grant all on public.activity_sessions to service_role;
