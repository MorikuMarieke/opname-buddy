# OpnameBuddy — Project Context

Stable product and architecture reference for Cursor and contributors. This document describes *what* OpnameBuddy is and *how* it is structured at a high level. It intentionally avoids detailed database schemas, implementation steps, and graduation assignment wording.

---

## What OpnameBuddy is

**OpnameBuddy** is a recovery participation platform for hospitalized patients. It helps patients stay actively involved during admission through:

- Daily check-ins
- Questions for caregivers
- Caregiver-defined safety boundaries
- Recovery activities and structured planning
- AI-generated daily participation advice

The application does not replace clinical care. It supports reflection, communication, and safe participation within boundaries set by healthcare professionals.

---

## Why it exists

Hospital admission can feel passive for patients. OpnameBuddy gives patients a simple daily rhythm (check-in, questions, activities) and turns their input plus professional context into understandable participation suggestions.

Caregivers and activity coordinators gain structured visibility into how patients are doing and what they want to discuss, without adding heavy administrative burden.

---

## Current architectural priority

Branch 7 (`feature/planning-activities-volunteers`) is the active workstream: activities, sessions, volunteers, and recovery planning. Foundations through branch 6 are shipped — clinical domain model, admin account management, and patient admission workflows.

The account/domain model rules are defined in [Domain and identity model](#domain-and-identity-model) below. Full sequencing, migrations, verification, and remaining deferrals live in the branch plan: [`docs/branch-plans/branch-04-account-domain-model.md`](branch-plans/branch-04-account-domain-model.md). The care schema is fully hardened (legacy `patient_id` columns dropped, `admission_id` `NOT NULL`, `updated_by_staff_id` audit field). Still deferred: organizational (department/team) caregiver access.

---

## Who uses it

| Role | Primary route | Typical responsibilities |
|------|---------------|------------------------|
| **patient** | `/dashboard` | Check-ins, questions, daily overview (`Vandaag`), DagBuddy placeholder |
| **caregiver** | `/care` | Patient overview, restrictions, recovery context, review check-ins and questions |
| **activity_coordinator** | `/planning` | Daily participation coordination: needs overview, volunteer block availability, afternoon activity record |
| **admin** | `/admin` | User and role management |

### Role rules

- Patients normally have only the **patient** role.
- Staff users may hold **multiple roles** (e.g. admin + caregiver).
- **Primary redirect priority** after login (default landing page only):

  `admin` > `activity_coordinator` > `caregiver` > `patient`

- `requireRole()` checks the full role list for route access.
- Navigation for staff with multiple roles should eventually expose all modules they can access, not only the primary role.

---

## MVP scope

The MVP delivers four role-specific dashboards, patient and staff CRUD flows, planning for recovery activities, and two AI agents (DailyBuddy and QuestionBuddy) that operate within strict safety boundaries.

### In scope

- Patient daily check-ins and questions
- Caregiver restrictions and open-ended context
- Daily participation coordination (two-block model), volunteer block availability, afternoon activity communication
- Patient activity feedback
- DailyBuddy (participation advice) and QuestionBuddy (question organization)
- Supabase Auth, RLS, React Query CRUD, Vercel deployment

### Out of scope for MVP

- Medical diagnosis or treatment recommendations
- EHR or hospital calendar integration (e.g. care appointments)
- Generated medical or treatment goals in caregiver context
- Overruling caregiver restrictions from AI or planning

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router (TypeScript, Tailwind CSS)           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Server      │  │ Client       │  │ API routes /        │ │
│  │ layouts,    │  │ dashboard    │  │ server actions      │ │
│  │ auth guards │  │ views, forms │  │ (AI agents later)   │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  Auth │ PostgreSQL + RLS │ Data API (PostgREST)             │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  External services (later branches)                          │
│  OpenAI via Vercel AI SDK │ Weather API (DailyBuddy tool)   │
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
| Supabase clients | `lib/supabase/` | Browser, server, middleware, admin |
| Types | `types/` | Database and domain types |
| Validations | `lib/validations/` | Zod schemas |

### Server vs client

- **Server:** route protection (`requireRole`), session-aware layouts, AI agent endpoints (later).
- **Client:** interactive CRUD via Supabase browser client + React Query, guarded by RLS.
- **Service role:** server-only (`lib/supabase/admin.ts`). Never exposed to client components. Used for admin actions and server-side AI tools—not as a shortcut for normal patient CRUD.

### Security principles

- **RLS** is the primary database security layer.
- Patient-owned data is scoped in the database to the **clinical patient/admission** it belongs to — never to the acting staff account. Access control follows the [Domain and identity model](#domain-and-identity-model).
- Use **explicit GRANT migrations** for Data API access (new Supabase projects do not auto-grant table privileges).
- Use **UUID primary keys**, not SERIAL/BIGSERIAL.
- Keep authentication, authorization, and clinical patient identity as distinct concerns.

### Domain and identity model

OpnameBuddy separates **who is acting** (login identity), **what an account may do** (authorization), and **who care data is about** (clinical patient). This separation is implemented and all new work must follow it.

- **`profiles` / `auth.users` are login identities, not clinical patients.** They model authentication and app-level account data only.
- **`roles` / `user_roles` define authorization** — what an account may do — independent of clinical data.
- **`patients` are clinical domain entities**, distinct from any login account.
- **A clinical patient can exist before a login account exists.** Staff create and maintain patient records whether or not the patient ever logs in.
- **Patient accounts are linked to patient records** through a secure linking flow (`patient_link_codes` → `redeem_patient_link_code()`) that connects a login to the clinical patient it belongs to.
- **`admissions` represent hospital stays.** A patient may have multiple admissions over time; care data is scoped to an admission (via `admission_id`).
- **Patient-owned care data belongs to a patient/admission, never to the acting staff account.** This includes care context, check-ins, questions, participation evaluations, and (later) daily plans and AI advice. Patient-side RLS is enforced through `current_admission_ids()`.
- **Staff and caregiver accounts are actors, not owners.** They appear only in audit fields such as `created_by_staff_id` and `patient_context.updated_by_staff_id`.
- **Caregiver access should ultimately be based on organizational assignment** — department, team, or admission context — not only a global `caregiver` role. *(Still deferred; caregiver access is currently the global `caregiver` role.)*

---

## AI safety philosophy

OpnameBuddy includes AI to **summarize, organize, and interpret** contextual information—not to practice medicine.

### Core rule

**The AI never provides medical advice.** It only supports recovery participation within boundaries defined by healthcare professionals.

### DailyBuddy (main agent)

Combines patient check-ins, open questions, caregiver restrictions, caregiver context, activity sessions, volunteer availability, activity feedback, and external weather data.

May generate:

- Short daily motivation
- Two to three safe participation suggestions
- Rest suggestion
- Reminder to prepare open questions when relevant

Must **not**:

- Diagnose, treat, or predict recovery
- Create medical goals
- Overrule caregiver restrictions

May first build a compact daily context summary from patient and caregiver inputs, then combine that with activities and weather for final advice.

### QuestionBuddy (secondary agent)

Organizes the patient’s **open questions into a daily summary** — grouped by specialism, clearer wording, ready for rounds or caregiver conversations.

Must **not** answer medical questions. Medical content is redirected back to the caregiver conversation. Answers live in caregiver `answer_notes` (branch 3), not in AI output.

**Deferred until branch 10:** [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md)

### Agent implementation requirements (project-wide)

- Vercel AI SDK with tool calling
- At least three tools per agent, `maxSteps >= 3`, streaming responses
- Tools retrieve data; the model interprets and combines—it does not merely forward raw payloads

---

## Completed foundation

The `feature/supabase-auth-roles` branch established:

- Supabase project and environment variables (`.env.local`, `.env.example`)
- Supabase CLI linked to the OpnameBuddy project
- `profiles`, `roles`, `user_roles` tables with RLS and explicit API GRANT migrations
- Supabase browser, server, and middleware clients; generated `types/database.ts`
- Login, register, logout, protected routes, role-based redirects
- Enter-key form submission on auth forms

---

## Development roadmap

The project is developed incrementally using feature branches. Each branch introduces a complete vertical slice or architectural improvement before moving to the next feature.

| # | Branch | Status | Focus |
|---|--------|--------|-------|
| 1 | `feature/supabase-auth-roles` | Shipped | Authentication, profiles and role-based authorization |
| 2 | `feature/patient-checkins-questions` | Shipped | Patient check-ins, questions and core patient interaction |
| 3 | `feature/care-restrictions-context` | Shipped | Caregiver-managed care context (`patient_context`) and recovery boundaries |
| 4 | `feature/account-domain-model` | Shipped | Clinical domain refactor introducing `patients`, `admissions`, admission-owned care data and secure patient account linking |
| 5 | `feature/admin-account-management` | Shipped | Administrative management of staff accounts, user roles and account lifecycle |
| 6 | `feature/patient-admission-management` | Shipped | Caregiver workflow for creating clinical patients, admissions and generating patient linking codes |
| 7 | `feature/activity-planning-volunteers` | In progress | Daily participation PoC — schema, check-in needs, volunteer/coordinator views, legacy cleanup |
| 8 | `feature/dailybuddy-participation-advice` | Planned | DailyBuddy AI — advisory tools, streaming `/dashboard/advice`, optional persistence |
| 9 | `feature/activity-feedback` | Planned | Patient activity participation, progress tracking and AI-supported recovery feedback |
| 10 | `feature/questionbuddy-agent` | Planned | QuestionBuddy AI assistant for patient questions |
| 11 | `feature/final-polish-docs` | Planned | UI polish, accessibility, documentation, deployment and final QA |

### Deferred

| Branch | Focus |
|--------|-------|
| Future | Organizational caregiver access (departments, teams and admission-based assignment), proxy/family access, multi-admission history, discharge workflows. |

Detailed implementation plans live in `docs/branch-plans/`. The living data blueprint lives in `docs/domain-model.md`.

### Key routes (shipped through branch 7)

| Route | Purpose |
|-------|---------|
| `/dashboard/link` | Patient link-code redemption |
| `/dashboard/context` | Patient read-only zorgcontext |
| `/dashboard/activities` | Patient read-only daily participation overview (`Vandaag`) |
| `/care/patients/admit` | New clinical patient + admission |
| `/care/patients/[patientId]/admit` | Readmission for existing patient |
| `/care/patients/[patientId]/edit` | Edit patient demographics |
| `/admin/departments` | Department reference data management |
| `/planning` | Activity coordinator daily participation dashboard |
| `/planning/volunteers` | Coordinator read-only volunteer profile overview |
| `/volunteer` | Volunteer daily participation and afternoon recording |
| `/volunteer/availability` | Volunteer block-based weekly availability |

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [`docs/domain-model.md`](domain-model.md) | Entities, relationships, business rules, database blueprint |
| [`docs/branch-plans/branch-04-account-domain-model.md`](branch-plans/branch-04-account-domain-model.md) | Account/domain model refactor plan (branch 4 — shipped) |
| [`docs/branch-plans/branch-02-patient-checkins-questions.md`](branch-plans/branch-02-patient-checkins-questions.md) | Branch 2 implementation plan |
| [`docs/branch-plans/branch-03-care-restrictions-context.md`](branch-plans/branch-03-care-restrictions-context.md) | Branch 3 implementation plan (shipped) |
| [`docs/branch-plans/branch-05-admin-account-management.md`](branch-plans/branch-05-admin-account-management.md) | Branch 5 implementation plan (shipped) |
| [`docs/branch-plans/branch-06-patient-admission-management.md`](branch-plans/branch-06-patient-admission-management.md) | Branch 6 implementation plan (shipped) |
| [`docs/branch-plans/branch-07-activity-planning-volunteers.md`](branch-plans/branch-07-activity-planning-volunteers.md) | Branch 7 implementation plan (superseded by daily participation PoC) |
| [`docs/branch-plans/branch-dailybuddy-participation-advice.md`](branch-plans/branch-dailybuddy-participation-advice.md) | DailyBuddy AI — deferred next branch |
| [`docs/planning-poc-migration.md`](planning-poc-migration.md) | Daily participation PoC migration plan |
| [`docs/future-participation-scheduling.md`](future-participation-scheduling.md) | Deferred morning/evening scheduling and reminders |
| [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md) | Deferred daily question summary (QuestionBuddy, branch 10) |
| [`docs/branch-plans/branch-11-final-polish-docs.md`](branch-plans/branch-11-final-polish-docs.md) | Final polish, deployment QA, and known technical debt (branch 11) |
| `.cursor/rules/project.mdc` | Folder structure and coding conventions |
| `AGENTS.md` | Next.js 16 project notes for agents |
