import type { CarePatientSummary } from "@/lib/services/patient-context";

/** Most recently created clinical patient from the care list (by `created_at`). */
export function getMostRecentlyAddedCarePatient(
  patients: CarePatientSummary[],
): CarePatientSummary | null {
  let latest: CarePatientSummary | null = null;

  for (const patient of patients) {
    if (!patient.created_at) {
      continue;
    }

    if (!latest?.created_at || patient.created_at > latest.created_at) {
      latest = patient;
    }
  }

  return latest;
}
