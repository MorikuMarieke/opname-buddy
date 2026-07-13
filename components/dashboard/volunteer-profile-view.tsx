"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { VolunteerBioSection } from "@/components/dashboard/volunteer-bio-section";
import { useVolunteerProfile } from "@/hooks/use-volunteer-profile";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import type { VolunteerProfile } from "@/lib/services/volunteer-profile";

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-parchment-100 py-2 last:border-0">
      <dt className="text-xs font-medium text-carbon-black-600">{label}</dt>
      <dd className="text-sm text-carbon-black-900">{value}</dd>
    </div>
  );
}

function VolunteerAccountSection({
  profile,
  copy,
}: {
  profile: VolunteerProfile;
  copy: (typeof VOLUNTEER_COPY)["profile"];
}) {
  return (
    <DashboardCard density="compact" title={copy.accountTitle} className="min-w-0 max-w-full">
      <p className="mb-4 text-sm text-carbon-black-600">{copy.accountHint}</p>

      <dl className="grid gap-x-4 md:grid-cols-2">
        <ReadOnlyRow
          label={copy.fullNameLabel}
          value={profile.fullName?.trim() || copy.notSet}
        />
        <ReadOnlyRow
          label={copy.emailLabel}
          value={profile.email?.trim() || copy.notSet}
        />
      </dl>
    </DashboardCard>
  );
}

export function VolunteerProfileView() {
  const copy = VOLUNTEER_COPY.profile;
  const { data: profile, isLoading, isError } = useVolunteerProfile();

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
      />

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Profiel kon niet worden geladen.
        </p>
      ) : null}

      {profile ? <VolunteerAccountSection profile={profile} copy={copy} /> : null}

      <VolunteerBioSection />
    </div>
  );
}
