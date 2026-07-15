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

---

## Patient participation: morning / evening scheduling

**Status:** Parked — data layer exists, scheduling logic does not  
**Added:** 2026-06-30  
**Trigger:** Evening evaluation UI, home-dashboard phase reminders, or DagBuddy daily rhythm.

**Context:** Morning check-in and evening participation evaluation use calendar dates (`check_in_date`, `evaluation_date`) in Europe/Amsterdam. The app does not yet use time-of-day windows or evening reminders.

**Full plan:** [`docs/future-participation-scheduling.md`](docs/future-participation-scheduling.md)

---

## Patient questions: daily summary (QuestionBuddy)

**Status:** Parked — branch 2 is editor only  
**Added:** 2026-06-30  
**Trigger:** Branch 10 (`feature/questionbuddy-agent`) — Vercel AI SDK integration

**Context:** Patients write and label questions in branch 2. Organization into a daily summary for rounds happens later via QuestionBuddy — never medical answers in the app.

**Full plan:** [`docs/future-questionbuddy-daily-summary.md`](docs/future-questionbuddy-daily-summary.md)

---

## Patient entity vs account: `feature/account-domain-model`

**Status:** Shipped — Phase 1–3 applied 2026-07-03 (`00015`–`00027`). Care data is admission-scoped; legacy `patient_id` columns removed.  
**Branch plan:** [`docs/branch-plans/branch-04-account-domain-model.md`](docs/branch-plans/branch-04-account-domain-model.md)

**Still deferred (later branch):** Organizational (department/team/admission) caregiver access instead of the global `caregiver` role.
