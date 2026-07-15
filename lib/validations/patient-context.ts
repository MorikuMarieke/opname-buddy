import { z } from "zod";

import type { AttentionPoint, PatientContext } from "@/types/patient-context";

const mobilityStatusSchema = z.enum([
  "unknown",
  "bed_bound",
  "chair_only",
  "wheelchair",
  "walking_independent",
  "walking_with_aid",
  "walking_with_assistance",
]);

const transferSupportSchema = z.enum([
  "unknown",
  "none",
  "one_person",
  "two_person",
  "lift",
]);

const fallRiskSchema = z.enum(["unknown", "low", "medium", "high"]);

const guidanceLevelSchema = z.enum(["unknown", "not_required", "required"]);

const mobilityAidTypeSchema = z.enum([
  "unknown",
  "cane",
  "walker",
  "wheelchair",
  "own_aid",
  "other",
]);

const mobilityAidAvailableSchema = z.enum(["unknown", "yes", "no"]);

const activityRoomAccessSchema = z.enum(["unknown", "yes", "no"]);

const isolationTypeSchema = z.enum([
  "unknown",
  "none",
  "contact",
  "droplet",
  "airborne",
  "strict",
  "protective",
]);

const movementFreedomSchema = z.enum([
  "unknown",
  "room_only",
  "ward_only",
  "no_restriction",
]);

const attentionPointSchema = z.enum([
  "iv_pump",
  "oxygen",
  "catheter",
  "wound_or_drain",
  "post_surgery",
  "fatigue",
  "wandering_risk",
  "language_barrier",
  "cognitive_support",
  "hearing_support",
  "vision_support",
  "communication_support",
  "other",
]);

export const patientContextFormSchema = z.object({
  mobility_status: mobilityStatusSchema,
  transfer_support: transferSupportSchema,
  fall_risk: fallRiskSchema,
  requires_supervision: guidanceLevelSchema,
  mobility_aid_type: mobilityAidTypeSchema,
  mobility_aid_available: mobilityAidAvailableSchema,
  isolation_type: isolationTypeSchema,
  room_restriction: movementFreedomSchema,
  can_independently_reach_activity_room: activityRoomAccessSchema,
  additional_attention_points: z.array(attentionPointSchema),
  additional_attention_notes: z.string(),
  notes: z.string(),
});

export type PatientContextFormValues = z.infer<typeof patientContextFormSchema>;

export const defaultPatientContextFormValues: PatientContextFormValues = {
  mobility_status: "unknown",
  transfer_support: "unknown",
  fall_risk: "unknown",
  requires_supervision: "unknown",
  mobility_aid_type: "unknown",
  mobility_aid_available: "unknown",
  isolation_type: "unknown",
  room_restriction: "unknown",
  can_independently_reach_activity_room: "unknown",
  additional_attention_points: [],
  additional_attention_notes: "",
  notes: "",
};

export function toFormValues(
  context: PatientContext | null,
): PatientContextFormValues {
  if (!context) {
    return defaultPatientContextFormValues;
  }

  return {
    mobility_status: context.mobility_status as PatientContextFormValues["mobility_status"],
    transfer_support: context.transfer_support as PatientContextFormValues["transfer_support"],
    fall_risk: context.fall_risk as PatientContextFormValues["fall_risk"],
    requires_supervision:
      context.requires_supervision as PatientContextFormValues["requires_supervision"],
    mobility_aid_type:
      context.mobility_aid_type as PatientContextFormValues["mobility_aid_type"],
    mobility_aid_available:
      context.mobility_aid_available as PatientContextFormValues["mobility_aid_available"],
    isolation_type:
      context.isolation_type as PatientContextFormValues["isolation_type"],
    room_restriction:
      context.room_restriction as PatientContextFormValues["room_restriction"],
    can_independently_reach_activity_room:
      (context.can_independently_reach_activity_room as PatientContextFormValues["can_independently_reach_activity_room"]) ??
      "unknown",
    additional_attention_points:
      context.additional_attention_points as AttentionPoint[],
    additional_attention_notes: context.additional_attention_notes ?? "",
    notes: context.notes ?? "",
  };
}
