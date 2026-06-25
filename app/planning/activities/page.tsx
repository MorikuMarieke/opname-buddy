import { Activity } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export default function PlanningActivitiesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Activiteiten"
        description="Beheer beschikbare activiteiten op de afdeling."
      />
      <DashboardCard>
        <EmptyState
          icon={Activity}
          title="Activiteitenbeheer"
          description="Hier kun je straks activiteiten aanmaken, bewerken en categoriseren."
        />
      </DashboardCard>
    </div>
  );
}
