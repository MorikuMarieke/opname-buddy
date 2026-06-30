-- =============================================================================
-- OpnameBuddy: add motivation_score to patient check-ins
-- =============================================================================
-- Motivation: how motivated the patient feels to participate in an activity today.
-- =============================================================================

alter table public.patient_checkins
  add column if not exists motivation_score smallint;

update public.patient_checkins
  set motivation_score = 3
  where motivation_score is null;

alter table public.patient_checkins
  alter column motivation_score set not null;

alter table public.patient_checkins
  drop constraint if exists patient_checkins_motivation_score_check;

alter table public.patient_checkins
  add constraint patient_checkins_motivation_score_check
    check (motivation_score between 1 and 5);

comment on column public.patient_checkins.motivation_score is
  'How motivated the patient feels to participate in an activity today (1-5).';
