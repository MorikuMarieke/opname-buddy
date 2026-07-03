"use client";

import { CarePatientShell } from "@/components/dashboard/care-patient-shell";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";

interface CarePatientOverviewViewProps {
  patientId: string;
}

export function CarePatientOverviewView({
  patientId,
}: CarePatientOverviewViewProps) {
  return (
    <CarePatientShell patientId={patientId}>
      <SectionHeader
        title="Patiëntoverzicht"
        description="Samenvatting van herstel en participatie."
        size="compact"
      />
      <DashboardCard density="compact">
        <p className="text-sm text-carbon-black-600">
          Hier komt het patiëntoverzicht met recente check-ins, open vragen en
          activiteiten.
        </p>
      </DashboardCard>
    </CarePatientShell>
  );
}
