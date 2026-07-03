-- =============================================================================
-- OpnameBuddy: patient_context (Zorgcontext)
-- =============================================================================
-- Practical care facts for safe participation — not derived planning decisions.
-- Idempotent: safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Role helper (for staff RLS)
-- -----------------------------------------------------------------------------

create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = role_name
  );
$$;

-- -----------------------------------------------------------------------------
-- Table
-- -----------------------------------------------------------------------------

create table if not exists public.patient_context (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  mobility_status text not null default 'unknown',
  transfer_support text not null default 'unknown',
  fall_risk text not null default 'unknown',
  requires_supervision text not null default 'unknown',
  weight_bearing_status text not null default 'unknown',
  mobility_aid_type text not null default 'unknown',
  mobility_aid_available text not null default 'unknown',
  has_iv_line text not null default 'unknown',
  has_oxygen text not null default 'unknown',
  isolation_type text not null default 'unknown',
  room_restriction text not null default 'unknown',
  additional_attention_points text[] not null default '{}',
  additional_attention_notes text,
  notes text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_context_patient_id_unique unique (patient_id),
  constraint patient_context_mobility_status_check
    check (mobility_status in (
      'unknown', 'bed_bound', 'chair_only', 'wheelchair',
      'walking_independent', 'walking_with_aid', 'walking_with_assistance'
    )),
  constraint patient_context_transfer_support_check
    check (transfer_support in (
      'unknown', 'none', 'one_person', 'two_person', 'lift'
    )),
  constraint patient_context_fall_risk_check
    check (fall_risk in ('unknown', 'low', 'medium', 'high')),
  constraint patient_context_requires_supervision_check
    check (requires_supervision in ('unknown', 'yes', 'no')),
  constraint patient_context_weight_bearing_status_check
    check (weight_bearing_status in ('unknown', 'full', 'partial', 'none')),
  constraint patient_context_mobility_aid_type_check
    check (mobility_aid_type in (
      'unknown', 'cane', 'walker', 'wheelchair', 'own_aid', 'other'
    )),
  constraint patient_context_mobility_aid_available_check
    check (mobility_aid_available in ('unknown', 'yes', 'no')),
  constraint patient_context_has_iv_line_check
    check (has_iv_line in ('unknown', 'yes', 'no')),
  constraint patient_context_has_oxygen_check
    check (has_oxygen in ('unknown', 'yes', 'no')),
  constraint patient_context_isolation_type_check
    check (isolation_type in (
      'unknown', 'none', 'contact', 'droplet', 'airborne', 'strict', 'protective'
    )),
  constraint patient_context_room_restriction_check
    check (room_restriction in (
      'unknown', 'free_to_leave', 'supervised_leave', 'room_only', 'staff_only'
    )),
  constraint patient_context_attention_points_check
    check (
      additional_attention_points <@ array[
        'catheter', 'wound_or_drain', 'post_surgery', 'fatigue',
        'cognitive_support', 'hearing_support', 'vision_support',
        'communication_support', 'other'
      ]::text[]
    )
);

comment on table public.patient_context is
  'Caregiver-maintained practical care facts. unknown = do not assume. Planning decisions derived by DagBuddy.';

create index if not exists patient_context_patient_id_idx
  on public.patient_context (patient_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists patient_context_set_updated_at on public.patient_context;

create trigger patient_context_set_updated_at
  before update on public.patient_context
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.patient_context enable row level security;

drop policy if exists patient_context_select_own on public.patient_context;
create policy patient_context_select_own
  on public.patient_context
  for select
  to authenticated
  using (patient_id = auth.uid());

drop policy if exists patient_context_select_caregiver on public.patient_context;
create policy patient_context_select_caregiver
  on public.patient_context
  for select
  to authenticated
  using (public.has_role('caregiver'));

drop policy if exists patient_context_select_coordinator on public.patient_context;
create policy patient_context_select_coordinator
  on public.patient_context
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists patient_context_insert_caregiver on public.patient_context;
create policy patient_context_insert_caregiver
  on public.patient_context
  for insert
  to authenticated
  with check (
    public.has_role('caregiver')
    and updated_by = auth.uid()
  );

drop policy if exists patient_context_update_caregiver on public.patient_context;
create policy patient_context_update_caregiver
  on public.patient_context
  for update
  to authenticated
  using (public.has_role('caregiver'))
  with check (
    public.has_role('caregiver')
    and updated_by = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- RLS: caregivers may list patient profiles
-- -----------------------------------------------------------------------------

drop policy if exists profiles_select_caregiver_patients on public.profiles;
create policy profiles_select_caregiver_patients
  on public.profiles
  for select
  to authenticated
  using (
    public.has_role('caregiver')
    and exists (
      select 1
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = profiles.id
        and r.name = 'patient'
    )
  );
