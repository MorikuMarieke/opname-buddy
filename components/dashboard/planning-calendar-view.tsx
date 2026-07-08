"use client";

import Link from "next/link";
import { useMemo } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePlanningSessions } from "@/hooks/use-planning-sessions";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  formatDutchDate,
  formatAmsterdamTime,
  getAmsterdamDateString,
  isAmsterdamSameDay,
} from "@/lib/utils/amsterdam-date";
import {
  getAmsterdamWeekBoundsIso,
  getAmsterdamWeekDateStrings,
} from "@/lib/utils/planning-time";
import type { PlanningSessionListItem } from "@/types/activity";

const weekDayLabels = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function sessionsForDay(
  sessions: PlanningSessionListItem[],
  dateString: string,
): PlanningSessionListItem[] {
  return sessions
    .filter(
      (session) =>
        session.status !== "cancelled" &&
        isAmsterdamSameDay(session.startsAt, dateString),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function PlanningCalendarView() {
  const copy = PLANNING_COPY.calendar;
  const today = getAmsterdamDateString();
  const weekDates = getAmsterdamWeekDateStrings(today);
  const bounds = getAmsterdamWeekBoundsIso(today);

  const { data: sessions, isLoading, isError } = usePlanningSessions({
    from: bounds.from,
    to: bounds.to,
  });

  const weekSessions = useMemo(() => sessions ?? [], [sessions]);

  const weekLabel = `${formatDutchDate(weekDates[0])} – ${formatDutchDate(weekDates[6])}`;

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={`${copy.pageDescription} ${weekLabel}`}
        size="compact"
      />

      <DashboardCard density="compact" className="overflow-x-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="px-3 py-4 text-sm text-red-600" role="alert">
            {copy.listError}
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-2 border-b border-dust-grey-200 pb-2">
              {weekDayLabels.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-carbon-black-600"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {weekDates.map((dateString) => {
                const daySessions = sessionsForDay(weekSessions, dateString);
                const dayNumber = Number(dateString.split("-")[2]);

                return (
                  <div
                    key={dateString}
                    className={
                      dateString === today
                        ? "min-h-24 rounded-lg border border-pearl-aqua-300 bg-pearl-aqua-50 p-2"
                        : "min-h-24 rounded-lg border border-parchment-200 bg-white p-2"
                    }
                  >
                    <p className="mb-1.5 text-xs font-medium text-carbon-black-600">
                      {dayNumber}
                    </p>
                    <div className="space-y-1">
                      {daySessions.length === 0 ? (
                        <p className="text-[11px] text-carbon-black-500">
                          {copy.emptyDay}
                        </p>
                      ) : null}
                      {daySessions.map((session) => (
                        <Link
                          key={session.sessionId}
                          href={`/planning/sessions/${session.sessionId}`}
                          className="block rounded-md bg-pearl-aqua-200 px-1.5 py-1 text-xs hover:bg-pearl-aqua-300"
                        >
                          <p className="font-medium text-carbon-black-900">
                            {session.activityTitle}
                          </p>
                          <p className="text-carbon-black-600">
                            {formatAmsterdamTime(session.startsAt)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </DashboardCard>
    </div>
  );
}
