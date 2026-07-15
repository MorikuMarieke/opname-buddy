-- =============================================================================
-- OpnameBuddy: patient activity sessions — include assigned volunteer names
-- =============================================================================
-- Extends list_patient_activity_sessions return shape (no new permissions).
-- =============================================================================

drop function if exists public.list_patient_activity_sessions();

create function public.list_patient_activity_sessions()
returns table (
  session_id uuid,
  activity_title text,
  activity_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  volunteer_names text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    s.id as session_id,
    a.title as activity_title,
    a.description as activity_description,
    s.starts_at,
    s.ends_at,
    s.location,
    nullif(
      (
        select string_agg(p.full_name, ', ' order by p.full_name)
        from public.activity_session_volunteers asv
        join public.profiles p on p.id = asv.user_id
        where asv.session_id = s.id
      ),
      ''
    ) as volunteer_names
  from public.activity_sessions s
  join public.activities a on a.id = s.activity_id
  join public.activity_session_participants asp on asp.session_id = s.id
  where asp.admission_id in (select public.current_admission_ids())
    and s.status = 'confirmed'
    and s.starts_at >= now()
  order by s.starts_at asc;
$$;

comment on function public.list_patient_activity_sessions() is
  'Confirmed upcoming sessions for the linked patient admission with volunteer names. SECURITY DEFINER.';

revoke all on function public.list_patient_activity_sessions() from public;
grant execute on function public.list_patient_activity_sessions() to authenticated;
