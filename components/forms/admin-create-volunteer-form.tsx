"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PasswordInput } from "@/components/ui/password-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { useCreateVolunteerAccount } from "@/hooks/use-admin-volunteer-accounts";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

export function AdminCreateVolunteerForm() {
  const router = useRouter();
  const createVolunteer = useCreateVolunteerAccount();
  const copy = VOLUNTEER_COPY.admin;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = await createVolunteer.mutateAsync({
      fullName,
      email,
      password,
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
        title={copy.createTitle}
        description={copy.createDescription}
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
            <PasswordInput
              id="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={createVolunteer.isPending}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="submit" disabled={createVolunteer.isPending}>
              {createVolunteer.isPending ? "Aanmaken..." : "Account aanmaken"}
            </PrimaryButton>
            <PrimaryButton
              href="/admin/users?tab=volunteers"
              className="bg-parchment-300 text-carbon-black-900 hover:bg-parchment-400"
            >
              Annuleren
            </PrimaryButton>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
