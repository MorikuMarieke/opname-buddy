"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useActiveAdmissionLocation } from "@/hooks/use-active-admission-location";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";

export function PatientAdmissionLocationCard() {
  const { data: location, isLoading, isError } = useActiveAdmissionLocation();

  if (isLoading) {
    return (
      <DashboardCard density="compact">
        <p className="text-sm text-carbon-black-600">Opnamegegevens laden...</p>
      </DashboardCard>
    );
  }

  if (isError) {
    return (
      <DashboardCard density="compact" className="border-cherry-rose-200 bg-cherry-rose-50/50">
        <p className="text-sm text-red-600" role="alert">
          Je opnamegegevens konden niet worden geladen.
        </p>
      </DashboardCard>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <DashboardCard density="compact" className="space-y-3">
      <h2 className="text-lg font-semibold text-carbon-black-900">
        {CLINICAL_PATIENT_COPY.patientAdmissionLocationTitle}
      </h2>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-carbon-black-600">
            {CLINICAL_PATIENT_COPY.patientDepartmentLabel}
          </dt>
          <dd className="font-medium text-carbon-black-900">
            {location.departmentName?.trim() ||
              CLINICAL_PATIENT_COPY.patientDepartmentUnknown}
          </dd>
        </div>
        {location.roomNumber ? (
          <div>
            <dt className="text-carbon-black-600">
              {CLINICAL_PATIENT_COPY.patientRoomLabel}
            </dt>
            <dd className="font-medium text-carbon-black-900">
              {location.roomNumber}
            </dd>
          </div>
        ) : null}
      </dl>
    </DashboardCard>
  );
}
