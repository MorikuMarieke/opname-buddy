# Demo data tooling

Reproducible fictional dataset for the daily participation proof of concept. Dates are always relative to **Europe/Amsterdam**.

## Prerequisites

1. A Supabase project with migrations applied (including `00050` / `00051`).
2. `.env.local` configured from [`.env.example`](../.env.example):

| Variable | Required for demo scripts |
|----------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server-only) |

The service role key is never exposed to the browser. Demo scripts use it only from the command line.

## Commands

```bash
# Create or refresh demo data (idempotent)
npm run demo:seed

# Preview what would be removed
npm run demo:cleanup -- --dry-run

# Remove all demo accounts and records
npm run demo:cleanup
```

## What the seed creates

| Category | Count | Notes |
|----------|-------|-------|
| Auth accounts | 20 | 1 admin, 1 coordinator, 2 caregivers, 4 volunteers, 12 patients |
| Clinical patients | 12 | `external_ref` = `DEMO-PAT-01` … `DEMO-PAT-12` |
| Active admissions | 12 | Spread across seeded departments |
| Patient context | 12 | One per admission |
| Account links | 12 | `method: staff_manual` |
| Check-ins | 12 | Today's date in Amsterdam |
| Volunteer weekly blocks | 4 volunteers | Distinct availability patterns |
| Volunteer absences | Several | Relative offsets from today |
| Daily plans | 2 | Today (creative, Finn) and tomorrow (movement, coordinator) |

## Idempotency rules

- **Accounts:** existing demo users are reused; profile names refreshed.
- **Patients:** upserted by `external_ref`; non-demo patients are never touched.
- **Admissions:** one active admission per demo patient; updated on re-run.
- **Check-ins:** one row per admission for today; updated on re-run.
- **Volunteer blocks:** replaced per demo volunteer only.
- **Daily plans:** upserted only when missing or recorded by a demo user; never overwrites non-demo plans.

## Cleanup safety

Cleanup deletes only:

- Auth users in the fixed demo email list with `demo_account = true`
- Patients with `external_ref` matching `DEMO-PAT-%`
- Related rows scoped to those patients, admissions, or demo user IDs

Non-demo accounts, patients, check-ins, and plans are left unchanged.

## File layout

| Path | Purpose |
|------|---------|
| `scripts/demo/demo-constants.ts` | Scenario definitions |
| `scripts/demo/demo-auth.ts` | Auth and role helpers |
| `scripts/demo/amsterdam-date.ts` | Relative date helpers |
| `scripts/demo/seed-demo-data.mts` | Seed entrypoint |
| `scripts/demo/cleanup-demo-data.mts` | Cleanup entrypoint |

## Out of scope

Demo tooling does **not** implement DailyBuddy AI helpers, API routes, prompts, or tool calling. Those belong on `feature/dailybuddy-participation-advice`.

## Related docs

- [demo-accounts.md](./demo-accounts.md) — login table
- [demo-scenarios.md](./demo-scenarios.md) — patient and volunteer narratives
- [demo-walkthrough.md](./demo-walkthrough.md) — graduation demonstration script
