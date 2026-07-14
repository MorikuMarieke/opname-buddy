import { createClient } from "@/lib/supabase/client";
import type { PatientDailyParticipationRow } from "@/types/daily-participation";
import type { AfternoonCategoryValue } from "@/lib/constants/daily-participation";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function getPatientDailyParticipation(
  planDate: string,
): Promise<PatientDailyParticipationRow | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_daily_participation_for_patient",
    { p_plan_date: planDate },
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const row = data?.[0];

  if (!row) {
    return null;
  }

  return {
    plan_date: row.plan_date,
    afternoon_category: row.afternoon_category as AfternoonCategoryValue | null,
    afternoon_title: row.afternoon_title,
    participant_message: row.participant_message,
    updated_at: row.updated_at,
  };
}
