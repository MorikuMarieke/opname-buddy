"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  ROLE_LABELS,
  STAFF_ROLE_NAMES,
} from "@/lib/constants/admin-account-copy";
import { useCreateStaffAccount } from "@/hooks/use-admin-staff-accounts";
import type { StaffRoleName } from "@/lib/constants/admin-account-copy";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

export function AdminCreateStaffForm() {
  const router = useRouter();
  const createStaff = useCreateStaffAccount();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<StaffRoleName[]>(["caregiver"]);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: StaffRoleName) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((value) => value !== role)
        : [...current, role],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = await createStaff.mutateAsync({
      fullName,
      email,
      password,
      roles,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(`/admin/users/${result.userId}`);
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Medewerker toevoegen"
        description="Maak een staffaccount aan met rollen. Patiëntaccounts worden niet hier aangemaakt."
        size="compact"
      />

      <DashboardCard density="compact">
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
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
            <label htmlFor="email" className="block text-sm font-medium">
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Tijdelijk wachtwoord
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClasses}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Rollen</legend>
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
          </fieldset>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="submit" disabled={createStaff.isPending}>
              {createStaff.isPending ? "Aanmaken..." : "Account aanmaken"}
            </PrimaryButton>
            <PrimaryButton href="/admin/users" className="bg-parchment-300 text-carbon-black-900 hover:bg-parchment-400">
              Annuleren
            </PrimaryButton>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
