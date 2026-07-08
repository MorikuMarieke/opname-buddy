-- =============================================================================
-- OpnameBuddy: issue patient link code (server-side only)
-- =============================================================================
-- Generates a 6-digit code, stores bcrypt hash, returns raw code once.
-- Callable only by service_role (from caregiver server action).
-- See docs/branch-plans/branch-06-patient-admission-management.md
-- =============================================================================

create or replace function public.issue_patient_link_code(
  p_patient_id uuid,
  p_created_by_staff_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code text;
  v_expires_at timestamptz;
  v_existing_link uuid;
begin
  select pal.id into v_existing_link
  from public.patient_account_links pal
  where pal.patient_id = p_patient_id
  limit 1;

  if v_existing_link is not null then
    raise exception 'patient is already linked to an account' using errcode = 'P0001';
  end if;

  update public.patient_link_codes
     set used_at = now()
   where patient_id = p_patient_id
     and used_at is null;

  v_code := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
  v_expires_at := now() + interval '24 hours';

  insert into public.patient_link_codes (
    patient_id,
    code_hash,
    expires_at,
    created_by_staff_id
  )
  values (
    p_patient_id,
    crypt(v_code, gen_salt('bf')),
    v_expires_at,
    p_created_by_staff_id
  );

  return jsonb_build_object(
    'code', v_code,
    'expiresAt', v_expires_at
  );
end;
$$;

comment on function public.issue_patient_link_code(uuid, uuid) is
  'Service-role only: issues a 6-digit patient link code. Returns raw code once.';

revoke all on function public.issue_patient_link_code(uuid, uuid) from public;
grant execute on function public.issue_patient_link_code(uuid, uuid) to service_role;
