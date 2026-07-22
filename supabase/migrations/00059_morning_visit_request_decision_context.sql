-- Enrich morning visit request list with narrow care-context fields for
-- volunteer-safe derivation in the application layer (not exposed raw to clients).
-- Order unchanged: created_at asc. No assignment workflow.

drop function if exists public.list_morning_volunteer_visit_requests(date);

create function public.list_morning_volunteer_visit_requests(p_request_date date)
returns table (
  id uuid,
  admission_id uuid,
  request_date date,
  block text,
  patient_message text,
  inspiration_ids text[],
  status text,
  created_at timestamptz,
  patient_display_name text,
  room_number text,
  can_independently_reach_activity_room text,
  visit_activity_possibility text,
  room_restriction text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.admission_id,
    r.request_date,
    r.block,
    r.patient_message,
    r.inspiration_ids,
    r.status,
    r.created_at,
    trim(both from coalesce(pt.first_name, '') || ' ' || coalesce(pt.last_name, ''))
      as patient_display_name,
    a.room_number,
    coalesce(pc.can_independently_reach_activity_room, 'unknown')
      as can_independently_reach_activity_room,
    coalesce(pc.visit_activity_possibility, 'unknown')
      as visit_activity_possibility,
    coalesce(pc.room_restriction, 'unknown') as room_restriction
  from public.morning_volunteer_visit_requests r
  join public.admissions a on a.id = r.admission_id
  join public.patients pt on pt.id = a.patient_id
  left join public.patient_context pc on pc.admission_id = r.admission_id
  where r.request_date = p_request_date
    and r.status = 'requested'
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('admin')
    )
  order by r.created_at asc;
$$;

comment on function public.list_morning_volunteer_visit_requests(date) is
  'Operational list of active morning volunteer visit requests for a date, with narrow care-context fields for volunteer-safe derivation. No assignment workflow.';

revoke all on function public.list_morning_volunteer_visit_requests(date) from public;
grant execute on function public.list_morning_volunteer_visit_requests(date) to authenticated;
