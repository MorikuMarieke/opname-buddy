-- =============================================================================
-- OpnameBuddy: API role grants for Data API access
-- =============================================================================
-- New Supabase projects no longer auto-grant table privileges to anon,
-- authenticated, and service_role. Without these grants, PostgREST returns
-- "permission denied for table ..." even when RLS policies exist.
-- =============================================================================

grant select, update on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select on public.user_roles to authenticated;

grant all on public.profiles to service_role;
grant all on public.roles to service_role;
grant all on public.user_roles to service_role;

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant select, update on tables to authenticated;
  
