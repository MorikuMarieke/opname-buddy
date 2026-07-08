-- =============================================================================
-- OpnameBuddy: department + room on admissions (replace location)
-- =============================================================================
-- department_id references departments; room_number is separate free text.
-- Backfill: legacy location text → room_number; department_id stays null until
-- caregivers update the admission.
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

alter table public.admissions
  add column if not exists department_id uuid references public.departments (id) on delete restrict,
  add column if not exists room_number text;

update public.admissions
set room_number = nullif(trim(location), '')
where room_number is null
  and location is not null
  and trim(location) <> '';

comment on column public.admissions.department_id is
  'Hospital department for this admission. Nullable for legacy rows until updated.';

comment on column public.admissions.room_number is
  'Room identifier (e.g. 312A, IC-05). Separate from department.';

alter table public.admissions
  drop column if exists location;

create index if not exists admissions_department_id_idx
  on public.admissions (department_id)
  where department_id is not null;
