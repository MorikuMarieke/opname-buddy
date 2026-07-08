-- =============================================================================
-- OpnameBuddy: structured patient demographics (first/last name, sex)
-- =============================================================================
-- Replaces monolithic full_name with first_name, last_name, and sex.
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

alter table public.patients
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists sex text;

-- Backfill from full_name when columns are still empty.
update public.patients
set
  first_name = coalesce(
    nullif(trim(first_name), ''),
    nullif(trim(split_part(trim(full_name), ' ', 1)), ''),
    'Onbekend'
  ),
  last_name = coalesce(
    nullif(trim(last_name), ''),
    nullif(
      trim(
        substring(
          trim(full_name)
          from length(split_part(trim(full_name), ' ', 1)) + 1
        )
      ),
      ''
    ),
    ''
  )
where full_name is not null;

update public.patients
set
  first_name = coalesce(nullif(trim(first_name), ''), 'Onbekend'),
  last_name = coalesce(last_name, '')
where first_name is null or last_name is null;

alter table public.patients
  alter column first_name set not null,
  alter column last_name set not null;

alter table public.patients
  drop constraint if exists patients_sex_check;

alter table public.patients
  add constraint patients_sex_check
    check (sex is null or sex in ('M', 'F', 'X'));

alter table public.patients
  drop column if exists full_name;

comment on column public.patients.first_name is 'Clinical patient first name.';
comment on column public.patients.last_name is 'Clinical patient last name.';
comment on column public.patients.sex is 'M, F, or X. Used for formal greeting defaults.';
