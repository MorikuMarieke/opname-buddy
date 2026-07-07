-- =============================================================================
-- OpnameBuddy: hospital departments (reference data)
-- =============================================================================
-- Structured department list for admissions. Admin-managed; caregivers read
-- active departments only. Department-scoped caregiver RLS remains deferred.
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.departments is
  'Hospital departments for admission assignment. Managed by admin; not org-scoped RLS yet.';

comment on column public.departments.code is
  'Optional short code (e.g. INT, IC).';

-- Seed starter departments (idempotent by name).
insert into public.departments (name, code, sort_order)
select v.name, v.code, v.sort_order
from (
  values
    ('Interne geneeskunde', 'INT', 10),
    ('Chirurgie', 'CHI', 20),
    ('Cardiologie', 'CAR', 30),
    ('Neurologie', 'NEU', 40),
    ('Orthopedie', 'ORT', 50),
    ('Gynaecologie', 'GYN', 60),
    ('Intensive care', 'IC', 70)
) as v(name, code, sort_order)
where not exists (
  select 1 from public.departments d where d.name = v.name
);

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at
  before update on public.departments
  for each row
  execute function public.set_updated_at();

alter table public.departments enable row level security;

drop policy if exists departments_select_caregiver on public.departments;
create policy departments_select_caregiver
  on public.departments
  for select
  to authenticated
  using (
    is_active = true
    and (public.has_role('caregiver') or public.has_role('admin'))
  );

drop policy if exists departments_select_admin on public.departments;
create policy departments_select_admin
  on public.departments
  for select
  to authenticated
  using (public.has_role('admin'));

drop policy if exists departments_insert_admin on public.departments;
create policy departments_insert_admin
  on public.departments
  for insert
  to authenticated
  with check (public.has_role('admin'));

drop policy if exists departments_update_admin on public.departments;
create policy departments_update_admin
  on public.departments
  for update
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

grant select on public.departments to authenticated;
grant all on public.departments to service_role;
