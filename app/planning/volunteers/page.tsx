import { Users } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export default function PlanningVolunteersPage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Vrijwilligers"
        description="Beheer beschikbaarheid van vrijwilligers."
        size="compact"
      />
      <DashboardCard density="compact">
        <EmptyState
          icon={Users}
          title="Vrijwilligersbeschikbaarheid"
          description="Hier kun je straks vrijwilligers en hun beschikbaarheid beheren."
        />
      </DashboardCard>
    </div>
  );
}
