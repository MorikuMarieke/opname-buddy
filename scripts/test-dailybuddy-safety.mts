/**
 * Focused DailyBuddy safety unit checks (no Vitest dependency).
 * Run: npx tsx scripts/test-dailybuddy-safety.mts
 */
import assert from "node:assert/strict";

import {
  NO_NON_CARE_CONTACT_FALLBACK,
  VISIT_PROTECTION_FALLBACK,
  buildBlockedAfternoonRestFallback,
  buildCareContextFingerprint,
  buildDeterministicAdviceWhenNoPlan,
  buildNeutralAfternoonNote,
  canShowAfternoonInterestCta,
  deriveParticipationFacts,
  enforceAccessGateOnOutput,
  isRestUnsuitableForGroupInterest,
  morningVisitAvailable,
} from "../lib/ai/participation-advice-policy";
import {
  filterInspirationIdsForPatient,
  getAllowedVisitInspirationIds,
  movementInspirationsAllowed,
} from "../lib/ai/inspiration-filter";
import {
  DAILYBUDDY_PATIENT_SAFE_ERROR,
  toPatientDailyAdvice,
  toPatientSafeErrorMessage,
} from "../lib/daily-advice/patient-response";
import type { DailyBuddyStructuredOutput } from "../lib/validations/daily-advice";

function baseOutput(
  overrides: Partial<DailyBuddyStructuredOutput> = {},
): DailyBuddyStructuredOutput {
  return {
    primary_outcome: "afternoon_group_activity",
    motivation: "Doe mee met de middagactiviteit in de groep.",
    explanation: "De creatieve middag past goed bij wat je wilt.",
    choice_reminder: "Deelname is jouw keuze.",
    secondary_morning_visit: null,
    inspiration_ids: ["coffee_together", "short_walk"],
    afternoon: {
      recommend: true,
      note: "De middagactiviteit kan bij je passen.",
      claims_need_match: true,
    },
    safety_flags_applied: [],
    ...overrides,
  };
}

const healthyScores = {
  energy_level: 5,
  mood: 5,
  motivation_score: 5,
};

const restUnsuitableScores = {
  energy_level: 2,
  mood: 4,
  motivation_score: 4,
};

function gateOptions(
  overrides: Partial<Parameters<typeof enforceAccessGateOnOutput>[1]> = {},
): Parameters<typeof enforceAccessGateOnOutput>[1] {
  return {
    access: "yes",
    hasPlan: false,
    planCategory: null,
    participationNeeds: [],
    morningAvailable: true,
    visitActivityPossibility: "no_relevant_restriction",
    roomRestriction: "no_restriction",
    checkinScores: healthyScores,
    ...overrides,
  };
}

function assertNoInternalLeakage(text: string) {
  assert.doesNotMatch(
    text,
    /no_relevant_restriction|visit_allowed_with_protection|no_non_care_contact|visit_activity_possibility|isolation_type|participation_routes/,
  );
}

// --- Access gate: blocked afternoon rewrites all patient-facing fields ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput(),
    gateOptions({
      access: "no",
      hasPlan: true,
      planCategory: "creative",
      participationNeeds: ["creative"],
      morningAvailable: false,
    }),
  );

  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.afternoon?.recommend, false);
  assert.equal(result.secondary_morning_visit?.suggest, false);
  assert.match(result.motivation.toLowerCase(), /rust/);
  assert.ok(
    result.safety_flags_applied.includes("independent_access_blocked_afternoon"),
  );
}

// --- Morning available may offer secondary after blocked afternoon ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput(),
    gateOptions({
      access: "no",
      hasPlan: true,
      planCategory: "creative",
      participationNeeds: ["creative"],
      morningAvailable: true,
    }),
  );
  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.secondary_morning_visit?.suggest, true);
}

// --- Rest fallback helper ---
{
  const fallback = buildBlockedAfternoonRestFallback({ morningAvailable: false });
  assert.equal(fallback.primary_outcome, "rest");
  assert.equal(fallback.afternoon?.recommend, false);
}

// --- Neutral afternoon note for rest (no personal fit claim) ---
{
  const note = buildNeutralAfternoonNote("Samen kleuren");
  assert.match(note, /bekend: Samen kleuren/);
  assert.doesNotMatch(note.toLowerCase(), /past bij je/);
}

// --- restUnsuitable helper ---
{
  assert.equal(isRestUnsuitableForGroupInterest(healthyScores), false);
  assert.equal(isRestUnsuitableForGroupInterest(restUnsuitableScores), true);
  assert.equal(
    isRestUnsuitableForGroupInterest({
      energy_level: 4,
      mood: 2,
      motivation_score: 4,
    }),
    true,
  );
}

// --- Concrete patient scenario: healthy + access yes + no plan → awaiting ---
{
  const deterministic = buildDeterministicAdviceWhenNoPlan(gateOptions());
  assert.ok(deterministic);
  assert.equal(deterministic!.primary_outcome, "awaiting_afternoon_programme");
  assert.ok(
    deterministic!.safety_flags_applied.includes("empty_plan_awaiting_programme"),
  );
  assert.doesNotMatch(deterministic!.motivation.toLowerCase(), /rust past/);
  assert.match(
    deterministic!.motivation,
    /gezamenlijke activiteit/i,
  );
  assert.doesNotMatch(
    deterministic!.motivation.toLowerCase(),
    /geen activiteit|geen middagprogramma|niet gepland|ontbreekt/,
  );
  assert.doesNotMatch(
    deterministic!.explanation.toLowerCase(),
    /geen gezamenlijke|nog geen.*geregistreerd|mocht er nog een worden gepland/,
  );
}

// --- Empty plan + LLM rest must be overridden to awaiting ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({
      primary_outcome: "rest",
      afternoon: { recommend: false, note: null, claims_need_match: false },
      motivation: "Op basis van wat je hebt ingevuld past vandaag vooral rust.",
      explanation: "Rust is aangewezen omdat er geen programma is.",
    }),
    gateOptions(),
  );
  assert.equal(result.primary_outcome, "awaiting_afternoon_programme");
  assert.doesNotMatch(result.explanation.toLowerCase(), /rust is aangewezen/);
}

// --- Empty plan + morning primary → awaiting ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({
      primary_outcome: "morning_volunteer_visit",
      afternoon: { recommend: false, note: null, claims_need_match: false },
    }),
    gateOptions(),
  );
  assert.equal(result.primary_outcome, "awaiting_afternoon_programme");
  assert.equal(result.secondary_morning_visit?.suggest, true);
}

// --- Empty plan + restUnsuitable → rest (not because plan is empty) ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({ primary_outcome: "rest" }),
    gateOptions({ checkinScores: restUnsuitableScores }),
  );
  assert.equal(result.primary_outcome, "rest");
  assert.doesNotMatch(
    result.explanation.toLowerCase(),
    /geen middagprogramma/,
  );
}

// --- Plan exists: do not apply empty-plan coercion ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({
      primary_outcome: "morning_volunteer_visit",
      afternoon: { recommend: false, note: null, claims_need_match: false },
    }),
    gateOptions({
      hasPlan: true,
      planCategory: "social",
      participationNeeds: ["social"],
    }),
  );
  assert.equal(result.primary_outcome, "morning_volunteer_visit");
  assert.equal(buildDeterministicAdviceWhenNoPlan(gateOptions({ hasPlan: true })), null);
}

// --- no_relevant_restriction: visit + group/interest when otherwise eligible ---
{
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "no_relevant_restriction",
      roomRestriction: "no_restriction",
      hasCheckIn: true,
      careContextComplete: true,
      ...healthyScores,
    }),
    true,
  );

  const withPlan = enforceAccessGateOnOutput(
    baseOutput({ primary_outcome: "morning_volunteer_visit" }),
    gateOptions({
      hasPlan: true,
      planCategory: "social",
      participationNeeds: ["social"],
      visitActivityPossibility: "no_relevant_restriction",
    }),
  );
  assert.equal(withPlan.primary_outcome, "morning_volunteer_visit");
  assert.ok(
    morningVisitAvailable({
      primaryOutcome: withPlan.primary_outcome,
      secondaryMorningVisit: Boolean(withPlan.secondary_morning_visit?.suggest),
    }),
  );
}

// --- visit_allowed_with_protection: visit only; afternoon/interest blocked ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({ primary_outcome: "afternoon_group_activity" }),
    gateOptions({
      visitActivityPossibility: "visit_allowed_with_protection",
      hasPlan: true,
      planCategory: "social",
      participationNeeds: ["social"],
    }),
  );
  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.afternoon?.recommend, false);
  assert.equal(result.secondary_morning_visit?.suggest, true);
  assert.match(result.explanation, /beschermingsmaatregelen/);
  assert.equal(result.explanation.includes(VISIT_PROTECTION_FALLBACK), true);
  assertNoInternalLeakage(result.motivation);
  assertNoInternalLeakage(result.explanation);
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "visit_allowed_with_protection",
      roomRestriction: "no_restriction",
      hasCheckIn: true,
      careContextComplete: true,
      ...healthyScores,
    }),
    false,
  );

  const facts = deriveParticipationFacts("visit_allowed_with_protection");
  assert.equal(facts.on_ward_visit, "allowed_with_protection");
  assert.equal(facts.afternoon_activity, "not_offered");
}

// --- no_non_care_contact: blocks visit and afternoon; no enum leakage ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({ primary_outcome: "morning_volunteer_visit" }),
    gateOptions({
      visitActivityPossibility: "no_non_care_contact",
      hasPlan: true,
    }),
  );
  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.secondary_morning_visit?.suggest, false);
  assert.equal(result.afternoon?.recommend, false);
  assert.equal(result.explanation, NO_NON_CARE_CONTACT_FALLBACK);
  assert.ok(result.safety_flags_applied.includes("no_non_care_contact"));
  assertNoInternalLeakage(result.motivation);
  assertNoInternalLeakage(result.explanation);
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "no_non_care_contact",
      roomRestriction: "no_restriction",
      hasCheckIn: true,
      careContextComplete: true,
      ...healthyScores,
    }),
    false,
  );

  const regenerated = buildDeterministicAdviceWhenNoPlan(
    gateOptions({ visitActivityPossibility: "no_non_care_contact" }),
  );
  assert.ok(regenerated);
  assert.equal(regenerated!.primary_outcome, "rest");
  assert.equal(regenerated!.explanation, NO_NON_CARE_CONTACT_FALLBACK);
}

// --- Room-only: morning primary if available; CTA blocked ---
{
  const result = enforceAccessGateOnOutput(
    baseOutput({ primary_outcome: "awaiting_afternoon_programme" }),
    gateOptions({ roomRestriction: "room_only" }),
  );
  assert.equal(result.primary_outcome, "morning_volunteer_visit");
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "no_relevant_restriction",
      roomRestriction: "room_only",
      hasCheckIn: true,
      careContextComplete: true,
      ...healthyScores,
    }),
    false,
  );
}

// --- Interest CTA gates ---
{
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "no_relevant_restriction",
      roomRestriction: "no_restriction",
      hasCheckIn: true,
      careContextComplete: true,
      ...healthyScores,
    }),
    true,
  );
  assert.equal(
    canShowAfternoonInterestCta({
      access: "yes",
      visitActivityPossibility: "no_relevant_restriction",
      roomRestriction: "no_restriction",
      hasCheckIn: true,
      careContextComplete: true,
      ...restUnsuitableScores,
    }),
    false,
  );
}

// --- Care-context fingerprint changes when access or visit possibility changes ---
{
  const base = {
    can_independently_reach_activity_room: "yes",
    visit_activity_possibility: "no_relevant_restriction",
    room_restriction: "no_restriction",
    requires_supervision: "not_required",
    mobility_status: "walking_independent",
    transfer_support: "none",
    fall_risk: "low",
  } as const;

  const a = buildCareContextFingerprint(base);
  const b = buildCareContextFingerprint({
    ...base,
    can_independently_reach_activity_room: "no",
  });
  assert.notEqual(a, b);

  const afterFieldChange = buildCareContextFingerprint({
    ...base,
    visit_activity_possibility: "no_non_care_contact",
  });
  assert.notEqual(a, afterFieldChange);

  // Regenerated advice with the new value uses the blocked route.
  const regenerated = buildDeterministicAdviceWhenNoPlan(
    gateOptions({ visitActivityPossibility: "no_non_care_contact" }),
  );
  assert.equal(regenerated?.primary_outcome, "rest");
  assert.equal(regenerated?.secondary_morning_visit?.suggest, false);
}

// --- Inspiration: fail closed for mobility unknown ---
{
  assert.equal(movementInspirationsAllowed(null), false);
  const ids = getAllowedVisitInspirationIds({
    mobility_status: "wheelchair",
    transfer_support: "two_person",
    fall_risk: "high",
    room_restriction: "ward_only",
    visit_activity_possibility: "no_relevant_restriction",
    mobility_aid_available: "yes",
    can_independently_reach_activity_room: "no",
    requires_supervision: "required",
  });
  assert.ok(!ids.includes("short_walk"));
  assert.ok(ids.includes("coffee_together"));
}

{
  const filtered = filterInspirationIdsForPatient(
    ["short_walk", "coffee_together", "not_in_library"],
    {
      mobility_status: "bed_bound",
      transfer_support: "lift",
      fall_risk: "high",
      room_restriction: "room_only",
      visit_activity_possibility: "no_relevant_restriction",
      requires_supervision: "required",
      can_independently_reach_activity_room: "no",
    },
  );
  assert.deepEqual(filtered, ["coffee_together"]);
}

{
  assert.equal(
    toPatientSafeErrorMessage(new Error("DailyBuddy-antwoord bevatte onveilige medische taal.")),
    DAILYBUDDY_PATIENT_SAFE_ERROR,
  );

  const patient = toPatientDailyAdvice({
    id: "a1",
    admission_id: "adm",
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
    created_at: "2026-07-22T00:00:00Z",
    error_message: "internal model failure xyz",
    explanation: null,
    generated_at: null,
    generation_started_at: null,
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
    updated_at: "2026-07-22T00:00:00Z",
  });
  assert.equal("error_message" in patient, false);
}

console.log("All DailyBuddy safety checks passed.");
