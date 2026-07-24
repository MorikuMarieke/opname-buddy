"use client";

import Link from "next/link";
import { useState } from "react";

import { PatientContextCompletenessIndicator } from "@/components/dashboard/patient-context-completeness-indicator";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import type { CarePatientSummary } from "@/lib/services/patient-context";
import {
  CARE_ADMISSION_FILTER_OPTIONS,
  filterCarePatientsByAdmission,
  getCareAdmissionFilterEmptyMessage,
} from "@/lib/utils/care-admission-filter";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";
import type { CareAdmissionFilter } from "@/types/clinical-patient";

interface CarePatientListProps {
  patients: CarePatientSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function CarePatientList({
  patients,
  isLoading,
  isError,
}: CarePatientListProps) {
  const [admissionFilter, setAdmissionFilter] =
    useState<CareAdmissionFilter>("all");

  const filteredPatients = patients
    ? filterCarePatientsByAdmission(patients, admissionFilter)
    : [];
  const matchingCount = filteredPatients.length;
  const showEmpty =
    !isLoading && !isError && Boolean(patients) && matchingCount === 0;

  return (
    <DashboardCard density="compact" className="space-y-3 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={CLINICAL_PATIENT_COPY.admissionFilterLabel}
        >
          {CARE_ADMISSION_FILTER_OPTIONS.map((option) => {
            const isActive = admissionFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAdmissionFilter(option.value)}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "rounded-full bg-pearl-aqua-200 px-3 py-1.5 text-xs font-medium text-blue-slate-800"
                    : "rounded-full bg-parchment-200 px-3 py-1.5 text-xs font-medium text-carbon-black-700"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {!isLoading && !isError && patients ? (
          <p className="text-xs text-carbon-black-600">
            {CLINICAL_PATIENT_COPY.matchingPatientsCount(matchingCount)}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="px-3 py-4 text-sm text-red-600" role="alert">
          Patiënten konden niet worden geladen.
        </p>
      ) : null}

      {showEmpty ? (
        <p className="px-3 py-4 text-sm text-carbon-black-600">
          {getCareAdmissionFilterEmptyMessage(admissionFilter)}
        </p>
      ) : null}

      {!isLoading && !isError && matchingCount > 0 ? (
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-parchment-100">
            <tr className="border-b border-parchment-200 text-carbon-black-600">
              <th className="px-3 py-2 font-medium">Naam</th>
              <th className="px-3 py-2 font-medium">Opname</th>
              <th className="px-3 py-2 font-medium">
                {PATIENT_CONTEXT_COPY.staff.title}
              </th>
              <th className="px-3 py-2 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                className="border-b border-dust-grey-100 last:border-0"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/care/patients/${patient.id}`}
                    className="font-medium text-blue-slate-700 hover:underline"
                  >
                    {formatPatientDisplayName(patient)}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge
                    variant={patient.admission_id ? "positive" : "neutral"}
                  >
                    {patient.admission_id
                      ? CLINICAL_PATIENT_COPY.activeAdmission
                      : CLINICAL_PATIENT_COPY.noActiveAdmission}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2">
                  {patient.context_completeness ? (
                    <PatientContextCompletenessIndicator
                      level={patient.context_completeness}
                    />
                  ) : (
                    <span className="text-carbon-black-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge
                    variant={patient.user_id ? "positive" : "attention"}
                  >
                    {patient.user_id
                      ? CLINICAL_PATIENT_COPY.accountLinked
                      : CLINICAL_PATIENT_COPY.accountNotLinked}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </DashboardCard>
  );
}
