import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

interface PatientSubPageViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function PatientSubPageView({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: PatientSubPageViewProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} description={description} />
      <DashboardCard>
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </DashboardCard>
    </div>
  );
}
