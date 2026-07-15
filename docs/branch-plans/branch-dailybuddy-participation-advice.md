# Branch plan — feature/dailybuddy-participation-advice

**Branch:** `feature/dailybuddy-participation-advice`  
**Status:** In progress (implementation)  
**Depends on:** daily participation PoC on `main`

## Purpose

Patient-facing DailyBuddy advisory on the simplified daily participation model: one structured advice per admission per day after check-in, with morning visit requests and a controlled inspiration library.

Canonical plan sections A–R live in the Cursor plan for this branch. Boundary: [`docs/dailybuddy-ai-boundary.md`](../dailybuddy-ai-boundary.md).

## Delivered surfaces

- Schema: `daily_advice`, `morning_volunteer_visit_requests`, `patient_context.can_independently_reach_activity_room`, patient-safe morning signal RPC
- AI: 4 read tools + structured output + server-side persist (`lib/ai/dailybuddy.ts`, `lib/tools/dailybuddy-tools.ts`)
- API: `POST/GET /api/dailybuddy/advice`, `POST /api/dailybuddy/afternoon-patch`
- UI: `/dashboard/advice`, check-in CTA, care-context field, volunteer/coordinator ochtendverzoeken

## Out of scope

Chatbot, volunteer matching, scheduling, assignment, notifications, QuestionBuddy, unrelated UI polish.
