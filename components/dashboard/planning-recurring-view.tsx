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

export function PlanningRecurringView() {
  const { data: schedules, isLoading, isError } = useRecurringSchedules();
  const copy = PLANNING_COPY.recurring;

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
            href="/planning/recurring/new"
          >
            {copy.addButton}
          </PrimaryButton>
        }
      />

      <DashboardCard density="compact">
        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Schema&apos;s laden…</p>
        ) : isError ? (
          <p className="text-sm text-red-600" role="alert">
            Schema&apos;s laden mislukt.
          </p>
        ) : !schedules?.length ? (
          <EmptyState
            icon={CalendarDays}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={
              <PrimaryButton href="/planning/recurring/new">
                {copy.addButton}
              </PrimaryButton>
            }
          />
        ) : (
          <div className="divide-y divide-dust-grey-100">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-carbon-black-900">
                      {schedule.activityTitle}
                    </h3>
                    <StatusBadge variant="neutral">{copy.badge}</StatusBadge>
                    <StatusBadge variant={schedule.isActive ? "positive" : "neutral"}>
                      {schedule.isActive
                        ? PLANNING_COPY.activities.activeBadge
                        : PLANNING_COPY.activities.inactiveBadge}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-carbon-black-600">
                    {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]} · {schedule.startTime}–
                    {schedule.endTime}
                    {schedule.location ? ` · ${schedule.location}` : ""}
                  </p>
                </div>
                <SecondaryButton
                  size="sm"
                  href={`/planning/recurring/${schedule.id}/edit`}
                >
                  Bewerken
                </SecondaryButton>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
