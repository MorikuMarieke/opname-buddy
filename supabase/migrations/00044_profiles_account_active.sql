-- =============================================================================
-- OpnameBuddy: profiles.is_active for application account state
-- =============================================================================
-- Keeps an explicit application-level active flag on profiles, synchronized with
-- Supabase Auth ban state via admin setAccountActive(). Idempotent.
-- =============================================================================

alter table public.profiles
  add column if not exists is_active boolean not null default true;

comment on column public.profiles.is_active is
  'Application account state. Kept in sync with Supabase Auth ban via admin deactivation.';
