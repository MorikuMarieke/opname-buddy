"use client";

import { CalendarDays } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useVolunteerSessions } from "@/hooks/use-volunteer-sessions";
import { SESSION_STATUS_LABELS } from "@/lib/constants/planning-enums";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";

function statusVariant(
  status: keyof typeof SESSION_STATUS_LABELS,
): "neutral" | "attention" | "positive" {
  if (status === "proposed") return "attention";
  if (status === "confirmed") return "positive";
  return "neutral";
}

export function VolunteerPlanningView() {
  const copy = VOLUNTEER_COPY.home;
  const { data: sessions, isLoading, isError } = useVolunteerSessions();

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
      />

      <DashboardCard density="compact">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="px-3 py-4 text-sm text-red-600" role="alert">
            Planning kon niet worden geladen.
          </p>
        ) : null}

        {!isLoading && !isError && !sessions?.length ? (
          <EmptyState
            icon={CalendarDays}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        ) : null}

        {sessions && sessions.length > 0 ? (
          <ul className="divide-y divide-dust-grey-100">
            {sessions.map((session) => (
              <li key={session.sessionId} className="space-y-3 px-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-carbon-black-900">
                      {session.activityTitle}
                    </h2>
                    <p className="text-sm text-carbon-black-600">
                      {formatDutchDateTime(session.startsAt)} –{" "}
                      {formatDutchDateTime(session.endsAt).split(", ").pop()}
                    </p>
                    <p className="text-sm text-carbon-black-700">
                      {session.location}
                    </p>
                  </div>
                  <StatusBadge variant={statusVariant(session.status)}>
                    {SESSION_STATUS_LABELS[session.status]}
                  </StatusBadge>
                </div>

                {session.participants.length > 0 ? (
                  <div className="rounded-xl bg-parchment-100 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-carbon-black-600">
                      {copy.participantsLabel}
                    </p>
                    <ul className="space-y-2">
                      {session.participants.map((participant, index) => (
                        <li
                          key={`${session.sessionId}-${index}`}
                          className="text-sm text-carbon-black-800"
                        >
                          <span className="font-medium">
                            {participant.displayName.trim() || "Deelnemer"}
                          </span>
                          {(participant.departmentName || participant.roomNumber) && (
                            <span className="text-carbon-black-600">
                              {" "}
                              ·{" "}
                              {[participant.departmentName, participant.roomNumber]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-carbon-black-600">
                      {copy.pickupHint}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardCard>
    </div>
  );
}
