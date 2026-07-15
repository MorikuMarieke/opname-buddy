import type { PatientSex } from "@/types/clinical-patient";

export interface PatientNameFields {
  first_name: string;
  last_name: string;
  sex?: PatientSex | string | null;
}

export function formatPatientDisplayName(patient: PatientNameFields): string {
  const first = patient.first_name?.trim() ?? "";
  const last = patient.last_name?.trim() ?? "";
  const combined = `${first} ${last}`.trim();
  return combined || "Naamloos";
}

export function calculateAge(birthDate: string, referenceDate?: string): number | null {
  if (!birthDate) {
    return null;
  }

  const ref = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date();
  const birth = new Date(`${birthDate}T12:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
