-- =============================================================================
-- OpnameBuddy: API role grants for patient check-ins and questions
-- =============================================================================

grant select, insert, update on public.patient_checkins to authenticated;
grant select, insert, update, delete on public.patient_questions to authenticated;

grant all on public.patient_checkins to service_role;
grant all on public.patient_questions to service_role;
