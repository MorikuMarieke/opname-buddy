"use client";

import { PatientContextAuditMeta } from "@/components/dashboard/patient-context-audit-meta";
import { PatientContextCompletenessIndicator } from "@/components/dashboard/patient-context-completeness-indicator";
import { PatientContextReadOnlySections } from "@/components/dashboard/patient-context-read-only-sections";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useOwnPatientContext,
  useOwnPatientContextRealtime,
} from "@/hooks/use-patient-context";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { getPatientContextCompleteness } from "@/lib/patient-context/completeness";

export function PatientContextReadOnlyView() {
  const { data: context, isLoading, isError } = useOwnPatientContext();
  useOwnPatientContextRealtime();
  const completeness = getPatientContextCompleteness(context ?? null);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Zorgcontext laden...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Zorgcontext kon niet worden geladen.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title={PATIENT_CONTEXT_COPY.patient.title}
          description={PATIENT_CONTEXT_COPY.patient.description}
          size="kiosk"
        />
        <PatientContextCompletenessIndicator level={completeness.level} />
      </div>

      <PatientContextAuditMeta
        updatedAt={context?.updated_at}
        patientView
      />

      <PatientContextReadOnlySections context={context ?? null} />
    </div>
  );
}
