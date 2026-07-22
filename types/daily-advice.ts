import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type DailyAdvice = Tables<"daily_advice">;
export type DailyAdviceInsert = TablesInsert<"daily_advice">;
export type DailyAdviceUpdate = TablesUpdate<"daily_advice">;

export type MorningVolunteerVisitRequest =
  Tables<"morning_volunteer_visit_requests">;
export type MorningVolunteerVisitRequestInsert =
  TablesInsert<"morning_volunteer_visit_requests">;
export type MorningVolunteerVisitRequestUpdate =
  TablesUpdate<"morning_volunteer_visit_requests">;

export type AdviceStatus =
  | "generating"
  | "ready"
  | "failed"
  | "stale"
  | "superseded";

export type AdviceGenerationKind = "standard" | "dev_iteration";

export type AdvicePrimaryOutcome =
  | "rest"
  | "morning_volunteer_visit"
  | "afternoon_group_activity"
  | "awaiting_afternoon_programme";

export type AfternoonGroupInterestSignal =
  Tables<"afternoon_group_interest_signals">;

export type AfternoonInterestStatus = "interested" | "withdrawn";

export interface AfternoonInterestListItem {
  id: string;
  admission_id: string;
  interest_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient_display_name: string;
  room_number: string | null;
}

export type AdviceAfternoonStatus =
  | "pending_plan"
  | "recommended"
  | "not_recommended"
  | "none"
  | "informational";

export type ActivityRoomAccess = "unknown" | "yes" | "no";

export type VisitRequestStatus = "requested" | "cancelled";

export interface MorningVisitRequestListItem {
  id: string;
  admission_id: string;
  request_date: string;
  block: string;
  patient_message: string | null;
  inspiration_ids: string[];
  status: string;
  created_at: string;
  patient_display_name: string;
  room_number: string | null;
  /** Derived: afternoon group route is blocked by care-context policy. */
  cannot_participate_in_afternoon_activity: boolean;
  /** Derived: visit_activity_possibility requires protection on ward visit. */
  requires_protection_before_room_entry: boolean;
}

export const ADVICE_PRIMARY_OUTCOME_LABELS: Record<
  AdvicePrimaryOutcome,
  string
> = {
  rest: "Rust",
  morning_volunteer_visit: "Bezoek op de afdeling (ochtend)",
  afternoon_group_activity: "Middag groepsactiviteit",
  awaiting_afternoon_programme: "Middagactiviteit",
};

export const ACTIVITY_ROOM_ACCESS_LABELS: Record<ActivityRoomAccess, string> = {
  unknown: "Onbekend",
  yes: "Ja, zelfstandig",
  no: "Nee",
};
