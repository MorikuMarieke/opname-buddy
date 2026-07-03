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

Before continuing other patient/caregiver feature work, the **account/domain model refactor** is the active architectural priority, because it affects ownership, access control, and RLS across later branches.

The target rules for this model are defined in [Domain and identity model](#domain-and-identity-model) below. Sequencing, migrations, and deferred steps live in the branch plan: [`docs/branch-plans/branch-account-domain-model.md`](branch-plans/branch-account-domain-model.md).

---

## Who uses it

| Role | Primary route | Typical responsibilities |
|------|---------------|------------------------|
| **patient** | `/dashboard` | Check-ins, questions, activity feedback, DailyBuddy advice |
| **caregiver** | `/care` | Patient overview, restrictions, recovery context, review check-ins and questions |
| **activity_coordinator** | `/planning` | Activities, sessions, volunteer slots, calendar |
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
- Activity catalog, sessions, volunteer availability, and calendar
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

OpnameBuddy separates **who is acting** (login identity), **what an account may do** (authorization), and **who care data is about** (clinical patient). This separation is the target architecture; all new work must follow it.

- **`profiles` / `auth.users` are login identities, not clinical patients.** They model authentication and app-level account data only.
- **`roles` / `user_roles` define authorization** — what an account may do — independent of clinical data.
- **`patients` are clinical domain entities**, distinct from any login account.
- **A clinical patient can exist before a login account exists.** Staff create and maintain patient records whether or not the patient ever logs in.
- **Patient accounts may later be linked to existing patient records** through a secure linking flow that connects a login to the clinical patient it belongs to.
- **`admissions` represent hospital stays.** A patient may have multiple admissions over time; care data is scoped to a patient/admission.
- **Patient-owned care data belongs to a patient/admission, never to the acting staff account.** This includes care restrictions, care context, check-ins, questions, daily plans, and AI advice.
- **Staff and caregiver accounts are actors, not owners.** They appear only in audit fields such as `created_by_staff_id` or `updated_by_staff_id`.
- **Caregiver access should ultimately be based on organizational assignment** — department, team, or admission context — not only a global `caregiver` role.

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

**Deferred until branch 8:** [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md)

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

## Branch roadmap

Work proceeds in small vertical slices on feature branches. The account/domain model refactor is the current focus (see [Current architectural priority](#current-architectural-priority)).

| # | Branch | Focus |
|---|--------|-------|
| 1 | `feature/supabase-auth-roles` | Auth, profiles, roles — **completed** |
| — | `feature/account-domain-model` | **Current focus** — clinical `patients` and `admissions`, patient/admission-scoped care data, staff in audit fields, secure patient↔record linking. See [branch plan](branch-plans/branch-account-domain-model.md) |
| 2 | `feature/patient-checkins-questions` | Patient check-ins and questions CRUD |
| 3 | `feature/care-restrictions-context` | Zorgcontext (`patient_context`), caregiver patient data access |
| 4 | `feature/planning-activities` | Activities, sessions, volunteers, calendar |
| 5 | `feature/admin-users-roles` | User management, role assignment, staff profiles — see [`docs/future-admin-users-roles.md`](future-admin-users-roles.md) |
| 6 | `feature/dagbuddy-agent` | DailyBuddy agent, tools, streaming, advice storage |
| 7 | `feature/activity-feedback` | Patient activity plans and feedback |
| 8 | `feature/questionbuddy-agent` | QuestionBuddy agent |
| 9 | `feature/final-polish-docs` | Responsive polish, accessibility, README, deployment, QA |

Detailed implementation plans live in `docs/branch-plans/`. The living data blueprint lives in `docs/domain-model.md`.

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [`docs/domain-model.md`](domain-model.md) | Entities, relationships, business rules, database blueprint |
| [`docs/branch-plans/branch-account-domain-model.md`](branch-plans/branch-account-domain-model.md) | Account/domain model refactor plan (current focus) |
| [`docs/branch-plans/branch-02-patient-checkins-questions.md`](branch-plans/branch-02-patient-checkins-questions.md) | Branch 2 implementation plan |
| [`docs/branch-plans/branch-03-care-restrictions-context.md`](branch-plans/branch-03-care-restrictions-context.md) | Branch 3 implementation plan |
| [`docs/future-admin-users-roles.md`](future-admin-users-roles.md) | Deferred admin, staff accounts, role assignment (branch 5) |
| [`docs/future-participation-scheduling.md`](future-participation-scheduling.md) | Deferred morning/evening scheduling and reminders |
| [`docs/future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md) | Deferred daily question summary (QuestionBuddy, branch 8) |
| `.cursor/rules/project.mdc` | Folder structure and coding conventions |
| `AGENTS.md` | Next.js 16 project notes for agents |
