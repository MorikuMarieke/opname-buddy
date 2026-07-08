"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminPatientAccountsView } from "@/components/dashboard/admin-patient-accounts-view";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  buildAdminUsersUrl,
  parseAdminUsersFilters,
  type AdminUsersStatus,
  type AdminUsersTab,
} from "@/lib/admin/admin-users-url";
import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { useAdminStaffAccounts } from "@/hooks/use-admin-staff-accounts";
import { useAdminVolunteerAccounts } from "@/hooks/use-admin-volunteer-accounts";

const STATUS_OPTIONS: { value: AdminUsersStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "active", label: "Actief" },
  { value: "inactive", label: "Inactief" },
];

export function AdminUsersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseAdminUsersFilters(searchParams);

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchInput(filters.search ?? "");
  }, [filters.search]);

  const navigate = useCallback(
    (next: Partial<typeof filters>) => {
      router.replace(
        buildAdminUsersUrl({
          tab: next.tab ?? filters.tab,
          role: "role" in next ? next.role : filters.role,
          status: "status" in next ? next.status : filters.status,
          search: "search" in next ? next.search : filters.search,
        }),
      );
    },
    [router, filters],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      const current = filters.search ?? "";

      if (trimmed === current) {
        return;
      }

      navigate({
        search: trimmed || undefined,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, filters.search, navigate]);

  const { data: staffAccounts, isLoading, isError } = useAdminStaffAccounts({
    search: filters.search,
    status: filters.status ?? "all",
    role: filters.role,
  });

  const {
    data: volunteerAccounts,
    isLoading: volunteersLoading,
    isError: volunteersError,
  } = useAdminVolunteerAccounts({
    search: filters.search,
    status: filters.status ?? "all",
  });

  function setTab(tab: AdminUsersTab) {
    if (tab === "patients") {
      router.replace(buildAdminUsersUrl({ tab: "patients" }));
      return;
    }

    if (tab === "volunteers") {
      router.replace(
        buildAdminUsersUrl({
          tab: "volunteers",
          status: filters.status,
          search: filters.search,
        }),
      );
      return;
    }

    router.replace(
      buildAdminUsersUrl({
        tab: "staff",
        role: filters.role,
        status: filters.status,
        search: filters.search,
      }),
    );
  }

  function setStatus(status: AdminUsersStatus | "all") {
    navigate({
      status: status === "all" ? undefined : status,
    });
  }

  const hasActiveFilters = Boolean(
    (filters.tab === "staff" && filters.role) || filters.status,
  );

  const volunteerCopy = VOLUNTEER_COPY.admin;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gebruikers"
        description="Beheer staffaccounts, vrijwilligers en bekijk patiëntaccounts."
        size="compact"
        action={
          filters.tab === "staff" ? (
            <PrimaryButton
              href="/admin/users/new"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Medewerker toevoegen
            </PrimaryButton>
          ) : filters.tab === "volunteers" ? (
            <PrimaryButton
              href="/admin/users/new/volunteer"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              {volunteerCopy.createButton}
            </PrimaryButton>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("staff")}
          className={
            filters.tab === "staff"
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
            filters.tab === "patients"
              ? "rounded-full bg-copper-600 px-4 py-2 text-sm font-medium text-white"
              : "rounded-full bg-parchment-200 px-4 py-2 text-sm font-medium text-carbon-black-800"
          }
        >
          Patiëntaccounts
        </button>
        <button
          type="button"
          onClick={() => setTab("volunteers")}
          className={
            filters.tab === "volunteers"
              ? "rounded-full bg-copper-600 px-4 py-2 text-sm font-medium text-white"
              : "rounded-full bg-parchment-200 px-4 py-2 text-sm font-medium text-carbon-black-800"
          }
        >
          {volunteerCopy.tabLabel}
        </button>
      </div>

      {filters.tab === "patients" ? <AdminPatientAccountsView /> : null}

      {filters.tab === "staff" ? (
        <DashboardCard density="compact" className="space-y-3">
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {STATUS_OPTIONS.map((option) => {
              const isActive =
                option.value === "all"
                  ? !filters.status
                  : filters.status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={
                    isActive
                      ? "rounded-full bg-pearl-aqua-200 px-3 py-1.5 text-xs font-medium text-blue-slate-800"
                      : "rounded-full bg-parchment-200 px-3 py-1.5 text-xs font-medium text-carbon-black-700"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2 px-3">
              {filters.role ? (
                <span className="rounded-full bg-parchment-200 px-3 py-1 text-xs text-carbon-black-700">
                  Rol: {ROLE_LABELS[filters.role]}
                </span>
              ) : null}
              {filters.status ? (
                <span className="rounded-full bg-parchment-200 px-3 py-1 text-xs text-carbon-black-700">
                  Status: {filters.status === "active" ? "Actief" : "Inactief"}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  navigate({ role: undefined, status: undefined })
                }
                className="text-xs font-medium text-blue-slate-700 hover:underline"
              >
                Wis filters
              </button>
            </div>
          ) : null}

          <label className="block px-3">
            <span className="sr-only">Zoeken</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
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

      {filters.tab === "volunteers" ? (
        <DashboardCard density="compact" className="space-y-3">
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {STATUS_OPTIONS.map((option) => {
              const isActive =
                option.value === "all"
                  ? !filters.status
                  : filters.status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={
                    isActive
                      ? "rounded-full bg-pearl-aqua-200 px-3 py-1.5 text-xs font-medium text-blue-slate-800"
                      : "rounded-full bg-parchment-200 px-3 py-1.5 text-xs font-medium text-carbon-black-700"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="block px-3">
            <span className="sr-only">Zoeken</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Zoek op naam of e-mail"
              className="h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm"
            />
          </label>

          <div className="overflow-x-auto">
            {volunteersLoading ? (
              <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
            ) : null}

            {volunteersError ? (
              <p className="px-3 py-4 text-sm text-red-600" role="alert">
                Vrijwilligers konden niet worden geladen.
              </p>
            ) : null}

            {!volunteersLoading &&
            !volunteersError &&
            volunteerAccounts?.length === 0 ? (
              <p className="px-3 py-4 text-sm text-carbon-black-600">
                {volunteerCopy.emptyList}
              </p>
            ) : null}

            {volunteerAccounts && volunteerAccounts.length > 0 ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-parchment-100">
                  <tr className="border-b border-parchment-200 text-carbon-black-600">
                    <th className="px-3 py-2 font-medium">Naam</th>
                    <th className="px-3 py-2 font-medium">E-mail</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteerAccounts.map((account) => (
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
