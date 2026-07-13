"use client";

import { CalendarDays, Plus } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRecurringSchedules } from "@/hooks/use-recurring-schedules";
import { DAY_OF_WEEK_LABELS } from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { getSeriesReminderStatus } from "@/lib/services/activity-recurring-schedules";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";

export function PlanningSeriesView() {
  const { data: schedules, isLoading, isError } = useRecurringSchedules();
  const copy = PLANNING_COPY.series;

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
        action={
          <PrimaryButton
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            href="/planning/plan"
          >
            {PLANNING_COPY.plan.pageTitle}
          </PrimaryButton>
        }
      />

      <DashboardCard density="compact">
        {isLoading ? (
          <p className="text-sm text-carbon-black-600">{copy.loading}</p>
        ) : isError ? (
          <p className="text-sm text-red-600" role="alert">
            {copy.listError}
          </p>
        ) : !schedules?.length ? (
          <EmptyState
            icon={CalendarDays}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={
              <PrimaryButton href="/planning/plan">
                {PLANNING_COPY.plan.pageTitle}
              </PrimaryButton>
            }
          />
        ) : (
          <div className="divide-y divide-dust-grey-100">
            {schedules.map((schedule) => {
              const reminder = getSeriesReminderStatus(schedule);

              return (
                <div
                  key={schedule.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium text-carbon-black-900">
                        {schedule.activityTitle}
                      </h3>
                      <StatusBadge variant="neutral">{copy.badge}</StatusBadge>
                      <StatusBadge
                        variant={schedule.isActive ? "positive" : "neutral"}
                      >
                        {schedule.isActive
                          ? PLANNING_COPY.activities.activeBadge
                          : PLANNING_COPY.activities.inactiveBadge}
                      </StatusBadge>
                      {reminder === "ending_soon" ? (
                        <StatusBadge variant="attention">
                          {copy.endingSoonBadge}
                        </StatusBadge>
                      ) : null}
                      {reminder === "ended" ? (
                        <StatusBadge variant="neutral">{copy.endedBadge}</StatusBadge>
                      ) : null}
                    </div>
                    <p className="text-sm text-carbon-black-600">
                      {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]} · {schedule.startTime}
                      –{schedule.endTime}
                      {schedule.location ? ` · ${schedule.location}` : ""}
                    </p>
                    <p className="text-sm text-carbon-black-500">
                      {copy.seriesPeriodLabel}:{" "}
                      {formatDutchDate(schedule.seriesStartsOn)} –{" "}
                      {formatDutchDate(schedule.seriesEndsOn)}
                    </p>
                  </div>
                  <SecondaryButton size="sm" href={`/planning/series/${schedule.id}`}>
                    {copy.detailButton}
                  </SecondaryButton>
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
