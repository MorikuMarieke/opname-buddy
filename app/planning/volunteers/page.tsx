import { Users } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export default function PlanningVolunteersPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vrijwilligers"
        description="Beheer beschikbaarheid van vrijwilligers."
      />
      <DashboardCard>
        <EmptyState
          icon={Users}
          title="Vrijwilligersbeschikbaarheid"
          description="Hier kun je straks vrijwilligers en hun beschikbaarheid beheren."
        />
      </DashboardCard>
    </div>
  );
}
