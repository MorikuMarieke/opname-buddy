/**
 * Deterministic DailyBuddy gates evaluated before any generation claim.
 * Distinct from advice status (ready | generating | failed | stale).
 */
export type DailyBuddyPrerequisite =
  | "checkin_required"
  | "care_context_incomplete";

export const DAILY_BUDDY_PREREQUISITES = [
  "checkin_required",
  "care_context_incomplete",
] as const satisfies readonly DailyBuddyPrerequisite[];

export function isDailyBuddyPrerequisite(
  value: unknown,
): value is DailyBuddyPrerequisite {
  return (
    value === "checkin_required" || value === "care_context_incomplete"
  );
}
