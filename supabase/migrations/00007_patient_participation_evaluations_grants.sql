-- =============================================================================
-- OpnameBuddy: API role grants for patient participation evaluations
-- =============================================================================

grant select, insert, update on public.patient_participation_evaluations to authenticated;
grant all on public.patient_participation_evaluations to service_role;
