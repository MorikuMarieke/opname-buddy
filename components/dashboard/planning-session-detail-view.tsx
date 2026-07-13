"use client";

import { useEffect, useRef, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { ScheduleTimeFields } from "@/components/forms/schedule-time-fields";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useActivities } from "@/hooks/use-activities";
import { usePlanningFacilitatorCandidates } from "@/hooks/use-planning-facilitators";
import { usePlanningPatients } from "@/hooks/use-planning-patients";
import {
  usePlanningSessionDetail,
  useSetSessionFacilitators,
  useSetSessionParticipants,
  useUpdateActivitySession,
  useUpdateSessionStatus,
} from "@/hooks/use-planning-sessions";
import {
  SESSION_KIND_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TRANSITIONS,
  type SessionStatus,
} from "@/lib/constants/planning-enums";
import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  getDefaultSessionEditValues,
  isBelowMinParticipants,
  isSessionEditable,
  type PlanningSessionDetail,
} from "@/lib/services/activity-sessions";
import { updateActivitySessionSchema } from "@/lib/validations/activity-session";
import type { UpdateActivitySessionFormValues } from "@/lib/validations/activity-session";
import { inferScheduleDurationState } from "@/lib/utils/planning-time";
import {
  getScheduleDurationFieldErrors,
  syncScheduleEndTime,
} from "@/lib/validations/schedule-duration";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";
import type {
  PlanningFacilitatorCandidate,
  PlanningPatientListItem,
} from "@/types/activity";

interface PlanningSessionDetailViewProps {
  sessionId: string;
}

const copy = PLANNING_COPY.sessions;

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 disabled:opacity-50";

const textareaClasses =
  "min-h-24 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900 disabled:opacity-50";

function getStatusActionLabel(nextStatus: SessionStatus): string {
  if (nextStatus === "confirmed") return copy.statusActions.publish;
  if (nextStatus === "completed") return copy.statusActions.complete;
  if (nextStatus === "cancelled") return copy.statusActions.cancel;
  return SESSION_STATUS_LABELS[nextStatus];
}

function statusVariant(
  status: SessionStatus,
): "neutral" | "attention" | "positive" {
  if (status === "confirmed" || status === "completed") return "positive";
  return "neutral";
}

function sortedIdsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

function formatRoleLabels(roleNames: string[]): string {
  return roleNames
    .map((role) => ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role)
    .join(", ");
}

interface SessionAssignmentsPanelProps {
  sessionId: string;
  detail: PlanningSessionDetail;
  patients: PlanningPatientListItem[] | undefined;
  patientsLoading: boolean;
  patientsError: boolean;
  facilitators: PlanningFacilitatorCandidate[] | undefined;
  facilitatorsLoading: boolean;
  facilitatorsError: boolean;
}

function SessionAssignmentsPanel({
  sessionId,
  detail,
  patients,
  patientsLoading,
  patientsError,
  facilitators,
  facilitatorsLoading,
  facilitatorsError,
}: SessionAssignmentsPanelProps) {
  const statusMutation = useUpdateSessionStatus(sessionId);
  const participantsMutation = useSetSessionParticipants(sessionId);
  const facilitatorsMutation = useSetSessionFacilitators(sessionId);
  const scheduleMutation = useUpdateActivitySession(sessionId);
  const { data: activities } = useActivities();
  const activityDefaultDurationMinutes = (activities ?? []).find(
    (activity) => activity.id === detail.session.activityId,
  )?.defaultDurationMinutes;

  const durationHydratedRef = useRef(false);

  const [scheduleValues, setScheduleValues] = useState<UpdateActivitySessionFormValues>(
    () => {
      const defaults = getDefaultSessionEditValues(detail.session);
      const durationState = inferScheduleDurationState(
        defaults.startTime,
        defaults.endTime,
      );
      return {
        ...defaults,
        ...durationState,
        minParticipants: String(defaults.minParticipants),
        maxParticipants: String(defaults.maxParticipants),
      };
    },
  );

  useEffect(() => {
    if (durationHydratedRef.current || activityDefaultDurationMinutes == null) {
      return;
    }

    durationHydratedRef.current = true;
    setScheduleValues((current) => {
      const durationState = inferScheduleDurationState(
        current.startTime,
        current.endTime,
        activityDefaultDurationMinutes,
      );
      return {
        ...current,
        ...durationState,
      };
    });
  }, [activityDefaultDurationMinutes]);
  const [scheduleErrors, setScheduleErrors] = useState<
    Partial<Record<string, string>>
  >({});

  const [selectedAdmissionIds, setSelectedAdmissionIds] = useState(
    () => detail.participantAdmissionIds,
  );
  const [selectedFacilitatorIds, setSelectedFacilitatorIds] = useState(
    () => detail.facilitatorUserIds,
  );
  const [facilitatorSearch, setFacilitatorSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { session, activityTitle, activityDescription } = detail;
  const editable = isSessionEditable(session.status);
  const nextStatuses = SESSION_STATUS_TRANSITIONS[session.status];
  const isSavingAssignments =
    participantsMutation.isPending || facilitatorsMutation.isPending;
  const isBusy =
    statusMutation.isPending ||
    isSavingAssignments ||
    scheduleMutation.isPending;
  const hasUnsavedAssignments =
    !sortedIdsEqual(selectedAdmissionIds, detail.participantAdmissionIds) ||
    !sortedIdsEqual(selectedFacilitatorIds, detail.facilitatorUserIds);
  const belowMinParticipants = isBelowMinParticipants(
    selectedAdmissionIds.length,
    session.minParticipants,
  );

  function toggleAdmission(admissionId: string) {
    setSelectedAdmissionIds((current) =>
      current.includes(admissionId)
        ? current.filter((id) => id !== admissionId)
        : [...current, admissionId],
    );
  }

  function toggleFacilitator(userId: string) {
    setSelectedFacilitatorIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function isStatusActionDisabled(nextStatus: SessionStatus): boolean {
    if (isBusy) {
      return true;
    }

    if (nextStatus === "confirmed" && hasUnsavedAssignments) {
      return true;
    }

    return false;
  }

  async function handleStatusChange(nextStatus: SessionStatus) {
    setActionError(null);

    try {
      await statusMutation.mutateAsync(nextStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Actie mislukt.");
    }
  }

  async function handleSaveSchedule() {
    const syncedValues = syncScheduleEndTime(
      scheduleValues,
      activityDefaultDurationMinutes,
    );
    const durationErrors = getScheduleDurationFieldErrors(
      syncedValues,
      activityDefaultDurationMinutes,
    );

    if (Object.keys(durationErrors).length > 0) {
      setScheduleErrors(durationErrors);
      return;
    }

    const parsed = updateActivitySessionSchema.safeParse(syncedValues);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setScheduleErrors(fieldErrors);
      return;
    }

    setScheduleErrors({});
    setActionError(null);

    try {
      await scheduleMutation.mutateAsync(parsed.data);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Opslaan mislukt.");
    }
  }

  async function handleSaveAssignments() {
    setActionError(null);

    try {
      await participantsMutation.mutateAsync(selectedAdmissionIds);
      await facilitatorsMutation.mutateAsync(selectedFacilitatorIds);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Opslaan mislukt.");
    }
  }

  const filteredFacilitators = (facilitators ?? []).filter((facilitator) => {
    if (!facilitatorSearch.trim()) {
      return true;
    }

    const query = facilitatorSearch.trim().toLowerCase();
    return (facilitator.fullName ?? "").toLowerCase().includes(query);
  });

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
            {session.isDetached ? (
              <StatusBadge variant="attention">Aangepast</StatusBadge>
            ) : null}
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
          {belowMinParticipants ? (
            <p className="text-sm text-amber-800" role="status">
              {copy.belowMinParticipantsWarning.replace(
                "{min}",
                String(session.minParticipants),
              )}
            </p>
          ) : null}
          {session.notes ? (
            <p className="text-sm text-carbon-black-600">Notities: {session.notes}</p>
          ) : null}
          {session.confirmedAt ? (
            <p className="text-xs text-carbon-black-500">
              Gepubliceerd op {formatDutchDateTime(session.confirmedAt)}
            </p>
          ) : null}
        </div>
      </DashboardCard>

      {editable ? (
        <DashboardCard density="compact" title={copy.editScheduleTitle}>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label={copy.fields.sessionDate}
              htmlFor="editSessionDate"
              error={scheduleErrors.sessionDate}
            >
              <input
                id="editSessionDate"
                type="date"
                disabled={isBusy}
                className={inputClasses}
                value={scheduleValues.sessionDate}
                onChange={(event) =>
                  setScheduleValues((current) => ({
                    ...current,
                    sessionDate: event.target.value,
                  }))
                }
              />
            </FormField>
            <ScheduleTimeFields
              values={scheduleValues}
              activityDefaultDurationMinutes={activityDefaultDurationMinutes}
              onChange={(nextValues) =>
                setScheduleValues((current) => ({ ...current, ...nextValues }))
              }
              errors={scheduleErrors}
              disabled={isBusy}
              ids={{
                startTime: "editStartTime",
                endTime: "editEndTime",
                customDuration: "editCustomDuration",
                useCustomDuration: "editUseCustomDuration",
              }}
            />
            <FormField
              label={copy.fields.location}
              htmlFor="editLocation"
              error={scheduleErrors.location}
              className="lg:col-span-2"
            >
              <input
                id="editLocation"
                type="text"
                disabled={isBusy}
                className={inputClasses}
                value={scheduleValues.location}
                onChange={(event) =>
                  setScheduleValues((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={copy.fields.minParticipants}
              htmlFor="editMinParticipants"
              error={scheduleErrors.minParticipants}
            >
              <input
                id="editMinParticipants"
                type="number"
                min={1}
                disabled={isBusy}
                className={inputClasses}
                value={String(scheduleValues.minParticipants)}
                onChange={(event) =>
                  setScheduleValues((current) => ({
                    ...current,
                    minParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={copy.fields.maxParticipants}
              htmlFor="editMaxParticipants"
              error={scheduleErrors.maxParticipants}
            >
              <input
                id="editMaxParticipants"
                type="number"
                min={1}
                disabled={isBusy}
                className={inputClasses}
                value={String(scheduleValues.maxParticipants)}
                onChange={(event) =>
                  setScheduleValues((current) => ({
                    ...current,
                    maxParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={copy.fields.notes}
              htmlFor="editNotes"
              error={scheduleErrors.notes}
              className="lg:col-span-2"
            >
              <textarea
                id="editNotes"
                disabled={isBusy}
                className={textareaClasses}
                value={scheduleValues.notes ?? ""}
                onChange={(event) =>
                  setScheduleValues((current) => ({
                    ...current,
                    notes: event.target.value || null,
                  }))
                }
              />
            </FormField>
          </div>
          <PrimaryButton
            className="mt-4"
            onClick={handleSaveSchedule}
            disabled={isBusy}
          >
            {copy.saveScheduleButton}
          </PrimaryButton>
        </DashboardCard>
      ) : null}

      {nextStatuses.length > 0 ? (
        <DashboardCard density="compact" title="Status">
          {hasUnsavedAssignments ? (
            <p className="mb-3 text-sm text-carbon-black-600" role="status">
              {copy.unsavedAssignmentsHint}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((nextStatus) => (
              <PrimaryButton
                key={nextStatus}
                size="sm"
                disabled={isStatusActionDisabled(nextStatus)}
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
        {patientsLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : patientsError ? (
          <p className="text-sm text-red-600" role="alert">
            {copy.patientsLoadError}
          </p>
        ) : !patients?.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyPatients}</p>
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

      <DashboardCard density="compact" title={copy.facilitatorsTitle}>
        <p className="mb-3 text-sm text-carbon-black-600">{copy.facilitatorsHint}</p>
        {editable ? (
          <input
            type="search"
            value={facilitatorSearch}
            onChange={(event) => setFacilitatorSearch(event.target.value)}
            placeholder={copy.facilitatorsSearchPlaceholder}
            className="mb-3 h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm"
          />
        ) : null}
        {facilitatorsLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : facilitatorsError ? (
          <p className="text-sm text-red-600" role="alert">
            {copy.facilitatorsLoadError}
          </p>
        ) : !filteredFacilitators.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyFacilitators}</p>
        ) : (
          <div className="space-y-2">
            {filteredFacilitators.map((facilitator) => (
              <label
                key={facilitator.userId}
                className="flex items-center gap-3 rounded-lg border border-dust-grey-100 p-3"
              >
                <input
                  type="checkbox"
                  disabled={!editable || isBusy}
                  checked={selectedFacilitatorIds.includes(facilitator.userId)}
                  onChange={() => toggleFacilitator(facilitator.userId)}
                  className="h-5 w-5 rounded border-dust-grey-300"
                />
                <span className="text-sm text-carbon-black-900">
                  {facilitator.fullName ?? "Naamloos"}
                  <span className="block text-xs text-carbon-black-500">
                    {formatRoleLabels(facilitator.roleNames)}
                  </span>
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

export function PlanningSessionDetailView({ sessionId }: PlanningSessionDetailViewProps) {
  const { data: detail, isLoading, isError } = usePlanningSessionDetail(sessionId);
  const {
    data: patients,
    isLoading: patientsLoading,
    isError: patientsError,
  } = usePlanningPatients();
  const {
    data: facilitators,
    isLoading: facilitatorsLoading,
    isError: facilitatorsError,
  } = usePlanningFacilitatorCandidates();

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

  const assignmentKey = `${detail.participantAdmissionIds.join(",")}|${detail.facilitatorUserIds.join(",")}`;

  return (
    <SessionAssignmentsPanel
      key={assignmentKey}
      sessionId={sessionId}
      detail={detail}
      patients={patients}
      patientsLoading={patientsLoading}
      patientsError={patientsError}
      facilitators={facilitators}
      facilitatorsLoading={facilitatorsLoading}
      facilitatorsError={facilitatorsError}
    />
  );
}
