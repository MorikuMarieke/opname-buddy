"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCarePatients } from "@/hooks/use-care-patients";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";

export function CareOverviewView() {
  const { data: patients, isLoading } = useCarePatients();

  const totalPatients = patients?.length ?? 0;
  const activeAdmissions =
    patients?.filter((patient) => patient.admission_id).length ?? 0;
  const linkedAccounts = patients?.filter((patient) => patient.user_id).length ?? 0;
  const recentPatients = patients?.slice(0, 5) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Patiëntenoverzicht"
          description="Overzicht van klinische patiënten op de afdeling."
          size="compact"
        />
        <PrimaryButton href="/care/patients/admit">
          {CLINICAL_PATIENT_COPY.admitPatient}
        </PrimaryButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pearl-aqua-200 text-pearl-aqua-800">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Klinische patiënten</p>
              <p className="text-xl font-semibold text-carbon-black-900">
                {isLoading ? "—" : totalPatients}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Actieve opnames</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {isLoading ? "—" : activeAdmissions}
          </p>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Gekoppelde accounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {isLoading ? "—" : linkedAccounts}
          </p>
        </DashboardCard>
      </div>

      <DashboardCard density="compact" className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-parchment-100">
            <tr className="border-b border-parchment-200 text-carbon-black-600">
              <th className="px-3 py-2 font-medium">Naam</th>
              <th className="px-3 py-2 font-medium">Opname</th>
              <th className="px-3 py-2 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {recentPatients.map((patient) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}

export function CareOverviewRightPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">Acties</h3>
        <ul className="space-y-1.5 text-sm text-blue-slate-700">
          <li>
            <Link href="/care/patients/admit" className="hover:underline">
              {CLINICAL_PATIENT_COPY.admitPatient}
            </Link>
          </li>
          <li>
            <Link href="/care/patients" className="hover:underline">
              Alle patiënten bekijken
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
