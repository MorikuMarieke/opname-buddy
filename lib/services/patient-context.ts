import { createClient } from "@/lib/supabase/client";
import { resetAidFieldsWhenHidden } from "@/lib/patient-context/mobility-aid";
import type { PatientContextFormValues } from "@/lib/validations/patient-context";
import type {
  PatientContext,
  PatientContextWithAudit,
} from "@/types/patient-context";

export interface CarePatientSummary {
  id: string;
  full_name: string | null;
}

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

function normalizeFormValues(input: PatientContextFormValues): PatientContextFormValues {
  const aidReset = resetAidFieldsWhenHidden(input.mobility_status);

  return {
    ...input,
    ...(aidReset ?? {}),
    additional_attention_notes: input.additional_attention_notes.trim()
      ? input.additional_attention_notes.trim()
      : "",
    notes: input.notes.trim() ? input.notes.trim() : "",
  };
}

function toDbPayload(
  patientId: string,
  input: PatientContextFormValues,
  updatedBy: string,
) {
  const values = normalizeFormValues(input);

  return {
    patient_id: patientId,
    mobility_status: values.mobility_status,
    transfer_support: values.transfer_support,
    fall_risk: values.fall_risk,
    requires_supervision: values.requires_supervision,
    mobility_aid_type: values.mobility_aid_type,
    mobility_aid_available: values.mobility_aid_available,
    isolation_type: values.isolation_type,
    room_restriction: values.room_restriction,
    additional_attention_points: values.additional_attention_points,
    additional_attention_notes: values.additional_attention_notes || null,
    notes: values.notes || null,
    updated_by: updatedBy,
  };
}

export async function getPatientContext(
  patientId: string,
): Promise<PatientContextWithAudit | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_context")
    .select("*, updater:profiles!patient_context_updated_by_fkey(full_name)")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  const { updater, ...context } = data;
  const updatedByName = updater?.full_name?.trim() || null;

  return {
    ...context,
    updatedByName,
  };
}

export async function getOwnPatientContext(): Promise<PatientContextWithAudit | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  return getPatientContext(user.id);
}

export async function upsertPatientContext(
  patientId: string,
  input: PatientContextFormValues,
): Promise<PatientContext> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const payload = toDbPayload(patientId, input, user.id);

  const { data: existing, error: existingError } = await supabase
    .from("patient_context")
    .select("id")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existingError) {
    throw new Error(getSupabaseErrorMessage(existingError));
  }

  if (existing) {
    const { data, error } = await supabase
      .from("patient_context")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error));
    }

    return data;
  }

  const { data, error } = await supabase
    .from("patient_context")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function listPatientsForCare(): Promise<CarePatientSummary[]> {
  const supabase = createClient();

  // Must use the list_care_patients() RPC: profiles RLS also exposes staff/self
  // to caregivers (for name resolution), and user_roles RLS hides other users'
  // roles, so patient-role filtering can only be done safely in the database.
  const { data, error } = await supabase.rpc("list_care_patients");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data ?? [];
}
