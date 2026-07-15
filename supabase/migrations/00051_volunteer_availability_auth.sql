-- Restrict volunteer availability oversight to volunteers (shared overview),
-- activity coordinators, and admins. Remove automatic caregiver access.

-- volunteer_weekly_blocks: select
drop policy if exists volunteer_weekly_blocks_select_staff
  on public.volunteer_weekly_blocks;
create policy volunteer_weekly_blocks_select_staff
  on public.volunteer_weekly_blocks
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('activity_coordinator')
    or public.has_role('admin')
  );

-- volunteer_day_absences: select
drop policy if exists volunteer_day_absences_select_staff
  on public.volunteer_day_absences;
create policy volunteer_day_absences_select_staff
  on public.volunteer_day_absences
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('activity_coordinator')
    or public.has_role('admin')
  );

-- RPC: volunteer effective block availability overview
drop function if exists public.get_volunteer_block_availability_overview(date);

create function public.get_volunteer_block_availability_overview(p_plan_date date)
returns table (
  user_id uuid,
  full_name text,
  morning_effective boolean,
  afternoon_effective boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with plan_dow as (
    select extract(dow from p_plan_date)::smallint as dow
  )
  select
    p.id as user_id,
    p.full_name,
    coalesce(vwb.morning_available, false)
      and not exists (
        select 1
        from public.volunteer_day_absences vda
        where vda.user_id = p.id
          and vda.absence_date = p_plan_date
          and vda.block = 'morning'
      ) as morning_effective,
    coalesce(vwb.afternoon_available, false)
      and not exists (
        select 1
        from public.volunteer_day_absences vda
        where vda.user_id = p.id
          and vda.absence_date = p_plan_date
          and vda.block = 'afternoon'
      ) as afternoon_effective
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  join public.roles r on r.id = ur.role_id
  cross join plan_dow pd
  left join public.volunteer_weekly_blocks vwb
    on vwb.user_id = p.id
   and vwb.day_of_week = pd.dow
  where r.name = 'volunteer'
    and (
      public.has_role('volunteer')
      or public.has_role('activity_coordinator')
      or public.has_role('admin')
    )
  order by p.full_name asc nulls last;
$$;

comment on function public.get_volunteer_block_availability_overview(date) is
  'Effective volunteer block availability for volunteer/coordinator/admin oversight. Not for caregivers or AI staffing.';

revoke all on function public.get_volunteer_block_availability_overview(date) from public;
grant execute on function public.get_volunteer_block_availability_overview(date) to authenticated;
