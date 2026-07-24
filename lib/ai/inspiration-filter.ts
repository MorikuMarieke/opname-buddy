/**
 * Deterministic inspiration filtering from caregiver care context.
 * Movement ideas fail closed when context is missing, unknown, or restrictive.
 */

import {
  VISIT_INSPIRATIONS,
  type VisitInspiration,
} from "@/lib/constants/visit-inspirations";

export interface InspirationCareContext {
  mobility_status?: string | null;
  transfer_support?: string | null;
  fall_risk?: string | null;
  room_restriction?: string | null;
  visit_activity_possibility?: string | null;
  mobility_aid_available?: string | null;
  can_independently_reach_activity_room?: string | null;
  requires_supervision?: string | null;
}

const RESTRICTIVE_MOBILITY = new Set([
  "unknown",
  "bed_bound",
  "chair_only",
  "wheelchair",
  "walking_with_assistance",
]);

const RESTRICTIVE_TRANSFER = new Set(["unknown", "one_person", "two_person", "lift"]);

const RESTRICTIVE_FALL = new Set(["unknown", "medium", "high"]);

const RESTRICTIVE_ROOM = new Set(["unknown", "room_only"]);

/**
 * Movement inspirations are only allowed when care context clearly supports
 * light independent movement on the ward. Fail closed otherwise.
 */
export function movementInspirationsAllowed(
  context: InspirationCareContext | null | undefined,
): boolean {
  if (!context) {
    return false;
  }

  const mobility = context.mobility_status ?? "unknown";
  const transfer = context.transfer_support ?? "unknown";
  const fallRisk = context.fall_risk ?? "unknown";
  const room = context.room_restriction ?? "unknown";
  const visitPossibility = context.visit_activity_possibility ?? "unknown";
  const aid = context.mobility_aid_available ?? "unknown";
  const roomAccess = context.can_independently_reach_activity_room ?? "unknown";
  const supervision = context.requires_supervision ?? "unknown";

  if (RESTRICTIVE_MOBILITY.has(mobility)) {
    return false;
  }

  if (mobility === "walking_with_aid" && aid !== "yes") {
    return false;
  }

  if (RESTRICTIVE_TRANSFER.has(transfer) && transfer !== "none") {
    return false;
  }

  if (RESTRICTIVE_FALL.has(fallRisk)) {
    return false;
  }

  if (RESTRICTIVE_ROOM.has(room)) {
    return false;
  }

  // Fail closed when visit/activity is unknown or all non-care contact is blocked.
  // visit_allowed_with_protection does not by itself clear on-ward social inspirations.
  if (
    visitPossibility === "unknown" ||
    visitPossibility === "no_non_care_contact"
  ) {
    return false;
  }

  if (supervision === "required" || supervision === "unknown") {
    return false;
  }

  // Independent corridor/ward movement still requires clear non-blocked room freedom.
  // Activity-room access itself does not unlock corridor walks, but unknown access is a caution signal.
  if (roomAccess === "no") {
    return false;
  }

  return mobility === "walking_independent" || mobility === "walking_with_aid";
}

export function getAllowedVisitInspirations(
  context: InspirationCareContext | null | undefined,
): VisitInspiration[] {
  const allowMovement = movementInspirationsAllowed(context);

  return VISIT_INSPIRATIONS.filter((item) => {
    if (item.category === "movement") {
      return allowMovement;
    }

    // Social / creative / relaxation stay available unless visits are fully blocked —
    // no_non_care_contact clears inspirations via policy; quiet bedside social remains allowed under protection.
    return true;
  });
}

export function getAllowedVisitInspirationIds(
  context: InspirationCareContext | null | undefined,
): string[] {
  return getAllowedVisitInspirations(context).map((item) => item.id);
}

/** Keep only IDs in the patient-specific allowed set (never global library alone). */
export function filterInspirationIdsForPatient(
  ids: string[],
  context: InspirationCareContext | null | undefined,
): string[] {
  const allowed = new Set(getAllowedVisitInspirationIds(context));
  const unique: string[] = [];

  for (const id of ids) {
    if (allowed.has(id) && !unique.includes(id)) {
      unique.push(id);
    }
  }

  return unique.slice(0, 4);
}

export function formatInspirationCatalogForPrompt(
  inspirations: VisitInspiration[],
): string {
  if (inspirations.length === 0) {
    return "(geen inspiratie-items beschikbaar voor deze patiënt)";
  }

  return inspirations
    .map((item) => `- ${item.id} (${item.category}): ${item.labelNl}`)
    .join("\n");
}
