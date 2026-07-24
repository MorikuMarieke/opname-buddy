import { createClient } from "@/lib/supabase/client";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { getActiveAdmissionId } from "@/lib/services/admissions";
import type {
  AfternoonGroupInterestSignal,
  AfternoonInterestListItem,
} from "@/types/daily-advice";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function getOwnAfternoonInterest(
  interestDate = getAmsterdamDateString(),
): Promise<AfternoonGroupInterestSignal | null> {
  const supabase = createClient();
  const admissionId = await getActiveAdmissionId();

  if (!admissionId) {
    return null;
  }

  const { data, error } = await supabase
    .from("afternoon_group_interest_signals")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("interest_date", interestDate)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function listAfternoonInterestForDate(
  interestDate = getAmsterdamDateString(),
): Promise<AfternoonInterestListItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "list_afternoon_group_interest_signals",
    { p_interest_date: interestDate },
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    admission_id: row.admission_id,
    interest_date: row.interest_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    patient_display_name: row.patient_display_name,
    room_number: row.room_number,
  }));
}

export async function countAfternoonInterestForDate(
  interestDate = getAmsterdamDateString(),
): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "count_afternoon_group_interest_signals",
    { p_interest_date: interestDate },
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return typeof data === "number" ? data : 0;
}
