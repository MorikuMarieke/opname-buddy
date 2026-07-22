-- Allow multiple DailyBuddy advice iterations per admission/date (dev history).
-- Exactly one active row per admission + Amsterdam advice date.

alter table public.daily_advice
  add column if not exists iteration integer not null default 1;

alter table public.daily_advice
  add column if not exists generation_kind text not null default 'standard';

alter table public.daily_advice
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_advice_generation_kind_check'
  ) then
    alter table public.daily_advice
      add constraint daily_advice_generation_kind_check
      check (generation_kind in ('standard', 'dev_iteration'));
  end if;
end $$;

alter table public.daily_advice
  drop constraint if exists daily_advice_status_check;

alter table public.daily_advice
  add constraint daily_advice_status_check
  check (
    status in (
      'generating',
      'ready',
      'failed',
      'stale',
      'superseded'
    )
  );

alter table public.daily_advice
  drop constraint if exists daily_advice_admission_date_unique;

create unique index if not exists daily_advice_one_active_per_admission_date
  on public.daily_advice (admission_id, advice_date)
  where is_active;

create index if not exists daily_advice_admission_date_iteration_idx
  on public.daily_advice (admission_id, advice_date, iteration desc);

comment on column public.daily_advice.iteration is
  '1-based generation order for this admission and advice_date. Prior iterations are kept when superseded.';

comment on column public.daily_advice.generation_kind is
  'standard = normal product generation; dev_iteration = development-only force iteration.';

comment on column public.daily_advice.is_active is
  'Exactly one active advice row per admission/date. Superseded iterations remain for history.';
