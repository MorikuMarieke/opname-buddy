-- -----------------------------------------------------------------------------
-- Afternoon group interest signals + awaiting_afternoon_programme outcome
-- -----------------------------------------------------------------------------

-- Allow new DailyBuddy primary outcome
alter table public.daily_advice
  drop constraint if exists daily_advice_primary_outcome_check;

alter table public.daily_advice
  add constraint daily_advice_primary_outcome_check
  check (
    primary_outcome is null
    or primary_outcome in (
      'rest',
      'morning_volunteer_visit',
      'afternoon_group_activity',
      'awaiting_afternoon_programme'
    )
  );

-- Non-binding interest in a possible future shared afternoon activity.
-- Not a booking, attendee list, reservation, or registration.
create table if not exists public.afternoon_group_interest_signals (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions (id) on delete cascade,
  interest_date date not null,
  status text not null default 'interested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint afternoon_group_interest_signals_status_check
    check (status in ('interested', 'withdrawn')),
  constraint afternoon_group_interest_signals_admission_date_unique
    unique (admission_id, interest_date)
);

comment on table public.afternoon_group_interest_signals is
  'Non-binding patient interest in a possible shared afternoon activity for a date. Historical demand signal only — never a booking or attendee claim.';

create index if not exists afternoon_group_interest_signals_date_status_idx
  on public.afternoon_group_interest_signals (interest_date desc, status);

drop trigger if exists set_afternoon_group_interest_signals_updated_at
  on public.afternoon_group_interest_signals;
create trigger set_afternoon_group_interest_signals_updated_at
  before update on public.afternoon_group_interest_signals
  for each row execute function public.set_updated_at();

alter table public.afternoon_group_interest_signals enable row level security;

-- Patients: own admission only
drop policy if exists afternoon_interest_select_own
  on public.afternoon_group_interest_signals;
create policy afternoon_interest_select_own
  on public.afternoon_group_interest_signals
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists afternoon_interest_insert_own
  on public.afternoon_group_interest_signals;
create policy afternoon_interest_insert_own
  on public.afternoon_group_interest_signals
  for insert
  to authenticated
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists afternoon_interest_update_own
  on public.afternoon_group_interest_signals;
create policy afternoon_interest_update_own
  on public.afternoon_group_interest_signals
  for update
  to authenticated
  using (admission_id in (select public.current_admission_ids()))
  with check (admission_id in (select public.current_admission_ids()));

-- Coordinator/admin may select rows (list via RPC); volunteers must not see PII rows
drop policy if exists afternoon_interest_select_coordinator_admin
  on public.afternoon_group_interest_signals;
create policy afternoon_interest_select_coordinator_admin
  on public.afternoon_group_interest_signals
  for select
  to authenticated
  using (
    public.has_role('activity_coordinator')
    or public.has_role('admin')
  );

grant select, insert, update on public.afternoon_group_interest_signals to authenticated;
grant all on public.afternoon_group_interest_signals to service_role;

-- Coordinator/admin list: name + room for active admissions only
drop function if exists public.list_afternoon_group_interest_signals(date);

create function public.list_afternoon_group_interest_signals(p_interest_date date)
returns table (
  id uuid,
  admission_id uuid,
  interest_date date,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  patient_display_name text,
  room_number text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.admission_id,
    s.interest_date,
    s.status,
    s.created_at,
    s.updated_at,
    trim(both from coalesce(pt.first_name, '') || ' ' || coalesce(pt.last_name, ''))
      as patient_display_name,
    a.room_number
  from public.afternoon_group_interest_signals s
  join public.admissions a on a.id = s.admission_id
  join public.patients pt on pt.id = a.patient_id
  where s.interest_date = p_interest_date
    and s.status = 'interested'
    and a.status = 'active'
    and (
      public.has_role('activity_coordinator')
      or public.has_role('admin')
    )
  order by s.created_at asc;
$$;

comment on function public.list_afternoon_group_interest_signals(date) is
  'Coordinator/admin list of non-binding afternoon interest signals for a date. Name and room only; not a booking list.';

revoke all on function public.list_afternoon_group_interest_signals(date) from public;
grant execute on function public.list_afternoon_group_interest_signals(date) to authenticated;

-- Volunteer aggregate only — no names or rooms
drop function if exists public.count_afternoon_group_interest_signals(date);

create function public.count_afternoon_group_interest_signals(p_interest_date date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*)::integer, 0)
  from public.afternoon_group_interest_signals s
  join public.admissions a on a.id = s.admission_id
  where s.interest_date = p_interest_date
    and s.status = 'interested'
    and a.status = 'active'
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('admin')
    );
$$;

comment on function public.count_afternoon_group_interest_signals(date) is
  'Aggregate count of interested afternoon signals for a date. Safe for volunteers (no PII).';

revoke all on function public.count_afternoon_group_interest_signals(date) from public;
grant execute on function public.count_afternoon_group_interest_signals(date) to authenticated;
