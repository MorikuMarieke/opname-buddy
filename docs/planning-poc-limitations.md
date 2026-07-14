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
- Patient autonomy is supported through AI advisory language and optional participation framing.

---

## AI (DailyBuddy)

### AI may

- Analyse check-in data, needs, care restrictions, and recorded afternoon activity
- Suggest rest, optional morning individual contact, or afternoon group participation
- Use a **simple availability signal** only: whether individual morning contact is reasonably available today

### AI must not

- Diagnose or give treatment advice
- Override clinical restrictions
- Schedule patients or activities
- Assign volunteers or optimise staffing
- Replace absent volunteers
- Receive individual volunteer names or detailed schedules
- Receive detailed staffing counts (unless a future use case explicitly requires them)

### Language

Use cautious Dutch phrasing: “kan passen”, “zou geschikt kunnen zijn”, “op basis van wat je invulde”, “de keuze is aan jou”, “bespreek met je zorgteam als je twijfelt”.

---

## Roles

| Role | PoC scope |
|------|-----------|
| `patient` | Check-in needs, daily overview, AI advice |
| `volunteer` | Availability self-service, daily needs view, afternoon recording |
| `activity_coordinator` | `/planning` dashboard (read-heavy + afternoon record fallback) |
| `caregiver` | Unchanged care workflows; `/care/activities` removed |
| `admin` | Volunteer account creation unchanged |

---

## Out of scope (explicit)

- Activity catalog, recurring series, generated sessions
- Facilitator roles and session assignments
- Volunteer capacity optimisation and readiness workflows
- Location scheduling and room management
- Patient-volunteer matching
- Recurring activity planning
- Evening participation evaluation UI (data layer may exist)

---

## Future extensions (not in PoC)

- Caregiver read-only daily plan on `/care`
- `daily_advice` persistence table
- Capacity enforcement and enrollment tracking
- Time-of-day participation phase helpers
- Data migration from legacy availability tables
