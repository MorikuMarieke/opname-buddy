import { Activity } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export default function PlanningActivitiesPage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Activiteiten"
        description="Beheer beschikbare activiteiten op de afdeling."
        size="compact"
      />
      <DashboardCard density="compact">
        <EmptyState
          icon={Activity}
          title="Activiteitenbeheer"
          description="Hier kun je straks activiteiten aanmaken, bewerken en categoriseren."
        />
      </DashboardCard>
    </div>
  );
}
