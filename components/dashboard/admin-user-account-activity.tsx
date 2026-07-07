"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { AuditActivityFeed } from "@/components/dashboard/admin-audit-activity-feed";
import { useAdminUserAuditEvents } from "@/hooks/use-admin-user-audit";

interface AdminUserAccountActivityProps {
  userId: string;
}

export function AdminUserAccountActivity({ userId }: AdminUserAccountActivityProps) {
  const { data: events, isLoading, isError } = useAdminUserAuditEvents(userId, 10);

  return (
    <DashboardCard density="compact" className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-carbon-black-900">
          Recente accountactiviteit
        </h2>
        <p className="mt-1 text-sm text-carbon-black-600">
          Wijzigingen aan dit account door beheerders.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Accountactiviteit kon niet worden geladen.
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <AuditActivityFeed
          events={events ?? []}
          variant="user-detail"
          emptyMessage="Nog geen accountactiviteit geregistreerd."
        />
      ) : null}
    </DashboardCard>
  );
}
