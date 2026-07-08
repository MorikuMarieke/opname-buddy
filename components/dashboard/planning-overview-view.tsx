"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useMemo } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCoordinatorVolunteerProfiles } from "@/hooks/use-planning-coordinator-volunteers";
import { usePlanningSessions } from "@/hooks/use-planning-sessions";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { SESSION_STATUS_LABELS } from "@/lib/constants/planning-enums";
import {
  formatAmsterdamTimeRange,
  formatDutchLongDate,
  getAmsterdamDateString,
  isAmsterdamSameDay,
} from "@/lib/utils/amsterdam-date";
import { getVolunteersAvailableOnDate } from "@/lib/services/planning-coordinator-volunteers";
import { getAmsterdamDayBoundsIso } from "@/lib/utils/planning-time";
import { cn } from "@/lib/utils/cn";
import type { PlanningSessionListItem } from "@/types/activity";
import type { SessionStatus } from "@/lib/constants/planning-enums";

const nestedActivityColors = [
  "bg-pearl-aqua-100",
  "bg-copper-100",
  "bg-blue-slate-100",
] as const;

function statusVariant(
  status: SessionStatus,
): "neutral" | "attention" | "positive" {
  if (status === "proposed") return "attention";
  if (status === "confirmed" || status === "completed") return "positive";
  return "neutral";
}

function groupSessionsByLocation(
  sessions: PlanningSessionListItem[],
): { location: string; sessions: PlanningSessionListItem[] }[] {
  const map = new Map<string, PlanningSessionListItem[]>();

  for (const session of sessions) {
    const existing = map.get(session.location) ?? [];
    existing.push(session);
    map.set(session.location, existing);
  }

  return Array.from(map.entries())
    .map(([location, locationSessions]) => ({
      location,
      sessions: locationSessions.sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
      ),
    }))
    .sort((a, b) => a.location.localeCompare(b.location, "nl"));
}

function getInitials(fullName: string | null): string {
  if (!fullName?.trim()) {
    return "?";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlanningOverviewView() {
  const copy = PLANNING_COPY.overview;
  const today = getAmsterdamDateString();
  const bounds = getAmsterdamDayBoundsIso(today);

  const { data: sessions, isLoading, isError } = usePlanningSessions({
    from: bounds.from,
    to: bounds.to,
  });

  const todaySessions = useMemo(
    () =>
      (sessions ?? []).filter(
        (session) =>
          session.status !== "cancelled" &&
          isAmsterdamSameDay(session.startsAt, today),
      ),
    [sessions, today],
  );

  const locations = useMemo(
    () => groupSessionsByLocation(todaySessions),
    [todaySessions],
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={formatDutchLongDate()}
        size="compact"
        action={
          <PrimaryButton
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            href="/planning/sessions/new"
          >
            {copy.addSessionButton}
          </PrimaryButton>
        }
      />

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          {copy.listError}
        </p>
      ) : null}

      {!isLoading && !isError && locations.length === 0 ? (
        <DashboardCard density="compact">
          <EmptyState
            icon={CalendarDays}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </DashboardCard>
      ) : null}

      {locations.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {locations.map((locationGroup) => (
            <DashboardCard
              key={locationGroup.location}
              title={locationGroup.location}
              density="compact"
            >
              <div className="space-y-2">
                {locationGroup.sessions.map((session, sessionIndex) => (
                  <Link
                    key={session.sessionId}
                    href={`/planning/sessions/${session.sessionId}`}
                    className={cn(
                      "block rounded-lg p-2.5 transition hover:ring-2 hover:ring-pearl-aqua-300",
                      nestedActivityColors[
                        sessionIndex % nestedActivityColors.length
                      ],
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-carbon-black-900">
                        {session.activityTitle}
                      </p>
                      <StatusBadge variant={statusVariant(session.status)}>
                        {SESSION_STATUS_LABELS[session.status]}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-carbon-black-600">
                      {formatAmsterdamTimeRange(session.startsAt, session.endsAt)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-blue-slate-700">
                      {session.participantCount} / {session.maxParticipants}{" "}
                      deelnemers · {session.volunteerCount} vrijwilliger(s)
                    </p>
                  </Link>
                ))}
              </div>
            </DashboardCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PlanningOverviewRightPanel() {
  const copy = PLANNING_COPY.overview;
  const today = getAmsterdamDateString();
  const { data: profiles, isLoading, isError } = useCoordinatorVolunteerProfiles();

  const volunteersToday = useMemo(
    () => getVolunteersAvailableOnDate(profiles ?? [], today),
    [profiles, today],
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">
          {copy.volunteersTodayTitle}
        </h3>

        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-600">{copy.volunteersTodayError}</p>
        ) : null}

        {!isLoading && !isError && volunteersToday.length === 0 ? (
          <p className="text-sm text-carbon-black-600">
            {copy.volunteersTodayEmpty}
          </p>
        ) : null}

        {volunteersToday.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {volunteersToday.map((volunteer) => (
              <li
                key={`${volunteer.userId}-${volunteer.startTime}-${volunteer.source}`}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pearl-aqua-200 text-xs font-semibold text-pearl-aqua-800">
                  {getInitials(volunteer.fullName)}
                </div>
                <div>
                  <p className="font-medium text-carbon-black-900">
                    {volunteer.fullName?.trim() || "Vrijwilliger"}
                  </p>
                  <p className="text-xs text-carbon-black-600">
                    {volunteer.startTime} – {volunteer.endTime}
                    {volunteer.source === "extra" ? " (extra)" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
