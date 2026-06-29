import { LayoutDashboard } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Beheer"
        description="Beheer gebruikers, rollen en systeeminstellingen."
        size="compact"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pearl-aqua-200 text-pearl-aqua-800">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Gebruikers</p>
              <p className="text-xl font-semibold text-carbon-black-900">25</p>
              <StatusBadge variant="positive" className="mt-1.5">
                23 actief
              </StatusBadge>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Rollen</p>
          <p className="text-xl font-semibold text-carbon-black-900">4</p>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Laatste wijziging</p>
          <p className="text-xl font-semibold text-carbon-black-900">Vandaag</p>
        </DashboardCard>
      </div>
    </div>
  );
}
