/**
 * Focused DailyBuddy safety unit checks (no Vitest dependency).
 * Run: npx tsx scripts/test-dailybuddy-safety.mts
 */
import assert from "node:assert/strict";

import {
  buildBlockedAfternoonRestFallback,
  buildNeutralAfternoonNote,
  enforceAccessGateOnOutput,
} from "../lib/ai/afternoon-gates";
import {
  filterInspirationIdsForPatient,
  getAllowedVisitInspirationIds,
  movementInspirationsAllowed,
} from "../lib/ai/inspiration-filter";
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

// --- Access gate: blocked afternoon rewrites all patient-facing fields ---
{
  const result = enforceAccessGateOnOutput(baseOutput(), {
    access: "no",
    planCategory: "creative",
    participationNeeds: ["creative"],
    morningAvailable: false,
  });

  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.afternoon?.recommend, false);
  assert.equal(result.secondary_morning_visit?.suggest, false);
  assert.match(result.motivation.toLowerCase(), /rust/);
  assert.doesNotMatch(result.motivation.toLowerCase(), /middagactiviteit.*passen/);
  assert.doesNotMatch(
    result.explanation.toLowerCase(),
    /creatieve middag past goed/,
  );
  assert.ok(
    result.safety_flags_applied.includes("independent_access_blocked_afternoon"),
  );
}

// --- Blocked afternoon must not invent morning CTA when signal false ---
{
  const result = enforceAccessGateOnOutput(baseOutput(), {
    access: "unknown",
    planCategory: "creative",
    participationNeeds: ["creative"],
    morningAvailable: false,
  });
  assert.equal(result.secondary_morning_visit?.suggest, false);
}

// --- Morning available may offer secondary after blocked afternoon ---
{
  const result = enforceAccessGateOnOutput(baseOutput(), {
    access: "no",
    planCategory: "creative",
    participationNeeds: ["creative"],
    morningAvailable: true,
  });
  assert.equal(result.primary_outcome, "rest");
  assert.equal(result.secondary_morning_visit?.suggest, true);
}

// --- Rest fallback helper ---
{
  const fallback = buildBlockedAfternoonRestFallback({ morningAvailable: false });
  assert.equal(fallback.primary_outcome, "rest");
  assert.equal(fallback.afternoon?.recommend, false);
  assert.equal(fallback.secondary_morning_visit?.suggest, false);
}

// --- Neutral afternoon note for rest (no personal fit claim) ---
{
  const note = buildNeutralAfternoonNote("Samen kleuren");
  assert.match(note, /bekend: Samen kleuren/);
  assert.doesNotMatch(note.toLowerCase(), /past bij je/);
  assert.doesNotMatch(note.toLowerCase(), /aanbevolen/);
}

// --- Inspiration: fail closed for mobility unknown ---
{
  assert.equal(movementInspirationsAllowed(null), false);
  assert.equal(
    movementInspirationsAllowed({ mobility_status: "unknown" }),
    false,
  );
  const ids = getAllowedVisitInspirationIds({
    mobility_status: "wheelchair",
    transfer_support: "two_person",
    fall_risk: "high",
    room_restriction: "ward_only",
    isolation_type: "none",
    mobility_aid_available: "yes",
    can_independently_reach_activity_room: "no",
    requires_supervision: "required",
  });
  assert.ok(!ids.includes("short_walk"));
  assert.ok(!ids.includes("corridor_stroll"));
  assert.ok(ids.includes("coffee_together"));
}

// --- Inspiration: patient-specific filter rejects global-only IDs ---
{
  const filtered = filterInspirationIdsForPatient(
    ["short_walk", "coffee_together", "not_in_library"],
    {
      mobility_status: "bed_bound",
      transfer_support: "lift",
      fall_risk: "high",
      room_restriction: "room_only",
      isolation_type: "none",
      requires_supervision: "required",
      can_independently_reach_activity_room: "no",
    },
  );
  assert.deepEqual(filtered, ["coffee_together"]);
}

// --- Independent walker may receive movement ---
{
  assert.equal(
    movementInspirationsAllowed({
      mobility_status: "walking_independent",
      transfer_support: "none",
      fall_risk: "low",
      room_restriction: "no_restriction",
      isolation_type: "none",
      mobility_aid_available: "unknown",
      requires_supervision: "not_required",
      can_independently_reach_activity_room: "yes",
    }),
    true,
  );
}

console.log("All DailyBuddy safety checks passed.");
