import { createClient } from "@/lib/supabase/client";
import { getActiveAdmissionId } from "@/lib/services/admissions";
import { getPatientContextCompleteness } from "@/lib/patient-context/completeness";
import { resetAidFieldsWhenHidden } from "@/lib/patient-context/mobility-aid";
import type { PatientContextFormValues } from "@/lib/validations/patient-context";
import type { PatientSex } from "@/types/clinical-patient";
import type {
  CompletenessLevel,
  PatientContext,
  PatientContextWithAudit,
} from "@/types/patient-context";

export interface CarePatientSummary {
  /** Clinical patient id (patients.id) — the caregiver route key. */
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: PatientSex | null;
  /** Active admission for this patient, if any. */
  admission_id: string | null;
  expected_discharge_on: string | null;
  /** Linked login account (profiles.id), if the patient has one yet. */
  user_id: string | null;
  /** Clinical record creation time (`patients.created_at`), when available. */
  created_at: string | null;
  /**
   * Zorgcontext completeness for the active admission.
   * `null` when the patient has no active admission (no context to evaluate).
   */
  context_completeness: CompletenessLevel | null;
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
  admissionId: string,
  input: PatientContextFormValues,
  updatedBy: string,
) {
  const values = normalizeFormValues(input);

  return {
    admission_id: admissionId,
    mobility_status: values.mobility_status,
    transfer_support: values.transfer_support,
    fall_risk: values.fall_risk,
    requires_supervision: values.requires_supervision,
    mobility_aid_type: values.mobility_aid_type,
    mobility_aid_available: values.mobility_aid_available,
    visit_activity_possibility: values.visit_activity_possibility,
    room_restriction: values.room_restriction,
    can_independently_reach_activity_room:
      values.can_independently_reach_activity_room,
    additional_attention_points: values.additional_attention_points,
    additional_attention_notes: values.additional_attention_notes || null,
    notes: values.notes || null,
    updated_by_staff_id: updatedBy,
  };
}

/**
 * Patient-facing read of their own Zorgcontext. Resolves the caller's active
 * admission and reads the context scoped to it (admission ownership model).
 * Returns null when the account has no active admission or no context yet.
 */
export async function getOwnPatientContext(): Promise<PatientContextWithAudit | null> {
  const admissionId = await getActiveAdmissionId();

  if (!admissionId) {
    return null;
  }

  return getPatientContextByAdmission(admissionId);
}

/**
 * Caregiver-facing read of a patient's Zorgcontext, scoped by the owning
 * admission (Phase 2 ownership model) instead of the login account.
 */
export async function getPatientContextByAdmission(
  admissionId: string,
): Promise<PatientContextWithAudit | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_context")
    .select("*, updater:profiles!patient_context_updated_by_staff_id_fkey(full_name)")
    .eq("admission_id", admissionId)
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

/**
 * Caregiver upsert of a patient's Zorgcontext, keyed by the owning admission.
 * The row is matched/created by `admission_id` (the sole ownership key).
 * `updated_by_staff_id` records the acting staff account. `patientUserId` is still
 * required so context is only saved for patients that have a linked account.
 */
export async function upsertPatientContextByAdmission(
  admissionId: string,
  patientUserId: string | null,
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

  if (!patientUserId) {
    throw new Error(
      "Deze patiënt heeft nog geen gekoppeld account. Zorgcontext kan nog niet worden opgeslagen.",
    );
  }

  const payload = toDbPayload(admissionId, input, user.id);

  const { data: existing, error: existingError } = await supabase
    .from("patient_context")
    .select("id")
    .eq("admission_id", admissionId)
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

const CONTEXT_COMPLETENESS_SELECT =
  "admission_id, mobility_status, transfer_support, fall_risk, requires_supervision, visit_activity_possibility, room_restriction, can_independently_reach_activity_room, mobility_aid_available" as const;

async function listContextCompletenessByAdmissionIds(
  admissionIds: string[],
): Promise<Map<string, CompletenessLevel>> {
  const completenessByAdmission = new Map<string, CompletenessLevel>();

  if (admissionIds.length === 0) {
    return completenessByAdmission;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("patient_context")
    .select(CONTEXT_COMPLETENESS_SELECT)
    .in("admission_id", admissionIds);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const contextByAdmission = new Map(
    (data ?? []).map((row) => [row.admission_id, row as PatientContext]),
  );

  for (const admissionId of admissionIds) {
    completenessByAdmission.set(
      admissionId,
      getPatientContextCompleteness(
        contextByAdmission.get(admissionId) ?? null,
      ).level,
    );
  }

  return completenessByAdmission;
}

export async function listPatientsForCare(): Promise<CarePatientSummary[]> {
  const supabase = createClient();

  // list_care_patients() returns clinical patients (patients table) with their
  // active admission and linked account. It runs SECURITY DEFINER so it can
  // resolve links/admissions the caregiver cannot read row-by-row.
  // created_at is read separately via caregiver SELECT on patients (no RPC change).
  const [listResult, createdAtResult] = await Promise.all([
    supabase.rpc("list_care_patients"),
    supabase.from("patients").select("id, created_at"),
  ]);

  if (listResult.error) {
    throw new Error(getSupabaseErrorMessage(listResult.error));
  }

  if (createdAtResult.error) {
    throw new Error(getSupabaseErrorMessage(createdAtResult.error));
  }

  const rows = listResult.data ?? [];
  const createdAtById = new Map(
    (createdAtResult.data ?? []).map((row) => [row.id, row.created_at]),
  );

  const admissionIds = [
    ...new Set(
      rows
        .map((row) => row.admission_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const completenessByAdmission =
    await listContextCompletenessByAdmissionIds(admissionIds);

  return rows.map((row) => ({
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    birth_date: row.birth_date,
    sex: row.sex as CarePatientSummary["sex"],
    admission_id: row.admission_id,
    expected_discharge_on: row.expected_discharge_on,
    user_id: row.user_id,
    created_at: createdAtById.get(row.id) ?? null,
    context_completeness: row.admission_id
      ? (completenessByAdmission.get(row.admission_id) ?? "insufficient")
      : null,
  }));
}
