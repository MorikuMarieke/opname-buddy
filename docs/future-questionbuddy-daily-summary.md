# Future: QuestionBuddy daily question summary

**Status:** Parked / deferred — patient question **editor** is shipped (branch 2); QuestionBuddy AI summary is **not** implemented. Caregiver in-app answering (`answer_notes` / status) also lacks care UI (RLS only).
**Added:** 2026-06-30
**Trigger:** Branch 10 (`feature/questionbuddy-agent`) — Vercel AI SDK integration

Related: [`docs/domain-model.md`](domain-model.md) (`patient_questions`), [`docs/project-context.md`](project-context.md), [`docs/planning-poc-limitations.md`](planning-poc-limitations.md).

---

## Product rule

Patient questions are **never answered** by the app or AI.

| Phase | What the patient gets |
|-------|------------------------|
| **Branch 2 (now)** | Preparation editor — write questions, label by hospital specialism, edit/delete open items |
| **Branch 10 (later)** | **Daily summary** — QuestionBuddy organizes open questions into a concise list for rounds or caregiver conversations |

Medical answers always stay in the **caregiver conversation** (in person). `answer_notes` on `patient_questions` is intended for caregivers, but **care UI to write it is not implemented** in this PoC (RLS UPDATE exists; patient UI can display notes if present).

---

## What QuestionBuddy may do (branch 10)

- Read the patient’s **open** questions for today (tool: `getOpenQuestions` or similar)
- Group similar questions by specialism (`target_type`)
- Clarify wording (shorter, clearer — still the patient’s intent)
- Produce a **daily question summary** — a readable list the patient can use before visits or rounds

Example output shape (planning level, not final schema):

```ts
interface DailyQuestionSummary {
  summary_date: string; // Amsterdam calendar day
  by_specialism: {
    specialism: CaregiverTargetType;
    items: string[]; // organized question lines
  }[];
  intro?: string; // optional one-line encouragement, non-medical
}
```

Storage TBD in branch 10 — e.g. `patient_question_summaries` table or section inside `daily_advice`. Do not implement until agent branch.

---

## What QuestionBuddy must not do

- Answer medical questions
- Diagnose, treat, or predict recovery
- Replace caregiver `answer_notes`
- Auto-close or change `status` on patient questions without caregiver action

If content is medical, redirect: *“Bespreek dit met je zorgteam.”*

---

## Branch 2 scope boundary (confirmed)

The current `/dashboard/questions` UI is **only** the editor:

- No daily summary view
- No AI organize button
- No streaming responses

Optional UI copy may mention that a daily summary is planned with QuestionBuddy.

---

## Suggested implementation (branch 10)

1. **Tools** (Vercel AI SDK, `maxSteps >= 3`, streaming)
   - `getOpenQuestions` — patient’s open questions for today/recent
   - `getPatientCheckins` — optional context (already planned for DailyBuddy)
   - `saveQuestionSummary` — persist organized daily summary

2. **API route** — e.g. `app/api/questionbuddy/route.ts` with service role or patient-scoped reads via tools

3. **UI** — section on `/dashboard/questions` or `/dashboard/advice`: “Jouw vragensamenvatting van vandaag” (read-only, generated)

4. **Docs** — mark this file status → Implemented; update domain model

---

## Files to touch when implementing

| Area | Files |
|------|--------|
| Agent | `lib/ai/questionbuddy.ts`, `lib/tools/get-open-questions.ts`, `lib/tools/save-question-summary.ts` |
| Route | `app/api/questionbuddy/route.ts` |
| UI | `components/dashboard/questions-summary.tsx` (new) |
| Data | Optional new table or JSON on existing advice storage |
