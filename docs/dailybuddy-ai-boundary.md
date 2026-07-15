# DailyBuddy AI boundary

This document defines the AI integration boundary for DailyBuddy on branch `feature/dailybuddy-participation-advice`.

## Tools (read-only)

| Tool | Data exposed |
|------|----------------|
| `getPatientCheckin` | pain, energy, mood, mobility, symptoms, note, `participation_needs` |
| `getPatientContext` | caregiver `patient_context`, including `can_independently_reach_activity_room` |
| `getDailyParticipationPlan` | afternoon category, title, participant message |
| `getMorningVolunteerAvailabilitySignal` | **Boolean only** — morning individual contact reasonably available |

Persistence is **not** an AI tool. After structured output passes Zod validation, the server upserts `daily_advice` deterministically.

## Not exposed to AI

- Individual volunteer names
- Volunteer schedules or weekly/absence detail
- Detailed staffing optimisation data
- Session lists, catalog, facilitator data

## Afternoon access gate

`can_independently_reach_activity_room` is the single operational source of truth:

| Value | Meaning |
|-------|---------|
| `yes` | May be considered for the afternoon group activity |
| `no` | Must never recommend afternoon group |
| `unknown` | Must not recommend afternoon group |

Exact participation-need / afternoon-category match is a **strong positive signal**, not an absolute requirement. Never claim a match the patient did not select.

## Hard boundaries

The AI must not: diagnose, give treatment advice, override care restrictions, schedule, assign volunteers, optimise staffing, replace absent volunteers, or invent an afternoon activity.

DailyBuddy is **advisory and patient-facing only**.

## Advisory outputs

1. Rest may fit today (optional secondary quiet morning visit)
2. Optional morning individual contact (10:00–12:00) may suit quieter needs
3. Recorded afternoon group activity may fit — patient chooses — only when access is `yes`

Language: cautious Dutch ("kan passen", "op basis van wat je hebt ingevuld", "de keuze is aan jou", "bespreek met je zorgteam als je twijfelt").
