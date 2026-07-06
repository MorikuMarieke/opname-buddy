"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AdminPatientAccountsView } from "@/components/dashboard/admin-patient-accounts-view";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import { useAdminStaffAccounts } from "@/hooks/use-admin-staff-accounts";

type UsersTab = "staff" | "patients";

export function AdminUsersView() {
  const [tab, setTab] = useState<UsersTab>("staff");
  const [search, setSearch] = useState("");
  const { data: staffAccounts, isLoading, isError } = useAdminStaffAccounts({
    search,
    status: "all",
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gebruikers"
        description="Beheer staffaccounts en bekijk patiëntaccounts."
        size="compact"
        action={
          tab === "staff" ? (
            <PrimaryButton
              href="/admin/users/new"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Medewerker toevoegen
            </PrimaryButton>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("staff")}
          className={
            tab === "staff"
              ? "rounded-full bg-copper-600 px-4 py-2 text-sm font-medium text-white"
              : "rounded-full bg-parchment-200 px-4 py-2 text-sm font-medium text-carbon-black-800"
          }
        >
          Staff
        </button>
        <button
          type="button"
          onClick={() => setTab("patients")}
          className={
            tab === "patients"
              ? "rounded-full bg-copper-600 px-4 py-2 text-sm font-medium text-white"
              : "rounded-full bg-parchment-200 px-4 py-2 text-sm font-medium text-carbon-black-800"
          }
        >
          Patiëntaccounts
        </button>
      </div>

      {tab === "patients" ? <AdminPatientAccountsView /> : null}

      {tab === "staff" ? (
        <DashboardCard density="compact" className="space-y-3">
          <label className="block px-3 pt-3">
            <span className="sr-only">Zoeken</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Zoek op naam of e-mail"
              className="h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm"
            />
          </label>

          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
            ) : null}

            {isError ? (
              <p className="px-3 py-4 text-sm text-red-600" role="alert">
                Gebruikers konden niet worden geladen.
              </p>
            ) : null}

            {!isLoading && !isError && staffAccounts?.length === 0 ? (
              <p className="px-3 py-4 text-sm text-carbon-black-600">
                Geen staffaccounts gevonden.
              </p>
            ) : null}

            {staffAccounts && staffAccounts.length > 0 ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-parchment-100">
                  <tr className="border-b border-parchment-200 text-carbon-black-600">
                    <th className="px-3 py-2 font-medium">Naam</th>
                    <th className="px-3 py-2 font-medium">E-mail</th>
                    <th className="px-3 py-2 font-medium">Rollen</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-dust-grey-100 last:border-0"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/users/${account.id}`}
                          className="font-medium text-blue-slate-700 hover:underline"
                        >
                          {account.fullName?.trim() || "Naamloos"}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{account.email}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {account.roles.map((role) => (
                            <StatusBadge key={role} variant="neutral">
                              {ROLE_LABELS[role]}
                            </StatusBadge>
                          ))}
                        </div>
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
      ) : null}
    </div>
  );
}
