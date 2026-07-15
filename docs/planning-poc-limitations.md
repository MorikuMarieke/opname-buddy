# Planning proof-of-concept — limitations

This document describes intentional boundaries of the daily participation PoC. These are **product decisions**, not bugs.

---

## Product positioning

OpnameBuddy supports **recovery participation and patient choice**. It is not:

- An operational workforce scheduling system
- An activity catalog or recurrence manager
- A volunteer-patient matching engine
- A clinical decision or treatment tool

---

## Fixed daily structure

### Morning block — 10:00–12:00

- Individual moments between a patient and a volunteer are coordinated **outside** the app.
- Volunteers indicate weekly block availability and one-time absences.
- The coordinator dashboard shows **effective availability** for oversight.
- No minute-level appointments, no volunteer-patient assignment, no contact records.

### Afternoon block — 14:00–16:00

- One group activity communication per date.
- **Fixed shared room** (application constant — not a location module).
- **Maximum capacity: 10 patients** (displayed; not enforced in database).
- Patients must be able to reach the room **independently** (displayed requirement; not clinically validated by the app).
- No transport planning, no volunteer assistance for the group block, no room selection.

---

## Volunteer availability

### What volunteers manage

- **Weekly:** per weekday, morning and/or afternoon checkboxes for the fixed blocks.
- **One-time absences:** per month, mark specific date+block combinations unavailable.
- Changing weekly checkboxes **is** the permanent update (simple confirmation dialog only).

### What volunteers do not manage

- Custom times or durations
- Overlapping time ranges
- Recurring absence patterns
- Partial-hour exceptions

### Legacy tables

`volunteer_recurring_availability` and `volunteer_availability_exceptions` remain in the database for remote compatibility but are **not used** by the PoC.

**Phase 7 audit (2026-07-15):** No active application code in `app/` or `lib/services/` writes to legacy planning tables (`activities`, `activity_recurring_schedules`, `activity_sessions`, facilitator tables) or legacy volunteer availability tables. Demo seed scripts write only to PoC tables (`volunteer_weekly_blocks`, `volunteer_day_absences`, `daily_participation_plans`). The `patient_participation_evaluations` service remains for a future evaluation UI and does not link new records to activity sessions from the PoC UI.

---

## Afternoon activity recording

- Volunteers (or coordinator as fallback) **decide** the afternoon activity using aggregated patient needs and judgment.
- The app records the **communication** of that choice: category, title, optional patient-facing message.
- The app does **not** auto-select or suggest-save the activity.
- Last write wins if multiple volunteers update the same date (acceptable for PoC).

---

## Patient participation

- Patients express daily needs at check-in (multi-select).
- Patients see a read-only daily overview (blocks, room, requirements, recorded activity).
- **No** database-tracked enrollment, interest, or decline state in PoC.
- Patient autonomy is supported through read-only daily overview and voluntary participation copy.
- `/dashboard/advice` remains a **placeholder** until `feature/dailybuddy-participation-advice`.

---

## AI (DailyBuddy) — deferred

**Not in scope** for the daily participation PoC branch. No API route, tools, streaming UI, or `daily_advice` persistence on this branch.

Future branch `feature/dailybuddy-participation-advice` will implement patient-facing advisory using:

- Check-in data and `participation_needs`
- Care restrictions (`patient_context`)
- Recorded afternoon activity
- Simple morning-contact availability signal (and optional aggregate availability summary)

Specification: [`docs/dailybuddy-ai-boundary.md`](dailybuddy-ai-boundary.md) and [`docs/branch-plans/branch-dailybuddy-participation-advice.md`](branch-plans/branch-dailybuddy-participation-advice.md).

### Future AI may

- Analyse check-in data, needs, care restrictions, and recorded afternoon activity
- Suggest rest, optional morning individual contact, or afternoon group participation
- Use a **simple availability signal** only — no volunteer names or schedules

### Future AI must not

- Diagnose or give treatment advice
- Override clinical restrictions
- Schedule patients or activities
- Assign volunteers or optimise staffing
- Replace absent volunteers
- Receive individual volunteer names or detailed schedules

### Language (future)

Use cautious Dutch phrasing: “kan passen”, “zou geschikt kunnen zijn”, “op basis van wat je invulde”, “de keuze is aan jou”, “bespreek met je zorgteam als je twijfelt”.

---

## Roles

| Role | PoC scope |
|------|-----------|
| `patient` | Check-in needs, daily overview (`Vandaag`), DagBuddy placeholder |
| `volunteer` | Availability self-service, shared effective availability overview, daily needs view, afternoon recording |
| `activity_coordinator` | Dedicated `/planning` module (not `/care`): daily dashboard + afternoon record fallback + `/planning/volunteers` profile overview |
| `caregiver` | Unchanged care workflows on `/care`; no volunteer availability overview; `/care/activities` removed |
| `admin` | Volunteer account creation unchanged; may read volunteer availability overview when required |

### Post-login routing

- `activity_coordinator` → `/planning` (never redirected to `/care`)
- Removed `/planning/*` subroutes redirect to `/planning`
- `/care/activities` redirects to `/care`

### Volunteer availability authorization

- Volunteers, activity coordinators, and admins may read the shared effective availability overview.
- Caregivers do **not** automatically receive this access.
- Volunteers may edit only their own weekly blocks and one-time absences.

---

## Out of scope (explicit)

- Activity catalog, recurring series, generated sessions
- Facilitator roles and session assignments
- Volunteer capacity optimisation and readiness workflows
- Location scheduling and room management
- Patient-volunteer matching
- Recurring activity planning
- Evening participation evaluation UI (data layer may exist)
- **DailyBuddy AI** (API, tools, streaming UI, persistence)

---

## Future extensions (not in PoC)

- **DailyBuddy** on `feature/dailybuddy-participation-advice`
- Caregiver read-only daily plan on `/care`
- `daily_advice` persistence table
- Capacity enforcement and enrollment tracking
- Time-of-day participation phase helpers
- Data migration from legacy availability tables
