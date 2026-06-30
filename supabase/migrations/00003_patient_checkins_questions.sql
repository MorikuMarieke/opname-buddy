-- =============================================================================
-- OpnameBuddy: patient check-ins and questions
-- =============================================================================
-- Idempotent: safe to re-run (uses IF NOT EXISTS, DROP IF EXISTS).
-- Caregiver read/update policies deferred to branch 3.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.patient_checkins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  check_in_date date not null,
  pain_score smallint not null,
  energy_level smallint not null,
  mood smallint not null,
  mobility_level smallint not null,
  symptoms text not null default '',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_checkins_pain_score_check
    check (pain_score between 0 and 10),
  constraint patient_checkins_energy_level_check
    check (energy_level between 1 and 5),
  constraint patient_checkins_mood_check
    check (mood between 1 and 5),
  constraint patient_checkins_mobility_level_check
    check (mobility_level between 1 and 5)
);

comment on table public.patient_checkins is
  'Patient-owned daily reflection. Caregiver read access added in branch 3.';

create index if not exists patient_checkins_patient_date_idx
  on public.patient_checkins (patient_id, check_in_date desc);

create table if not exists public.patient_questions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  question_text text not null,
  target_type text not null,
  status text not null default 'open',
  answer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_questions_target_type_check
    check (target_type in ('doctor', 'nurse', 'physiotherapist', 'other')),
  constraint patient_questions_status_check
    check (status in ('open', 'discussed', 'answered'))
);

comment on table public.patient_questions is
  'Patient questions for caregivers. answer_notes written by caregivers in branch 3.';

create index if not exists patient_questions_patient_status_idx
  on public.patient_questions (patient_id, status, created_at desc);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists patient_checkins_set_updated_at on public.patient_checkins;

create trigger patient_checkins_set_updated_at
  before update on public.patient_checkins
  for each row
  execute function public.set_updated_at();

drop trigger if exists patient_questions_set_updated_at on public.patient_questions;

create trigger patient_questions_set_updated_at
  before update on public.patient_questions
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.patient_checkins enable row level security;
alter table public.patient_questions enable row level security;

-- -----------------------------------------------------------------------------
-- RLS policies: patient_checkins
-- -----------------------------------------------------------------------------

drop policy if exists patient_checkins_select_own on public.patient_checkins;
create policy patient_checkins_select_own
  on public.patient_checkins
  for select
  to authenticated
  using (patient_id = auth.uid());

drop policy if exists patient_checkins_insert_own on public.patient_checkins;
create policy patient_checkins_insert_own
  on public.patient_checkins
  for insert
  to authenticated
  with check (patient_id = auth.uid());

drop policy if exists patient_checkins_update_own on public.patient_checkins;
create policy patient_checkins_update_own
  on public.patient_checkins
  for update
  to authenticated
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- No DELETE policy: patients cannot delete check-ins.

-- -----------------------------------------------------------------------------
-- RLS policies: patient_questions
-- -----------------------------------------------------------------------------

drop policy if exists patient_questions_select_own on public.patient_questions;
create policy patient_questions_select_own
  on public.patient_questions
  for select
  to authenticated
  using (patient_id = auth.uid());

drop policy if exists patient_questions_insert_own on public.patient_questions;
create policy patient_questions_insert_own
  on public.patient_questions
  for insert
  to authenticated
  with check (patient_id = auth.uid() and status = 'open');

drop policy if exists patient_questions_update_own_open on public.patient_questions;
create policy patient_questions_update_own_open
  on public.patient_questions
  for update
  to authenticated
  using (patient_id = auth.uid() and status = 'open')
  with check (patient_id = auth.uid() and status = 'open');

drop policy if exists patient_questions_delete_own_open on public.patient_questions;
create policy patient_questions_delete_own_open
  on public.patient_questions
  for delete
  to authenticated
  using (patient_id = auth.uid() and status = 'open');
