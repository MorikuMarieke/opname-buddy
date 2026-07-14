# Planning PoC — migration and legacy inventory

**Status:** Phase 1 documentation  
**Goal:** Replace branch-7 activity scheduling with a minimal two-block daily participation proof-of-concept.

OpnameBuddy is **not** an operational workforce or activity scheduling system. The PoC demonstrates how patient check-in data and expressed needs support participation and patient choice.

---

## Replacement summary

| Area | PoC approach |
|------|----------------|
| Coordinator UI | Single dashboard at `/planning` (date, blocks, needs, volunteer availability, afternoon record) |
| Volunteer UI | `/volunteer` daily needs + afternoon recording; `/volunteer/availability` block-based weekly + one-time absences |
| Patient UI | Check-in needs; read-only daily overview; AI advisory on `/dashboard/advice` |
| Database | `participation_needs` on check-ins; `daily_participation_plans`; `volunteer_weekly_blocks`; `volunteer_day_absences` |
| AI | Advisory only; simple morning-contact availability signal — no volunteer names or schedules |

---

## Legacy database tables (deprecate — do not drop)

Applied remotely in migrations `00039`–`00049`. Stop all application writes after Phase 6.

| Table | Migration | Replacement |
|-------|-----------|-------------|
| `activities` | 00039 | None — no activity catalog in PoC |
| `activity_recurring_schedules` | 00040 | None |
| `activity_recurring_schedule_facilitators` | 00048 | None |
| `activity_sessions` | 00040 | `daily_participation_plans` (one afternoon communication per date) |
| `activity_session_participants` | 00041 | None |
| `activity_session_facilitators` | 00048 | None |
| `volunteer_recurring_availability` | 00042 | `volunteer_weekly_blocks` |
| `volunteer_availability_exceptions` | 00042 | `volunteer_day_absences` |

**Unaffected:** `patients`, `admissions`, `patient_checkins`, `patient_questions`, `patient_context`, `patient_participation_evaluations`, auth tables.

---

## Legacy RPCs (deprecate — stop calling)

| RPC | Replacement |
|-----|-------------|
| `materialize_recurring_sessions` | None |
| `list_planning_sessions` | Coordinator dashboard queries |
| `list_planning_facilitator_candidates` | None |
| `list_facilitator_sessions` | None |
| `list_patient_activity_sessions` | `get_daily_participation_for_patient` |
| `list_planning_patients` | None |
| `list_planning_volunteers` | Volunteer profile list if still needed |

### New RPCs (Phase 2)

| RPC | Purpose |
|-----|---------|
| `get_daily_needs_summary(plan_date)` | Aggregated patient need counts |
| `get_daily_participation_for_patient(plan_date)` | Patient read model |
| `get_volunteer_block_availability_overview(plan_date)` | Effective block availability per volunteer (coordinator UI only — not passed to AI with names) |
| `get_morning_contact_availability_signal(plan_date)` | Boolean/simple signal for AI: morning individual contact reasonably available |

---

## Routes — remove or replace

### Remove (Phase 6) + redirect to `/planning`

| Route | Current purpose |
|-------|-----------------|
| `/planning/plan` | Unified activity plan wizard |
| `/planning/sessions`, `/planning/sessions/[sessionId]` | Session list and detail |
| `/planning/sessions/new` | Redirect to plan |
| `/planning/series`, `/planning/series/[id]` | Recurring series |
| `/planning/activities`, `/planning/activities/new`, `/planning/activities/[id]/edit` | Activity catalog |
| `/planning/calendar` | Week calendar |
| `/planning/facilitator` | Coordinator facilitator sessions |
| `/planning/volunteers` | Coordinator volunteer availability panel |
| `/planning/recurring/*` | Legacy recurring URLs |
| `/care/activities` | Caregiver facilitator sessions |

### Keep and replace

| Route | PoC purpose |
|-------|-------------|
| `/planning` | **Coordinator dashboard** — date, weekday, blocks, needs, volunteer availability, afternoon record + audit |
| `/volunteer` | Volunteer daily page — needs summary, afternoon recording |
| `/volunteer/availability` | Block-based weekly availability + monthly one-time absences |
| `/volunteer/profile` | Volunteer profile |
| `/dashboard/checkin` | Extended with `participation_needs` |
| `/dashboard/activities` | Read-only patient daily participation overview |
| `/dashboard/advice` | DailyBuddy advisory (Phase 7) |

### Navigation after PoC

| Module | Items |
|--------|-------|
| Planning | **Dagplanning** → `/planning` only |
| Volunteer | Vandaag, Beschikbaarheid, Mijn profiel |
| Patient | Activiteiten → daily overview label TBD |

---

## Application files — remove in Phase 6

### Routes (`app/planning/`)

- `plan/page.tsx`, `sessions/**`, `series/**`, `activities/**`, `calendar/page.tsx`, `facilitator/page.tsx`, `volunteers/page.tsx`, `recurring/**`

### Components (`components/dashboard/`)

- `planning-overview-view.tsx`, `planning-plan-view.tsx`, `planning-sessions-view.tsx`, `planning-session-detail-view.tsx`
- `planning-series-view.tsx`, `planning-series-detail-view.tsx`, `planning-activities-view.tsx`
- `planning-activity-create-view.tsx`, `planning-activity-edit-view.tsx`, `planning-calendar-view.tsx`
- `planning-coordinator-volunteers-view.tsx`, `planning-recurring-edit-view.tsx`
- `planning-recurring-view.tsx`, `planning-recurring-create-view.tsx`, `planning-session-create-view.tsx` (orphans)
- `facilitator-sessions-page-view.tsx`, `facilitator-sessions-view.tsx`, `volunteer-planning-view.tsx`
- `patient-activities-view.tsx`
- Legacy: `volunteer-availability-view.tsx`, `volunteer-recurring-availability-card.tsx`, `volunteer-availability-exception-card.tsx`

### Services (`lib/services/`)

- `activities.ts`, `activity-sessions.ts`, `activity-recurring-schedules.ts`, `plan-activity.ts`
- `planning-patients.ts`, `planning-facilitators.ts`, `planning-volunteers.ts`, `planning-coordinator-volunteers.ts`
- `facilitator-sessions.ts`, `volunteer-sessions.ts`, `patient-activity-sessions.ts`
- Legacy: `volunteer-availability.ts`

### Hooks (`hooks/`)

- `use-activities.ts`, `use-planning-sessions.ts`, `use-recurring-schedules.ts`, `use-plan-activity.ts`
- `use-planning-patients.ts`, `use-planning-facilitators.ts`, `use-planning-volunteers.ts`, `use-planning-coordinator-volunteers.ts`
- `use-facilitator-sessions.ts`, `use-volunteer-sessions.ts`, `use-patient-activity-sessions.ts`
- Legacy: `use-volunteer-availability.ts`

### Validations, types, constants

- `lib/validations/activity.ts`, `activity-session.ts`, `recurring-schedule.ts`, `plan-activity.ts`, `volunteer-availability.ts`
- `types/activity.ts`
- `lib/constants/planning-enums.ts`, `planning-copy.ts`, `facilitator-copy.ts` (partial), `patient-activities-copy.ts`
- `lib/utils/planning-time.ts`, `volunteer-availability-validation.ts` (legacy overlap)

### Forms

- `activity-form.tsx`, `recurring-schedule-form.tsx`, `one-off-session-form.tsx`, `facilitator-picker.tsx`, `schedule-time-fields.tsx`

---

## Application files — add across phases

| Phase | Files |
|-------|-------|
| 1 | `lib/constants/daily-participation.ts`, this doc, `planning-poc-limitations.md` |
| 2 | `supabase/migrations/00050_daily_participation_poc.sql`, `types/daily-participation.ts`, validations |
| 3 | Check-in form/summary updates |
| 4 | `coordinator-daily-planning-view.tsx`, `volunteer-daily-view.tsx`, `volunteer-block-availability-view.tsx`, services/hooks |
| 5 | `patient-daily-participation-view.tsx` |
| 6 | Redirects; delete legacy files listed above |
| 7 | `lib/ai/dailybuddy.ts`, `lib/tools/*`, API route |

---

## Migration safety rules

1. **Never delete** historical migrations `00039`–`00049`.
2. **Additive schema only** in `00050` — no `DROP TABLE`.
3. **Stop legacy writes** when Phase 6 removes services.
4. **No data migration required** for volunteer availability — volunteers re-enter weekly blocks in new UI.
5. **`patient_participation_evaluations.activity_session_id`** remains nullable; no new session links.

---

## Coordinator dashboard specification (final)

`/planning` shows for the selected date:

1. Date and Dutch weekday name
2. Fixed morning block (10:00–12:00) with effective volunteer availability count/list
3. Fixed afternoon block (14:00–16:00) with room constant, capacity 10, independent-access notice
4. Aggregated patient needs (social, movement, creative, relaxation)
5. Recorded afternoon activity (category, title, participant message) if present
6. Audit: who last updated the afternoon record and when (`recorded_by_user_id`, `updated_at`)

Morning coordination happens outside the app using the availability overview. No minute-level scheduling.

---

## AI data boundary (final)

| Exposed to AI | Not exposed to AI |
|---------------|-------------------|
| Check-in scores, symptoms, note, needs | Individual volunteer names |
| Care restrictions | Volunteer schedules |
| Recorded afternoon activity | Staffing counts (unless later justified) |
| Simple signal: morning individual contact reasonably available | Assignment, optimisation, replacement |
