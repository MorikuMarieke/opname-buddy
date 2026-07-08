"use client";

import { useEffect, useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePlanningPatients } from "@/hooks/use-planning-patients";
import {
  usePlanningSessionDetail,
  useSetSessionParticipants,
  useSetSessionVolunteers,
  useUpdateSessionStatus,
} from "@/hooks/use-planning-sessions";
import { usePlanningVolunteers } from "@/hooks/use-planning-volunteers";
import {
  SESSION_KIND_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TRANSITIONS,
  type SessionStatus,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { isSessionEditable } from "@/lib/services/activity-sessions";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";

interface PlanningSessionDetailViewProps {
  sessionId: string;
}

const copy = PLANNING_COPY.sessions;

function getStatusActionLabel(nextStatus: SessionStatus): string {
  if (nextStatus === "proposed") return copy.statusActions.propose;
  if (nextStatus === "confirmed") return copy.statusActions.confirm;
  if (nextStatus === "draft") return copy.statusActions.backToDraft;
  if (nextStatus === "completed") return copy.statusActions.complete;
  if (nextStatus === "cancelled") return copy.statusActions.cancel;
  return SESSION_STATUS_LABELS[nextStatus];
}

function statusVariant(
  status: SessionStatus,
): "neutral" | "attention" | "positive" {
  if (status === "proposed") return "attention";
  if (status === "confirmed" || status === "completed") return "positive";
  return "neutral";
}

export function PlanningSessionDetailView({ sessionId }: PlanningSessionDetailViewProps) {
  const { data: detail, isLoading, isError } = usePlanningSessionDetail(sessionId);
  const { data: patients } = usePlanningPatients();
  const { data: volunteers } = usePlanningVolunteers();
  const statusMutation = useUpdateSessionStatus(sessionId);
  const participantsMutation = useSetSessionParticipants(sessionId);
  const volunteersMutation = useSetSessionVolunteers(sessionId);

  const [selectedAdmissionIds, setSelectedAdmissionIds] = useState<string[]>([]);
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (detail) {
      setSelectedAdmissionIds(detail.participantAdmissionIds);
      setSelectedVolunteerIds(detail.volunteerUserIds);
    }
  }, [detail]);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Sessie laden…</p>;
  }

  if (isError || !detail) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Sessie niet gevonden.
      </p>
    );
  }

  const { session, activityTitle, activityDescription } = detail;
  const editable = isSessionEditable(session.status);
  const nextStatuses = SESSION_STATUS_TRANSITIONS[session.status];
  const isBusy =
    statusMutation.isPending ||
    participantsMutation.isPending ||
    volunteersMutation.isPending;

  function toggleAdmission(admissionId: string) {
    setSelectedAdmissionIds((current) =>
      current.includes(admissionId)
        ? current.filter((id) => id !== admissionId)
        : [...current, admissionId],
    );
  }

  function toggleVolunteer(userId: string) {
    setSelectedVolunteerIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  async function handleStatusChange(nextStatus: SessionStatus) {
    setActionError(null);
    try {
      await statusMutation.mutateAsync(nextStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Actie mislukt.");
    }
  }

  async function handleSaveAssignments() {
    setActionError(null);
    try {
      await participantsMutation.mutateAsync(selectedAdmissionIds);
      await volunteersMutation.mutateAsync(selectedVolunteerIds);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Opslaan mislukt.");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.detailTitle}
        description={activityTitle}
        size="compact"
        action={
          <SecondaryButton size="sm" href="/planning/sessions">
            Terug naar sessies
          </SecondaryButton>
        }
      />

      <DashboardCard density="compact" title="Overzicht">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="neutral">
              {SESSION_KIND_LABELS[session.sessionKind]}
            </StatusBadge>
            <StatusBadge variant={statusVariant(session.status)}>
              {SESSION_STATUS_LABELS[session.status]}
            </StatusBadge>
          </div>
          <p className="text-sm text-carbon-black-700">{activityDescription}</p>
          <p className="text-sm text-carbon-black-600">
            {formatDutchDateTime(session.startsAt)} –{" "}
            {formatDutchDateTime(session.endsAt)}
          </p>
          <p className="text-sm text-carbon-black-600">Locatie: {session.location}</p>
          <p className="text-sm text-carbon-black-600">
            Capaciteit: {session.minParticipants}–{session.maxParticipants} deelnemers
          </p>
          {session.notes ? (
            <p className="text-sm text-carbon-black-600">Notities: {session.notes}</p>
          ) : null}
          {session.confirmedAt ? (
            <p className="text-xs text-carbon-black-500">
              Bevestigd op {formatDutchDateTime(session.confirmedAt)}
            </p>
          ) : null}
        </div>
      </DashboardCard>

      {nextStatuses.length > 0 ? (
        <DashboardCard density="compact" title="Status">
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((nextStatus) => (
              <PrimaryButton
                key={nextStatus}
                size="sm"
                disabled={isBusy}
                onClick={() => handleStatusChange(nextStatus)}
              >
                {getStatusActionLabel(nextStatus)}
              </PrimaryButton>
            ))}
          </div>
        </DashboardCard>
      ) : null}

      <DashboardCard density="compact" title={copy.participantsTitle}>
        <p className="mb-3 text-sm text-carbon-black-600">{copy.participantsHint}</p>
        {!patients?.length ? (
          <p className="text-sm text-carbon-black-600">Geen actieve opnames gevonden.</p>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <label
                key={patient.admissionId}
                className="flex items-start gap-3 rounded-lg border border-dust-grey-100 p-3"
              >
                <input
                  type="checkbox"
                  disabled={!editable || isBusy}
                  checked={selectedAdmissionIds.includes(patient.admissionId)}
                  onChange={() => toggleAdmission(patient.admissionId)}
                  className="mt-1 h-5 w-5 rounded border-dust-grey-300"
                />
                <span className="text-sm text-carbon-black-900">
                  {patient.patientDisplayName}
                  {patient.departmentName || patient.roomNumber
                    ? ` · ${[patient.departmentName, patient.roomNumber].filter(Boolean).join(", ")}`
                    : ""}
                </span>
              </label>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard density="compact" title={copy.volunteersTitle}>
        <p className="mb-3 text-sm text-carbon-black-600">{copy.volunteersHint}</p>
        {!volunteers?.length ? (
          <p className="text-sm text-carbon-black-600">Geen vrijwilligers gevonden.</p>
        ) : (
          <div className="space-y-2">
            {volunteers.map((volunteer) => (
              <label
                key={volunteer.userId}
                className="flex items-center gap-3 rounded-lg border border-dust-grey-100 p-3"
              >
                <input
                  type="checkbox"
                  disabled={!editable || isBusy}
                  checked={selectedVolunteerIds.includes(volunteer.userId)}
                  onChange={() => toggleVolunteer(volunteer.userId)}
                  className="h-5 w-5 rounded border-dust-grey-300"
                />
                <span className="text-sm text-carbon-black-900">
                  {volunteer.fullName ?? "Naamloos"}
                </span>
              </label>
            ))}
          </div>
        )}
      </DashboardCard>

      {editable ? (
        <PrimaryButton onClick={handleSaveAssignments} disabled={isBusy}>
          {copy.saveAssignmentsButton}
        </PrimaryButton>
      ) : null}

      {actionError ? (
        <p className="text-sm text-red-600" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
