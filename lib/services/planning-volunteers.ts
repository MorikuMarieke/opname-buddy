import { createClient } from "@/lib/supabase/client";
import type { PlanningVolunteerListItem } from "@/types/activity";

function getSupabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listPlanningVolunteers(): Promise<PlanningVolunteerListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_planning_volunteers");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
  }));
}
