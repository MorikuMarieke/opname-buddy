# Future: Morning / evening participation scheduling

**Status:** Parked — not implemented  
**Added:** 2026-06-30  
**Trigger:** Implement patient-facing evening evaluation UI, home-dashboard reminders, or DagBuddy daily rhythm.

Related: [`docs/domain-model.md`](domain-model.md) (check-in + participation evaluation entities).

---

## Current behaviour (as built)

The app tracks participation by **calendar day** in `Europe/Amsterdam`, not by time of day.

| Flow | Table | Date field | How “done today?” is checked |
|------|-------|------------|------------------------------|
| Morning check-in | `patient_checkins` | `check_in_date` | `getTodayCheckIn()` — latest row for today’s Amsterdam date |
| Evening evaluation | `patient_participation_evaluations` | `evaluation_date` | `getTodayEvaluations()` — data layer only; **no UI yet** |

**Date helper:** `lib/utils/amsterdam-date.ts` → `getAmsterdamDateString()`

**Home reminder:** `components/dashboard/patient-home-summary.tsx` only checks morning check-in + open questions. No evening prompt.

There is **no**:

- Time-of-day window (e.g. morning before 14:00, evening after 17:00)
- Push or in-app notifications
- Automatic link from evening eval to a DagBuddy-suggested activity
- Dynamic greeting (shell always says “Goedemorgen”)

**UX vs database (morning):** UI encourages one check-in per day; DB does not enforce `UNIQUE (patient_id, check_in_date)`.

---

## Intended daily rhythm (product)

```
Calendar day (Europe/Amsterdam)
    │
    ├─ Morning: patient check-in (pain, energy, mood, mobility, motivation, …)
    │            → informs DagBuddy activity suggestions
    │
    └─ Evening: participation evaluation per suggested/planned activity
                 → done | partly_done | not_done + effort + after-feeling
```

Scheduling logic should eventually answer:

1. **What should the patient do now?** (morning check-in vs evening reflection vs nothing)
2. **What should the home card say?** (reminder vs completed vs evening pending)

---

## Suggested implementation (when ready)

### 1. Constants

```ts
// lib/constants/participation-schedule.ts (example)
export const MORNING_CHECKIN_END_HOUR = 14;   // Amsterdam, exclusive end of “morning”
export const EVENING_EVAL_START_HOUR = 17;    // Amsterdam, start of “evening”
```

Tune with caregivers / UX testing.

### 2. Helper

```ts
// lib/utils/participation-schedule.ts (example)
export type ParticipationPhase = "morning" | "between" | "evening";

export function getParticipationPhase(now = new Date()): ParticipationPhase;
export function getAmsterdamHour(now = new Date()): number;
```

- **morning** — prompt check-in if missing  
- **between** — optional soft reminders; no evening eval yet  
- **evening** — prompt participation evaluation if morning check-in exists and eval missing  

### 3. Home dashboard

Extend `PatientHomeSummary` (or successor) to consider:

- `getParticipationPhase()`
- `useTodayCheckIn()` — morning done?
- `useTodayParticipationEvaluations()` — evening done?
- Open questions count (existing)

Example headlines:

- Morning, no check-in: “Vergeet niet je ochtend-check-in in te vullen.”
- Evening, check-in done, no eval: “Hoe ging je activiteit vandaag?”
- Both done: “Goed bezig vandaag.”

### 4. Routes / UI (follow-up slices)

- Evening form on `/dashboard/activities` or `/dashboard/checkin` (evening tab) — keep forms short
- Pre-fill `activity_title` from stored DailyBuddy advice (branch 8)
- Link `activity_session_id` when activities exist (branch 7)

### 5. Optional database changes (only if needed)

- `UNIQUE (patient_id, check_in_date)` on `patient_checkins` — enforce one morning check-in per day
- No schema change required for time windows — scheduling stays in app layer unless notifications need persisted schedule preferences

### 6. DagBuddy (branch 8)

Agent tools should read:

- Today’s `patient_checkins` (including `motivation_score`)
- Recent `patient_participation_evaluations`
- Caregiver restrictions/context (branch 3)

Agent does **not** replace the schedule helper; it consumes the data the patient already entered.

---

## Files to touch when implementing

| Area | Files |
|------|--------|
| Schedule logic | `lib/constants/participation-schedule.ts`, `lib/utils/participation-schedule.ts` |
| Home reminders | `components/dashboard/patient-home-summary.tsx` |
| Evening UI | New view under `components/dashboard/`, route TBD |
| Data (exists) | `lib/services/patient-participation-evaluations.ts`, `hooks/use-patient-participation-evaluations.ts` |
| Greeting | `components/layout/patient-shell.tsx` — phase-aware copy |
| Docs | Update this file status → Implemented; update `docs/domain-model.md` |

---

## Out of scope for scheduling slice

- Hospital-wide notification infrastructure
- Caregiver-configurable per-patient schedules (stretch)
- Medical adherence tracking
