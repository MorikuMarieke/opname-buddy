-- =============================================================================
-- OpnameBuddy: activity planning refactor — schema (phase 1)
-- =============================================================================
-- Facilitator junction tables, recurring series bounds, session exceptions,
-- simplified session status (remove proposed), drop conclusion fields on activities.
-- RPC updates follow in 00049.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Activities: remove patient-conclusion-style flags
-- -----------------------------------------------------------------------------

alter table public.activities
  drop column if exists requires_supervision,
  drop column if exists requires_volunteer;

-- -----------------------------------------------------------------------------
-- Recurring schedules: interval and series date bounds
-- -----------------------------------------------------------------------------

alter table public.activity_recurring_schedules
  add column if not exists interval_weeks smallint,
  add column if not exists series_starts_on date,
  add column if not exists series_ends_on date,
  add column if not exists ended_at timestamptz;

update public.activity_recurring_schedules
set
  interval_weeks = coalesce(interval_weeks, 1),
  series_starts_on = coalesce(
    series_starts_on,
    (timezone('Europe/Amsterdam', now()))::date
  ),
  series_ends_on = coalesce(
    series_ends_on,
    (timezone('Europe/Amsterdam', now()))::date + 84
  )
where interval_weeks is null
   or series_starts_on is null
   or series_ends_on is null;

alter table public.activity_recurring_schedules
  alter column interval_weeks set default 1,
  alter column interval_weeks set not null;

alter table public.activity_recurring_schedules
  alter column series_starts_on set not null,
  alter column series_ends_on set not null;

alter table public.activity_recurring_schedules
  drop constraint if exists activity_recurring_schedules_interval_weeks_check;

alter table public.activity_recurring_schedules
  add constraint activity_recurring_schedules_interval_weeks_check
  check (interval_weeks in (1, 2, 4));

alter table public.activity_recurring_schedules
  drop constraint if exists activity_recurring_schedules_series_dates_check;

alter table public.activity_recurring_schedules
  add constraint activity_recurring_schedules_series_dates_check
  check (series_ends_on >= series_starts_on);

comment on column public.activity_recurring_schedules.interval_weeks is
  'Repeat every N weeks: 1, 2, or 4.';

comment on column public.activity_recurring_schedules.series_starts_on is
  'First calendar date (Europe/Amsterdam) the series may generate sessions.';

comment on column public.activity_recurring_schedules.series_ends_on is
  'Last calendar date (Europe/Amsterdam) the series may generate sessions.';

comment on column public.activity_recurring_schedules.ended_at is
  'When the coordinator stopped the series early (is_active may also be false).';

-- -----------------------------------------------------------------------------
-- Activity sessions: occurrence tracking, detach flag, status simplification
-- -----------------------------------------------------------------------------

alter table public.activity_sessions
  add column if not exists recurring_occurrence_date date,
  add column if not exists is_detached boolean not null default false;

update public.activity_sessions
set recurring_occurrence_date = (timezone('Europe/Amsterdam', starts_at))::date
where recurring_schedule_id is not null
  and recurring_occurrence_date is null;

update public.activity_sessions
set status = 'draft'
where status = 'proposed';

alter table public.activity_sessions
  drop constraint if exists activity_sessions_status_check;

alter table public.activity_sessions
  add constraint activity_sessions_status_check
  check (status in ('draft', 'confirmed', 'completed', 'cancelled'));

comment on column public.activity_sessions.recurring_occurrence_date is
  'Canonical series occurrence date (Europe/Amsterdam). Used for idempotent materialization.';

comment on column public.activity_sessions.is_detached is
  'True when individually edited/cancelled; excluded from series bulk updates and rematerialization overwrites.';

create unique index if not exists activity_sessions_recurring_occurrence_unique_idx
  on public.activity_sessions (recurring_schedule_id, recurring_occurrence_date)
  where recurring_schedule_id is not null
    and recurring_occurrence_date is not null;

-- -----------------------------------------------------------------------------
-- Facilitator assignments (replaces activity_session_volunteers)
-- -----------------------------------------------------------------------------

create table if not exists public.activity_session_facilitators (
  session_id uuid not null references public.activity_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by_staff_id uuid references public.profiles (id) on delete set null,
  primary key (session_id, user_id)
);

comment on table public.activity_session_facilitators is
  'Optional facilitator accounts assigned to a session. Assignment-based session read access.';

create index if not exists activity_session_facilitators_user_idx
  on public.activity_session_facilitators (user_id);

insert into public.activity_session_facilitators (
  session_id,
  user_id,
  assigned_at,
  assigned_by_staff_id
)
select
  session_id,
  user_id,
  assigned_at,
  assigned_by_staff_id
from public.activity_session_volunteers
on conflict (session_id, user_id) do nothing;

create table if not exists public.activity_recurring_schedule_facilitators (
  recurring_schedule_id uuid not null references public.activity_recurring_schedules (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by_staff_id uuid references public.profiles (id) on delete set null,
  primary key (recurring_schedule_id, user_id)
);

comment on table public.activity_recurring_schedule_facilitators is
  'Optional facilitators for a recurring series. Copied to newly materialized sessions.';

create index if not exists activity_recurring_schedule_facilitators_user_idx
  on public.activity_recurring_schedule_facilitators (user_id);

drop table if exists public.activity_session_volunteers;

-- -----------------------------------------------------------------------------
-- RLS: facilitator tables (coordinator-managed, same as former volunteer assignments)
-- -----------------------------------------------------------------------------

alter table public.activity_session_facilitators enable row level security;
alter table public.activity_recurring_schedule_facilitators enable row level security;

drop policy if exists activity_session_facilitators_select_coordinator
  on public.activity_session_facilitators;
create policy activity_session_facilitators_select_coordinator
  on public.activity_session_facilitators
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_session_facilitators_insert_coordinator
  on public.activity_session_facilitators;
create policy activity_session_facilitators_insert_coordinator
  on public.activity_session_facilitators
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and assigned_by_staff_id = auth.uid()
  );

drop policy if exists activity_session_facilitators_delete_coordinator
  on public.activity_session_facilitators;
create policy activity_session_facilitators_delete_coordinator
  on public.activity_session_facilitators
  for delete
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_recurring_schedule_facilitators_select_coordinator
  on public.activity_recurring_schedule_facilitators;
create policy activity_recurring_schedule_facilitators_select_coordinator
  on public.activity_recurring_schedule_facilitators
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_recurring_schedule_facilitators_insert_coordinator
  on public.activity_recurring_schedule_facilitators;
create policy activity_recurring_schedule_facilitators_insert_coordinator
  on public.activity_recurring_schedule_facilitators
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and assigned_by_staff_id = auth.uid()
  );

drop policy if exists activity_recurring_schedule_facilitators_delete_coordinator
  on public.activity_recurring_schedule_facilitators;
create policy activity_recurring_schedule_facilitators_delete_coordinator
  on public.activity_recurring_schedule_facilitators
  for delete
  to authenticated
  using (public.has_role('activity_coordinator'));

grant select, insert, delete on public.activity_session_facilitators to authenticated;
grant select, insert, delete on public.activity_recurring_schedule_facilitators to authenticated;
grant all on public.activity_session_facilitators to service_role;
grant all on public.activity_recurring_schedule_facilitators to service_role;
