import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import type { CarePatientSummary } from "@/lib/services/patient-context";
import type { CareAdmissionFilter } from "@/types/clinical-patient";

export const CARE_ADMISSION_FILTER_OPTIONS: {
  value: CareAdmissionFilter;
  label: string;
}[] = [
  { value: "all", label: CLINICAL_PATIENT_COPY.allPatients },
  { value: "active", label: CLINICAL_PATIENT_COPY.activeAdmission },
  { value: "none", label: CLINICAL_PATIENT_COPY.noActiveAdmission },
];

export function filterCarePatientsByAdmission(
  patients: CarePatientSummary[],
  filter: CareAdmissionFilter,
): CarePatientSummary[] {
  if (filter === "all") {
    return patients;
  }

  if (filter === "active") {
    return patients.filter((patient) => Boolean(patient.admission_id));
  }

  return patients.filter((patient) => !patient.admission_id);
}

export function getCareAdmissionFilterEmptyMessage(
  filter: CareAdmissionFilter,
): string {
  if (filter === "active") {
    return CLINICAL_PATIENT_COPY.emptyFilteredActiveAdmission;
  }

  if (filter === "none") {
    return CLINICAL_PATIENT_COPY.emptyFilteredNoActiveAdmission;
  }

  return CLINICAL_PATIENT_COPY.emptyPatients;
}
