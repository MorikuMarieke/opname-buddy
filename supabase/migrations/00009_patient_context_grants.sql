-- =============================================================================
-- OpnameBuddy: API role grants for patient_context
-- =============================================================================

grant select on public.patient_context to authenticated;
grant insert, update on public.patient_context to authenticated;

grant all on public.patient_context to service_role;
