-- =============================================================================
-- OpnameBuddy: patient_context UX refine — field simplification
-- =============================================================================
-- Reshape guidance and movement-freedom enums; move IV/oxygen to chips;
-- drop weight_bearing_status, has_iv_line, has_oxygen.
-- Idempotent where possible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Migrate requires_supervision: yes/no -> required/not_required
-- -----------------------------------------------------------------------------

alter table public.patient_context
  drop constraint if exists patient_context_requires_supervision_check;

update public.patient_context
set requires_supervision = case requires_supervision
  when 'yes' then 'required'
  when 'no' then 'not_required'
  else requires_supervision
end;

alter table public.patient_context
  add constraint patient_context_requires_supervision_check
  check (requires_supervision in ('unknown', 'not_required', 'required'));

-- -----------------------------------------------------------------------------
-- Migrate room_restriction -> movement freedom values
-- -----------------------------------------------------------------------------

alter table public.patient_context
  drop constraint if exists patient_context_room_restriction_check;

update public.patient_context
set room_restriction = case room_restriction
  when 'free_to_leave' then 'no_restriction'
  when 'supervised_leave' then 'ward_only'
  when 'staff_only' then 'room_only'
  else room_restriction
end;

alter table public.patient_context
  add constraint patient_context_room_restriction_check
  check (room_restriction in ('unknown', 'room_only', 'ward_only', 'no_restriction'));

-- -----------------------------------------------------------------------------
-- Expand attention-point allowlist (before chip migration)
-- -----------------------------------------------------------------------------

alter table public.patient_context
  drop constraint if exists patient_context_attention_points_check;

alter table public.patient_context
  add constraint patient_context_attention_points_check
  check (
    additional_attention_points <@ array[
      'iv_pump', 'oxygen', 'catheter', 'wound_or_drain', 'post_surgery', 'fatigue',
      'wandering_risk', 'language_barrier', 'cognitive_support', 'hearing_support',
      'vision_support', 'communication_support', 'other'
    ]::text[]
  );

-- -----------------------------------------------------------------------------
-- Migrate has_iv_line / has_oxygen yes -> attention chips
-- -----------------------------------------------------------------------------

update public.patient_context
set additional_attention_points = (
  select coalesce(array_agg(distinct point), '{}')
  from unnest(
    additional_attention_points
    || case when has_iv_line = 'yes' then array['iv_pump']::text[] else '{}'::text[] end
    || case when has_oxygen = 'yes' then array['oxygen']::text[] else '{}'::text[] end
  ) as point
);

-- -----------------------------------------------------------------------------
-- Drop deprecated columns
-- -----------------------------------------------------------------------------

alter table public.patient_context
  drop constraint if exists patient_context_weight_bearing_status_check;

alter table public.patient_context
  drop constraint if exists patient_context_has_iv_line_check;

alter table public.patient_context
  drop constraint if exists patient_context_has_oxygen_check;

alter table public.patient_context
  drop column if exists weight_bearing_status;

alter table public.patient_context
  drop column if exists has_iv_line;

alter table public.patient_context
  drop column if exists has_oxygen;
