/**
 * Volunteer morning-visit decision-context checks.
 * Run: npx tsx scripts/test-morning-visit-decision-context.mts
 */
import assert from "node:assert/strict";

import {
  assertVolunteerSafeMorningVisitDto,
  deriveMorningVisitDecisionContext,
} from "../lib/services/morning-visit-decision-context";

// --- Route-blocked care context → ward-stay true ---
{
  const roomOnly = deriveMorningVisitDecisionContext({
    can_independently_reach_activity_room: "yes",
    visit_activity_possibility: "no_relevant_restriction",
    room_restriction: "room_only",
  });
  assert.equal(roomOnly.cannot_participate_in_afternoon_activity, true);

  const noAccess = deriveMorningVisitDecisionContext({
    can_independently_reach_activity_room: "no",
    visit_activity_possibility: "no_relevant_restriction",
    room_restriction: "no_restriction",
  });
  assert.equal(noAccess.cannot_participate_in_afternoon_activity, true);

  const protection = deriveMorningVisitDecisionContext({
    can_independently_reach_activity_room: "yes",
    visit_activity_possibility: "visit_allowed_with_protection",
    room_restriction: "no_restriction",
  });
  assert.equal(protection.cannot_participate_in_afternoon_activity, true);
  assert.equal(protection.requires_protection_before_room_entry, true);

  const noContact = deriveMorningVisitDecisionContext({
    can_independently_reach_activity_room: "yes",
    visit_activity_possibility: "no_non_care_contact",
    room_restriction: "no_restriction",
  });
  assert.equal(noContact.cannot_participate_in_afternoon_activity, true);
  assert.equal(noContact.requires_protection_before_room_entry, false);
}

// --- Eligible afternoon route → ward-stay false ---
{
  const eligible = deriveMorningVisitDecisionContext({
    can_independently_reach_activity_room: "yes",
    visit_activity_possibility: "no_relevant_restriction",
    room_restriction: "no_restriction",
  });
  assert.equal(eligible.cannot_participate_in_afternoon_activity, false);
  assert.equal(eligible.requires_protection_before_room_entry, false);
}

// --- Protection only for visit_allowed_with_protection ---
{
  for (const value of [
    "no_relevant_restriction",
    "no_non_care_contact",
    "unknown",
    null,
  ] as const) {
    const result = deriveMorningVisitDecisionContext({
      can_independently_reach_activity_room: "yes",
      visit_activity_possibility: value,
      room_restriction: "ward_only",
    });
    assert.equal(result.requires_protection_before_room_entry, false);
  }
}

// --- Volunteer DTO must not expose raw clinical fields ---
{
  assert.doesNotThrow(() =>
    assertVolunteerSafeMorningVisitDto({
      id: "1",
      cannot_participate_in_afternoon_activity: true,
      requires_protection_before_room_entry: false,
    }),
  );

  assert.throws(
    () =>
      assertVolunteerSafeMorningVisitDto({
        id: "1",
        visit_activity_possibility: "visit_allowed_with_protection",
      }),
    /must not expose field: visit_activity_possibility/,
  );

  assert.throws(
    () =>
      assertVolunteerSafeMorningVisitDto({
        isolation_type: "contact",
      }),
    /must not expose field: isolation_type/,
  );
}

console.log("test-morning-visit-decision-context: all checks passed");
