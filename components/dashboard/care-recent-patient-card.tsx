"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CLINICAL_PATIENT_COPY,
  PATIENT_SEX_OPTIONS,
} from "@/lib/constants/clinical-patient-copy";
import type { CarePatientSummary } from "@/lib/services/patient-context";
import { formatDutchDate, formatDutchDateTime } from "@/lib/utils/amsterdam-date";
import {
  calculateAge,
  formatPatientDisplayName,
} from "@/lib/utils/patient-greeting";

interface CareRecentPatientCardProps {
  patient: CarePatientSummary | null;
  isLoading: boolean;
  isError: boolean;
}

function sexLabel(sex: CarePatientSummary["sex"]): string {
  if (!sex) {
    return "—";
  }

  return PATIENT_SEX_OPTIONS.find((option) => option.value === sex)?.label ?? sex;
}

export function CareRecentPatientCard({
  patient,
  isLoading,
  isError,
}: CareRecentPatientCardProps) {
  if (isLoading) {
    return (
      <DashboardCard
        title={CLINICAL_PATIENT_COPY.recentlyAddedPatient}
        density="compact"
      >
        <p className="text-sm text-carbon-black-600">Laden...</p>
      </DashboardCard>
    );
  }

  if (isError) {
    return (
      <DashboardCard
        title={CLINICAL_PATIENT_COPY.recentlyAddedPatient}
        density="compact"
      >
        <p className="text-sm text-red-600" role="alert">
          Patiënten konden niet worden geladen.
        </p>
      </DashboardCard>
    );
  }

  if (!patient) {
    return (
      <DashboardCard
        title={CLINICAL_PATIENT_COPY.recentlyAddedPatient}
        density="compact"
      >
        <p className="text-sm text-carbon-black-600">
          {CLINICAL_PATIENT_COPY.recentlyAddedPatientEmpty}
        </p>
      </DashboardCard>
    );
  }

  const displayName = formatPatientDisplayName(patient);
  const age = patient.birth_date ? calculateAge(patient.birth_date) : null;

  return (
    <DashboardCard
      title={CLINICAL_PATIENT_COPY.recentlyAddedPatient}
      density="compact"
      className="space-y-4"
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-carbon-black-600">Naam</dt>
          <dd className="font-medium text-carbon-black-900">{displayName}</dd>
        </div>
        <div>
          <dt className="text-carbon-black-600">
            {CLINICAL_PATIENT_COPY.birthDate}
          </dt>
          <dd className="font-medium text-carbon-black-900">
            {patient.birth_date ? formatDutchDate(patient.birth_date) : "—"}
            {age !== null ? ` (${age} jaar)` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-carbon-black-600">{CLINICAL_PATIENT_COPY.sex}</dt>
          <dd className="font-medium text-carbon-black-900">
            {sexLabel(patient.sex)}
          </dd>
        </div>
        <div>
          <dt className="text-carbon-black-600">Opname</dt>
          <dd className="pt-0.5">
            <StatusBadge
              variant={patient.admission_id ? "positive" : "neutral"}
            >
              {patient.admission_id
                ? CLINICAL_PATIENT_COPY.activeAdmission
                : CLINICAL_PATIENT_COPY.noActiveAdmission}
            </StatusBadge>
          </dd>
        </div>
        {patient.created_at ? (
          <div className="sm:col-span-2">
            <dt className="text-carbon-black-600">
              {CLINICAL_PATIENT_COPY.addedOnLabel}
            </dt>
            <dd className="font-medium text-carbon-black-900">
              {formatDutchDateTime(patient.created_at)}
            </dd>
          </div>
        ) : null}
      </dl>

      <SecondaryButton href={`/care/patients/${patient.id}`} size="sm">
        {CLINICAL_PATIENT_COPY.openPatient}
      </SecondaryButton>
    </DashboardCard>
  );
}
