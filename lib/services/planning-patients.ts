import { createClient } from "@/lib/supabase/client";
import type { PlanningPatientListItem } from "@/types/activity";

function getSupabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listPlanningPatients(): Promise<PlanningPatientListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_planning_patients");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    admissionId: row.admission_id,
    patientDisplayName: row.patient_display_name,
    departmentId: row.department_id,
    departmentName: row.department_name,
    roomNumber: row.room_number,
  }));
}
