-- Replace clinical isolation_type with product-specific visit/activity possibility.
-- Legacy mapping (exact):
--   NULL / 'unknown' → 'unknown'
--   'none' → 'no_relevant_restriction'
--   contact|droplet|airborne|strict|protective → 'no_non_care_contact'
--   any other non-null → 'no_non_care_contact'
-- Never maps to visit_allowed_with_protection (staff must set that explicitly).

alter table public.patient_context
  drop constraint if exists patient_context_isolation_type_check;

update public.patient_context
set isolation_type = case
  when isolation_type is null or isolation_type = 'unknown' then 'unknown'
  when isolation_type = 'none' then 'no_relevant_restriction'
  when isolation_type in (
    'contact', 'droplet', 'airborne', 'strict', 'protective'
  ) then 'no_non_care_contact'
  else 'no_non_care_contact'
end;

alter table public.patient_context
  rename column isolation_type to visit_activity_possibility;

alter table public.patient_context
  alter column visit_activity_possibility set default 'unknown';

alter table public.patient_context
  add constraint patient_context_visit_activity_possibility_check
    check (visit_activity_possibility in (
      'unknown',
      'no_relevant_restriction',
      'visit_allowed_with_protection',
      'no_non_care_contact'
    ));

comment on column public.patient_context.visit_activity_possibility is
  'Product field for DailyBuddy non-care visit/activity routes. Not a clinical isolation diagnosis.';
