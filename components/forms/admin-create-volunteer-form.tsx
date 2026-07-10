"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PasswordInput } from "@/components/ui/password-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { useCreateVolunteerAccount } from "@/hooks/use-admin-volunteer-accounts";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

interface CreateSuccessState {
  userId: string;
  email: string;
  fullName: string;
}

export function AdminCreateVolunteerForm() {
  const createVolunteer = useCreateVolunteerAccount();
  const copy = VOLUNTEER_COPY.admin;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateSuccessState | null>(null);

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

    setSuccess({
      userId: result.userId,
      email: email.trim(),
      fullName: fullName.trim(),
    });
    setPassword("");
  }

  if (success) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title={copy.createSuccessTitle}
          description={success.fullName}
          size="compact"
        />

        <DashboardCard density="compact" className="space-y-4">
          <p className="text-sm text-pearl-aqua-800" role="status">
            Het account is actief. {copy.createSuccessPasswordHint}
          </p>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-carbon-black-900">E-mailadres</dt>
              <dd className="mt-0.5 text-carbon-black-700">{success.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-carbon-black-900">
                {copy.createSuccessLoginLabel}
              </dt>
              <dd className="mt-0.5">
                <code className="rounded bg-parchment-200 px-2 py-0.5 text-carbon-black-800">
                  {copy.createSuccessLoginPath}
                </code>
              </dd>
            </div>
          </dl>

          <p className="text-sm text-carbon-black-600">{copy.createSuccessNextSteps}</p>

          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              href={`/admin/users/${success.userId}`}
              size="sm"
            >
              {copy.createSuccessViewAccount}
            </PrimaryButton>
            <PrimaryButton
              href="/admin/users?tab=volunteers"
              size="sm"
              className="bg-parchment-300 text-carbon-black-900 hover:bg-parchment-400"
            >
              Terug naar vrijwilligers
            </PrimaryButton>
          </div>
        </DashboardCard>
      </div>
    );
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
