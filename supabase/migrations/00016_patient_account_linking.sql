-- =============================================================================
-- OpnameBuddy: patient <-> account linking (secure flow)
-- =============================================================================
-- Phase 1 of the account/domain model refactor. Connects a login account
-- (profiles/auth.users) to a clinical patient (patients) via a staff-issued,
-- short-TTL, hashed redemption code.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. High-impact; requires explicit
-- approval before running. Depends on 00015_patient_entity.sql.
--
-- Security notes:
--   * Link codes are stored HASHED (pgcrypto crypt/bf). Raw codes are never
--     persisted and are shown to staff once at generation time.
--   * redeem_patient_link_code() is SECURITY DEFINER: it verifies hash + expiry
--     + unused, creates the link, and marks the code used. code_hash is never
--     exposed to clients (no select grant / no select policy).
--
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-account-domain-model.md
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Links one login account to one clinical patient. A given account links to at
-- most one patient (unique user_id). A patient may in principle be linked by
-- more than one account (e.g. future proxy access), so patient_id is not unique.
create table if not exists public.patient_account_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  linked_at timestamptz not null default now(),
  method text not null default 'link_code',
  constraint patient_account_links_user_id_unique unique (user_id),
  constraint patient_account_links_method_check
    check (method in ('link_code', 'staff_manual', 'backfill'))
);

comment on table public.patient_account_links is
  'Connects a login account (profiles) to a clinical patient (patients). One account links to at most one patient.';

create index if not exists patient_account_links_patient_id_idx
  on public.patient_account_links (patient_id);

-- Staff-issued redemption codes. Only the hash is stored. Short TTL + single use.
create table if not exists public.patient_link_codes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.patient_link_codes is
  'Hashed, short-TTL, single-use codes to link an account to a patient. Raw code never stored; code_hash never exposed to clients.';

comment on column public.patient_link_codes.code_hash is
  'bcrypt hash (pgcrypto crypt) of the raw code. Never selectable by clients.';

create index if not exists patient_link_codes_patient_id_idx
  on public.patient_link_codes (patient_id);

-- -----------------------------------------------------------------------------
-- Helper: current_patient_ids()
-- -----------------------------------------------------------------------------
-- Returns the clinical patient ids linked to the calling account. Intended for
-- future care-table RLS (Phase 2) so patient-owned data can be scoped by
-- admission/patient ownership instead of patient_id = auth.uid().

create or replace function public.current_patient_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select pal.patient_id
  from public.patient_account_links pal
  where pal.user_id = auth.uid();
$$;

comment on function public.current_patient_ids() is
  'Clinical patient ids linked to auth.uid(). For future care-table RLS (Phase 2).';

revoke all on function public.current_patient_ids() from public;
grant execute on function public.current_patient_ids() to authenticated;

-- -----------------------------------------------------------------------------
-- Helper: redeem_patient_link_code(code)
-- -----------------------------------------------------------------------------
-- Verifies a raw code against unexpired, unused hashes, links the calling
-- account to the patient, and marks the code used. Returns the linked patient id.
-- Runs as SECURITY DEFINER so it can read code_hash (clients cannot).

create or replace function public.redeem_patient_link_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code_id uuid;
  v_patient_id uuid;
  v_existing_patient_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- One account links to at most one patient. Never silently consume a code
  -- for an account that is already linked.
  select patient_id into v_existing_patient_id
  from public.patient_account_links
  where user_id = auth.uid();

  if v_existing_patient_id is not null then
    raise exception 'account is already linked to a patient' using errcode = 'P0001';
  end if;

  -- Match the raw code against stored bcrypt hashes among valid codes only.
  select id, patient_id
    into v_code_id, v_patient_id
  from public.patient_link_codes
  where used_at is null
    and expires_at > now()
    and code_hash = crypt(p_code, code_hash)
  order by created_at desc
  limit 1;

  if v_code_id is null then
    raise exception 'invalid or expired link code' using errcode = 'P0001';
  end if;

  -- Link created before the code is marked used; unique(user_id) guards races.
  insert into public.patient_account_links (patient_id, user_id, method)
  values (v_patient_id, auth.uid(), 'link_code');

  update public.patient_link_codes
     set used_at = now()
   where id = v_code_id;

  return v_patient_id;
end;
$$;

comment on function public.redeem_patient_link_code(text) is
  'Redeems a raw link code for auth.uid(): verifies hash+expiry+unused, links account to patient, marks used. Returns patient id.';

revoke all on function public.redeem_patient_link_code(text) from public;
grant execute on function public.redeem_patient_link_code(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.patient_account_links enable row level security;
alter table public.patient_link_codes enable row level security;

-- Grants and full RLS policies are defined in 00017_patient_entity_grants_rls.sql.
