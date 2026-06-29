import { CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export default function PlanningSessionsPage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Sessies"
        description="Plan en beheer activiteitensessies."
        size="compact"
      />
      <DashboardCard density="compact">
        <EmptyState
          icon={CalendarDays}
          title="Sessieplanning"
          description="Hier kun je straks sessies plannen met tijd, locatie en deelnemers."
        />
      </DashboardCard>
    </div>
  );
}
