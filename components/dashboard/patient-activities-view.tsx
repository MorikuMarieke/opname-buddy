"use client";

import { Calendar } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { usePatientActivitySessions } from "@/hooks/use-patient-activity-sessions";
import { PATIENT_ACTIVITIES_COPY } from "@/lib/constants/patient-activities-copy";
import { formatAmsterdamTimeRange } from "@/lib/utils/amsterdam-date";

export function PatientActivitiesView() {
  const copy = PATIENT_ACTIVITIES_COPY;
  const { data: sessions, isLoading, isError } = usePatientActivitySessions();

  return (
    <div className="space-y-6">
      <SectionHeader title={copy.title} description={copy.description} size="kiosk" />

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          {copy.loadError}
        </p>
      ) : null}

      {!isLoading && !isError && !sessions?.length ? (
        <DashboardCard density="comfortable" padding="lg">
          <EmptyState
            icon={Calendar}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            size="kiosk"
          />
        </DashboardCard>
      ) : null}

      {sessions && sessions.length > 0 ? (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.sessionId}>
              <DashboardCard density="comfortable" padding="lg">
                <h2 className="text-lg font-semibold text-carbon-black-900">
                  {session.activityTitle}
                </h2>
                <p className="mt-1 text-base text-carbon-black-700">
                  {formatAmsterdamTimeRange(session.startsAt, session.endsAt)}
                </p>
                <p className="mt-2 text-sm text-carbon-black-600">
                  {copy.locationLabel}: {session.location}
                </p>
                {session.volunteerNames ? (
                  <p className="mt-1 text-sm text-carbon-black-600">
                    {copy.volunteerLabel}: {session.volunteerNames}
                  </p>
                ) : null}
              </DashboardCard>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
