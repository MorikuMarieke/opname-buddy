"use client";

import { CarePatientShell } from "@/components/dashboard/care-patient-shell";
import { PatientContextAuditMeta } from "@/components/dashboard/patient-context-audit-meta";
import { PatientContextCompletenessIndicator } from "@/components/dashboard/patient-context-completeness-indicator";
import { PatientContextForm } from "@/components/dashboard/patient-context-form";
import { PatientContextMissingFields } from "@/components/dashboard/patient-context-missing-fields";
import { usePatientContext } from "@/hooks/use-patient-context";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { getPatientContextCompleteness } from "@/lib/patient-context/completeness";

interface PatientContextViewProps {
  patientId: string;
}

export function PatientContextView({ patientId }: PatientContextViewProps) {
  const { data: context, isLoading, isError, refetch } = usePatientContext(patientId);
  const completeness = getPatientContextCompleteness(context ?? null);

  if (isLoading) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-carbon-black-600">Zorgcontext laden...</p>
      </CarePatientShell>
    );
  }

  if (isError) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-red-600" role="alert">
          Zorgcontext kon niet worden geladen.
        </p>
      </CarePatientShell>
    );
  }

  return (
    <CarePatientShell patientId={patientId}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-xl font-semibold text-carbon-black-900">
              {PATIENT_CONTEXT_COPY.staff.title}
            </h2>
            <p className="text-sm text-carbon-black-600">
              {PATIENT_CONTEXT_COPY.staff.description}
            </p>
            <PatientContextAuditMeta
              variant="inline"
              updatedAt={context?.updated_at}
              updatedByName={context?.updatedByName}
            />
          </div>
          <PatientContextCompletenessIndicator level={completeness.level} />
        </div>

        <PatientContextMissingFields
          fieldLabels={completeness.unknownCriticalFieldLabels}
        />

        <PatientContextForm
          patientId={patientId}
          existingContext={context ?? null}
          onSuccess={() => {
            void refetch();
          }}
        />
      </div>
    </CarePatientShell>
  );
}
