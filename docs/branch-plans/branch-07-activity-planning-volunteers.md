# Branch plan — feature/activity-planning-volunteers

**Branch:** `feature/activity-planning-volunteers`  
**Status:** Shipped  
**Depends on:** branches 1–6 (auth, clinical domain, admin, patient admission)

## Design principle

Keep the domain model rich enough for future AI reasoning, while keeping user interaction MVP-simple.

- Invest in structured schema, enums, RPC read models, and audit fields
- Keep UI as list / detail / form workflows — no drag-and-drop calendar, no AI, no notifications
- When trade-offs arise, prefer schema and services over UI complexity

## Scope

### In scope

- Activity catalog (required description, structured requirements)
- Weekly recurring schedules + one-off sessions
- Session status workflow: draft → proposed → confirmed → completed | cancelled (human approval)
- Patient (admission) and volunteer assignments
- Volunteer role, portal (`/volunteer`), availability (recurring + exceptions)
- Coordinator planning views (overview, sessions, volunteers, calendar)
- Patient read-only confirmed upcoming sessions
- SECURITY DEFINER RPCs for volunteer/patient/coordinator read models

### Out of scope

- DagBuddy / AI matching / auto-assignment
- Notifications, external calendar sync
- Complex recurrence, drag-and-drop calendar
- `activity_feedback` (branch 9)
- Patient signup/cancel for activities

## Migrations (00038–00043)

| File | Purpose |
|------|---------|
| `00038_volunteer_role.sql` | Volunteer role seed; skip auto-patient for `account_type = volunteer` |
| `00039_activities.sql` | Activity catalog + RLS + grants |
| `00040_activity_schedules_sessions.sql` | Recurring schedules, sessions, materialize RPC |
| `00041_activity_session_assignments.sql` | Participants + volunteer assignments |
| `00042_volunteer_availability_planning_rpcs.sql` | Availability tables, planning RPCs, participation eval FK |
| `00043_patient_activity_sessions_volunteers.sql` | Patient RPC: volunteer names on session list |

## Implementation phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Schema + enums + types | Done |
| 2 | Activity catalog CRUD | Done |
| 3 | Recurring schedules | Done |
| 4 | Sessions + assignments + status workflow | Done |
| 5 | Volunteer portal + admin accounts | Done |
| 6 | Coordinator overview + volunteer visibility | Done |
| 7 | Patient minimal activities list | Done |
| 8 | Docs + QA | Done |

## Key routes

| Route | Role | Purpose |
|-------|------|---------|
| `/planning` | activity_coordinator | Today overview by location |
| `/planning/activities` | activity_coordinator | Activity catalog CRUD |
| `/planning/recurring` | activity_coordinator | Weekly recurring schedules |
| `/planning/sessions` | activity_coordinator | Session list + detail + assignments |
| `/planning/calendar` | activity_coordinator | Week calendar (read-only grid) |
| `/planning/volunteers` | activity_coordinator | Volunteer availability visibility |
| `/volunteer` | volunteer | Assigned sessions (proposed/confirmed) |
| `/volunteer/availability` | volunteer | Own availability CRUD |
| `/admin/users/new/volunteer` | admin | Create volunteer accounts |
| `/dashboard/advice` | patient | DagBuddy personalised participation advice |

## QA checklist (manual)

- [ ] Coordinator: create activity → recurring schedule → materialized draft sessions
- [ ] Coordinator: one-off session → assign patient + volunteer → propose → confirm
- [ ] Volunteer: see assigned session on `/volunteer`; manage availability
- [ ] Patient (linked + active admission): receive DagBuddy advice on `/dashboard/advice` (legacy `/dashboard/activities` redirects here)
- [ ] Admin: create volunteer account; appears in planning volunteer list

## Known limitations (MVP)

- No AI-assisted matching or auto-assignment
- Calendar is a simple week grid, not drag-and-drop
- Patients use DagBuddy for personalised participation context; no separate patient activity catalogue
- Coordinator overview is day-centric on `/planning`; calendar is week-centric
- Volunteer availability is not validated against session overlap in UI (coordinator assigns manually)
