-- =============================================================================
-- OpnameBuddy: clinical patient entity (patients + admissions)
-- =============================================================================
-- Phase 1 of the account/domain model refactor. Introduces the clinical patient
-- as a first-class entity, separate from the login account (profiles/auth.users).
--
-- IMPORTANT: This migration is AUTHORED but NOT YET APPLIED. It is high-impact
-- and requires explicit approval before running against the remote project.
-- Existing care tables (patient_context, patient_checkins, patient_questions,
-- patient_participation_evaluations) are UNCHANGED here; they keep the
-- patient_id = auth.uid() model until Phase 2.
--
-- Idempotent: safe to re-run (uses IF NOT EXISTS, DROP IF EXISTS).
-- See docs/branch-plans/branch-account-domain-model.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- The clinical patient: the person receiving care. Managed by staff. This is
-- distinct from a login account and may exist before the patient has a login.
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  external_ref text,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.patients is
  'Clinical patient entity (who care data is about). Distinct from profiles/auth.users (login identity). Managed by staff.';

comment on column public.patients.external_ref is
  'Optional external/hospital reference. No EHR integration in MVP.';

comment on column public.patients.created_by_staff_id is
  'Audit: staff account that created this patient. Staff are actors, not owners.';

-- One hospital stay for a patient. Care data will attach to an admission in
-- Phase 2 (admission_id). A patient may have multiple admissions over time.
create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  admitted_on date not null default (now() at time zone 'Europe/Amsterdam')::date,
  discharged_on date,
  status text not null default 'active',
  location text,
  created_by_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admissions_status_check
    check (status in ('active', 'discharged')),
  constraint admissions_discharge_after_admit_check
    check (discharged_on is null or discharged_on >= admitted_on)
);

comment on table public.admissions is
  'A single hospital stay for a patient. Care data attaches to an admission in Phase 2.';

comment on column public.admissions.created_by_staff_id is
  'Audit: staff account that created this admission.';

create index if not exists admissions_patient_id_idx
  on public.admissions (patient_id);

-- At most one active admission per patient (partial unique index).
create unique index if not exists admissions_one_active_per_patient_idx
  on public.admissions (patient_id)
  where status = 'active';

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row
  execute function public.set_updated_at();

drop trigger if exists admissions_set_updated_at on public.admissions;
create trigger admissions_set_updated_at
  before update on public.admissions
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Enabled here with NO permissive policies yet beyond staff management.
-- Patient read access to their own linked patient/admission is added in 00017
-- once the linking helper (current_patient_ids) exists.

alter table public.patients enable row level security;
alter table public.admissions enable row level security;

-- Grants and full RLS policies are defined in 00017_patient_entity_grants_rls.sql.
