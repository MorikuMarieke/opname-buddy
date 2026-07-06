"use client";

import { CarePatientShell } from "@/components/dashboard/care-patient-shell";
import { PatientContextAuditMeta } from "@/components/dashboard/patient-context-audit-meta";
import { PatientContextCompletenessIndicator } from "@/components/dashboard/patient-context-completeness-indicator";
import { PatientContextForm } from "@/components/dashboard/patient-context-form";
import { PatientContextMissingFields } from "@/components/dashboard/patient-context-missing-fields";
import { useCarePatients } from "@/hooks/use-care-patients";
import { usePatientContext } from "@/hooks/use-patient-context";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { getPatientContextCompleteness } from "@/lib/patient-context/completeness";

interface PatientContextViewProps {
  patientId: string;
}

export function PatientContextView({ patientId }: PatientContextViewProps) {
  const {
    data: patients,
    isLoading: patientsLoading,
    isError: patientsError,
  } = useCarePatients();

  const patient = patients?.find((item) => item.id === patientId);
  const admissionId = patient?.admission_id ?? null;
  const patientUserId = patient?.user_id ?? null;

  const {
    data: context,
    isLoading: contextLoading,
    isError,
    refetch,
  } = usePatientContext(admissionId);

  const completeness = getPatientContextCompleteness(context ?? null);

  if (patientsLoading || (admissionId && contextLoading)) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-carbon-black-600">Zorgcontext laden...</p>
      </CarePatientShell>
    );
  }

  if (patientsError || (!patientsLoading && !patient)) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-red-600" role="alert">
          Patiënt kon niet worden gevonden.
        </p>
      </CarePatientShell>
    );
  }

  if (!admissionId) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-carbon-black-600">
          Deze patiënt heeft nog geen actieve opname.
        </p>
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
          admissionId={admissionId}
          patientUserId={patientUserId}
          existingContext={context ?? null}
          onSuccess={() => {
            void refetch();
          }}
        />
      </div>
    </CarePatientShell>
  );
}
