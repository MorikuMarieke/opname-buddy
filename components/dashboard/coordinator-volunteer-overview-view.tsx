"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formInputClasses } from "@/components/forms/form-styles";
import { useCoordinatorVolunteerOverview } from "@/hooks/use-coordinator-volunteer-overview";
import { COORDINATOR_VOLUNTEER_OVERVIEW_COPY } from "@/lib/constants/coordinator-volunteer-overview-copy";
import {
  PARTICIPATION_BLOCKS,
  type DayOfWeek,
} from "@/lib/constants/daily-participation";
import {
  formatDutchDate,
  getAmsterdamDateString,
  getDutchWeekdayLabelFromIsoDate,
} from "@/lib/utils/amsterdam-date";
import {
  getMonthAbsenceSlots,
  getWeeklyDayLabel,
  WEEKLY_BLOCK_DISPLAY_ORDER,
} from "@/lib/utils/volunteer-block-availability";
import type { CoordinatorVolunteerOverviewRow } from "@/lib/services/coordinator-volunteer-overview";

function getCurrentYearMonth(): string {
  return getAmsterdamDateString().slice(0, 7);
}

function VolunteerOverviewCard({
  volunteer,
  yearMonth,
  copy,
}: {
  volunteer: CoordinatorVolunteerOverviewRow;
  yearMonth: string;
  copy: typeof COORDINATOR_VOLUNTEER_OVERVIEW_COPY;
}) {
  const absenceSlots = getMonthAbsenceSlots(yearMonth, volunteer.weekly_blocks);
  const absentKeys = new Set(
    volunteer.month_absences.map(
      (absence) => `${absence.absence_date}:${absence.block}`,
    ),
  );

  return (
    <DashboardCard density="comfortable" padding="lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-carbon-black-900">
            {volunteer.full_name || "Vrijwilliger"}
          </h3>
          {volunteer.volunteer_bio ? (
            <p className="mt-2 text-sm text-carbon-black-700">
              {volunteer.volunteer_bio}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            variant={volunteer.morning_effective_today ? "positive" : "neutral"}
          >
            {copy.morningShort}:{" "}
            {volunteer.morning_effective_today
              ? copy.availableToday
              : copy.unavailableToday}
          </StatusBadge>
          <StatusBadge
            variant={volunteer.afternoon_effective_today ? "positive" : "neutral"}
          >
            {copy.afternoonShort}:{" "}
            {volunteer.afternoon_effective_today
              ? copy.availableToday
              : copy.unavailableToday}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-carbon-black-900">
          {copy.weeklyTitle}
        </h4>
        <div className="space-y-2">
          {WEEKLY_BLOCK_DISPLAY_ORDER.map((dayOfWeek) => {
            const block = volunteer.weekly_blocks.find(
              (row) => row.day_of_week === dayOfWeek,
            );

            return (
              <div
                key={dayOfWeek}
                className="flex flex-col gap-2 rounded-xl border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-carbon-black-900">
                  {getWeeklyDayLabel(dayOfWeek as DayOfWeek)}
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    variant={
                      block?.morning_available ? "positive" : "neutral"
                    }
                  >
                    {copy.morningShort} ({PARTICIPATION_BLOCKS.morning.label})
                  </StatusBadge>
                  <StatusBadge
                    variant={
                      block?.afternoon_available ? "positive" : "neutral"
                    }
                  >
                    {copy.afternoonShort} ({PARTICIPATION_BLOCKS.afternoon.label})
                  </StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-carbon-black-900">
          {copy.absencesTitle}
        </h4>
        {absenceSlots.filter((slot) =>
          absentKeys.has(`${slot.absenceDate}:${slot.block}`),
        ).length === 0 ? (
          <p className="text-sm text-carbon-black-600">{copy.absencesEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {absenceSlots.map((slot) => {
              const isAbsent = absentKeys.has(
                `${slot.absenceDate}:${slot.block}`,
              );

              if (!isAbsent) {
                return null;
              }

              return (
                <li
                  key={`${slot.absenceDate}:${slot.block}`}
                  className="rounded-xl border border-parchment-200 bg-white px-4 py-3 text-sm text-carbon-black-800"
                >
                  {slot.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardCard>
  );
}

export function CoordinatorVolunteerOverviewView() {
  const copy = COORDINATOR_VOLUNTEER_OVERVIEW_COPY;
  const [planDate, setPlanDate] = useState(getAmsterdamDateString());
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const { data, isLoading, error } = useCoordinatorVolunteerOverview(
    planDate,
    yearMonth,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={copy.title}
        description={copy.description}
        size="kiosk"
      />

      <DashboardCard density="compact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="overview_plan_date"
              className="mb-2 block text-sm font-medium text-carbon-black-900"
            >
              {copy.todayLabel}
            </label>
            <input
              id="overview_plan_date"
              type="date"
              value={planDate}
              onChange={(event) => setPlanDate(event.target.value)}
              className={formInputClasses}
            />
            <p className="mt-2 text-sm text-carbon-black-600">
              {getDutchWeekdayLabelFromIsoDate(planDate)} {formatDutchDate(planDate)}
            </p>
          </div>
          <div>
            <label
              htmlFor="overview_month"
              className="mb-2 block text-sm font-medium text-carbon-black-900"
            >
              {copy.monthLabel}
            </label>
            <input
              id="overview_month"
              type="month"
              value={yearMonth}
              onChange={(event) => setYearMonth(event.target.value)}
              className={formInputClasses}
            />
          </div>
        </div>
      </DashboardCard>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof Error ? error.message : copy.loadError}
        </p>
      ) : null}

      {!isLoading && !error && data?.length === 0 ? (
        <EmptyState
          icon={Users}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
          size="kiosk"
        />
      ) : null}

      {!isLoading && !error && data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((volunteer) => (
            <VolunteerOverviewCard
              key={volunteer.user_id}
              volunteer={volunteer}
              yearMonth={yearMonth}
              copy={copy}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
