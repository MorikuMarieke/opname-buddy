create table if not exists public.account_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id) on delete restrict,
  target_user_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint account_audit_events_action_check check (
    action in (
      'role_assigned',
      'role_revoked',
      'profile_updated',
      'account_created',
      'account_deactivated',
      'account_reactivated'
    )
  )
);

comment on table public.account_audit_events is
  'Append-only audit log for admin account management actions. Service role only.';

create index if not exists account_audit_events_target_user_id_idx
  on public.account_audit_events (target_user_id, created_at desc);

create index if not exists account_audit_events_created_at_idx
  on public.account_audit_events (created_at desc);

alter table public.account_audit_events enable row level security;

grant all on public.account_audit_events to service_role;
