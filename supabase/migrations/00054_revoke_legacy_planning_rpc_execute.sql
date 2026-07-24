-- =============================================================================
-- OpnameBuddy: Revoke direct client EXECUTE on unused legacy planning RPCs
-- =============================================================================
-- Forward-only hardening. Does not drop functions or legacy tables.
-- Preserves postgres/owner access. Does not grant service_role.
-- Idempotent: safe to re-run.
-- =============================================================================

-- Unused SECURITY DEFINER planning RPCs from migrations 00039–00049.
-- Active PoC flows do not call these; revoke client surface only.

revoke execute on function public.materialize_recurring_sessions(uuid, integer)
  from public, anon, authenticated;

revoke execute on function public.list_planning_sessions(timestamptz, timestamptz, text, text)
  from public, anon, authenticated;

revoke execute on function public.list_facilitator_sessions(timestamptz, timestamptz)
  from public, anon, authenticated;

revoke execute on function public.list_patient_activity_sessions()
  from public, anon, authenticated;

revoke execute on function public.list_planning_patients()
  from public, anon, authenticated;

revoke execute on function public.list_planning_facilitator_candidates(text)
  from public, anon, authenticated;

comment on function public.materialize_recurring_sessions(uuid, integer) is
  'Legacy planning RPC. Client EXECUTE revoked (00054); not used by daily participation PoC.';

comment on function public.list_planning_sessions(timestamptz, timestamptz, text, text) is
  'Legacy planning RPC. Client EXECUTE revoked (00054); not used by daily participation PoC.';

comment on function public.list_facilitator_sessions(timestamptz, timestamptz) is
  'Legacy planning RPC. Client EXECUTE revoked (00054); not used by daily participation PoC.';

comment on function public.list_patient_activity_sessions() is
  'Legacy planning RPC. Client EXECUTE revoked (00054); replaced by get_daily_participation_for_patient.';

comment on function public.list_planning_patients() is
  'Legacy planning RPC. Client EXECUTE revoked (00054); not used by daily participation PoC.';

comment on function public.list_planning_facilitator_candidates(text) is
  'Legacy planning RPC. Client EXECUTE revoked (00054); not used by daily participation PoC.';
