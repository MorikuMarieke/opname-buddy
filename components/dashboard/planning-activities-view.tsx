"use client";

import Link from "next/link";
import { Activity, Plus } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useActivities } from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";

export function PlanningActivitiesView() {
  const { data: activities, isLoading, isError } = useActivities();
  const copy = PLANNING_COPY.activities;

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
            href="/planning/activities/new"
          >
            {copy.addButton}
          </PrimaryButton>
        }
      />

      <DashboardCard density="compact">
        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Activiteiten laden…</p>
        ) : isError ? (
          <p className="text-sm text-red-600" role="alert">
            {copy.listError}
          </p>
        ) : !activities?.length ? (
          <EmptyState
            icon={Activity}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={
              <PrimaryButton href="/planning/activities/new">
                {copy.addButton}
              </PrimaryButton>
            }
          />
        ) : (
          <div className="divide-y divide-dust-grey-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-carbon-black-900">
                      {activity.title}
                    </h3>
                    <StatusBadge variant={activity.isActive ? "positive" : "neutral"}>
                      {activity.isActive ? copy.activeBadge : copy.inactiveBadge}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-carbon-black-600 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-carbon-black-500">
                    {PLANNING_COPY.categoryLabels[activity.category]} ·{" "}
                    {PLANNING_COPY.intensityLabels[activity.intensity]} ·{" "}
                    {activity.minParticipants}–{activity.maxParticipants} deelnemers
                  </p>
                </div>
                <SecondaryButton
                  size="sm"
                  href={`/planning/activities/${activity.id}/edit`}
                >
                  Bewerken
                </SecondaryButton>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {!isLoading && !isError && activities?.length ? (
        <p className="text-sm text-carbon-black-600">
          <Link href="/planning/activities/new" className="underline">
            Nieuwe activiteit toevoegen
          </Link>
        </p>
      ) : null}
    </div>
  );
}
