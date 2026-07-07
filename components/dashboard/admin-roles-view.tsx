"use client";

import Link from "next/link";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getUsersUrlForRole } from "@/lib/admin/admin-users-url";
import { cn } from "@/lib/utils/cn";
import { useAdminRoles } from "@/hooks/use-admin-roles";

export function AdminRolesView() {
  const { data: roles, isLoading, isError } = useAdminRoles();

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Rollen"
        description="Overzicht van rollen en rechten in OpnameBuddy. Klik op een rol om bijbehorende accounts te bekijken."
        size="compact"
      />

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Rollen konden niet worden geladen.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {roles?.map((role, index) => (
          <Link
            key={role.name}
            href={getUsersUrlForRole(role.name)}
            aria-label={`Bekijk accounts met rol ${role.label}`}
            className={cn(
              "block rounded-xl border bg-white shadow-card transition-colors",
              "cursor-pointer hover:border-pearl-aqua-300 hover:bg-parchment-50",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600",
              index % 2 === 0 ? "border-pearl-aqua-50" : "border-copper-50",
            )}
          >
            <DashboardCard density="compact" className="border-0 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-carbon-black-900">
                    {role.label}
                  </h3>
                  <p className="mt-1 text-sm text-carbon-black-600">
                    {role.description}
                  </p>
                </div>
                <StatusBadge variant="neutral">
                  {role.userCount} gebruikers
                </StatusBadge>
              </div>
            </DashboardCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
