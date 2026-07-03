-- =============================================================================
-- OpnameBuddy: patient_context Realtime
-- =============================================================================
-- Publish patient_context changes so the patient dashboard reflects caregiver
-- edits live (RLS still applies: patients only receive their own row).
-- Idempotent: safe to re-run.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'patient_context'
  ) then
    alter publication supabase_realtime add table public.patient_context;
  end if;
end
$$;
