-- =============================================================================
-- OpnameBuddy: activity catalog (structured templates for planning + future AI)
-- =============================================================================
-- Reusable non-medical activity templates managed by activity coordinators.
-- Idempotent. See docs/branch-plans/branch-07-activity-planning-volunteers.md
-- =============================================================================

create or replace function public.planning_allowed_settings_valid(settings text[])
returns boolean
language sql
immutable
as $$
  select coalesce(
    bool_and(elem = any(array['bed', 'chair', 'room', 'ward', 'outside']::text[])),
    true
  )
  from unnest(coalesce(settings, '{}'::text[])) as elem;
$$;

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  intensity text not null default 'low',
  location text,
  allowed_settings text[] not null default '{}',
  default_duration_minutes int,
  min_participants int not null default 1,
  max_participants int not null,
  requires_supervision boolean not null default false,
  requires_volunteer boolean not null default false,
  mobility_notes text,
  is_active boolean not null default true,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_category_check check (
    category in ('creative', 'movement', 'social', 'relaxation', 'other')
  ),
  constraint activities_intensity_check check (
    intensity in ('low', 'medium', 'high')
  ),
  constraint activities_allowed_settings_check check (
    public.planning_allowed_settings_valid(allowed_settings)
  ),
  constraint activities_default_duration_check check (
    default_duration_minutes is null or default_duration_minutes > 0
  ),
  constraint activities_participants_check check (
    min_participants >= 1 and max_participants >= min_participants
  ),
  constraint activities_description_not_blank check (length(trim(description)) > 0),
  constraint activities_title_not_blank check (length(trim(title)) > 0)
);

comment on table public.activities is
  'Reusable activity templates for recovery participation planning. Coordinator-managed.';

comment on column public.activities.description is
  'Required narrative context for coordinators and future DagBuddy activity matching.';

comment on column public.activities.allowed_settings is
  'Where the activity can take place: bed, chair, room, ward, outside.';

create index if not exists activities_is_active_idx on public.activities (is_active);
create index if not exists activities_category_idx on public.activities (category);

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
  before update on public.activities
  for each row
  execute function public.set_updated_at();

alter table public.activities enable row level security;

drop policy if exists activities_select_coordinator on public.activities;
create policy activities_select_coordinator
  on public.activities
  for select
  to authenticated
  using (public.has_role('activity_coordinator'));

drop policy if exists activities_insert_coordinator on public.activities;
create policy activities_insert_coordinator
  on public.activities
  for insert
  to authenticated
  with check (
    public.has_role('activity_coordinator')
    and created_by_staff_id = auth.uid()
  );

drop policy if exists activities_update_coordinator on public.activities;
create policy activities_update_coordinator
  on public.activities
  for update
  to authenticated
  using (public.has_role('activity_coordinator'))
  with check (public.has_role('activity_coordinator'));

grant select, insert, update on public.activities to authenticated;
grant all on public.activities to service_role;
