import { createClient } from "@/lib/supabase/client";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { normalizeName } from "@/lib/utils/patient-greeting";
import type {
  AdmissionInput,
  AdmissionWithDepartment,
  ClinicalPatient,
  PatientDemographicMatch,
  PatientDemographicsInput,
  PatientMatchTier,
} from "@/types/clinical-patient";
import type { Admission, Patient } from "@/types/database";

type AdmissionRowWithDepartment = Admission & {
  departments: { name: string } | null;
};

function mapAdmissionWithDepartment(
  row: AdmissionRowWithDepartment,
): AdmissionWithDepartment {
  const { departments, ...admission } = row;

  return {
    ...admission,
    departmentName: departments?.name ?? null,
  };
}

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.code === "23505") {
    return "Deze patiënt heeft al een actieve opname.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function classifyMatchTier(
  patientBirthDate: string | null,
  formBirthDate: string | null | undefined,
): PatientMatchTier {
  if (!formBirthDate || !patientBirthDate) {
    return "possible";
  }

  return patientBirthDate === formBirthDate ? "strong" : "possible";
}

export async function getPatientById(patientId: string): Promise<ClinicalPatient | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function getActiveAdmissionForPatient(
  patientId: string,
): Promise<AdmissionWithDepartment | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("admissions")
    .select("*, departments(name)")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .order("admitted_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data ? mapAdmissionWithDepartment(data as AdmissionRowWithDepartment) : null;
}

export async function searchPatientsByDemographics(input: {
  firstName: string;
  lastName: string;
  birthDate?: string | null;
}): Promise<PatientDemographicMatch[]> {
  const supabase = createClient();
  const first = normalizeName(input.firstName);
  const last = normalizeName(input.lastName);

  if (first.length < 2 || last.length < 2) {
    return [];
  }

  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, birth_date, sex")
    .ilike("first_name", input.firstName.trim())
    .ilike("last_name", input.lastName.trim());

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (!patients?.length) {
    return [];
  }

  const patientIds = patients.map((patient) => patient.id);

  const [{ data: admissions }, { data: links }] = await Promise.all([
    supabase
      .from("admissions")
      .select("id, patient_id, status")
      .in("patient_id", patientIds)
      .eq("status", "active"),
    supabase
      .from("patient_account_links")
      .select("patient_id, user_id")
      .in("patient_id", patientIds),
  ]);

  const activeAdmissionByPatient = new Map(
    (admissions ?? []).map((admission) => [admission.patient_id, admission.id]),
  );
  const linkByPatient = new Map(
    (links ?? []).map((link) => [link.patient_id, link.user_id]),
  );

  return patients
    .filter(
      (patient) =>
        normalizeName(patient.first_name) === first &&
        normalizeName(patient.last_name) === last,
    )
    .map((patient) => {
      const admissionId = activeAdmissionByPatient.get(patient.id) ?? null;

      return {
        patientId: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        birthDate: patient.birth_date,
        sex: patient.sex as PatientDemographicMatch["sex"],
        matchTier: classifyMatchTier(patient.birth_date, input.birthDate),
        admissionStatus: admissionId ? "active" : "none",
        admissionId,
        userId: linkByPatient.get(patient.id) ?? null,
      };
    });
}

export async function createPatientWithAdmission(
  demographics: PatientDemographicsInput,
  admission: AdmissionInput,
  staffId: string,
): Promise<{ patient: Patient; admission: Admission }> {
  const supabase = createClient();

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({
      first_name: demographics.firstName.trim(),
      last_name: demographics.lastName.trim(),
      birth_date: demographics.birthDate,
      sex: demographics.sex,
      created_by_staff_id: staffId,
    })
    .select()
    .single();

  if (patientError || !patient) {
    throw new Error(getSupabaseErrorMessage(patientError ?? { message: "unknown" }));
  }

  const { data: admissionRow, error: admissionError } = await supabase
    .from("admissions")
    .insert({
      patient_id: patient.id,
      admitted_on: admission.admittedOn,
      department_id: admission.departmentId,
      room_number: admission.roomNumber?.trim() || null,
      expected_discharge_on: admission.expectedDischargeOn || null,
      status: "active",
      created_by_staff_id: staffId,
    })
    .select()
    .single();

  if (admissionError || !admissionRow) {
    throw new Error(
      "Patiënt is aangemaakt, maar de opname kon niet worden gestart. Probeer een nieuwe opname te starten.",
    );
  }

  return { patient, admission: admissionRow };
}

export async function createAdmissionForPatient(
  patientId: string,
  admission: AdmissionInput,
  staffId: string,
): Promise<Admission> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("admissions")
    .insert({
      patient_id: patientId,
      admitted_on: admission.admittedOn,
      department_id: admission.departmentId,
      room_number: admission.roomNumber?.trim() || null,
      expected_discharge_on: admission.expectedDischargeOn || null,
      status: "active",
      created_by_staff_id: staffId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function updatePatient(
  patientId: string,
  demographics: PatientDemographicsInput,
): Promise<Patient> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .update({
      first_name: demographics.firstName.trim(),
      last_name: demographics.lastName.trim(),
      birth_date: demographics.birthDate,
      sex: demographics.sex,
    })
    .eq("id", patientId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function updateAdmission(
  admissionId: string,
  input: Partial<AdmissionInput>,
): Promise<Admission> {
  const supabase = createClient();

  const payload: {
    admitted_on?: string;
    department_id?: string | null;
    room_number?: string | null;
    expected_discharge_on?: string | null;
  } = {};

  if (input.admittedOn !== undefined) {
    payload.admitted_on = input.admittedOn;
  }

  if (input.departmentId !== undefined) {
    payload.department_id = input.departmentId;
  }

  if (input.roomNumber !== undefined) {
    payload.room_number = input.roomNumber?.trim() || null;
  }

  if (input.expectedDischargeOn !== undefined) {
    payload.expected_discharge_on = input.expectedDischargeOn || null;
  }

  const { data, error } = await supabase
    .from("admissions")
    .update(payload)
    .eq("id", admissionId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function dischargeActiveAdmission(admissionId: string): Promise<Admission> {
  const supabase = createClient();
  const dischargedOn = getAmsterdamDateString();

  const { data, error } = await supabase
    .from("admissions")
    .update({
      status: "discharged",
      discharged_on: dischargedOn,
    })
    .eq("id", admissionId)
    .eq("status", "active")
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}
