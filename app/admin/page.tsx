import { LayoutDashboard } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Beheer"
        description="Beheer gebruikers, rollen en systeeminstellingen."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard padding="sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-pearl-aqua/40 p-2 text-blue-slate">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-carbon-black/60">Gebruikers</p>
              <p className="text-2xl font-semibold text-carbon-black">25</p>
              <StatusBadge variant="positive" className="mt-2">
                23 actief
              </StatusBadge>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard padding="sm">
          <p className="text-sm text-carbon-black/60">Rollen</p>
          <p className="text-2xl font-semibold text-carbon-black">4</p>
        </DashboardCard>

        <DashboardCard padding="sm">
          <p className="text-sm text-carbon-black/60">Laatste wijziging</p>
          <p className="text-2xl font-semibold text-carbon-black">Vandaag</p>
        </DashboardCard>
      </div>
    </div>
  );
}
