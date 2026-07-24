"use client";

import { Users } from "lucide-react";

import { CareRecentPatientCard } from "@/components/dashboard/care-recent-patient-card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useCarePatients } from "@/hooks/use-care-patients";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { getMostRecentlyAddedCarePatient } from "@/lib/utils/care-recent-patient";

export function CareOverviewView() {
  const { data: patients, isLoading, isError } = useCarePatients();

  const totalPatients = patients?.length ?? 0;
  const activeAdmissions =
    patients?.filter((patient) => patient.admission_id).length ?? 0;
  const linkedAccounts =
    patients?.filter((patient) => patient.user_id).length ?? 0;
  const recentPatient = patients
    ? getMostRecentlyAddedCarePatient(patients)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Patiëntenoverzicht"
          description="Overzicht van klinische patiënten."
          size="compact"
        />
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton href="/care/patients/admit">
            {CLINICAL_PATIENT_COPY.admitPatient}
          </PrimaryButton>
          <SecondaryButton href="/care/patients" size="md">
            {CLINICAL_PATIENT_COPY.viewAllPatients}
          </SecondaryButton>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Patiënten konden niet worden geladen.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pearl-aqua-200 text-pearl-aqua-800">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Klinische patiënten</p>
              <p className="text-xl font-semibold text-carbon-black-900">
                {isLoading || isError ? "—" : totalPatients}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Actieve opnames</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {isLoading || isError ? "—" : activeAdmissions}
          </p>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Gekoppelde accounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {isLoading || isError ? "—" : linkedAccounts}
          </p>
        </DashboardCard>
      </div>

      <CareRecentPatientCard
        patient={recentPatient}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
