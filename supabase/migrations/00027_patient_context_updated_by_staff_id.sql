-- =============================================================================
-- OpnameBuddy: Phase 3 (checkpoint 3) — rename patient_context.updated_by to
-- updated_by_staff_id
-- =============================================================================
-- `updated_by` is the staff audit field (the caregiver who last saved the
-- Zorgcontext). This renames it to the conventional `updated_by_staff_id` used
-- across the domain model. Done as add-new + backfill + switch + drop (never an
-- in-place ALTER RENAME) so the change is reversible mid-flight and policies are
-- swapped explicitly.
--
--   1. Add nullable updated_by_staff_id uuid -> profiles(id).
--   2. Backfill from the legacy updated_by.
--   3. Recreate the two caregiver policies that reference the column so they use
--      updated_by_staff_id (both PERMISSIVE, to authenticated).
--   4. Drop the legacy updated_by column (drops its FK + index automatically).
--
-- Column stays nullable (same as updated_by was) — it is an audit field, not an
-- ownership key.
--
-- APPLIED 2026-07-03 (with approval). Depends on 00019–00026.
--
-- Idempotent: add/drop column if [not] exists; drop policy if exists.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 3 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add new audit column
-- -----------------------------------------------------------------------------

alter table public.patient_context
  add column if not exists updated_by_staff_id uuid references public.profiles(id);

-- -----------------------------------------------------------------------------
-- 2. Backfill from legacy column
-- -----------------------------------------------------------------------------

update public.patient_context
set updated_by_staff_id = updated_by
where updated_by_staff_id is null;

-- -----------------------------------------------------------------------------
-- 3. Recreate the two caregiver policies referencing the new column
-- -----------------------------------------------------------------------------

drop policy if exists patient_context_insert_caregiver on public.patient_context;
create policy patient_context_insert_caregiver on public.patient_context
  for insert to authenticated
  with check (has_role('caregiver') and updated_by_staff_id = auth.uid());

drop policy if exists patient_context_update_caregiver on public.patient_context;
create policy patient_context_update_caregiver on public.patient_context
  for update to authenticated
  using (has_role('caregiver'))
  with check (has_role('caregiver') and updated_by_staff_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. Drop legacy column (drops its FK + index automatically)
-- -----------------------------------------------------------------------------

alter table public.patient_context drop column if exists updated_by;
