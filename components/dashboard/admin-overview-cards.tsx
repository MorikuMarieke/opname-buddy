"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { StatusBadge } from "@/components/ui/status-badge";
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
        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Staffaccounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.staffTotal}
          </p>
          <StatusBadge variant="positive" className="mt-1.5">
            {stats.staffActive} actief
          </StatusBadge>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Patiëntaccounts</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.patientAccountsTotal}
          </p>
          <p className="mt-1 text-xs text-carbon-black-600">
            {stats.patientAccountsLinked} gekoppeld
          </p>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Zorgverleners</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.roleCounts.caregiver}
          </p>
        </DashboardCard>

        <DashboardCard density="compact">
          <p className="text-xs text-carbon-black-600">Beheerders</p>
          <p className="text-xl font-semibold text-carbon-black-900">
            {stats.roleCounts.admin}
          </p>
        </DashboardCard>
      </div>

      {auditEvents && auditEvents.length > 0 ? (
        <DashboardCard density="compact">
          <h2 className="mb-2 text-base font-semibold text-carbon-black-900">
            Recente wijzigingen
          </h2>
          <ul className="space-y-2 text-sm text-carbon-black-700">
            {auditEvents.map((event) => (
              <li key={event.id} className="border-b border-dust-grey-100 pb-2 last:border-0">
                <span className="font-medium">
                  {event.actorName ?? "Beheerder"}
                </span>
                {" → "}
                <span>{event.targetName ?? "Gebruiker"}</span>
                {": "}
                <span>{event.action}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}
    </div>
  );
}

