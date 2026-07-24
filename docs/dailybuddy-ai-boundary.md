# DailyBuddy AI boundary

**Status:** Implemented on the current PoC (`feature/dailybuddy-participation-advice` shipped).
This document defines the AI integration boundary for DailyBuddy as built.

Implementation references: `lib/ai/dailybuddy.ts`, `lib/ai/participation-advice-policy.ts`, `lib/tools/dailybuddy-tools.ts`, `app/api/dailybuddy/*`, `components/dashboard/daily-advice-view.tsx`.

## Model and runtime

| Concern | Current behaviour |
|---------|-------------------|
| Model | `gpt-4.1` (`DAILYBUDDY_MODEL_ID` in `lib/ai/dailybuddy.ts`) |
| SDK | Vercel AI SDK (`generateText` + structured object output + tools) |
| Tools | Up to several tool steps (`stepCountIs(8)`); tools are read-only |
| Transport | Patient UI may stream **progress** events (NDJSON); advice content is structured, not free-form token prose |
| Persistence | Server upserts `daily_advice` after validation (not an AI tool) |

## Tools (read-only)

| Tool | Data exposed |
|------|----------------|
| `getPatientCheckin` | pain, energy, mood, mobility, symptoms, note, `participation_needs` |
| `getPatientContext` | caregiver `patient_context`, including `can_independently_reach_activity_room` |
| `getDailyParticipationPlan` | afternoon category, title, participant message (null/missing title ≠ “no activity”; fixed afternoon block still exists) |
| `getMorningVolunteerAvailabilitySignal` | **Boolean only** — morning individual contact reasonably available |

## Caching and regeneration

- Ready advice is reused for the admission/date until marked stale, failed, expired generating claim, or forced retry.
- Stale when the source check-in or material care-context fingerprint changes (does not auto-regenerate silently).
- When an afternoon plan title arrives later, `/api/dailybuddy/afternoon-patch` can refresh afternoon-related advice content.
- Development-only “iterate / compare advice” controls have been removed from the PoC.

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

When no concrete afternoon title is recorded, policy may use `awaiting_afternoon_programme` or rest — without inventing a title and without treating “title missing” as “no afternoon block”.

## Hard boundaries

The AI must not: diagnose, give treatment advice, override care restrictions, schedule, assign volunteers, optimise staffing, replace absent volunteers, or invent an afternoon activity.

DailyBuddy is **advisory and patient-facing only**.

## Advisory outputs

1. Rest may fit today (optional secondary quiet morning visit)
2. Optional morning individual contact (10:00–12:00) may suit quieter needs
3. Recorded afternoon group activity may fit — patient chooses — only when access is `yes`

Language: cautious Dutch ("kan passen", "op basis van wat je hebt ingevuld", "de keuze is aan jou", "bespreek met je zorgteam als je twijfelt").

## Patient-safe failure behaviour

Generation failures persist `daily_advice.status = failed` with an internal error message and return patient-safe copy in the UI (check-in remains saved). Incomplete care context blocks generation with an explicit “not yet available” gate — not a marketing placeholder.
