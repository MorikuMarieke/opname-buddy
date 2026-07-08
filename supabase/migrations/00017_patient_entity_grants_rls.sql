-- =============================================================================
-- OpnameBuddy: grants + RLS for patient entity and linking
-- =============================================================================
-- Phase 1 companion to 00015 and 00016. Sets Data API grants and RLS policies.
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. High-impact; requires explicit
-- approval before running. Depends on 00015 and 00016.
--
-- Ownership rules enforced here:
--   * Staff (caregiver/admin) manage patients, admissions, and link codes.
--   * Patients read only the patient/admission they are linked to
--     (via current_patient_ids()).
--   * code_hash is never exposed: patient_link_codes has NO authenticated grant
--     and NO authenticated policy. Codes are created server-side (service_role).
--   * created_by_staff_id records the acting staff account (audit, not owner).
--
-- Idempotent: safe to re-run.
-- See docs/branch-plans/branch-04-account-domain-model.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Grants (role-level; RLS restricts rows, grants restrict tables/columns)
-- -----------------------------------------------------------------------------

grant select, insert, update on public.patients to authenticated;
grant select, insert, update on public.admissions to authenticated;
grant select on public.patient_account_links to authenticated;
-- patient_link_codes: no authenticated grant here; code_hash protection is
-- enforced by the explicit REVOKE below (overriding 00002 default privileges)
-- plus deny-all RLS (no authenticated policy).

grant all on public.patients to service_role;
grant all on public.admissions to service_role;
grant all on public.patient_account_links to service_role;
grant all on public.patient_link_codes to service_role;

-- 00002 sets default privileges granting select+update on new public tables to
-- authenticated. Undo that for the codes table so code_hash can never be read by
-- authenticated, even if a SELECT policy is added later (defense in depth).
revoke select, update on public.patient_link_codes from authenticated;

-- Account links are written only via redeem_patient_link_code() (definer) or the
-- service role; authenticated needs SELECT only.
revoke update on public.patient_account_links from authenticated;

-- -----------------------------------------------------------------------------
-- RLS: patients
-- -----------------------------------------------------------------------------

drop policy if exists patients_select_staff on public.patients;
create policy patients_select_staff
  on public.patients
  for select
  to authenticated
  using (public.has_role('caregiver') or public.has_role('admin'));

drop policy if exists patients_select_linked on public.patients;
create policy patients_select_linked
  on public.patients
  for select
  to authenticated
  using (id in (select public.current_patient_ids()));

drop policy if exists patients_insert_staff on public.patients;
create policy patients_insert_staff
  on public.patients
  for insert
  to authenticated
  with check (
    (public.has_role('caregiver') or public.has_role('admin'))
    and created_by_staff_id = auth.uid()
  );

drop policy if exists patients_update_staff on public.patients;
create policy patients_update_staff
  on public.patients
  for update
  to authenticated
  using (public.has_role('caregiver') or public.has_role('admin'))
  with check (public.has_role('caregiver') or public.has_role('admin'));

-- -----------------------------------------------------------------------------
-- RLS: admissions
-- -----------------------------------------------------------------------------

drop policy if exists admissions_select_staff on public.admissions;
create policy admissions_select_staff
  on public.admissions
  for select
  to authenticated
  using (public.has_role('caregiver') or public.has_role('admin'));

drop policy if exists admissions_select_linked on public.admissions;
create policy admissions_select_linked
  on public.admissions
  for select
  to authenticated
  using (patient_id in (select public.current_patient_ids()));

drop policy if exists admissions_insert_staff on public.admissions;
create policy admissions_insert_staff
  on public.admissions
  for insert
  to authenticated
  with check (
    (public.has_role('caregiver') or public.has_role('admin'))
    and created_by_staff_id = auth.uid()
  );

drop policy if exists admissions_update_staff on public.admissions;
create policy admissions_update_staff
  on public.admissions
  for update
  to authenticated
  using (public.has_role('caregiver') or public.has_role('admin'))
  with check (public.has_role('caregiver') or public.has_role('admin'));

-- -----------------------------------------------------------------------------
-- RLS: patient_account_links
-- -----------------------------------------------------------------------------
-- Reads: the linked account (self) and staff. Writes happen through the
-- SECURITY DEFINER redeem function or the service role, so no client
-- INSERT/UPDATE/DELETE policies are defined.

drop policy if exists patient_account_links_select_own on public.patient_account_links;
create policy patient_account_links_select_own
  on public.patient_account_links
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists patient_account_links_select_staff on public.patient_account_links;
create policy patient_account_links_select_staff
  on public.patient_account_links
  for select
  to authenticated
  using (public.has_role('caregiver') or public.has_role('admin'));

-- -----------------------------------------------------------------------------
-- RLS: patient_link_codes
-- -----------------------------------------------------------------------------
-- No authenticated policies. RLS is enabled and there is no authenticated grant,
-- so clients cannot read code_hash. Codes are created server-side (service_role,
-- which bypasses RLS) and consumed via redeem_patient_link_code() (definer).
