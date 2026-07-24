# OpnameBuddy

OpnameBuddy is a tablet-first recovery participation platform for people who are admitted to hospital. It supports patients in taking an active role in their day, while keeping healthcare-professional safety boundaries leading.

> OpnameBuddy supports reflection, communication, and safe participation. It does not provide medical diagnosis, treatment, or clinical decision-making.

## Core functionality

1. **Daily patient check-ins** — patients complete a short daily check-in about how they feel, their energy, and what they need to participate that day.
2. **Care context** — caregivers record participation-related restrictions and considerations (`patient_context`). Patients can read their zorgcontext. Caregiver UI for check-ins and patient questions is not part of this PoC (patient-side only today; future: read-only care views, later a secured answering workflow).
3. **Daily participation coordination** — activity coordinators and volunteers work with a fixed two-block day (morning individual contact, afternoon group communication). Volunteers manage block availability and can record the afternoon activity (category, title, optional patient-facing message). Coordinators see ward-wide needs, volunteer availability, morning visit requests, afternoon interest signals, and can record or adjust the afternoon plan. This PoC is **not** an activity catalog, recurrence engine, or operational workforce scheduler.
4. **DailyBuddy participation advice** — DailyBuddy combines the patient’s check-in, care context, and available participation information (including the recorded afternoon plan and a boolean morning-availability signal) into personalised advice on `/dashboard/advice`. Patients may express or withdraw non-binding afternoon interest when eligibility rules allow. Deterministic safety rules keep advice within recorded care boundaries; DailyBuddy does not diagnose, prescribe treatment, or override care context.

Patients do **not** use a standalone general “Vandaag” / activities-overview page. Legacy `/dashboard/activities` redirects to `/dashboard/advice`.

## Stack

- Next.js 16 (App Router), React 19, and TypeScript
- Tailwind CSS
- Supabase: Auth, PostgreSQL, Row Level Security (RLS), and RPCs
- TanStack React Query for client-side queries and mutations
- Vercel AI SDK and OpenAI for DailyBuddy
- Zod for validation
- Vercel for deployment

## Project links

- GitHub: [MorikuMarieke/opname-buddy](https://github.com/MorikuMarieke/opname-buddy)
- Vercel production: https://opname-buddy.vercel.app
- Supabase project URL: https://ioqcxvhuomyfzaodaiqf.supabase.co

## Requirements

- Node.js 20.9 or newer (Node.js 20 LTS recommended)
- npm 10 or newer
- A Supabase project with the migrations in this repository applied
- An OpenAI API key for DailyBuddy generation

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in values:

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key (browser + server) |
| `SUPABASE_URL` | Server | Optional override for server/demo scripts (falls back to the public URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin/demo scripts and privileged server paths — never expose to the browser |
| `OPENAI_API_KEY` | Server only | Used by the Vercel AI SDK / OpenAI provider for DailyBuddy |

## Run locally

```bash
git clone https://github.com/MorikuMarieke/opname-buddy.git
cd opname-buddy
npm install
cp .env.example .env.local
npm run dev
```

Fill in the values in `.env.local`, then open [http://localhost:3000](http://localhost:3000).

The root page (`/`) is an intentional **Demonstratie-overzicht** (heart logo and module tiles) for PoC demonstration and testing. It does not bypass route authorization: protected modules still require login and the matching role. It is not part of the final patient-facing production design.

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test:dailybuddy` | DailyBuddy safety / policy tests |
| `npm run demo:seed` | Seed fictional `@opnamebuddy.test` demo data |
| `npm run demo:cleanup` | Remove demo accounts and related records |

## Roles and default landing pages

After login, the app picks one landing page from the user’s roles using this priority (highest first):

`admin` → `/admin` · `activity_coordinator` → `/planning` · `caregiver` → `/care` · `volunteer` → `/volunteer` · `patient` → `/dashboard`

Route layouts still authorize against the user’s **full** role set (`requireRole`), so a multi-role account can open every module they are assigned to.

Demo logins: [`docs/demo-accounts.md`](docs/demo-accounts.md) (shared password `Demo123!`).

## For teachers and graders

**Start here:** [`docs/functioneel-testdraaiboek.md`](docs/functioneel-testdraaiboek.md) — Dutch functional test playbook (Bijlage D).

| How to use it | What to open |
|---------------|--------------|
| Grade / accept the PoC | Full checklist in the testdraaiboek |
| Record an 8–12 min demo video | Testdraaiboek **§16** only |
| Log in | [`docs/demo-accounts.md`](docs/demo-accounts.md) (includes playbook codes A1, C1, P1…) |
| Reset fictional data | `npm run demo:seed` — then follow testdraaiboek **§3.4** (seed already creates today’s check-ins and often an afternoon title) |
| Pick patient stories | [`docs/demo-scenarios.md`](docs/demo-scenarios.md) |

The root page (`/`) is the **Demonstratie-overzicht** (heart logo). It helps navigation for demos; it does **not** bypass login or role checks.

Production smoke: https://opname-buddy.vercel.app

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/functioneel-testdraaiboek.md`](docs/functioneel-testdraaiboek.md) | **Primary** teacher/grader playbook (tests, video route, acceptance) |
| [`docs/demo-accounts.md`](docs/demo-accounts.md) | Demo logins and playbook role mapping |
| [`docs/demo-scenarios.md`](docs/demo-scenarios.md) | Patient/volunteer stories and DailyBuddy matrix |
| [`docs/demo-data.md`](docs/demo-data.md) | Seed and cleanup commands |
| [`docs/demo-walkthrough.md`](docs/demo-walkthrough.md) | Short pointer to the testdraaiboek |
| [`docs/project-context.md`](docs/project-context.md) | Product and architecture overview for the current PoC |
| [`docs/domain-model.md`](docs/domain-model.md) | Domain entities and data blueprint |
| [`docs/dailybuddy-ai-boundary.md`](docs/dailybuddy-ai-boundary.md) | DailyBuddy tools, gates, and safety rules |
| [`docs/planning-poc-limitations.md`](docs/planning-poc-limitations.md) | Intentional PoC boundaries |
| [`docs/planning-poc-migration.md`](docs/planning-poc-migration.md) | Legacy planning → daily participation migration inventory |
