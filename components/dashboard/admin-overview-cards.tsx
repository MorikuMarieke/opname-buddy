"use client";

import { AdminRecentChanges } from "@/components/dashboard/admin-recent-changes";
import { AdminOverviewStatCard } from "@/components/dashboard/admin-overview-stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { buildAdminUsersUrl } from "@/lib/admin/admin-users-url";
import { useAdminOverview, useAdminRecentAudit } from "@/hooks/use-admin-overview";

export function AdminOverviewCards() {
  const { data: stats, isLoading, isError } = useAdminOverview();
  const { data: auditEvents } = useAdminRecentAudit(5);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Laden...</p>;
  }

  if (isError || !stats) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Overzicht kon niet worden geladen.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminOverviewStatCard
          href={buildAdminUsersUrl({ tab: "staff" })}
          ariaLabel="Bekijk staffaccounts"
        >
          <p className="text-xs text-carbon-black-600">Staffaccounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.staffTotal}
          </p>
          <StatusBadge variant="positive" className="mt-1.5">
            {stats.staffActive} actief
          </StatusBadge>
        </AdminOverviewStatCard>

        <AdminOverviewStatCard
          href={buildAdminUsersUrl({ tab: "patients" })}
          ariaLabel="Bekijk patiëntaccounts"
        >
          <p className="text-xs text-carbon-black-600">Patiëntaccounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.patientAccountsTotal}
          </p>
          <p className="mt-1 text-xs text-carbon-black-600">
            {stats.patientAccountsLinked} gekoppeld
          </p>
        </AdminOverviewStatCard>

        <AdminOverviewStatCard
          href={buildAdminUsersUrl({ tab: "staff", role: "caregiver" })}
          ariaLabel="Bekijk zorgverleners"
        >
          <p className="text-xs text-carbon-black-600">Zorgverleners</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.roleCounts.caregiver}
          </p>
        </AdminOverviewStatCard>

        <AdminOverviewStatCard
          href={buildAdminUsersUrl({ tab: "staff", role: "admin" })}
          ariaLabel="Bekijk beheerders"
        >
          <p className="text-xs text-carbon-black-600">Beheerders</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.roleCounts.admin}
          </p>
        </AdminOverviewStatCard>
      </div>

      {auditEvents && auditEvents.length > 0 ? (
        <AdminRecentChanges events={auditEvents} />
      ) : null}
    </div>
  );
}
