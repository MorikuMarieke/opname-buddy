import type { SupabaseClient } from "@supabase/supabase-js";

import { isEssentialCareContextComplete } from "@/lib/patient-context/completeness";
import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";
import type { PatientContext } from "@/types/patient-context";
import type { Database } from "@/types/database";

type ServerSupabase = SupabaseClient<Database>;

export type DailyBuddyPrerequisiteResult =
  | { ok: true }
  | { ok: false; prerequisite: DailyBuddyPrerequisite };

const CONTEXT_SELECT =
  "mobility_status, transfer_support, fall_risk, requires_supervision, mobility_aid_type, mobility_aid_available, visit_activity_possibility, room_restriction, can_independently_reach_activity_room" as const;

/**
 * Authoritative DailyBuddy gates. Must run before any generation claim,
 * model call, tool execution, or advice persist.
 */
export async function resolveDailyBuddyPrerequisites(
  readClient: ServerSupabase,
  admissionId: string,
  adviceDate: string,
): Promise<DailyBuddyPrerequisiteResult> {
  const { data: checkin, error: checkinError } = await readClient
    .from("patient_checkins")
    .select("id")
    .eq("admission_id", admissionId)
    .eq("check_in_date", adviceDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (checkinError) {
    throw new Error(`Check-in lookup failed: ${checkinError.message}`);
  }

  if (!checkin?.id) {
    return { ok: false, prerequisite: "checkin_required" };
  }

  const { data: context, error: contextError } = await readClient
    .from("patient_context")
    .select(CONTEXT_SELECT)
    .eq("admission_id", admissionId)
    .maybeSingle();

  if (contextError) {
    throw new Error(`Context lookup failed: ${contextError.message}`);
  }

  if (
    !isEssentialCareContextComplete(
      (context as PatientContext | null) ?? null,
    )
  ) {
    return { ok: false, prerequisite: "care_context_incomplete" };
  }

  return { ok: true };
}
