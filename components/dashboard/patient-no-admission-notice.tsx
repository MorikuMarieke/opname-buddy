"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useActiveAdmissionId } from "@/hooks/use-active-admission-id";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";

export function PatientNoAdmissionNotice() {
  const { data: admissionId, isLoading } = useActiveAdmissionId();

  if (isLoading || admissionId) {
    return null;
  }

  return (
    <DashboardCard density="compact" className="border-cherry-rose-200 bg-cherry-rose-50/50">
      <p className="text-sm text-carbon-black-700">
        {CLINICAL_PATIENT_COPY.noActiveAdmissionPatient}
      </p>
    </DashboardCard>
  );
}
