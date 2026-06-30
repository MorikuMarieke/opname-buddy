# Deferred notes

Items we know about but are intentionally not fixing yet for the MVP.
Revisit when the feature that triggers them is built.

---

## Supabase: sequence grants for SERIAL/BIGSERIAL tables

**Status:** Parked — not applicable yet  
**Added:** 2026-06-29  
**Trigger:** A new table uses `SERIAL`, `BIGSERIAL`, or `GENERATED ... AS IDENTITY`, and authenticated users `INSERT` via the Supabase client.

**Context:** `supabase/migrations/00002_api_grants.sql` sets default privileges for tables only, not sequences. The current auth schema (`profiles`, `roles`, `user_roles`) uses UUID primary keys only.

**Symptom:** `permission denied for sequence ...` on `INSERT`.

**Fix when needed:**

```sql
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;
```

**Reference:** [Supabase — Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)
