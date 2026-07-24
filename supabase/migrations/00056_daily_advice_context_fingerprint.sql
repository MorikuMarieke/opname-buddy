-- Care-context fingerprint for DailyBuddy advice freshness.
-- Material care-context changes must invalidate ready advice without deleting rows.

alter table public.daily_advice
  add column if not exists source_context_fingerprint text;

comment on column public.daily_advice.source_context_fingerprint is
  'Stable fingerprint of care-context fields that affect participation routing. Null on legacy rows; mismatch or null marks advice stale for refresh.';
