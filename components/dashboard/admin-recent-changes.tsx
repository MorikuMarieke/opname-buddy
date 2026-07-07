import { DashboardCard } from "@/components/ui/dashboard-card";
import { AuditActivityFeed } from "@/components/dashboard/admin-audit-activity-feed";
import type { AccountAuditEvent } from "@/types/admin-account";

interface AdminRecentChangesProps {
  events: AccountAuditEvent[];
}

export function AdminRecentChanges({ events }: AdminRecentChangesProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <DashboardCard density="compact">
      <h2 className="mb-1 text-base font-semibold text-carbon-black-900">
        Recente activiteit
      </h2>
      <p className="mb-3 text-xs text-carbon-black-600">
        Laatste wijzigingen aan accounts in OpnameBuddy.
      </p>
      <AuditActivityFeed events={events} variant="overview" />
    </DashboardCard>
  );
}
