-- =============================================================================
-- OpnameBuddy: patient participation evaluations (evening reflection)
-- =============================================================================
-- activity_session_id FK deferred to branch 4 when activities table exists.
-- =============================================================================

create table if not exists public.patient_participation_evaluations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  evaluation_date date not null,
  activity_title text not null,
  activity_session_id uuid,
  status text not null,
  reason text,
  effort_score smallint not null,
  after_feeling_score smallint not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_participation_evaluations_status_check
    check (status in ('done', 'partly_done', 'not_done')),
  constraint patient_participation_evaluations_effort_score_check
    check (effort_score between 1 and 5),
  constraint patient_participation_evaluations_after_feeling_score_check
    check (after_feeling_score between 1 and 5)
);

comment on table public.patient_participation_evaluations is
  'Patient evening reflection on participation in a suggested or planned activity.';

comment on column public.patient_participation_evaluations.activity_title is
  'Human-readable activity label until activity_session_id FK is available (branch 4).';

comment on column public.patient_participation_evaluations.activity_session_id is
  'Optional link to activity_sessions; FK added in branch 4.';

create index if not exists patient_participation_evaluations_patient_date_idx
  on public.patient_participation_evaluations (patient_id, evaluation_date desc);

drop trigger if exists patient_participation_evaluations_set_updated_at
  on public.patient_participation_evaluations;

create trigger patient_participation_evaluations_set_updated_at
  before update on public.patient_participation_evaluations
  for each row
  execute function public.set_updated_at();

alter table public.patient_participation_evaluations enable row level security;

drop policy if exists patient_participation_evaluations_select_own
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_select_own
  on public.patient_participation_evaluations
  for select
  to authenticated
  using (patient_id = auth.uid());

drop policy if exists patient_participation_evaluations_insert_own
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_insert_own
  on public.patient_participation_evaluations
  for insert
  to authenticated
  with check (patient_id = auth.uid());

drop policy if exists patient_participation_evaluations_update_own
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_update_own
  on public.patient_participation_evaluations
  for update
  to authenticated
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());
