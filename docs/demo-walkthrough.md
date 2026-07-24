# Demo walkthrough

**Beoordelaars en docenten:** gebruik het primaire document

→ [`functioneel-testdraaiboek.md`](./functioneel-testdraaiboek.md)

Dat bestand bevat:

- de volledige handmatige acceptatietest (test-ID’s + statusvelden);
- de aanbevolen rolvolgorde;
- voorbereiding met `demo:seed` (§3.4);
- de korte **video-/presentatieroute** (§16, 8–12 minuten).

## Supporting docs

| Document | Purpose |
|----------|---------|
| [`demo-accounts.md`](./demo-accounts.md) | Demo logins and playbook role codes |
| [`demo-data.md`](./demo-data.md) | Seed and cleanup commands |
| [`demo-scenarios.md`](./demo-scenarios.md) | Patient/volunteer stories and DailyBuddy matrix |
| [`planning-poc-limitations.md`](./planning-poc-limitations.md) | Intentional PoC limits (not bugs) |

## Quick orientation (not a second walkthrough)

- Root `/` is the **Demonstratie-overzicht** (heart logo returns here). It does not bypass authorization.
- Production: https://opname-buddy.vercel.app
- After seed: `npm run demo:seed` — then follow §3.4 of the testdraaiboek before DailyBuddy interest steps (seed often creates today’s afternoon title and check-ins).
