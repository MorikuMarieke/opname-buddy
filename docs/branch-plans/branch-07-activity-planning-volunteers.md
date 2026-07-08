# Branch plan — feature/activity-planning-volunteers

**Branch:** `feature/activity-planning-volunteers`  
**Status:** In progress  
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
- Coordinator planning views (overview, sessions, volunteers)
- SECURITY DEFINER RPCs for volunteer/patient read models

### Out of scope

- DagBuddy / AI matching / auto-assignment
- Notifications, external calendar sync
- Complex recurrence, drag-and-drop calendar
- `activity_feedback` (branch 9)

## Migrations (00038–00042)

| File | Purpose |
|------|---------|
| `00038_volunteer_role.sql` | Volunteer role seed; skip auto-patient for `account_type = volunteer` |
| `00039_activities.sql` | Activity catalog + RLS + grants |
| `00040_activity_schedules_sessions.sql` | Recurring schedules, sessions, materialize RPC |
| `00041_activity_session_assignments.sql` | Participants + volunteer assignments |
| `00042_volunteer_availability_planning_rpcs.sql` | Availability tables, planning RPCs, participation eval FK |

## Implementation phases

1. Schema + enums + types
2. Activity catalog CRUD
3. Recurring schedules
4. Sessions + assignments + status workflow
5. Volunteer portal + admin accounts
6. Coordinator overview + volunteer visibility
7. Patient minimal activities list (optional)
8. Docs + QA

Full plan: see Cursor branch plan artifact or project discussion.
