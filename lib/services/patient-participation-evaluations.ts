import { getActiveAdmissionId } from "@/lib/services/admissions";
import { createClient } from "@/lib/supabase/client";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { PatientParticipationEvaluationFormValues } from "@/lib/validations/patient-participation-evaluation";
import type { PatientParticipationEvaluation } from "@/types/patient";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.message.includes("does not exist") ||
    error.code === "42P01"
  ) {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  if (error.code === "23503") {
    return "Je profiel is niet gevonden. Log uit en opnieuw in, of neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listEvaluationsForDate(
  date: string,
): Promise<PatientParticipationEvaluation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_participation_evaluations")
    .select("*")
    .eq("evaluation_date", date)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data ?? [];
}

export async function getTodayEvaluations(): Promise<PatientParticipationEvaluation[]> {
  return listEvaluationsForDate(getAmsterdamDateString());
}

export async function getRecentEvaluations(
  limit = 7,
): Promise<PatientParticipationEvaluation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_participation_evaluations")
    .select("*")
    .order("evaluation_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data ?? [];
}

export async function createParticipationEvaluation(
  input: PatientParticipationEvaluationFormValues,
): Promise<PatientParticipationEvaluation> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const admissionId = await getActiveAdmissionId();

  const { data, error } = await supabase
    .from("patient_participation_evaluations")
    .insert({
      patient_id: user.id,
      admission_id: admissionId,
      evaluation_date: input.evaluation_date,
      activity_title: input.activity_title,
      activity_session_id: input.activity_session_id ?? null,
      status: input.status,
      reason: input.reason?.trim() ? input.reason.trim() : null,
      effort_score: input.effort_score,
      after_feeling_score: input.after_feeling_score,
      notes: input.notes?.trim() ? input.notes.trim() : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function updateParticipationEvaluation(
  id: string,
  input: PatientParticipationEvaluationFormValues,
): Promise<PatientParticipationEvaluation> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_participation_evaluations")
    .update({
      evaluation_date: input.evaluation_date,
      activity_title: input.activity_title,
      activity_session_id: input.activity_session_id ?? null,
      status: input.status,
      reason: input.reason?.trim() ? input.reason.trim() : null,
      effort_score: input.effort_score,
      after_feeling_score: input.after_feeling_score,
      notes: input.notes?.trim() ? input.notes.trim() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}
