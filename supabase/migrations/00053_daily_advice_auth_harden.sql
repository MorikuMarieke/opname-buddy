-- =============================================================================
-- OpnameBuddy: Harden daily_advice authorization (patient read-only)
-- =============================================================================
-- Patients may SELECT own advice via current_admission_ids().
-- Inserts/updates are server-side only (service_role).
-- Removes broad caregiver SELECT on all advice rows.
-- Idempotent: safe to re-run.
-- =============================================================================

-- Drop patient write policies
drop policy if exists daily_advice_insert_own_admission on public.daily_advice;
drop policy if exists daily_advice_update_own_admission on public.daily_advice;

-- Drop broad caregiver read access
drop policy if exists daily_advice_select_caregiver on public.daily_advice;

-- Keep patient select (recreate for clarity)
drop policy if exists daily_advice_select_own_admission on public.daily_advice;
create policy daily_advice_select_own_admission
  on public.daily_advice
  for select
  to authenticated
  using (admission_id in (select public.current_admission_ids()));

-- Patients: read only. Service role retains full access for trusted server writes.
revoke insert, update, delete on public.daily_advice from authenticated;
grant select on public.daily_advice to authenticated;
grant all on public.daily_advice to service_role;

-- Afternoon patch: allow neutral informational status (not a recommendation)
alter table public.daily_advice
  drop constraint if exists daily_advice_afternoon_status_check;

alter table public.daily_advice
  add constraint daily_advice_afternoon_status_check
  check (
    afternoon_status is null
    or afternoon_status in (
      'pending_plan',
      'recommended',
      'not_recommended',
      'none',
      'informational'
    )
  );

comment on table public.daily_advice is
  'DailyBuddy advice per admission per day. Patients read own rows only; writes via service role after server authz.';
