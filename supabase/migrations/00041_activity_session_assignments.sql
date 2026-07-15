-- =============================================================================
-- OpnameBuddy: session participants and volunteer assignments
-- =============================================================================
-- Links active admissions and volunteer accounts to planned sessions.
-- Idempotent. See docs/branch-plans/branch-07-activity-planning-volunteers.md
-- =============================================================================

create table if not exists public.activity_session_participants (
  session_id uuid not null references public.activity_sessions (id) on delete cascade,
  admission_id uuid not null references public.admissions (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by_staff_id uuid references public.profiles (id) on delete set null,
  primary key (session_id, admission_id)
);

comment on table public.activity_session_participants is
  'Patients (via active admission) assigned to an activity session by coordinator.';

create index if not exists activity_session_participants_admission_idx
  on public.activity_session_participants (admission_id);

create table if not exists public.activity_session_volunteers (
  session_id uuid not null references public.activity_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by_staff_id uuid references public.profiles (id) on delete set null,
  primary key (session_id, user_id)
);

comment on table public.activity_session_volunteers is
  'Volunteers assigned to staff an activity session.';

create index if not exists activity_session_volunteers_user_idx
  on public.activity_session_volunteers (user_id);

alter table public.activity_session_participants enable row level security;
alter table public.activity_session_volunteers enable row level security;

drop policy if exists activity_session_participants_select_coordinator
  on public.activity_session_participants;
create policy activity_session_participants_select_coordinator
  on public.activity_session_participants
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_session_participants_insert_coordinator
  on public.activity_session_participants;
create policy activity_session_participants_insert_coordinator
  on public.activity_session_participants
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and assigned_by_staff_id = auth.uid()
  );

drop policy if exists activity_session_participants_delete_coordinator
  on public.activity_session_participants;
create policy activity_session_participants_delete_coordinator
  on public.activity_session_participants
  for delete
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_session_volunteers_select_coordinator
  on public.activity_session_volunteers;
create policy activity_session_volunteers_select_coordinator
  on public.activity_session_volunteers
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activity_session_volunteers_insert_coordinator
  on public.activity_session_volunteers;
create policy activity_session_volunteers_insert_coordinator
  on public.activity_session_volunteers
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and assigned_by_staff_id = auth.uid()
  );

drop policy if exists activity_session_volunteers_delete_coordinator
  on public.activity_session_volunteers;
create policy activity_session_volunteers_delete_coordinator
  on public.activity_session_volunteers
  for delete
  to authenticated
  using (public.has_role('activity_coordinator'));

grant select, insert, delete on public.activity_session_participants to authenticated;
grant select, insert, delete on public.activity_session_volunteers to authenticated;
grant all on public.activity_session_participants to service_role;
grant all on public.activity_session_volunteers to service_role;
