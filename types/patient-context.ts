import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type PatientContext = Tables<"patient_context">;
export type PatientContextInsert = TablesInsert<"patient_context">;
export type PatientContextUpdate = TablesUpdate<"patient_context">;

/** Patient context row with resolved caregiver display name for audit UI. */
export type PatientContextWithAudit = PatientContext & {
  updatedByName: string | null;
};

export type MobilityStatus =
  | "unknown"
  | "bed_bound"
  | "chair_only"
  | "wheelchair"
  | "walking_independent"
  | "walking_with_aid"
  | "walking_with_assistance";

export type TransferSupport =
  | "unknown"
  | "none"
  | "one_person"
  | "two_person"
  | "lift";

export type FallRisk = "unknown" | "low" | "medium" | "high";

export type GuidanceLevel = "unknown" | "not_required" | "required";

export type MobilityAidType =
  | "unknown"
  | "cane"
  | "walker"
  | "wheelchair"
  | "own_aid"
  | "other";

export type MobilityAidAvailable = "unknown" | "yes" | "no";

export type ActivityRoomAccess = "unknown" | "yes" | "no";

export type IsolationType =
  | "unknown"
  | "none"
  | "contact"
  | "droplet"
  | "airborne"
  | "strict"
  | "protective";

export type MovementFreedom =
  | "unknown"
  | "room_only"
  | "ward_only"
  | "no_restriction";

export type AttentionPoint =
  | "iv_pump"
  | "oxygen"
  | "catheter"
  | "wound_or_drain"
  | "post_surgery"
  | "fatigue"
  | "wandering_risk"
  | "language_barrier"
  | "cognitive_support"
  | "hearing_support"
  | "vision_support"
  | "communication_support"
  | "other";

export type CompletenessLevel = "complete" | "insufficient";

export const UNKNOWN_OPTION = "unknown" as const;

export const MOBILITY_STATUS_LABELS: Record<MobilityStatus, string> = {
  unknown: "Onbekend",
  bed_bound: "Bedgebonden",
  chair_only: "Alleen stoel",
  wheelchair: "Rolstoel",
  walking_independent: "Lopen zelfstandig",
  walking_with_aid: "Lopen met loophulpmiddel",
  walking_with_assistance: "Lopen met begeleiding",
};

export const TRANSFER_SUPPORT_LABELS: Record<TransferSupport, string> = {
  unknown: "Onbekend",
  none: "Geen",
  one_person: "Eén persoon",
  two_person: "Twee personen",
  lift: "Tillift",
};

export const FALL_RISK_LABELS: Record<FallRisk, string> = {
  unknown: "Onbekend",
  low: "Laag",
  medium: "Gemiddeld",
  high: "Hoog",
};

export const GUIDANCE_LEVEL_LABELS: Record<GuidanceLevel, string> = {
  unknown: "Onbekend",
  not_required: "Niet nodig",
  required: "Verplicht",
};

export const MOBILITY_AID_TYPE_LABELS: Record<MobilityAidType, string> = {
  unknown: "Onbekend",
  cane: "Wandelstok",
  walker: "Rollator",
  wheelchair: "Rolstoel",
  own_aid: "Eigen hulpmiddel",
  other: "Overig",
};

export const MOBILITY_AID_AVAILABLE_LABELS: Record<MobilityAidAvailable, string> =
  {
    unknown: "Onbekend",
    yes: "Ja",
    no: "Nee",
  };

export const ACTIVITY_ROOM_ACCESS_LABELS: Record<ActivityRoomAccess, string> = {
  unknown: "Onbekend",
  yes: "Ja, zelfstandig",
  no: "Nee",
};

export const ISOLATION_TYPE_LABELS: Record<IsolationType, string> = {
  unknown: "Onbekend",
  none: "Geen",
  contact: "Contact",
  droplet: "Druppel",
  airborne: "Luchtwegen",
  strict: "Strikt",
  protective: "Beschermend",
};

export const MOVEMENT_FREEDOM_LABELS: Record<MovementFreedom, string> = {
  unknown: "Onbekend",
  room_only: "Alleen kamer",
  ward_only: "Alleen afdeling",
  no_restriction: "Geen beperkingen",
};

export const ATTENTION_POINT_LABELS: Record<AttentionPoint, string> = {
  iv_pump: "Infuus / pomp",
  oxygen: "Zuurstof",
  catheter: "Katheter",
  wound_or_drain: "Wond / drain",
  post_surgery: "Postoperatief",
  fatigue: "Vermoeidheid",
  wandering_risk: "Dwaalrisico",
  language_barrier: "Taalbarrière",
  cognitive_support: "Cognitieve ondersteuning",
  hearing_support: "Gehoorbeperking",
  vision_support: "Zichtbeperking",
  communication_support: "Communicatieondersteuning",
  other: "Overig",
};

export const ATTENTION_POINT_OPTIONS: {
  value: AttentionPoint;
  label: string;
}[] = (
  Object.entries(ATTENTION_POINT_LABELS) as [AttentionPoint, string][]
).map(([value, label]) => ({ value, label }));

export const PATIENT_CONTEXT_FIELD_LABELS: Record<string, string> = {
  mobility_status: "Mobiliteit",
  transfer_support: "Transferondersteuning",
  fall_risk: "Valrisico",
  requires_supervision: "Begeleiding",
  mobility_aid_type: "Type loophulpmiddel",
  mobility_aid_available: "Loophulpmiddel beschikbaar",
  isolation_type: "Isolatietype",
  room_restriction: "Bewegingsvrijheid",
  can_independently_reach_activity_room: "Activiteitenruimte zelfstandig bereiken",
  notes: "Notities",
};

export const CRITICAL_CONTEXT_FIELDS = [
  "mobility_status",
  "transfer_support",
  "fall_risk",
  "requires_supervision",
  "isolation_type",
  "room_restriction",
  "can_independently_reach_activity_room",
] as const;

export type CriticalContextField = (typeof CRITICAL_CONTEXT_FIELDS)[number];

export function enumOptionsWithUnknown<T extends string>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  const entries = Object.entries(labels) as [T, string][];
  const unknownEntry = entries.find(([value]) => value === "unknown");
  const rest = entries.filter(([value]) => value !== "unknown");
  return [
    ...(unknownEntry ? [{ value: unknownEntry[0], label: unknownEntry[1] }] : []),
    ...rest.map(([value, label]) => ({ value, label })),
  ];
}

export const MOBILITY_STATUS_OPTIONS = enumOptionsWithUnknown(MOBILITY_STATUS_LABELS);
export const TRANSFER_SUPPORT_OPTIONS = enumOptionsWithUnknown(TRANSFER_SUPPORT_LABELS);
export const FALL_RISK_OPTIONS = enumOptionsWithUnknown(FALL_RISK_LABELS);
export const GUIDANCE_LEVEL_OPTIONS = enumOptionsWithUnknown(GUIDANCE_LEVEL_LABELS);
export const MOBILITY_AID_TYPE_OPTIONS = enumOptionsWithUnknown(MOBILITY_AID_TYPE_LABELS);
export const MOBILITY_AID_AVAILABLE_OPTIONS = enumOptionsWithUnknown(
  MOBILITY_AID_AVAILABLE_LABELS,
);
export const ACTIVITY_ROOM_ACCESS_OPTIONS = enumOptionsWithUnknown(
  ACTIVITY_ROOM_ACCESS_LABELS,
);
export const ISOLATION_TYPE_OPTIONS = enumOptionsWithUnknown(ISOLATION_TYPE_LABELS);
export const MOVEMENT_FREEDOM_OPTIONS = enumOptionsWithUnknown(MOVEMENT_FREEDOM_LABELS);
