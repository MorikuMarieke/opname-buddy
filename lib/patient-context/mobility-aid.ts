import type { MobilityStatus } from "@/types/patient-context";

export const MOBILITY_STATUSES_REQUIRING_AID = [
  "walking_with_aid",
  "wheelchair",
] as const satisfies readonly MobilityStatus[];

export function mobilityStatusRequiresAid(status: MobilityStatus): boolean {
  return (MOBILITY_STATUSES_REQUIRING_AID as readonly string[]).includes(status);
}

export function mobilityStatusShowsAidFields(status: MobilityStatus): boolean {
  return mobilityStatusRequiresAid(status);
}

export function resetAidFieldsWhenHidden(status: MobilityStatus): {
  mobility_aid_type: "unknown";
  mobility_aid_available: "unknown";
} | null {
  if (mobilityStatusShowsAidFields(status)) {
    return null;
  }

  return {
    mobility_aid_type: "unknown",
    mobility_aid_available: "unknown",
  };
}
