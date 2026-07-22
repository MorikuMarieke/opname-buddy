import { canConsiderAfternoonGroupRoute } from "@/lib/ai/participation-advice-policy";

/** Narrow care-context inputs used only for volunteer-safe derivation. */
export interface MorningVisitDecisionContextInput {
  can_independently_reach_activity_room?: string | null;
  visit_activity_possibility?: string | null;
  room_restriction?: string | null;
}

export interface MorningVisitDecisionContext {
  cannot_participate_in_afternoon_activity: boolean;
  requires_protection_before_room_entry: boolean;
}

/**
 * Derive volunteer-facing decision flags from narrow care-context fields.
 * Uses the same afternoon-route rules as DailyBuddy; does not expose raw enums.
 */
export function deriveMorningVisitDecisionContext(
  input: MorningVisitDecisionContextInput,
): MorningVisitDecisionContext {
  const cannotParticipate = !canConsiderAfternoonGroupRoute({
    access: input.can_independently_reach_activity_room,
    visitActivityPossibility: input.visit_activity_possibility,
    roomRestriction: input.room_restriction,
  });

  return {
    cannot_participate_in_afternoon_activity: cannotParticipate,
    requires_protection_before_room_entry:
      input.visit_activity_possibility === "visit_allowed_with_protection",
  };
}

/** Ensure volunteer DTO never carries raw clinical care-context fields. */
export function assertVolunteerSafeMorningVisitDto(dto: Record<string, unknown>): void {
  const forbidden = [
    "visit_activity_possibility",
    "can_independently_reach_activity_room",
    "room_restriction",
    "isolation_type",
    "mobility_status",
    "fall_risk",
    "notes",
    "additional_attention_points",
  ];

  for (const key of forbidden) {
    if (key in dto) {
      throw new Error(`Volunteer DTO must not expose field: ${key}`);
    }
  }
}
