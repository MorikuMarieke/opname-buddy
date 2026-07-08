-- =============================================================================
-- OpnameBuddy: linked patients may read their active admission's department
-- =============================================================================
-- Read-only: department name for the patient's own active stay (dashboard).
-- Not organizational caregiver access — scoped to current_patient_ids().
-- Idempotent: safe to re-run.
-- =============================================================================

drop policy if exists departments_select_linked_patient on public.departments;

create policy departments_select_linked_patient
  on public.departments
  for select
  to authenticated
  using (
    id in (
      select a.department_id
      from public.admissions a
      where a.patient_id in (select public.current_patient_ids())
        and a.status = 'active'
        and a.department_id is not null
    )
  );
