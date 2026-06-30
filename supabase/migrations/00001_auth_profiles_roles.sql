-- =============================================================================
-- OpnameBuddy: auth, profiles and role-based access foundation
-- =============================================================================
-- Run this script manually in the Supabase SQL Editor for your OpnameBuddy project.
-- Idempotent: safe to re-run (uses IF NOT EXISTS, ON CONFLICT, DROP IF EXISTS).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper functions
-- -----------------------------------------------------------------------------

-- Keeps profiles.updated_at in sync on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles and Auth connection
-- -----------------------------------------------------------------------------
-- When a new user signs up via Supabase Auth, a row is inserted into auth.users.
-- This trigger automatically creates a matching public.profiles row so the app
-- can store display name and preferences without exposing the auth schema.
-- full_name is taken from signup metadata (raw_user_meta_data->>'full_name').
-- SECURITY DEFINER is required so the insert succeeds while RLS is enabled
-- (clients have no INSERT policy on profiles).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    'nl'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  preferred_language text not null default 'nl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'App-specific user data linked 1:1 to auth.users. Created automatically on signup.';

comment on column public.profiles.preferred_language is
  'User language preference. Plain text with default nl; no CHECK constraint yet (multilingual support is a future stretch feature).';

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

comment on table public.roles is
  'Canonical role names for route and module access control (patient, caregiver, activity_coordinator, admin).';

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

comment on table public.user_roles is
  'Assigns roles to users. Read-only for clients; assignments are managed server-side by admins.';

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Seed roles
-- -----------------------------------------------------------------------------

insert into public.roles (name) values
  ('patient'),
  ('caregiver'),
  ('activity_coordinator'),
  ('admin')
on conflict (name) do nothing;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Supabase client libraries connect as the anon or authenticated Postgres role.
-- Without RLS, anyone with the public anon key could read or modify every row
-- in the public schema. Enabling RLS ensures access is limited to explicit policies.

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

-- -----------------------------------------------------------------------------
-- RLS policies: profiles
-- -----------------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT policy: profiles are created by handle_new_user() on auth signup.
-- No DELETE policy: users cannot remove their profile from the client.

-- -----------------------------------------------------------------------------
-- RLS policies: roles
-- -----------------------------------------------------------------------------

drop policy if exists roles_select_authenticated on public.roles;
create policy roles_select_authenticated
  on public.roles
  for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policies: role catalog is managed via migrations only.

-- -----------------------------------------------------------------------------
-- RLS policies: user_roles
-- -----------------------------------------------------------------------------
-- Clients can read their own role assignments but cannot modify them.
-- Allowing client-side INSERT/UPDATE/DELETE would enable privilege escalation
-- (e.g. a patient assigning themselves the admin role). Role assignment will
-- be handled later by admin functionality using the service role key.

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated clients.
