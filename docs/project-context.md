# OpnameBuddy — Project Context

Stable product and architecture reference for Cursor and contributors. Describes *what* OpnameBuddy is in the **current proof of concept** and *how* it is structured. Detailed schemas live in migrations and `docs/domain-model.md`.

---

## What OpnameBuddy is

**OpnameBuddy** is a recovery participation platform for hospitalized patients. In this PoC it helps patients stay involved during admission through:

- Daily check-ins (including participation needs)
- Questions for caregivers (patient preparation editor)
- Caregiver-defined care context / safety boundaries
- A simplified two-block daily participation model (volunteer availability + afternoon activity communication)
- AI-generated DailyBuddy participation advice

The application does not replace clinical care. It supports reflection, communication, and safe participation within boundaries set by healthcare professionals.

---

## Why it exists

Hospital admission can feel passive for patients. OpnameBuddy gives patients a simple daily rhythm (check-in, questions, DagBuddy advice) and turns their input plus professional care context into understandable participation suggestions.

Caregivers maintain clinical patient records and zorgcontext. Activity coordinators and volunteers coordinate the day’s participation communication without a full activity-scheduling product.

---

## Current PoC status

The **daily participation PoC** and **DailyBuddy** are implemented on the current codebase:

- Two fixed dayparts (morning individual contact overview; afternoon group communication)
- Volunteer block availability and afternoon activity recording
- Coordinator dashboard at `/planning`
- Patient DagBuddy at `/dashboard/advice` (structured advice, morning visit requests, afternoon interest when eligible)

Legacy branch-7 activity catalog / session scheduling UI is superseded; those routes redirect to `/planning` or `/care`. See [`docs/planning-poc-migration.md`](planning-poc-migration.md) and [`docs/planning-poc-limitations.md`](planning-poc-limitations.md).

---

## Who uses it

| Role | Primary route | Implemented responsibilities |
|------|---------------|------------------------------|
| **patient** | `/dashboard` | Check-ins, questions, read-only zorgcontext, DagBuddy advice (interest / withdraw when eligible), account linking |
| **caregiver** | `/care` | Overview stats, clinical patient list, admissions, link codes, zorgcontext editing |
| **activity_coordinator** | `/planning` | Daily needs overview, volunteer availability, morning visit requests, afternoon interest signals, afternoon plan record/adjust; volunteer roster at `/planning/volunteers` |
| **volunteer** | `/volunteer` | Daily needs / requests overview, afternoon activity recording, block availability, profile |
| **admin** | `/admin` | Staff/patient/volunteer accounts and roles |

### Role rules

- Patients normally have only the **patient** role.
- Staff users may hold **multiple roles** (e.g. admin + caregiver).
- **Primary redirect priority** after login (default landing page only):

  `admin` > `activity_coordinator` > `caregiver` > `volunteer` > `patient`

  (See `lib/auth/constants.ts`.)

- `requireRole()` checks the full role list for route access, so multi-role users can open every module they are assigned to after login.
- Cross-module navigation for multi-role staff is still limited (each shell shows that module’s nav).

### Caregiver PoC scope (Zorgcontext only)

In the current PoC, caregivers **view and manage Zorgcontext** for clinical patients (plus admissions / link codes as implemented). Patient check-ins and patient questions exist on the **patient** side only.

RLS historically allows caregivers to **SELECT** `patient_checkins` and to **UPDATE** `patient_questions` (`status` / `answer_notes`), but the **care UI does not expose** those flows. Do not document them as shipped caregiver features.

**Future development (not in this PoC):**

- Read-only caregiver access to patient check-ins
- Read-only caregiver access to submitted patient questions
- A later secured workflow for answering questions and updating their handling status

Patient question CRUD (text / specialism) and reading of `answer_notes` when present remain patient-facing.

---

## PoC scope

### In scope (implemented)

- Patient daily check-ins and questions
- Caregiver patient/admission workflows and zorgcontext
- Daily participation coordination (two-block model), volunteer availability, afternoon activity communication
- DailyBuddy participation advice (tools, deterministic gates, persistence, patient UI)
- Supabase Auth, RLS, React Query CRUD, Vercel deployment
- Admin account and role management
- Demo seed / cleanup tooling for graduation demos

### Out of scope for this PoC

- Medical diagnosis or treatment recommendations
- EHR or hospital calendar integration
- Activity catalog, recurring series, session staffing / facilitator workflows (legacy; not active UI)
- Operational volunteer–patient matching or minute-level scheduling
- Evening participation evaluation **UI** (data layer may exist)
- QuestionBuddy AI (patient question editor only)
- Organizational (department/team) caregiver access scoping (global `caregiver` role today)

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router (TypeScript, Tailwind CSS)           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Server      │  │ Client       │  │ API routes          │ │
│  │ layouts,    │  │ dashboard    │  │ (/api/dailybuddy/*) │ │
│  │ auth guards │  │ views, forms │  │                     │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  Auth │ PostgreSQL + RLS │ Data API (PostgREST) │ RPCs      │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  OpenAI via Vercel AI SDK (DailyBuddy, server-only)         │
└─────────────────────────────────────────────────────────────┘
```

### Layering conventions

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `app/` | App Router pages, layouts, API routes |
| Views | `components/dashboard/` | Role-specific UI composition |
| UI primitives | `components/ui/`, `components/forms/` | Reusable presentation and forms |
| Hooks | `hooks/` | React Query hooks |
| Services | `lib/services/` | Supabase data access |
| Auth | `lib/auth/` | Session, roles, route guards |
| AI | `lib/ai/`, `lib/tools/` | DailyBuddy generation, policy, tools |
| Supabase clients | `lib/supabase/` | Browser, server, middleware, admin |
| Types | `types/` | Database and domain types |
| Validations | `lib/validations/` | Zod schemas |

### Server vs client

- **Server:** route protection (`requireRole`), session-aware layouts, DailyBuddy API routes and generation.
- **Client:** interactive CRUD via Supabase browser client + React Query, guarded by RLS.
- **Service role:** server-only (`lib/supabase/admin.ts`). Never exposed to client components.

### Security principles

- **RLS** is the primary database security layer.
- Patient-owned data is scoped to the **clinical patient/admission** — never to the acting staff account.
- Use **explicit GRANT migrations** for Data API access.
- Use **UUID primary keys**.
- Keep authentication, authorization, and clinical patient identity as distinct concerns.

### Domain and identity model

- **`profiles` / `auth.users`** — login identities, not clinical patients.
- **`roles` / `user_roles`** — authorization.
- **`patients`** — clinical domain entities; can exist before a login exists.
- **Linking** — `patient_link_codes` → `redeem_patient_link_code()`.
- **`admissions`** — hospital stays; care data scoped via `admission_id`.
- **Staff** appear only in audit fields (`created_by_staff_id`, `patient_context.updated_by_staff_id`).
- **Organizational caregiver access** (department/team) remains deferred; access is currently the global `caregiver` role.

---

## AI safety philosophy

### Core rule

**The AI never provides medical advice.** It only supports recovery participation within boundaries defined by healthcare professionals.

### DailyBuddy (implemented)

Combines today’s check-in, `patient_context`, recorded afternoon plan (if any), and a **boolean** morning contact availability signal. Uses four read-only tools, structured output, Zod validation, deterministic access enforcement, and persistence in `daily_advice`.

May suggest rest, optional morning individual contact, and/or the recorded afternoon group activity when care context allows. Patients choose; interest is non-binding.

Must **not**: diagnose, treat, override care restrictions, schedule, assign volunteers, or invent an afternoon activity title.

Full boundary: [`docs/dailybuddy-ai-boundary.md`](dailybuddy-ai-boundary.md).

### QuestionBuddy (deferred)

Organizing open questions into a daily summary is **not implemented**. See [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md).

---

## Developer / demo navigation (`/`)

The root page and the OpnameBuddy heart logo (links to `/`) provide a **Demonstratie-overzicht** for PoC demonstration and testing of role modules. Protected routes still require authentication and the correct role; the overview does not bypass authorization or expose restricted data by itself.

---

## Development roadmap

| # | Branch | Status | Focus |
|---|--------|--------|-------|
| 1 | `feature/supabase-auth-roles` | Shipped | Auth, profiles, roles |
| 2 | `feature/patient-checkins-questions` | Shipped | Patient check-ins and questions |
| 3 | `feature/care-restrictions-context` | Shipped | Zorgcontext (`patient_context`) |
| 4 | `feature/account-domain-model` | Shipped | Patients, admissions, linking |
| 5 | `feature/admin-account-management` | Shipped | Admin users, roles, lifecycle |
| 6 | `feature/patient-admission-management` | Shipped | Care admission workflows |
| 7 | `feature/activity-planning-volunteers` | Shipped (scheduling UI **superseded** by daily participation PoC) | Originally catalog/sessions; PoC replaced active UX |
| 8 | `feature/dailybuddy-participation-advice` | Shipped | DailyBuddy AI + related patient/staff surfaces |
| 9 | Activity feedback / evening evaluation UI | Planned / parked | See `future-participation-scheduling.md` |
| 10 | `feature/questionbuddy-agent` | Planned | QuestionBuddy |
| 11 | `feature/final-polish-docs` | Planned | Polish, a11y, docs QA |

### Deferred product themes

Organizational caregiver access, proxy/family access, multi-admission history UX, evening evaluation UI, QuestionBuddy, activity catalog revival (if ever needed).

Detailed historical plans: `docs/branch-plans/`. Living data blueprint: `docs/domain-model.md`.

### Key routes (current PoC)

| Route | Purpose |
|-------|---------|
| `/` | Demonstratie-overzicht (PoC navigation aid; not production patient UX) |
| `/dashboard` | Patient home |
| `/dashboard/checkin` | Daily check-in |
| `/dashboard/questions` | Patient questions |
| `/dashboard/context` | Patient read-only zorgcontext |
| `/dashboard/advice` | DagBuddy |
| `/dashboard/link` | Link-code redemption |
| `/dashboard/activities` | **Redirect** → `/dashboard/advice` (legacy) |
| `/care` | Caregiver **Overzicht**: compact dashboard with aggregate statistics and primary navigation (`Patiënt opnemen`, link to full list) |
| `/care/patients` | Caregiver **Patiënten**: complete clinical patient list with admission-status filters (`Alle patiënten` / `Actieve opname` / `Geen actieve opname`) |
| `/care/patients/...` | Patient detail, admit/edit, zorgcontext |
| `/care/activities` | **Redirect** → `/care` (legacy) |

Do **not** rename `/care/patients` to **Mijn patiënten**. That label is reserved for future department- or caregiver-scoped access after real filtering and authorization exist. Today the list shows all clinical patients returned by `list_care_patients()`.
| `/planning` | Coordinator daily participation dashboard |
| `/planning/volunteers` | Volunteer roster overview |
| `/planning/{legacy}/*` | **Redirect** → `/planning` |
| `/volunteer` … | Volunteer daily view, availability, profile |
| `/admin` … | Admin users and roles (department CRUD UI excluded from final PoC) |

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [`docs/domain-model.md`](domain-model.md) | Entities and database blueprint |
| [`docs/dailybuddy-ai-boundary.md`](dailybuddy-ai-boundary.md) | DailyBuddy tools and hard boundaries |
| [`docs/planning-poc-migration.md`](planning-poc-migration.md) | Legacy → PoC migration inventory |
| [`docs/planning-poc-limitations.md`](planning-poc-limitations.md) | Intentional PoC limitations |
| [`docs/functioneel-testdraaiboek.md`](functioneel-testdraaiboek.md) | **Primary** teacher/grader functional test playbook |
| [`docs/demo-accounts.md`](demo-accounts.md) | Demo logins |
| [`docs/demo-scenarios.md`](demo-scenarios.md) | Demo patient/volunteer stories |
| [`docs/demo-walkthrough.md`](demo-walkthrough.md) | Pointer to the testdraaiboek |
| [`docs/demo-accounts.md`](demo-accounts.md) | Demo logins |
| [`docs/branch-plans/branch-08-dailybuddy-participation-advice.md`](branch-plans/branch-08-dailybuddy-participation-advice.md) | DailyBuddy branch plan (shipped) |
| [`docs/future-participation-scheduling.md`](future-participation-scheduling.md) | Parked evening rhythm / reminders |
| [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md) | Parked QuestionBuddy |
| `.cursor/rules/project.mdc` | Folder structure and conventions |
| `AGENTS.md` | Next.js 16 notes for agents |
