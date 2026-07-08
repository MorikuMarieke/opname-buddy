-- =============================================================================
-- OpnameBuddy: Phase 2 (checkpoint 1) — backfill care admission_id
-- =============================================================================
-- Sets admission_id on existing care rows by resolving the owning admission from
-- the account link:
--   care.patient_id (= profiles.id / login account)
--     -> patient_account_links.user_id
--     -> patients
--     -> that patient's ACTIVE admission
--
-- Only fills rows where admission_id is null, so it is idempotent and safe to
-- re-run. No care data is moved or deleted; patient_id is left untouched.
--
-- Relies on the one-active-admission invariant (partial unique index from 00015),
-- so at most one active admission matches per patient.
--
-- Rows owned by accounts without a patient link (e.g. previously mis-attributed
-- staff/self patient_context rows) are intentionally left with admission_id NULL.
-- Cleaning those up is deferred to a later checkpoint (do not delete data here).
--
-- IMPORTANT: AUTHORED but NOT YET APPLIED. Requires explicit approval before
-- running. Depends on 00019 (columns) and Phase 1 links/admissions (00016/00018).
-- See docs/branch-plans/branch-04-account-domain-model.md (Phase 2 plan).
-- =============================================================================

update public.patient_context c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a
  on a.patient_id = pal.patient_id
 and a.status = 'active'
where c.admission_id is null
  and pal.user_id = c.patient_id;

update public.patient_checkins c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a
  on a.patient_id = pal.patient_id
 and a.status = 'active'
where c.admission_id is null
  and pal.user_id = c.patient_id;

update public.patient_questions c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a
  on a.patient_id = pal.patient_id
 and a.status = 'active'
where c.admission_id is null
  and pal.user_id = c.patient_id;

update public.patient_participation_evaluations c
set admission_id = a.id
from public.patient_account_links pal
join public.admissions a
  on a.patient_id = pal.patient_id
 and a.status = 'active'
where c.admission_id is null
  and pal.user_id = c.patient_id;
