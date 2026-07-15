-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 2) — admission-scoped care RLS (additive)
-- =============================================================================
-- Adds patient-facing RLS policies scoped by admission ownership
--   admission_id in (select public.current_admission_ids())
-- ALONGSIDE the existing patient_id = auth.uid() policies. Permissive policies
-- are OR-combined, so this only BROADENS access during the transition and never
-- weakens it. The old policies stay authoritative until the cutover checkpoint,
-- which drops them once services/routes write admission_id.
--
-- Caregiver / coordinator policies on patient_context are intentionally left
-- untouched (still global has_role(...)). Organizational scoping is Phase 3.
--
-- Mirrors, per table, the exact predicates of the existing patient policies
-- (including the status = 'open' guard on patient_questions).
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. Requires explicit approval before
-- running. Depends on 00019 (admission_id columns) and 00021 (helper).
--
-- Idempotent: drop policy if exists + create.
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 2 plan).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- patient_checkins
-- -----------------------------------------------------------------------------

drop policy if exists patient_checkins_select_own_admission on public.patient_checkins;
create policy patient_checkins_select_own_admission
  on public.patient_checkins
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists patient_checkins_insert_own_admission on public.patient_checkins;
create policy patient_checkins_insert_own_admission
  on public.patient_checkins
  for insert
  to authenticated
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists patient_checkins_update_own_admission on public.patient_checkins;
create policy patient_checkins_update_own_admission
  on public.patient_checkins
  for update
  to authenticated
  using (admission_id in (select public.current_admission_ids()))
  with check (admission_id in (select public.current_admission_ids()));

-- -----------------------------------------------------------------------------
-- patient_questions (preserve the status = 'open' guard)
-- -----------------------------------------------------------------------------

drop policy if exists patient_questions_select_own_admission on public.patient_questions;
create policy patient_questions_select_own_admission
  on public.patient_questions
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists patient_questions_insert_own_admission on public.patient_questions;
create policy patient_questions_insert_own_admission
  on public.patient_questions
  for insert
  to authenticated
  with check (
    admission_id in (select public.current_admission_ids())
    and status = 'open'
  );

drop policy if exists patient_questions_update_own_open_admission on public.patient_questions;
create policy patient_questions_update_own_open_admission
  on public.patient_questions
  for update
  to authenticated
  using (
    admission_id in (select public.current_admission_ids())
    and status = 'open'
  )
  with check (
    admission_id in (select public.current_admission_ids())
    and status = 'open'
  );

drop policy if exists patient_questions_delete_own_open_admission on public.patient_questions;
create policy patient_questions_delete_own_open_admission
  on public.patient_questions
  for delete
  to authenticated
  using (
    admission_id in (select public.current_admission_ids())
    and status = 'open'
  );

-- -----------------------------------------------------------------------------
-- patient_participation_evaluations
-- -----------------------------------------------------------------------------

drop policy if exists patient_participation_evaluations_select_own_admission
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_select_own_admission
  on public.patient_participation_evaluations
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

drop policy if exists patient_participation_evaluations_insert_own_admission
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_insert_own_admission
  on public.patient_participation_evaluations
  for insert
  to authenticated
  with check (admission_id in (select public.current_admission_ids()));

drop policy if exists patient_participation_evaluations_update_own_admission
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_update_own_admission
  on public.patient_participation_evaluations
  for update
  to authenticated
  using (admission_id in (select public.current_admission_ids()))
  with check (admission_id in (select public.current_admission_ids()));

-- -----------------------------------------------------------------------------
-- patient_context (patient-owned SELECT only; caregivers write, unchanged)
-- -----------------------------------------------------------------------------

drop policy if exists patient_context_select_own_admission on public.patient_context;
create policy patient_context_select_own_admission
  on public.patient_context
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));
