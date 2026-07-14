# DailyBuddy AI boundary (PoC)

This document defines the AI integration boundary for the daily participation proof-of-concept.  
When implementing Phase 7, align [`.cursor/rules/ai-agent.mdc`](../.cursor/rules/ai-agent.mdc) with this spec.

## Tools

| Tool | Data exposed |
|------|----------------|
| `getPatientCheckins` | pain, energy, mood, mobility, symptoms, note, `participation_needs` |
| `getPatientRestrictions` | `patient_context` care boundaries |
| `getDailyParticipationPlan` | afternoon category, title, participant message |
| `getMorningContactAvailabilitySignal` | **Simple signal only** — boolean whether morning individual contact is reasonably available |
| `getOpenQuestions` | open patient questions |
| `saveDailyAdvice` | optional persist |

## Not exposed to AI

- Individual volunteer names
- Volunteer schedules or weekly/absence detail
- Detailed staffing counts (unless a later use case explicitly requires them)
- Session lists, catalog, facilitator data

## Hard boundaries

The AI must not: diagnose, give treatment advice, override restrictions, schedule, assign volunteers, optimise staffing, replace absent volunteers, or auto-select the afternoon activity.

## Advisory outputs

1. Rest may fit today
2. Optional morning individual contact (10:00–12:00) may suit quieter needs
3. Recorded afternoon group activity may fit expressed needs — patient chooses

Language: cautious Dutch ("kan passen", "zou geschikt kunnen zijn", "de keuze is aan jou").
