-- =============================================================================
-- OpnameBuddy: daily participation proof-of-concept schema
-- =============================================================================
-- Replaces branch-7 scheduling writes with:
--   - patient_checkins.participation_needs
--   - daily_participation_plans (one afternoon communication per date)
--   - volunteer_weekly_blocks (fixed morning/afternoon block flags)
--   - volunteer_day_absences (one-time block unavailability)
--
-- Legacy tables (00039–00049) remain; stop application writes in Phase 6.
-- Idempotent. See docs/planning-poc-migration.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.participation_needs_valid(needs text[])
returns boolean
language sql
immutable
as $$
  select needs is not null
    and needs <@ array['social', 'movement', 'creative', 'relaxation']::text[];
$$;

comment on function public.participation_needs_valid(text[]) is
  'Validates patient_checkins.participation_needs array values.';

create or replace function public.participation_block_valid(block text)
returns boolean
language sql
immutable
as $$
  select block in ('morning', 'afternoon');
$$;

comment on function public.participation_block_valid(text) is
  'Validates volunteer_day_absences.block and related enums.';

create or replace function public.afternoon_category_valid(category text)
returns boolean
language sql
immutable
as $$
  select category is null
    or category in ('social', 'movement', 'creative', 'relaxation');
$$;

-- -----------------------------------------------------------------------------
-- patient_checkins: participation needs
-- -----------------------------------------------------------------------------

alter table public.patient_checkins
  add column if not exists participation_needs text[] not null default '{}';

alter table public.patient_checkins
  drop constraint if exists patient_checkins_participation_needs_check;

alter table public.patient_checkins
  add constraint patient_checkins_participation_needs_check
    check (public.participation_needs_valid(participation_needs));

comment on column public.patient_checkins.participation_needs is
  'Patient-selected daily participation needs: social, movement, creative, relaxation.';

-- -----------------------------------------------------------------------------
-- daily_participation_plans
-- -----------------------------------------------------------------------------

create table if not exists public.daily_participation_plans (
  id uuid primary key default gen_random_uuid(),
  plan_date date not null,
  afternoon_category text,
  afternoon_title text,
  participant_message text,
  recorded_by_user_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_participation_plans_plan_date_unique unique (plan_date),
  constraint daily_participation_plans_afternoon_category_check
    check (public.afternoon_category_valid(afternoon_category))
);

comment on table public.daily_participation_plans is
  'Optional daily afternoon group activity communication (one record per calendar date).';

create index if not exists daily_participation_plans_plan_date_idx
  on public.daily_participation_plans (plan_date desc);

drop trigger if exists daily_participation_plans_set_updated_at
  on public.daily_participation_plans;
create trigger daily_participation_plans_set_updated_at
  before update on public.daily_participation_plans
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- volunteer_weekly_blocks
-- -----------------------------------------------------------------------------

create table if not exists public.volunteer_weekly_blocks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null,
  morning_available boolean not null default false,
  afternoon_available boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint volunteer_weekly_blocks_pkey primary key (user_id, day_of_week),
  constraint volunteer_weekly_blocks_dow_check check (day_of_week between 0 and 6)
);

comment on table public.volunteer_weekly_blocks is
  'Volunteer weekly availability for fixed morning (10:00–12:00) and afternoon (14:00–16:00) blocks.';

create index if not exists volunteer_weekly_blocks_user_idx
  on public.volunteer_weekly_blocks (user_id);

drop trigger if exists volunteer_weekly_blocks_set_updated_at
  on public.volunteer_weekly_blocks;
create trigger volunteer_weekly_blocks_set_updated_at
  before update on public.volunteer_weekly_blocks
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- volunteer_day_absences
-- -----------------------------------------------------------------------------

create table if not exists public.volunteer_day_absences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  absence_date date not null,
  block text not null,
  created_at timestamptz not null default now(),
  constraint volunteer_day_absences_block_check
    check (public.participation_block_valid(block)),
  constraint volunteer_day_absences_user_date_block_unique
    unique (user_id, absence_date, block)
);

comment on table public.volunteer_day_absences is
  'One-time volunteer unavailability for a specific date and fixed block.';

create index if not exists volunteer_day_absences_user_date_idx
  on public.volunteer_day_absences (user_id, absence_date);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.daily_participation_plans enable row level security;
alter table public.volunteer_weekly_blocks enable row level security;
alter table public.volunteer_day_absences enable row level security;

-- daily_participation_plans
drop policy if exists daily_participation_plans_select_staff
  on public.daily_participation_plans;
create policy daily_participation_plans_select_staff
  on public.daily_participation_plans
  for select
  to authenticated
  using (
    public.has_role('volunteer')
    or public.has_role('activity_coordinator')
    or public.has_role('caregiver')
    or public.has_role('patient')
  );

drop policy if exists daily_participation_plans_insert_staff
  on public.daily_participation_plans;
create policy daily_participation_plans_insert_staff
  on public.daily_participation_plans
  for insert
  to authenticated
  with check (
    (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
    )
    and recorded_by_user_id = auth.uid()
  );

drop policy if exists daily_participation_plans_update_staff
  on public.daily_participation_plans;
create policy daily_participation_plans_update_staff
  on public.daily_participation_plans
  for update
  to authenticated
  using (
    public.has_role('volunteer')
    or public.has_role('activity_coordinator')
  )
  with check (
    (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
    )
    and recorded_by_user_id = auth.uid()
  );

-- volunteer_weekly_blocks
drop policy if exists volunteer_weekly_blocks_select_staff
  on public.volunteer_weekly_blocks;
create policy volunteer_weekly_blocks_select_staff
  on public.volunteer_weekly_blocks
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('activity_coordinator')
    or public.has_role('caregiver')
  );

drop policy if exists volunteer_weekly_blocks_insert_own
  on public.volunteer_weekly_blocks;
create policy volunteer_weekly_blocks_insert_own
  on public.volunteer_weekly_blocks
  for insert
  to authenticated
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_weekly_blocks_update_own
  on public.volunteer_weekly_blocks;
create policy volunteer_weekly_blocks_update_own
  on public.volunteer_weekly_blocks
  for update
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid())
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_weekly_blocks_delete_own
  on public.volunteer_weekly_blocks;
create policy volunteer_weekly_blocks_delete_own
  on public.volunteer_weekly_blocks
  for delete
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid());

-- volunteer_day_absences
drop policy if exists volunteer_day_absences_select_staff
  on public.volunteer_day_absences;
create policy volunteer_day_absences_select_staff
  on public.volunteer_day_absences
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('activity_coordinator')
    or public.has_role('caregiver')
  );

drop policy if exists volunteer_day_absences_insert_own
  on public.volunteer_day_absences;
create policy volunteer_day_absences_insert_own
  on public.volunteer_day_absences
  for insert
  to authenticated
  with check (public.has_role('volunteer') and user_id = auth.uid());

drop policy if exists volunteer_day_absences_delete_own
  on public.volunteer_day_absences;
create policy volunteer_day_absences_delete_own
  on public.volunteer_day_absences
  for delete
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------

grant select on public.daily_participation_plans to authenticated;
grant insert, update on public.daily_participation_plans to authenticated;
grant all on public.daily_participation_plans to service_role;

grant select, insert, update, delete on public.volunteer_weekly_blocks to authenticated;
grant all on public.volunteer_weekly_blocks to service_role;

grant select, insert, delete on public.volunteer_day_absences to authenticated;
grant all on public.volunteer_day_absences to service_role;

-- -----------------------------------------------------------------------------
-- RPC: aggregated patient needs for a date
-- -----------------------------------------------------------------------------

drop function if exists public.get_daily_needs_summary(date);

create function public.get_daily_needs_summary(p_plan_date date)
returns table (
  need text,
  need_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    need_value as need,
    count(*)::bigint as need_count
  from public.admissions a
  join public.patient_checkins pc on pc.admission_id = a.id
  cross join lateral unnest(pc.participation_needs) as need_value
  where a.status = 'active'
    and pc.check_in_date = p_plan_date
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('caregiver')
    )
  group by need_value
  order by need_value;
$$;

comment on function public.get_daily_needs_summary(date) is
  'Aggregated participation need counts from active admissions check-ins for a date.';

revoke all on function public.get_daily_needs_summary(date) from public;
grant execute on function public.get_daily_needs_summary(date) to authenticated;

-- -----------------------------------------------------------------------------
-- RPC: patient read model for daily afternoon communication
-- -----------------------------------------------------------------------------

drop function if exists public.get_daily_participation_for_patient(date);

create function public.get_daily_participation_for_patient(p_plan_date date)
returns table (
  plan_date date,
  afternoon_category text,
  afternoon_title text,
  participant_message text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    dpp.plan_date,
    dpp.afternoon_category,
    dpp.afternoon_title,
    dpp.participant_message,
    dpp.updated_at
  from public.daily_participation_plans dpp
  where dpp.plan_date = p_plan_date
    and exists (select 1 from public.current_admission_ids());
$$;

comment on function public.get_daily_participation_for_patient(date) is
  'Afternoon participation communication for linked patients. SECURITY DEFINER.';

revoke all on function public.get_daily_participation_for_patient(date) from public;
grant execute on function public.get_daily_participation_for_patient(date) to authenticated;

-- -----------------------------------------------------------------------------
-- RPC: volunteer effective block availability (coordinator oversight)
-- -----------------------------------------------------------------------------

drop function if exists public.get_volunteer_block_availability_overview(date);

create function public.get_volunteer_block_availability_overview(p_plan_date date)
returns table (
  user_id uuid,
  full_name text,
  morning_effective boolean,
  afternoon_effective boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with plan_dow as (
    select extract(dow from p_plan_date)::smallint as dow
  )
  select
    p.id as user_id,
    p.full_name,
    coalesce(vwb.morning_available, false)
      and not exists (
        select 1
        from public.volunteer_day_absences vda
        where vda.user_id = p.id
          and vda.absence_date = p_plan_date
          and vda.block = 'morning'
      ) as morning_effective,
    coalesce(vwb.afternoon_available, false)
      and not exists (
        select 1
        from public.volunteer_day_absences vda
        where vda.user_id = p.id
          and vda.absence_date = p_plan_date
          and vda.block = 'afternoon'
      ) as afternoon_effective
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  join public.roles r on r.id = ur.role_id
  cross join plan_dow pd
  left join public.volunteer_weekly_blocks vwb
    on vwb.user_id = p.id
   and vwb.day_of_week = pd.dow
  where r.name = 'volunteer'
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('caregiver')
    )
  order by p.full_name asc nulls last;
$$;

comment on function public.get_volunteer_block_availability_overview(date) is
  'Effective volunteer block availability for coordinator/volunteer oversight. Not for AI staffing.';

revoke all on function public.get_volunteer_block_availability_overview(date) from public;
grant execute on function public.get_volunteer_block_availability_overview(date) to authenticated;

-- -----------------------------------------------------------------------------
-- RPC: simple morning contact signal for AI (no volunteer names)
-- -----------------------------------------------------------------------------

drop function if exists public.get_morning_contact_availability_signal(date);

create function public.get_morning_contact_availability_signal(p_plan_date date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.get_volunteer_block_availability_overview(p_plan_date) o
    where o.morning_effective
  );
$$;

comment on function public.get_morning_contact_availability_signal(date) is
  'Simple boolean: morning individual contact reasonably available. No volunteer identities exposed.';

revoke all on function public.get_morning_contact_availability_signal(date) from public;
grant execute on function public.get_morning_contact_availability_signal(date) to authenticated;
