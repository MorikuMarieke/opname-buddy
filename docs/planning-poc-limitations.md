# Planning proof-of-concept — limitations

This document describes intentional boundaries of the **current** daily participation PoC (including shipped DailyBuddy). These are **product decisions**, not bugs.

---

## Product positioning

OpnameBuddy supports **recovery participation and patient choice**. It is not:

- An operational workforce scheduling system
- An activity catalog or recurrence manager
- A volunteer–patient matching engine
- A clinical decision or treatment tool

---

## Fixed daily structure

### Morning block — 10:00–12:00

- Individual moments between a patient and a volunteer are coordinated **outside** the app.
- Volunteers indicate weekly block availability and one-time absences.
- Coordinator and volunteer dashboards show **effective availability** for oversight.
- Patients may request a morning ward visit via DagBuddy when advice/eligibility allows.
- No minute-level appointments, no automatic volunteer–patient assignment.

### Afternoon block — 14:00–16:00

- One group activity **communication** per calendar date (`daily_participation_plans`).
- **Fixed shared room** (application constant — not a location module).
- **Maximum capacity: 10 patients** (displayed; not enforced in the database).
- Patients must be able to reach the room **independently** when afternoon group advice is allowed (`patient_context.can_independently_reach_activity_room`).
- No transport planning, no room selection UI, no activity catalog.

---

## Volunteer availability

### What volunteers manage

- **Weekly:** per weekday, morning and/or afternoon checkboxes for the fixed blocks.
- **One-time absences:** per month, mark specific date+block combinations unavailable.

### What volunteers do not manage

- Custom times or durations
- Overlapping time ranges
- Recurring absence patterns
- Partial-hour exceptions

### Legacy tables

`volunteer_recurring_availability` and `volunteer_availability_exceptions` remain in the database for remote compatibility but are **not used** by the PoC UI.

Legacy activity/session tables (`activities`, `activity_sessions`, facilitator tables, etc.) are likewise unused by active application writes. See [`planning-poc-migration.md`](planning-poc-migration.md).

---

## Afternoon activity recording

- Volunteers (or coordinator as fallback) **decide** the afternoon activity using aggregated patient needs and judgment.
- The app records the **communication** of that choice: category, title, optional patient-facing message.
- The app does **not** auto-select or invent the activity.
- Last write wins if multiple people update the same date (acceptable for PoC).

---

## Patient participation

- Patients express daily needs at check-in (multi-select).
- Patients receive personalised participation advice and optional interest / withdraw actions via DagBuddy (`/dashboard/advice`).
- There is **no** separate patient activity overview page. Legacy `/dashboard/activities` redirects to `/dashboard/advice`.

---

## DailyBuddy (implemented)

DailyBuddy is **in scope** for the current PoC. Summary:

- Server-side generation with Vercel AI SDK (`gpt-4.1`), four read-only tools, structured output, Zod validation
- Deterministic policy when no afternoon title is recorded; hard afternoon access gate from care context
- Persistence in `daily_advice`; reuse until stale / failed / forced retry
- Patient UI on `/dashboard/advice` with progress streaming (NDJSON), morning visit requests, afternoon interest when eligible
- Failures surface patient-safe messages; failed generations are recorded
- Development-only advice-iteration controls were removed after the PoC finalize pass

Boundary detail: [`dailybuddy-ai-boundary.md`](dailybuddy-ai-boundary.md). Branch plan: [`branch-plans/branch-08-dailybuddy-participation-advice.md`](branch-plans/branch-08-dailybuddy-participation-advice.md).

DailyBuddy must not diagnose, treat, override care context, schedule, or invent afternoon titles.

---

## Roles

| Role | PoC scope |
|------|-----------|
| `patient` | Check-in needs, zorgcontext (read), DagBuddy, questions editor, linking |
| `volunteer` | Availability self-service, daily needs/requests view, afternoon recording, profile |
| `activity_coordinator` | `/planning` dashboard + afternoon record fallback + `/planning/volunteers` |
| `caregiver` | Clinical patients, admissions, link codes, zorgcontext; **no** volunteer availability overview; **no** check-in or question UI |
| `admin` | Accounts and roles; may read volunteer overview when required |

### Post-login routing

- Priority: `admin` > `activity_coordinator` > `caregiver` > `volunteer` > `patient`
- Removed `/planning/*` legacy subroutes redirect to `/planning`
- `/care/activities` redirects to `/care`
- `/dashboard/activities` redirects to `/dashboard/advice`

### Caregiver check-ins and questions

- **Implemented for patients:** check-in CRUD; question create/edit/delete; display of `answer_notes` if present.
- **Implemented for caregivers in this PoC:** Zorgcontext (and clinical patient / admission workflows as built).
- **Database:** caregiver SELECT on check-ins; caregiver UPDATE on questions (policies in migrations) — not sufficient to claim shipped care UI.
- **Not in the caregiver interface:** reviewing check-ins or setting question `status` / `answer_notes`.

**Future development:** read-only care views of check-ins and submitted questions; later a secured answering / status workflow.

### Removed placeholder UI (finalize pass)

- Fake caregiver nav items (Meldingen / Instellingen) and disabled search chrome on care/planning
- Misleading patient “week overview” home tile
- Permanently empty caregiver patient-table columns for Check-in / Vragen
- Unused placeholder shell components (`CarePatientDetailView`, `PatientSubPageView`)
- Admin department management page (`/admin/departments`) — excluded from final PoC UI; `departments` table and admission department select remain

---

## Out of scope (explicit)

- Activity catalog, recurring series, generated sessions, facilitator assignment UIs
- Volunteer capacity optimisation and readiness workflows
- Location scheduling and room management
- Patient–volunteer matching
- Evening participation evaluation UI (data layer may exist)
- QuestionBuddy AI
- Organizational caregiver access (department/team assignment)
- Admin department CRUD UI (reference table + admission select remain)

---

## Future extensions (not in this PoC)

- QuestionBuddy — [`future-questionbuddy-daily-summary.md`](future-questionbuddy-daily-summary.md)
- Time-of-day rhythm / evening evaluation UI — [`future-participation-scheduling.md`](future-participation-scheduling.md)
- Coordinator/volunteer UI polish — [`future-ui-polish.md`](future-ui-polish.md)
- Organizational caregiver access and related identity extensions — see project context deferred themes
