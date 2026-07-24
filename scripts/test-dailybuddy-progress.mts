/**
 * Progress stage + check-in cache sync + patient-safe wire unit checks.
 * Run: npx tsx scripts/test-dailybuddy-progress.mts
 */
import assert from "node:assert/strict";

import {
  CHECKIN_DEPENDENT_QUERY_KEYS,
} from "../lib/daily-advice/checkin-cache-sync";
import {
  createProgressEmitter,
  DAILYBUDDY_PROGRESS_MESSAGES,
  DAILYBUDDY_TOOL_PROGRESS_STAGE,
  progressEventForStage,
  progressEventForTool,
} from "../lib/daily-advice/progress";
import {
  DAILYBUDDY_PATIENT_SAFE_ERROR,
  patientSafeHttpError,
  toPatientDailyAdvice,
  toPatientSafeErrorMessage,
} from "../lib/daily-advice/patient-response";
import {
  encodeNdjsonLine,
  isDailyBuddyStreamEvent,
} from "../lib/daily-advice/stream-events";
import { queryKeys } from "../lib/constants/query-keys";
import type { DailyAdvice } from "../types/daily-advice";

function adviceRow(overrides: Partial<DailyAdvice> = {}): DailyAdvice {
  const now = new Date().toISOString();
  return {
    id: "advice-1",
    admission_id: "adm-1",
    advice_date: "2026-07-22",
    status: "failed",
    iteration: 1,
    generation_kind: "standard",
    is_active: true,
    afternoon_claims_need_match: false,
    afternoon_note: null,
    afternoon_status: null,
    afternoon_title: null,
    choice_reminder: null,
    created_at: now,
    error_message: "relation daily_advice does not exist",
    explanation: null,
    generated_at: null,
    generation_started_at: now,
    inspiration_ids: [],
    model_id: null,
    motivation: null,
    primary_outcome: null,
    safety_flags_applied: [],
    secondary_morning_note: null,
    secondary_morning_visit: false,
    source_checkin_id: null,
    source_context_fingerprint: null,
    source_plan_updated_at: null,
    stale_reason: null,
    updated_at: now,
    ...overrides,
  };
}

// --- Tool → stage mapping (LLM path) ---
{
  assert.equal(
    DAILYBUDDY_TOOL_PROGRESS_STAGE.getPatientCheckin,
    "checkin",
  );
  assert.equal(
    DAILYBUDDY_TOOL_PROGRESS_STAGE.getPatientContext,
    "care_context",
  );
  assert.equal(
    DAILYBUDDY_TOOL_PROGRESS_STAGE.getDailyParticipationPlan,
    "possibilities",
  );
  assert.equal(
    DAILYBUDDY_TOOL_PROGRESS_STAGE.getMorningVolunteerAvailabilitySignal,
    "possibilities",
  );

  const checkin = progressEventForTool("getPatientCheckin", "llm");
  assert.ok(checkin);
  assert.equal(checkin.message, DAILYBUDDY_PROGRESS_MESSAGES.checkin);
  assert.equal(checkin.path, "llm");
}

// --- Deterministic path stages never claim LLM tools ---
{
  const stages: string[] = [];
  const emitter = createProgressEmitter((event) => {
    stages.push(`${event.stage}:${event.path ?? ""}`);
  });

  emitter.emit("possibilities", "deterministic");
  emitter.emit("composing", "deterministic");
  emitter.emit("validating", "deterministic");
  emitter.emit("ready", "deterministic");
  // Dedupe
  emitter.emit("possibilities", "deterministic");

  assert.deepEqual(stages, [
    "possibilities:deterministic",
    "composing:deterministic",
    "validating:deterministic",
    "ready:deterministic",
  ]);

  assert.equal(
    progressEventForStage("possibilities", "deterministic").message,
    "Ik kijk welke activiteiten vandaag mogelijk zijn…",
  );
  assert.equal(
    progressEventForStage("validating", "deterministic").message,
    DAILYBUDDY_PROGRESS_MESSAGES.validating,
  );
}

// --- LLM path: checkin → care → possibilities → composing → validating → ready ---
{
  const stages: string[] = [];
  const emitter = createProgressEmitter((event) => {
    stages.push(event.stage);
  });

  emitter.emitTool("getPatientCheckin");
  emitter.emitTool("getPatientContext");
  emitter.emitTool("getDailyParticipationPlan");
  emitter.emitTool("getMorningVolunteerAvailabilitySignal");
  emitter.emitTool("getDailyParticipationPlan"); // dedupe possibilities
  emitter.emit("composing", "llm");
  emitter.emit("validating", "llm");
  emitter.emit("ready", "llm");

  assert.deepEqual(stages, [
    "checkin",
    "care_context",
    "possibilities",
    "composing",
    "validating",
    "ready",
  ]);

  // validating must precede ready
  assert.ok(stages.indexOf("validating") < stages.indexOf("ready"));
}

// --- Patient-safe error transport ---
{
  assert.equal(
    toPatientSafeErrorMessage(new Error("duplicate key value violates unique constraint")),
    DAILYBUDDY_PATIENT_SAFE_ERROR,
  );
  assert.equal(
    toPatientSafeErrorMessage(new Error("OpenAI rate limit")),
    DAILYBUDDY_PATIENT_SAFE_ERROR,
  );
  assert.equal(patientSafeHttpError(500), DAILYBUDDY_PATIENT_SAFE_ERROR);
  assert.equal(patientSafeHttpError(401), "Je bent niet ingelogd.");
  assert.equal(patientSafeHttpError(403), "Je hebt geen toegang tot deze actie.");
}

// --- PatientDailyAdvice omits raw error_message ---
{
  const raw = adviceRow({
    status: "failed",
    error_message: "postgres: FATAL connection refused adm-secret-id",
  });
  const patient = toPatientDailyAdvice(raw);
  assert.equal("error_message" in patient, false);
  assert.equal(patient.status, "failed");
  assert.equal(patient.id, "advice-1");

  const resultLine = encodeNdjsonLine({
    type: "result",
    advice: patient,
    startedGeneration: true,
  });
  const parsed = JSON.parse(resultLine.trim()) as {
    type: string;
    advice: Record<string, unknown>;
  };
  assert.equal(parsed.type, "result");
  assert.equal("error_message" in parsed.advice, false);
  assert.doesNotMatch(resultLine, /connection refused|adm-secret|FATAL|postgres/i);

  const errorLine = encodeNdjsonLine({
    type: "error",
    error: toPatientSafeErrorMessage(new Error("tool execute failed: stack")),
  });
  const errorParsed = JSON.parse(errorLine.trim()) as { error: string };
  assert.equal(errorParsed.error, DAILYBUDDY_PATIENT_SAFE_ERROR);
  assert.doesNotMatch(errorLine, /tool execute|stack/);
}

// --- NDJSON encoding / parsing contract ---
{
  const line = encodeNdjsonLine({
    type: "progress",
    stage: "validating",
    message: DAILYBUDDY_PROGRESS_MESSAGES.validating,
    path: "llm",
  });
  assert.ok(line.endsWith("\n"));
  const parsed = JSON.parse(line.trim());
  assert.equal(isDailyBuddyStreamEvent(parsed), true);
  assert.equal(parsed.type, "progress");
  assert.equal(parsed.stage, "validating");

  const resultLine = encodeNdjsonLine({
    type: "result",
    advice: toPatientDailyAdvice(adviceRow({ status: "ready", error_message: "secret" })),
    startedGeneration: true,
  });
  assert.equal(
    isDailyBuddyStreamEvent(JSON.parse(resultLine.trim())),
    true,
  );
  assert.doesNotMatch(resultLine, /"error_message"/);
}

// --- Check-in dependent query keys for DailyBuddy ---
{
  assert.ok(
    CHECKIN_DEPENDENT_QUERY_KEYS.some(
      (key) => key[0] === queryKeys.checkIns.all[0],
    ),
  );
  assert.ok(
    CHECKIN_DEPENDENT_QUERY_KEYS.some(
      (key) => key[0] === queryKeys.dailyAdvice.all[0],
    ),
  );
  assert.ok(
    CHECKIN_DEPENDENT_QUERY_KEYS.some(
      (key) => key[0] === queryKeys.afternoonInterest.all[0],
    ),
  );
}

console.log("test-dailybuddy-progress: all checks passed");
