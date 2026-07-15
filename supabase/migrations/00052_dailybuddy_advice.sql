-- =============================================================================
-- OpnameBuddy: DailyBuddy advice, visit requests, independent-access care fact
-- =============================================================================
-- Idempotent: safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- patient_context: independent access to shared activity room
-- -----------------------------------------------------------------------------

alter table public.patient_context
  add column if not exists can_independently_reach_activity_room text not null default 'unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patient_context_can_independently_reach_activity_room_check'
  ) then
    alter table public.patient_context
      add constraint patient_context_can_independently_reach_activity_room_check
      check (can_independently_reach_activity_room in ('unknown', 'yes', 'no'));
  end if;
end $$;

comment on column public.patient_context.can_independently_reach_activity_room is
  'Caregiver-owned: whether the patient can independently reach the shared afternoon activity room (with or without own mobility aid). yes = may be considered for afternoon group; no/unknown = never recommend afternoon group.';

-- -----------------------------------------------------------------------------
-- daily_advice
-- -----------------------------------------------------------------------------

create table if not exists public.daily_advice (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions (id) on delete cascade,
  advice_date date not null,
  status text not null default 'generating',
  primary_outcome text,
  motivation text,
  explanation text,
  choice_reminder text,
  inspiration_ids text[] not null default '{}',
  secondary_morning_visit boolean not null default false,
  secondary_morning_note text,
  afternoon_status text,
  afternoon_title text,
  afternoon_note text,
  afternoon_claims_need_match boolean not null default false,
  source_checkin_id uuid references public.patient_checkins (id) on delete set null,
  source_plan_updated_at timestamptz,
  stale_reason text,
  safety_flags_applied text[] not null default '{}',
  model_id text,
  generation_started_at timestamptz,
  generated_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_advice_admission_date_unique unique (admission_id, advice_date),
  constraint daily_advice_status_check
    check (status in ('generating', 'ready', 'failed', 'stale')),
  constraint daily_advice_primary_outcome_check
    check (
      primary_outcome is null
      or primary_outcome in (
        'rest',
        'morning_volunteer_visit',
        'afternoon_group_activity'
      )
    ),
  constraint daily_advice_afternoon_status_check
    check (
      afternoon_status is null
      or afternoon_status in (
        'pending_plan',
        'recommended',
        'not_recommended',
        'none'
      )
    )
);

comment on table public.daily_advice is
  'One DailyBuddy participation advice per admission per calendar day. Persisted after structured AI validation; regenerated when check-in changes.';

create index if not exists daily_advice_admission_date_idx
  on public.daily_advice (admission_id, advice_date desc);

drop trigger if exists set_daily_advice_updated_at on public.daily_advice;
create trigger set_daily_advice_updated_at
  before update on public.daily_advice
  for each row execute function public.set_updated_at();

alter table public.daily_advice enable row level security;

drop policy if exists daily_advice_select_own_admission on public.daily_advice;
create policy daily_advice_select_own_admission
  on public.daily_advice
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists daily_advice_insert_own_admission on public.daily_advice;
create policy daily_advice_insert_own_admission
  on public.daily_advice
  for insert
  to authenticated
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists daily_advice_update_own_admission on public.daily_advice;
create policy daily_advice_update_own_admission
  on public.daily_advice
  for update
  to authenticated
  using (admission_id in (select public.current_admission_ids()))
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists daily_advice_select_caregiver on public.daily_advice;
create policy daily_advice_select_caregiver
  on public.daily_advice
  for select
  to authenticated
  using (public.has_role('caregiver'));

grant select, insert, update on public.daily_advice to authenticated;
grant all on public.daily_advice to service_role;

-- -----------------------------------------------------------------------------
-- morning_volunteer_visit_requests
-- -----------------------------------------------------------------------------

create table if not exists public.morning_volunteer_visit_requests (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions (id) on delete cascade,
  request_date date not null,
  block text not null default 'morning',
  patient_message text,
  inspiration_ids text[] not null default '{}',
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint morning_volunteer_visit_requests_block_check
    check (block = 'morning'),
  constraint morning_volunteer_visit_requests_status_check
    check (status in ('requested', 'cancelled'))
);

comment on table public.morning_volunteer_visit_requests is
  'Simple patient request for a personal morning volunteer visit. No matching or assignment.';

create unique index if not exists morning_visit_requests_one_active_per_day
  on public.morning_volunteer_visit_requests (admission_id, request_date)
  where status = 'requested';

create index if not exists morning_visit_requests_date_idx
  on public.morning_volunteer_visit_requests (request_date desc, status);

drop trigger if exists set_morning_visit_requests_updated_at
  on public.morning_volunteer_visit_requests;
create trigger set_morning_visit_requests_updated_at
  before update on public.morning_volunteer_visit_requests
  for each row execute function public.set_updated_at();

alter table public.morning_volunteer_visit_requests enable row level security;

drop policy if exists morning_visit_requests_select_own on public.morning_volunteer_visit_requests;
create policy morning_visit_requests_select_own
  on public.morning_volunteer_visit_requests
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists morning_visit_requests_insert_own on public.morning_volunteer_visit_requests;
create policy morning_visit_requests_insert_own
  on public.morning_volunteer_visit_requests
  for insert
  to authenticated
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists morning_visit_requests_update_own on public.morning_volunteer_visit_requests;
create policy morning_visit_requests_update_own
  on public.morning_volunteer_visit_requests
  for update
  to authenticated
  using (admission_id in (select public.current_admission_ids()))
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists morning_visit_requests_select_staff on public.morning_volunteer_visit_requests;
create policy morning_visit_requests_select_staff
  on public.morning_volunteer_visit_requests
  for select
  to authenticated
  using (
    public.has_role('volunteer')
    or public.has_role('activity_coordinator')
    or public.has_role('admin')
  );

grant select, insert, update on public.morning_volunteer_visit_requests to authenticated;
grant all on public.morning_volunteer_visit_requests to service_role;

-- -----------------------------------------------------------------------------
-- Fix morning contact availability signal (patient-safe boolean only)
-- -----------------------------------------------------------------------------

drop function if exists public.get_morning_contact_availability_signal(date);

create function public.get_morning_contact_availability_signal(p_plan_date date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with plan_dow as (
    select extract(dow from p_plan_date)::smallint as dow
  )
  select exists (
    select 1
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.roles r on r.id = ur.role_id
    cross join plan_dow pd
    left join public.volunteer_weekly_blocks vwb
      on vwb.user_id = p.id
     and vwb.day_of_week = pd.dow
    where r.name = 'volunteer'
      and coalesce(vwb.morning_available, false)
      and not exists (
        select 1
        from public.volunteer_day_absences vda
        where vda.user_id = p.id
          and vda.absence_date = p_plan_date
          and vda.block = 'morning'
      )
  );
$$;

comment on function public.get_morning_contact_availability_signal(date) is
  'Patient/AI-safe boolean: morning individual contact reasonably available. Never returns volunteer identities.';

revoke all on function public.get_morning_contact_availability_signal(date) from public;
grant execute on function public.get_morning_contact_availability_signal(date) to authenticated;

-- -----------------------------------------------------------------------------
-- Staff list of morning visit requests for a date
-- -----------------------------------------------------------------------------

drop function if exists public.list_morning_volunteer_visit_requests(date);

create function public.list_morning_volunteer_visit_requests(p_request_date date)
returns table (
  id uuid,
  admission_id uuid,
  request_date date,
  block text,
  patient_message text,
  inspiration_ids text[],
  status text,
  created_at timestamptz,
  patient_display_name text,
  room_number text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.admission_id,
    r.request_date,
    r.block,
    r.patient_message,
    r.inspiration_ids,
    r.status,
    r.created_at,
    trim(both from coalesce(pt.first_name, '') || ' ' || coalesce(pt.last_name, ''))
      as patient_display_name,
    a.room_number
  from public.morning_volunteer_visit_requests r
  join public.admissions a on a.id = r.admission_id
  join public.patients pt on pt.id = a.patient_id
  where r.request_date = p_request_date
    and r.status = 'requested'
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('admin')
    )
  order by r.created_at asc;
$$;

comment on function public.list_morning_volunteer_visit_requests(date) is
  'Operational list of active morning volunteer visit requests for a date. No assignment workflow.';

revoke all on function public.list_morning_volunteer_visit_requests(date) from public;
grant execute on function public.list_morning_volunteer_visit_requests(date) to authenticated;
