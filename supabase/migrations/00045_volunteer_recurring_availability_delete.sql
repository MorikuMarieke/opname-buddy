-- =============================================================================
-- OpnameBuddy: allow volunteers to delete own recurring availability rows
-- =============================================================================

drop policy if exists volunteer_recurring_availability_delete_own
  on public.volunteer_recurring_availability;

create policy volunteer_recurring_availability_delete_own
  on public.volunteer_recurring_availability
  for delete
  to authenticated
  using (public.has_role('volunteer') and user_id = auth.uid());

grant delete on public.volunteer_recurring_availability to authenticated;
