insert into public.user_roles (user_id, role_id)
select distinct pal.user_id, r.id
from public.patient_account_links pal
cross join public.roles r
where r.name = 'patient'
  and not exists (
    select 1
    from public.user_roles ur
    join public.roles ro on ro.id = ur.role_id
    where ur.user_id = pal.user_id
      and ro.name = 'patient'
  )
on conflict do nothing;
