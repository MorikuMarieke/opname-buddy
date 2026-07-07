"use client";

import Link from "next/link";
import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ROLE_LABELS,
  STAFF_ROLE_NAMES,
} from "@/lib/constants/admin-account-copy";
import type { StaffRoleName } from "@/lib/constants/admin-account-copy";
import {
  useAdminStaffAccountDetail,
  useSetAccountActive,
  useSetStaffRoles,
  useUpdateAccountProfile,
} from "@/hooks/use-admin-account-detail";
import type { StaffAccountSummary } from "@/types/admin-account";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

interface AdminUserDetailFormProps {
  account: StaffAccountSummary;
}

function AdminUserDetailForm({ account }: AdminUserDetailFormProps) {
  const updateProfile = useUpdateAccountProfile(account.id);
  const setRoles = useSetStaffRoles(account.id);
  const setActive = useSetAccountActive(account.id);

  const [fullName, setFullName] = useState(account.fullName ?? "");
  const [preferredLanguage, setPreferredLanguage] = useState<"nl" | "en">(
    account.preferredLanguage === "en" ? "en" : "nl",
  );
  const [roles, setRolesState] = useState<StaffRoleName[]>(
    account.roles.filter((role): role is StaffRoleName =>
      (STAFF_ROLE_NAMES as readonly string[]).includes(role),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: StaffRoleName) {
    setRolesState((current) =>
      current.includes(role)
        ? current.filter((value) => value !== role)
        : [...current, role],
    );
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const result = await updateProfile.mutateAsync({
      fullName,
      preferredLanguage,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMessage("Profiel bijgewerkt.");
  }

  async function handleRolesSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const result = await setRoles.mutateAsync({ roles });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMessage("Rollen bijgewerkt.");
  }

  async function handleToggleActive() {
    setError(null);
    setMessage(null);

    const wasActive = account.isActive;
    const result = await setActive.mutateAsync(!wasActive);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMessage(wasActive ? "Account gedeactiveerd." : "Account geactiveerd.");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant={account.isActive ? "positive" : "neutral"}>
          {account.isActive ? "Actief" : "Inactief"}
        </StatusBadge>
        {account.roles.map((role) => (
          <StatusBadge key={role} variant="neutral">
            {ROLE_LABELS[role]}
          </StatusBadge>
        ))}
      </div>

      {message ? (
        <p className="text-sm text-pearl-aqua-800" role="status">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <DashboardCard density="compact">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <h2 className="text-base font-semibold text-carbon-black-900">Profiel</h2>

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              Naam
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-medium">
              Taal
            </label>
            <select
              id="language"
              value={preferredLanguage}
              onChange={(event) =>
                setPreferredLanguage(event.target.value as "nl" | "en")
              }
              className={inputClasses}
            >
              <option value="nl">Nederlands</option>
              <option value="en">Engels</option>
            </select>
          </div>

          <PrimaryButton type="submit" disabled={updateProfile.isPending}>
            Profiel opslaan
          </PrimaryButton>
        </form>
      </DashboardCard>

      <DashboardCard density="compact">
        <form onSubmit={handleRolesSubmit} className="space-y-4">
          <h2 className="text-base font-semibold text-carbon-black-900">Rollen</h2>
          <div className="flex flex-wrap gap-2">
            {STAFF_ROLE_NAMES.map((role) => (
              <label
                key={role}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dust-grey-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </div>
          <PrimaryButton type="submit" disabled={setRoles.isPending}>
            Rollen opslaan
          </PrimaryButton>
        </form>
      </DashboardCard>

      <DashboardCard density="compact" className="space-y-3">
        <h2 className="text-base font-semibold text-carbon-black-900">Accountstatus</h2>
        <p className="text-sm text-carbon-black-600">
          {account.isActive
            ? "Deactiveer dit account om inloggen te blokkeren."
            : "Activeer dit account om inloggen weer toe te staan."}
        </p>
        <PrimaryButton
          type="button"
          onClick={handleToggleActive}
          disabled={setActive.isPending}
        >
          {account.isActive ? "Account deactiveren" : "Account activeren"}
        </PrimaryButton>
      </DashboardCard>
    </>
  );
}

interface AdminUserDetailViewProps {
  userId: string;
}

export function AdminUserDetailView({ userId }: AdminUserDetailViewProps) {
  const { data: account, isLoading, isError } = useAdminStaffAccountDetail(userId);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Laden...</p>;
  }

  if (isError || !account) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Staffaccount niet gevonden.
      </p>
    );
  }

  const rolesKey = [...account.roles].sort().join(",");
  const formKey = `${account.id}-${rolesKey}-${account.isActive}-${account.fullName ?? ""}`;

  return (
    <div className="space-y-4">
      <SectionHeader
        title={account.fullName?.trim() || "Staffaccount"}
        description={account.email}
        size="compact"
        action={
          <Link href="/admin/users" className="text-sm font-medium text-blue-slate-700 hover:underline">
            Terug naar overzicht
          </Link>
        }
      />

      <AdminUserDetailForm key={formKey} account={account} />
    </div>
  );
}

