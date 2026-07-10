"use client";

import { Users } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCoordinatorVolunteerProfiles } from "@/hooks/use-planning-coordinator-volunteers";
import {
  DAY_OF_WEEK_LABELS,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { formatDutchDate, formatAmsterdamTime } from "@/lib/utils/amsterdam-date";
import { formatVolunteerRecurringSummary } from "@/lib/services/planning-coordinator-volunteers";

export function PlanningCoordinatorVolunteersView() {
  const copy = PLANNING_COPY.coordinatorVolunteers;
  const availabilityCopy = VOLUNTEER_COPY.availability;
  const { data: profiles, isLoading, isError } = useCoordinatorVolunteerProfiles();

  return (
    <div className="space-y-4">
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
          {copy.listError}
        </p>
      ) : null}

      {!isLoading && !isError && !profiles?.length ? (
        <DashboardCard density="compact">
          <EmptyState
            icon={Users}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </DashboardCard>
      ) : null}

      {profiles && profiles.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {profiles.map((profile) => {
            const activeRecurring = profile.recurringAvailability.filter(
              (slot) => slot.isActive,
            );
            const sortedExceptions = [...profile.availabilityExceptions].sort(
              (a, b) =>
                b.exceptionDate.localeCompare(a.exceptionDate) ||
                a.startTime.localeCompare(b.startTime),
            );

            return (
              <DashboardCard
                key={profile.userId}
                density="compact"
                title={profile.fullName?.trim() || "Naamloze vrijwilliger"}
              >
                <p className="mb-4 text-sm text-carbon-black-600">
                  {formatVolunteerRecurringSummary(profile.recurringAvailability)}
                </p>

                {profile.volunteerBio ? (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">
                      {copy.bioTitle}
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-carbon-black-700">
                      {profile.volunteerBio}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">
                      {copy.recurringTitle}
                    </h3>
                    {activeRecurring.length === 0 ? (
                      <p className="text-sm text-carbon-black-600">
                        {copy.noRecurring}
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {activeRecurring.map((slot) => (
                          <li
                            key={slot.id}
                            className="rounded-lg bg-parchment-100 px-3 py-2"
                          >
                            {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} ·{" "}
                            {formatAmsterdamTime(slot.startTime)} –{" "}
                            {formatAmsterdamTime(slot.endTime)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">
                      {copy.exceptionsTitle}
                    </h3>
                    {sortedExceptions.length === 0 ? (
                      <p className="text-sm text-carbon-black-600">
                        {copy.noExceptions}
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {sortedExceptions.slice(0, 8).map((exception) => (
                          <li
                            key={exception.id}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-parchment-100 px-3 py-2"
                          >
                            <span>
                              {formatDutchDate(exception.exceptionDate)} ·{" "}
                              {formatAmsterdamTime(exception.startTime)} –{" "}
                              {formatAmsterdamTime(exception.endTime)}
                            </span>
                            <StatusBadge
                              variant={
                                exception.kind === "extra" ? "positive" : "attention"
                              }
                            >
                              {exception.kind === "extra"
                                ? availabilityCopy.kindExtra
                                : availabilityCopy.kindUnavailable}
                            </StatusBadge>
                            {exception.note ? (
                              <span className="text-carbon-black-600">
                                {exception.note}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
