"use client";

import Link from "next/link";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCarePatients } from "@/hooks/use-care-patients";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";

export function CarePatientsView() {
  const { data: patients, isLoading, isError } = useCarePatients();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Patiënten"
          description="Alle klinische patiënten op de afdeling."
          size="compact"
        />
        <PrimaryButton href="/care/patients/admit">
          {CLINICAL_PATIENT_COPY.admitPatient}
        </PrimaryButton>
      </div>

      <DashboardCard density="compact" className="overflow-x-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="px-3 py-4 text-sm text-red-600" role="alert">
            Patiënten konden niet worden geladen.
          </p>
        ) : null}

        {!isLoading && !isError && patients?.length === 0 ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">
            Geen patiënten gevonden.
          </p>
        ) : null}

        {patients && patients.length > 0 ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-parchment-100">
              <tr className="border-b border-parchment-200 text-carbon-black-600">
                <th className="px-3 py-2 font-medium">Naam</th>
                <th className="px-3 py-2 font-medium">Opname</th>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Check-in</th>
                <th className="px-3 py-2 font-medium">Vragen</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
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
                    <StatusBadge variant={patient.user_id ? "positive" : "attention"}>
                      {patient.user_id
                        ? CLINICAL_PATIENT_COPY.accountLinked
                        : CLINICAL_PATIENT_COPY.accountNotLinked}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2 text-carbon-black-400">—</td>
                  <td className="px-3 py-2 text-carbon-black-400">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </DashboardCard>
    </div>
  );
}
