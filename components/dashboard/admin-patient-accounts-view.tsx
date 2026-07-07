"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminPatientAccounts } from "@/hooks/use-admin-patient-accounts";

export function AdminPatientAccountsView() {
  const [linkStatus, setLinkStatus] = useState<"all" | "linked" | "unlinked">(
    "all",
  );
  const { data: accounts, isLoading, isError } = useAdminPatientAccounts({
    linkStatus,
  });

  return (
    <DashboardCard density="compact" className="space-y-3">
      <div className="flex flex-wrap gap-2 px-3 pt-3">
        {(
          [
            ["all", "Alle"],
            ["linked", "Gekoppeld"],
            ["unlinked", "Niet gekoppeld"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setLinkStatus(value)}
            className={
              linkStatus === value
                ? "rounded-full bg-pearl-aqua-200 px-3 py-1.5 text-xs font-medium text-blue-slate-800"
                : "rounded-full bg-parchment-200 px-3 py-1.5 text-xs font-medium text-carbon-black-700"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <p className="px-3 text-xs text-carbon-black-600">
        Alleen-lezen overzicht. Koppelen gebeurt in een latere branch.
      </p>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="px-3 py-4 text-sm text-red-600" role="alert">
            Patiëntaccounts konden niet worden geladen.
          </p>
        ) : null}

        {!isLoading && !isError && accounts?.length === 0 ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">
            Geen patiëntaccounts gevonden.
          </p>
        ) : null}

        {accounts && accounts.length > 0 ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-parchment-100">
              <tr className="border-b border-parchment-200 text-carbon-black-600">
                <th className="px-3 py-2 font-medium">Naam</th>
                <th className="px-3 py-2 font-medium">E-mail</th>
                <th className="px-3 py-2 font-medium">Koppeling</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-dust-grey-100 last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-carbon-black-900">
                    {account.fullName?.trim() || "Naamloos"}
                  </td>
                  <td className="px-3 py-2">{account.email}</td>
                  <td className="px-3 py-2">
                    {account.isLinked ? (
                      <span>
                        {account.linkedPatientName?.trim() || "Gekoppeld"}
                      </span>
                    ) : (
                      <StatusBadge variant="attention">Niet gekoppeld</StatusBadge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge
                      variant={account.isActive ? "positive" : "neutral"}
                    >
                      {account.isActive ? "Actief" : "Inactief"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </DashboardCard>
  );
}
