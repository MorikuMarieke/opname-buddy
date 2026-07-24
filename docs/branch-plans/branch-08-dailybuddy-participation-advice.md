# Branch plan — feature/dailybuddy-participation-advice

**Branch:** `feature/dailybuddy-participation-advice`  
**Status:** Shipped  
**Depends on:** `feature/activity-planning-volunteers` (branches 1–7, daily participation PoC on `main`)

## Purpose

Patient-facing DailyBuddy advisory on the simplified daily participation model: one structured AI advice per admission per day, generated server-side after check-in. Includes morning visit requests, a care-context-gated inspiration library, deterministic access enforcement, and hardened authorization.

AI boundary reference: [`docs/dailybuddy-ai-boundary.md`](../dailybuddy-ai-boundary.md).

## Scope

### In scope

- One structured AI advice per admission per calendar day (`daily_advice`)
- Morning volunteer visit requests (`morning_volunteer_visit_requests`)
- Caregiver care-context field: `can_independently_reach_activity_room`
- Morning signal RPC (boolean only, no names/schedules)
- Afternoon plan patch for later-arriving plan data
- Patient-facing advice page with morning visit request UI
- Care-context field in caregiver patient form
- Volunteer/coordinator ochtendverzoeken lists

### Out of scope

Chatbot, volunteer matching, scheduling, assignment, notifications, QuestionBuddy, unrelated UI polish, tone-of-voice copy improvements (future branch).

## Migrations

| File | Purpose |
|------|---------|
| `00052_dailybuddy_advice.sql` | `daily_advice` table + RLS + grants; `morning_volunteer_visit_requests`; `patient_context.can_independently_reach_activity_room`; morning signal RPC; staff request-list RPC |
| `00053_daily_advice_auth_harden.sql` | Drop patient insert/update policies and broad caregiver SELECT; patient read-only (`SELECT` only for `authenticated`); add afternoon status `informational`; service-role retains full access |

## Implementation phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Schema + RLS + migrations | Done |
| 2 | AI tools (4 read tools, structured output, Zod validation) | Done |
| 3 | Server-side generation service (idempotent, claim-lock) | Done |
| 4 | API routes (`/advice`, `/afternoon-patch`) | Done |
| 5 | Patient UI (`/dashboard/advice`, check-in CTA, morning request) | Done |
| 6 | Caregiver/coordinator/volunteer surfaces | Done |
| 7 | Safety & authorization hardening | Done |
| 8 | Read/write client split fix | Done |

## Key routes

| Route | Role | Purpose |
|-------|------|---------|
| `GET/POST /api/dailybuddy/advice` | Patient | Read or trigger generation |
| `POST /api/dailybuddy/afternoon-patch` | Volunteer / Coordinator / Admin | Update afternoon status after plan is known |
| `/dashboard/advice` | Patient | Advice display + morning visit request |

## Key files

| Path | Purpose |
|------|---------|
| `lib/ai/dailybuddy.ts` | Core generation: system prompt, tool wiring, structured output, inspiration filter |
| `lib/ai/afternoon-gates.ts` | Deterministic access gate; blocked-afternoon rewrite; neutral rest afternoon note |
| `lib/ai/inspiration-filter.ts` | Care-context inspiration allowlist; movement fail-closed |
| `lib/tools/dailybuddy-tools.ts` | 4 essential read tools; throws `DailyBuddyToolFailureError` on DB/RPC failure |
| `lib/services/daily-advice.ts` | Idempotent generation controller; `getGenerationMeta`; `persistReadyAdvice`; afternoon patch |
| `lib/services/daily-advice-server.ts` | Session auth; service-role write split; `requirePatientSession`; `resolveActiveAdmissionId` |
| `lib/validations/daily-advice.ts` | Zod schema for structured AI output |
| `lib/constants/visit-inspirations.ts` | Global inspiration library with category tags |
| `types/daily-advice.ts` | `DailyAdvice` type and status/outcome enums |
| `hooks/use-daily-advice.ts` | React Query hooks for advice and generation |
| `components/dashboard/daily-advice-view.tsx` | Patient advice card, morning visit request form |
| `scripts/test-dailybuddy-safety.mts` | Deterministic safety unit checks (no Vitest) |

## Authorization model

- Patients: `SELECT` only on `daily_advice` (own admission via RLS); no insert/update.
- Writes (`daily_advice` claims, status updates): service-role client only, after session is verified server-side.
- Reads (check-in, context, plan, morning signal RPC): authenticated session client (RLS + RPC `authenticated` grant).
- Broad caregiver `SELECT` on `daily_advice` was removed; no caregiver read policy exists.
- Afternoon patch: requires volunteer, activity_coordinator, or admin role.

## Safety behavior

| Scenario | Outcome |
|----------|---------|
| `can_independently_reach_activity_room = no / unknown` | Access gate rewrites all patient-facing fields; `afternoon.recommend = false`; flag added |
| Morning availability false + blocked afternoon | No secondary morning CTA invented |
| Primary outcome `rest` + later afternoon plan | `afternoon_status = informational`; neutral copy; not personally recommended |
| Movement inspiration + restricted/unknown mobility | Movement IDs excluded; fail closed |
| Essential tool DB/RPC failure | `status = failed`; detailed `error_message`; retry UI shown |

## Commits

| Hash | Description |
|------|-------------|
| `0839ba8` | `fix(ai): harden DailyBuddy safety and advice authorization` — full feature + safety hardening |
| `2412c0b` | `fix(ai): use session client for DailyBuddy reads` — authenticated read/service-role write split |
