"use client";

import { useEffect, useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import {
  useUpdateVolunteerBio,
  useVolunteerProfile,
} from "@/hooks/use-volunteer-profile";

const textareaClasses =
  "min-h-28 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900";

export function VolunteerBioSection() {
  const copy = VOLUNTEER_COPY.availability;
  const { data: profile, isLoading } = useVolunteerProfile();
  const updateBio = useUpdateVolunteerBio();
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.volunteerBio ?? "");
    }
  }, [profile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await updateBio.mutateAsync(bio);
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.",
      );
    }
  }

  return (
    <DashboardCard density="compact" title={copy.profileTitle} className="min-w-0 max-w-full">
      <p className="mb-4 text-sm text-carbon-black-600">{copy.profileHint}</p>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{copy.bioLabel}</span>
            <textarea
              className={textareaClasses}
              value={bio}
              maxLength={500}
              onChange={(event) => {
                setBio(event.target.value);
                setSuccess(false);
              }}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton type="submit" disabled={updateBio.isPending}>
              {copy.bioSave}
            </PrimaryButton>
            <span className="text-xs text-carbon-black-500">
              {bio.length}/500
            </span>
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="text-sm text-pearl-aqua-700" role="status">
              {copy.bioSaved}
            </p>
          ) : null}
        </form>
      )}
    </DashboardCard>
  );
}
