import { createClient } from "@/lib/supabase/client";
import type { PatientActivitySessionListItem } from "@/types/activity";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met je zorgteam.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listPatientActivitySessions(): Promise<
  PatientActivitySessionListItem[]
> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_patient_activity_sessions");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    sessionId: row.session_id,
    activityTitle: row.activity_title,
    activityDescription: row.activity_description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    facilitatorNames: row.facilitator_names,
  }));
}
