/**
 * DailyBuddy client-cache completion sync checks (no Vitest dependency).
 * Run: npx tsx scripts/test-dailybuddy-client-cache.mts
 */
import assert from "node:assert/strict";

import {
  ADVICE_FETCH_INIT,
  applyGenerateAdviceSuccess,
  markAdviceGenerating,
  mergeAdviceFetchIntoCache,
  type DailyAdviceQueryData,
} from "../lib/daily-advice/client-cache";
import {
  toPatientDailyAdvice,
  type PatientDailyAdvice,
} from "../lib/daily-advice/patient-response";
import type { DailyAdvice } from "../types/daily-advice";

function advice(overrides: Partial<DailyAdvice> = {}): PatientDailyAdvice {
  const now = new Date().toISOString();
  return toPatientDailyAdvice({
    id: "advice-1",
    admission_id: "adm-1",
    advice_date: "2026-07-22",
    status: "ready",
    iteration: 1,
    generation_kind: "standard",
    is_active: true,
    afternoon_claims_need_match: false,
    afternoon_note: null,
    afternoon_status: null,
    afternoon_title: null,
    choice_reminder: "Deelname is jouw keuze.",
    created_at: now,
    error_message: null,
    explanation: "Uitleg",
    generated_at: now,
    generation_started_at: now,
    inspiration_ids: [],
    model_id: "gpt-4.1",
    motivation: "Motivatie",
    primary_outcome: "rest",
    safety_flags_applied: [],
    secondary_morning_note: null,
    secondary_morning_visit: false,
    source_checkin_id: "checkin-1",
    source_context_fingerprint: "fp",
    source_plan_updated_at: null,
    stale_reason: null,
    updated_at: now,
    ...overrides,
  });
}

// --- Start generation: empty cache becomes generating ---
{
  const next = markAdviceGenerating(undefined);
  assert.equal(next.advice?.status, "generating");
  assert.ok(next.advice?.id);
  assert.equal("error_message" in (next.advice ?? {}), false);
}

// --- Start generation: existing failed row flips to generating ---
{
  const current: DailyAdviceQueryData = {
    advice: advice({ status: "failed" }),
  };
  const next = markAdviceGenerating(current);
  assert.equal(next.advice?.status, "generating");
  assert.equal(next.advice?.id, "advice-1");
  assert.equal("error_message" in (next.advice ?? {}), false);
}

// --- Complete generation: POST ready becomes active cache value ---
{
  const generating = markAdviceGenerating(undefined);
  const ready = advice({ status: "ready", motivation: "Klaar" });
  const next = applyGenerateAdviceSuccess(generating, {
    advice: ready,
    startedGeneration: true,
  });
  assert.equal(next.advice?.status, "ready");
  assert.equal(next.advice?.motivation, "Klaar");
  assert.equal(next.prerequisite, undefined);
  assert.equal("error_message" in (next.advice ?? {}), false);
}

// --- Late poll must not regress ready → generating ---
{
  const current: DailyAdviceQueryData = {
    advice: advice({ status: "ready" }),
  };
  const fetched: DailyAdviceQueryData = {
    advice: advice({ status: "generating" }),
  };
  const next = mergeAdviceFetchIntoCache(current, fetched);
  assert.equal(next.advice?.status, "ready");
}

// --- Failed must not regress to generating via late poll ---
{
  const current: DailyAdviceQueryData = {
    advice: advice({ status: "failed" }),
  };
  const fetched: DailyAdviceQueryData = {
    advice: advice({ status: "generating" }),
  };
  const next = mergeAdviceFetchIntoCache(current, fetched);
  assert.equal(next.advice?.status, "failed");
}

assert.equal(ADVICE_FETCH_INIT.cache, "no-store");

console.log("test-dailybuddy-client-cache: all checks passed");
