import { getActiveAdmissionId } from "@/lib/services/admissions";
import { createClient } from "@/lib/supabase/client";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { PatientCheckinFormValues } from "@/lib/validations/patient-checkin";
import type { PatientCheckin } from "@/types/patient";

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

export async function getCheckInForDate(
  date: string,
): Promise<PatientCheckin | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_checkins")
    .select("*")
    .eq("check_in_date", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function getTodayCheckIn(): Promise<PatientCheckin | null> {
  return getCheckInForDate(getAmsterdamDateString());
}

export async function getRecentCheckIns(
  limit = 7,
): Promise<PatientCheckin[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_checkins")
    .select("*")
    .order("check_in_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data ?? [];
}

export async function createCheckIn(
  input: PatientCheckinFormValues,
): Promise<PatientCheckin> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const admissionId = await getActiveAdmissionId();

  if (!admissionId) {
    throw new Error(
      "Er is nog geen actieve opname voor je account. Neem contact op met je zorgteam.",
    );
  }

  const { data, error } = await supabase
    .from("patient_checkins")
    .insert({
      admission_id: admissionId,
      check_in_date: input.check_in_date,
      pain_score: input.pain_score,
      energy_level: input.energy_level,
      mood: input.mood,
      mobility_level: input.mobility_level,
      motivation_score: input.motivation_score,
      symptoms: input.symptoms,
      note: input.note?.trim() ? input.note.trim() : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function updateCheckIn(
  id: string,
  input: PatientCheckinFormValues,
): Promise<PatientCheckin> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_checkins")
    .update({
      check_in_date: input.check_in_date,
      pain_score: input.pain_score,
      energy_level: input.energy_level,
      mood: input.mood,
      mobility_level: input.mobility_level,
      motivation_score: input.motivation_score,
      symptoms: input.symptoms,
      note: input.note?.trim() ? input.note.trim() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}
