"use client";

import Link from "next/link";
import { useState } from "react";

import { FacilitatorPicker } from "@/components/forms/facilitator-picker";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useEndRecurringSeries,
  useExtendRecurringSeries,
  useRecurringSeriesDetail,
  useSetRecurringSeriesFacilitators,
} from "@/hooks/use-recurring-schedules";
import {
  DAY_OF_WEEK_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  getSeriesReminderStatus,
  type RecurringSeriesDetail,
} from "@/lib/services/activity-recurring-schedules";
import { formatDutchDate, formatDutchDateTime } from "@/lib/utils/amsterdam-date";

interface PlanningSeriesDetailViewProps {
  scheduleId: string;
}

function sortedIdsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

interface PlanningSeriesDetailPanelProps {
  scheduleId: string;
  detail: RecurringSeriesDetail;
}

function PlanningSeriesDetailPanel({
  scheduleId,
  detail,
}: PlanningSeriesDetailPanelProps) {
  const copy = PLANNING_COPY.series;
  const extendMutation = useExtendRecurringSeries(scheduleId);
  const endMutation = useEndRecurringSeries(scheduleId);
  const facilitatorsMutation = useSetRecurringSeriesFacilitators(scheduleId);

  const [selectedFacilitatorIds, setSelectedFacilitatorIds] = useState(
    () => detail.facilitatorUserIds,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { schedule, activityTitle, sessions } = detail;
  const reminder = getSeriesReminderStatus(schedule);
  const hasUnsavedFacilitators = !sortedIdsEqual(
    selectedFacilitatorIds,
    detail.facilitatorUserIds,
  );
  const isBusy =
    extendMutation.isPending ||
    endMutation.isPending ||
    facilitatorsMutation.isPending;

  async function handleExtendSeries() {
    setActionError(null);
    try {
      await extendMutation.mutateAsync(12);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : copy.actionError);
    }
  }

  async function handleEndSeries() {
    setActionError(null);
    try {
      await endMutation.mutateAsync();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : copy.actionError);
    }
  }

  async function handleSaveFacilitators() {
    setActionError(null);
    try {
      await facilitatorsMutation.mutateAsync(selectedFacilitatorIds);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : copy.actionError);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.detailTitle}
        description={activityTitle}
        size="compact"
        action={
          <SecondaryButton size="sm" href="/planning/series">
            {copy.backButton}
          </SecondaryButton>
        }
      />

      {reminder === "ending_soon" ? (
        <DashboardCard density="compact" title={copy.reminderTitle}>
          <p className="text-sm text-carbon-black-700">{copy.endingSoonMessage}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PrimaryButton
              size="sm"
              onClick={handleExtendSeries}
              disabled={isBusy}
            >
              {copy.extendButton}
            </PrimaryButton>
            <SecondaryButton
              size="sm"
              onClick={handleEndSeries}
              disabled={isBusy}
            >
              {copy.letEndButton}
            </SecondaryButton>
          </div>
        </DashboardCard>
      ) : null}

      {reminder === "ended" ? (
        <DashboardCard density="compact" title={copy.reminderTitle}>
          <p className="text-sm text-carbon-black-700">{copy.endedMessage}</p>
        </DashboardCard>
      ) : null}

      <DashboardCard density="compact" title={copy.overviewTitle}>
        <div className="space-y-2 text-sm text-carbon-black-700">
          <p>
            {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]} · {schedule.startTime}–
            {schedule.endTime}
          </p>
          {schedule.location ? <p>{schedule.location}</p> : null}
          <p>
            {copy.seriesPeriodLabel}: {formatDutchDate(schedule.seriesStartsOn)} –{" "}
            {formatDutchDate(schedule.seriesEndsOn)}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusBadge variant={schedule.isActive ? "positive" : "neutral"}>
              {schedule.isActive
                ? PLANNING_COPY.activities.activeBadge
                : PLANNING_COPY.activities.inactiveBadge}
            </StatusBadge>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard density="compact" title={PLANNING_COPY.sessions.facilitatorsTitle}>
        <FacilitatorPicker
          selectedUserIds={selectedFacilitatorIds}
          onChange={setSelectedFacilitatorIds}
          disabled={isBusy || Boolean(schedule.endedAt)}
        />
        {hasUnsavedFacilitators && !schedule.endedAt ? (
          <div className="mt-4">
            <PrimaryButton onClick={handleSaveFacilitators} disabled={isBusy}>
              {PLANNING_COPY.sessions.saveAssignmentsButton}
            </PrimaryButton>
          </div>
        ) : null}
      </DashboardCard>

      <DashboardCard density="compact" title={copy.sessionsTitle}>
        {!sessions.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptySessions}</p>
        ) : (
          <ul className="divide-y divide-dust-grey-100">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-carbon-black-900">
                    {formatDutchDateTime(session.startsAt)}
                  </p>
                  <p className="text-sm text-carbon-black-600">
                    {session.location}
                    {session.isDetached ? ` · ${copy.detachedLabel}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge variant="neutral">
                    {SESSION_STATUS_LABELS[session.status]}
                  </StatusBadge>
                  <SecondaryButton
                    size="sm"
                    href={`/planning/sessions/${session.id}`}
                  >
                    {copy.openSessionButton}
                  </SecondaryButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <p className="text-sm text-carbon-black-600">
        {copy.structuralEditHint}{" "}
        <Link
          href={`/planning/recurring/${scheduleId}/edit`}
          className="font-medium text-pearl-aqua-800 underline"
        >
          {copy.structuralEditLink}
        </Link>
      </p>

      {actionError ? (
        <p className="text-sm text-red-600" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}

export function PlanningSeriesDetailView({
  scheduleId,
}: PlanningSeriesDetailViewProps) {
  const copy = PLANNING_COPY.series;
  const { data: detail, isLoading, isError } = useRecurringSeriesDetail(scheduleId);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">{copy.loading}</p>;
  }

  if (isError || !detail) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {copy.notFound}
      </p>
    );
  }

  const facilitatorKey = detail.facilitatorUserIds.join(",");

  return (
    <PlanningSeriesDetailPanel
      key={`${scheduleId}-${facilitatorKey}-${detail.schedule.updatedAt}`}
      scheduleId={scheduleId}
      detail={detail}
    />
  );
}
