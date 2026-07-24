"use client";

import { CarePatientList } from "@/components/dashboard/care-patient-list";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useCarePatients } from "@/hooks/use-care-patients";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";

export function CarePatientsView() {
  const { data: patients, isLoading, isError } = useCarePatients();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Patiënten"
          description="Alle klinische patiënten."
          size="compact"
        />
        <PrimaryButton href="/care/patients/admit">
          {CLINICAL_PATIENT_COPY.admitPatient}
        </PrimaryButton>
      </div>

      <CarePatientList
        patients={patients}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
