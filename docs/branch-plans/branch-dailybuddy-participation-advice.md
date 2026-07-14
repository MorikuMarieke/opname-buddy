# Branch plan — feature/dailybuddy-participation-advice

**Branch:** `feature/dailybuddy-participation-advice`  
**Status:** Planned (deferred from daily participation PoC)  
**Depends on:** `feature/activity-planning-volunteers` daily participation PoC (phases 1–7)

## Purpose

Add **patient-facing DailyBuddy advisory** on top of the simplified daily participation model. This branch implements AI integration only — no changes to scheduling, volunteer assignment, or coordinator workflows.

OpnameBuddy remains **advisory and patient-facing only**. AI must not schedule activities or volunteers.

---

## Prerequisites (shipped on PoC branch)

- `patient_checkins.participation_needs`
- `daily_participation_plans`
- `volunteer_weekly_blocks` / `volunteer_day_absences`
- RPCs: `get_daily_participation_for_patient`, `get_morning_contact_availability_signal`, `get_daily_needs_summary`
- Patient read-only `/dashboard/activities` (`Vandaag`)
- Placeholder `/dashboard/advice` route (no AI yet)

Architecture boundary: [`docs/dailybuddy-ai-boundary.md`](../dailybuddy-ai-boundary.md)

---

## In scope

### Data inputs

| Source | Use |
|--------|-----|
| Patient check-in | pain, energy, mood, mobility, symptoms, note, `participation_needs` |
| Care restrictions | `patient_context` boundaries |
| Recorded afternoon activity | `daily_participation_plans` category, title, message |
| Morning contact signal | `get_morning_contact_availability_signal` — boolean/simple only |
| Optional availability summary | Aggregate morning/afternoon volunteer counts — **no names or schedules** |
| Open questions | optional context |

### Implementation

- DailyBuddy API route (streaming)
- Vercel AI SDK tool calling with Zod schemas
- Tools: `getPatientCheckins`, `getPatientRestrictions`, `getDailyParticipationPlan`, `getMorningContactAvailabilitySignal`, `getVolunteerAvailabilityContext` (summary counts only), `getOpenQuestions`, optional `saveDailyAdvice`
- System prompt aligned to [`docs/dailybuddy-ai-boundary.md`](../dailybuddy-ai-boundary.md)
- Streaming advice UI on `/dashboard/advice`
- Optional `daily_advice` persistence table + migration

### Advisory outputs (Dutch, cautious)

1. Rest may fit today
2. Optional morning individual contact (10:00–12:00) may suit quieter needs
3. Recorded afternoon group activity may fit expressed needs — patient chooses

---

## Out of scope

- Scheduling patients or activities
- Assigning or replacing volunteers
- Staffing optimisation
- Coordinator or caregiver AI workflows
- Auto-selecting the afternoon activity
- Individual volunteer names or detailed schedules in prompts

---

## Suggested phases

| # | Phase | Commit |
|---|-------|--------|
| 1 | Tools + services reading PoC RPCs/tables | `feat(ai): add daily participation tools` |
| 2 | API route + DailyBuddy agent config | `feat(ai): add dailybuddy advice route` |
| 3 | Streaming `/dashboard/advice` UI | `feat(ai): add dailybuddy advice view` |
| 4 | Optional `daily_advice` persistence | `feat(ai): persist daily advice` |
| 5 | Docs, RLS QA, lint/typecheck/build | `docs(ai): finalize dailybuddy participation advice` |

Gates after each phase: `npm run lint && npm run typecheck && npm run build`

---

## Hard boundaries (non-negotiable)

See [`.cursor/rules/ai-agent.mdc`](../../.cursor/rules/ai-agent.mdc) and [`docs/dailybuddy-ai-boundary.md`](../dailybuddy-ai-boundary.md).

The AI must not: diagnose, give treatment advice, override restrictions, schedule, assign volunteers, optimise staffing, or receive volunteer names/schedules.
