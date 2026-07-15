# DailyBuddy AI boundary (future branch)

This document defines the AI integration boundary for DailyBuddy on the **future** branch `feature/dailybuddy-participation-advice`.

**Not implemented** on the daily participation PoC branch (`feature/activity-planning-volunteers`). The current branch keeps only this spec and a placeholder `/dashboard/advice` route.

When implementing the AI branch, align [`.cursor/rules/ai-agent.mdc`](../.cursor/rules/ai-agent.mdc) with this document. See [`docs/branch-plans/branch-dailybuddy-participation-advice.md`](branch-plans/branch-dailybuddy-participation-advice.md).

## Tools (future branch)

| Tool | Data exposed |
|------|----------------|
| `getPatientCheckins` | pain, energy, mood, mobility, symptoms, note, `participation_needs` |
| `getPatientRestrictions` | `patient_context` care boundaries |
| `getDailyParticipationPlan` | afternoon category, title, participant message |
| `getMorningContactAvailabilitySignal` | **Simple signal only** — boolean whether morning individual contact is reasonably available |
| `getVolunteerAvailabilityContext` | **Optional summary only** — aggregate morning/afternoon counts; no names or schedules |
| `getOpenQuestions` | open patient questions |
| `saveDailyAdvice` | optional persist to `daily_advice` |

## Not exposed to AI

- Individual volunteer names
- Volunteer schedules or weekly/absence detail
- Detailed staffing optimisation data
- Session lists, catalog, facilitator data

## Hard boundaries

The AI must not: diagnose, give treatment advice, override restrictions, schedule, assign volunteers, optimise staffing, replace absent volunteers, or auto-select the afternoon activity.

DailyBuddy is **advisory and patient-facing only**.

## Advisory outputs

1. Rest may fit today
2. Optional morning individual contact (10:00–12:00) may suit quieter needs
3. Recorded afternoon group activity may fit expressed needs — patient chooses

Language: cautious Dutch ("kan passen", "zou geschikt kunnen zijn", "de keuze is aan jou").
