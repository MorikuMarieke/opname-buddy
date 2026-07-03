-- =============================================================================
-- OpnameBuddy: caregiver RLS on patient data (branch 2 deferrals)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- patient_checkins: caregiver read
-- -----------------------------------------------------------------------------

drop policy if exists patient_checkins_select_caregiver on public.patient_checkins;
create policy patient_checkins_select_caregiver
  on public.patient_checkins
  for select
  to authenticated
  using (public.has_role('caregiver'));

-- -----------------------------------------------------------------------------
-- patient_questions: caregiver read and answer
-- -----------------------------------------------------------------------------

drop policy if exists patient_questions_select_caregiver on public.patient_questions;
create policy patient_questions_select_caregiver
  on public.patient_questions
  for select
  to authenticated
  using (public.has_role('caregiver'));

drop policy if exists patient_questions_update_caregiver on public.patient_questions;
create policy patient_questions_update_caregiver
  on public.patient_questions
  for update
  to authenticated
  using (public.has_role('caregiver'))
  with check (public.has_role('caregiver'));

-- -----------------------------------------------------------------------------
-- patient_participation_evaluations: caregiver read
-- -----------------------------------------------------------------------------

drop policy if exists patient_participation_evaluations_select_caregiver
  on public.patient_participation_evaluations;
create policy patient_participation_evaluations_select_caregiver
  on public.patient_participation_evaluations
  for select
  to authenticated
  using (public.has_role('caregiver'));
