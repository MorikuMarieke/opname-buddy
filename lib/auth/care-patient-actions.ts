"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { generatePatientLinkCode } from "@/lib/services/patient-linking";
import type { PatientLinkCodeResult } from "@/types/clinical-patient";

function revalidateCarePaths(patientId?: string) {
  revalidatePath("/care");
  revalidatePath("/care/patients");

  if (patientId) {
    revalidatePath(`/care/patients/${patientId}`);
  }
}

export async function generatePatientLinkCodeAction(
  patientId: string,
): Promise<PatientLinkCodeResult | { error: string }> {
  const { user } = await requireRole("caregiver");

  if (!patientId) {
    return { error: "Patiënt niet gevonden." };
  }

  try {
    const result = await generatePatientLinkCode(patientId, user.id);
    revalidateCarePaths(patientId);
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Koppelcode kon niet worden gegenereerd.";
    return { error: message };
  }
}
