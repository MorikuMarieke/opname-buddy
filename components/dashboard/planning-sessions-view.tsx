"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePlanningSessions } from "@/hooks/use-planning-sessions";
import {
  SESSION_KIND_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUSES,
  SESSION_KINDS,
  type SessionKind,
  type SessionStatus,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";

const inputClasses =
  "h-11 rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

function statusVariant(
  status: SessionStatus,
): "neutral" | "attention" | "positive" {
  if (status === "confirmed" || status === "completed") return "positive";
  return "neutral";
}

export function PlanningSessionsView() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">("all");
  const [kindFilter, setKindFilter] = useState<SessionKind | "all">("all");
  const copy = PLANNING_COPY.sessions;

  const { data: sessions, isLoading, isError } = usePlanningSessions({
    status: statusFilter === "all" ? null : statusFilter,
    sessionKind: kindFilter === "all" ? null : kindFilter,
  });

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
            href="/planning/sessions/new"
          >
            {copy.addOneOffButton}
          </PrimaryButton>
        }
      />

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-carbon-black-700">
          {copy.filters.status}
          <select
            className={inputClasses}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as SessionStatus | "all")
            }
          >
            <option value="all">{copy.filters.all}</option>
            {SESSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {SESSION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-carbon-black-700">
          {copy.filters.kind}
          <select
            className={inputClasses}
            value={kindFilter}
            onChange={(event) =>
              setKindFilter(event.target.value as SessionKind | "all")
            }
          >
            <option value="all">{copy.filters.all}</option>
            {SESSION_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {SESSION_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DashboardCard density="compact">
        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Sessies laden…</p>
        ) : isError ? (
          <p className="text-sm text-red-600" role="alert">
            {copy.listError}
          </p>
        ) : !sessions?.length ? (
          <EmptyState
            icon={CalendarDays}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={
              <PrimaryButton href="/planning/sessions/new">
                {copy.addOneOffButton}
              </PrimaryButton>
            }
          />
        ) : (
          <div className="divide-y divide-dust-grey-100">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-carbon-black-900">
                      {session.activityTitle}
                    </h3>
                    <StatusBadge variant="neutral">
                      {SESSION_KIND_LABELS[session.sessionKind]}
                    </StatusBadge>
                    <StatusBadge variant={statusVariant(session.status)}>
                      {SESSION_STATUS_LABELS[session.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-carbon-black-600">
                    {formatDutchDateTime(session.startsAt)} –{" "}
                    {formatDutchDateTime(session.endsAt).split(", ")[1]} ·{" "}
                    {session.location}
                  </p>
                  <p className="text-xs text-carbon-black-500">
                    {session.participantCount}/{session.maxParticipants} deelnemers ·{" "}
                    {session.facilitatorCount} begeleider(s)
                  </p>
                </div>
                <SecondaryButton
                  size="sm"
                  href={`/planning/sessions/${session.sessionId}`}
                >
                  Details
                </SecondaryButton>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
