import {
  canTransitionSessionStatus,
  type SessionStatus,
} from "@/lib/constants/planning-enums";
import { createClient } from "@/lib/supabase/client";
import { combineAmsterdamDateAndTime } from "@/lib/utils/planning-time";
import type {
  ActivitySession,
  PlanningSessionListItem,
} from "@/types/activity";
import type { ActivitySessionRow } from "@/types/database";
import type { OneOffSessionInputValues } from "@/lib/validations/activity-session";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.code === "23514") {
    return "Deze wijziging is niet toegestaan voor de huidige sessiestatus.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function mapSession(row: ActivitySessionRow): ActivitySession {
  return {
    id: row.id,
    activityId: row.activity_id,
    recurringScheduleId: row.recurring_schedule_id,
    sessionKind: row.session_kind as ActivitySession["sessionKind"],
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    status: row.status as ActivitySession["status"],
    notes: row.notes,
    confirmedAt: row.confirmed_at,
    confirmedByStaffId: row.confirmed_by_staff_id,
    createdByStaffId: row.created_by_staff_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentStaffId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  return user.id;
}

export interface PlanningSessionDetail {
  session: ActivitySession;
  activityTitle: string;
  activityDescription: string;
  participantAdmissionIds: string[];
  volunteerUserIds: string[];
}

export interface ListPlanningSessionsFilters {
  status?: SessionStatus | null;
  sessionKind?: ActivitySession["sessionKind"] | null;
  from?: string;
  to?: string;
}

function mapPlanningSessionListItem(row: {
  session_id: string;
  activity_id: string;
  activity_title: string;
  activity_description: string;
  activity_category: string;
  activity_intensity: string;
  session_kind: string;
  status: string;
  starts_at: string;
  ends_at: string;
  location: string;
  min_participants: number;
  max_participants: number;
  participant_count: number;
  volunteer_count: number;
  recurring_schedule_id: string | null;
}): PlanningSessionListItem {
  return {
    sessionId: row.session_id,
    activityId: row.activity_id,
    activityTitle: row.activity_title,
    activityDescription: row.activity_description,
    activityCategory: row.activity_category as PlanningSessionListItem["activityCategory"],
    activityIntensity: row.activity_intensity as PlanningSessionListItem["activityIntensity"],
    sessionKind: row.session_kind as PlanningSessionListItem["sessionKind"],
    status: row.status as PlanningSessionListItem["status"],
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    participantCount: Number(row.participant_count),
    volunteerCount: Number(row.volunteer_count),
    recurringScheduleId: row.recurring_schedule_id,
  };
}

export async function listPlanningSessions(
  filters: ListPlanningSessionsFilters = {},
): Promise<PlanningSessionListItem[]> {
  const supabase = createClient();
  const from = filters.from ?? new Date().toISOString();
  const to =
    filters.to ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc("list_planning_sessions", {
    p_from: from,
    p_to: to,
    p_status: filters.status ?? undefined,
    p_session_kind: filters.sessionKind ?? undefined,
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapPlanningSessionListItem);
}

export async function getPlanningSessionDetail(
  sessionId: string,
): Promise<PlanningSessionDetail> {
  const supabase = createClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("activity_sessions")
    .select("*, activities(title, description)")
    .eq("id", sessionId)
    .single();

  if (sessionError) {
    throw new Error(getSupabaseErrorMessage(sessionError));
  }

  const { data: participants, error: participantsError } = await supabase
    .from("activity_session_participants")
    .select("admission_id")
    .eq("session_id", sessionId);

  if (participantsError) {
    throw new Error(getSupabaseErrorMessage(participantsError));
  }

  const { data: volunteers, error: volunteersError } = await supabase
    .from("activity_session_volunteers")
    .select("user_id")
    .eq("session_id", sessionId);

  if (volunteersError) {
    throw new Error(getSupabaseErrorMessage(volunteersError));
  }

  const activity = sessionRow.activities as {
    title: string;
    description: string;
  } | null;

  return {
    session: mapSession(sessionRow as ActivitySessionRow),
    activityTitle: activity?.title ?? "Onbekende activiteit",
    activityDescription: activity?.description ?? "",
    participantAdmissionIds: (participants ?? []).map((row) => row.admission_id),
    volunteerUserIds: (volunteers ?? []).map((row) => row.user_id),
  };
}

export async function createOneOffSession(
  input: OneOffSessionInputValues,
): Promise<ActivitySession> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();

  const startsAt = combineAmsterdamDateAndTime(input.sessionDate, input.startTime);
  const endsAt = combineAmsterdamDateAndTime(input.sessionDate, input.endTime);

  const { data, error } = await supabase
    .from("activity_sessions")
    .insert({
      activity_id: input.activityId,
      session_kind: "one_off",
      recurring_schedule_id: null,
      starts_at: startsAt,
      ends_at: endsAt,
      location: input.location.trim(),
      min_participants: input.minParticipants,
      max_participants: input.maxParticipants,
      status: "draft",
      notes: input.notes,
      created_by_staff_id: staffId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapSession(data);
}

export async function updateSessionStatus(
  sessionId: string,
  nextStatus: SessionStatus,
): Promise<ActivitySession> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();
  const detail = await getPlanningSessionDetail(sessionId);
  const currentStatus = detail.session.status;

  if (!canTransitionSessionStatus(currentStatus, nextStatus)) {
    throw new Error("Deze statuswijziging is niet toegestaan.");
  }

  const payload: Partial<ActivitySessionRow> = {
    status: nextStatus,
  };

  if (nextStatus === "confirmed") {
    payload.confirmed_at = new Date().toISOString();
    payload.confirmed_by_staff_id = staffId;
  }

  const { data, error } = await supabase
    .from("activity_sessions")
    .update(payload)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapSession(data);
}

function assertParticipantBounds(
  count: number,
  minParticipants: number,
  maxParticipants: number,
): void {
  if (count < minParticipants) {
    throw new Error(
      `Selecteer minimaal ${minParticipants} deelnemer(s) voor deze sessie.`,
    );
  }

  if (count > maxParticipants) {
    throw new Error(
      `Selecteer maximaal ${maxParticipants} deelnemer(s) voor deze sessie.`,
    );
  }
}

export async function setSessionParticipants(
  sessionId: string,
  admissionIds: string[],
): Promise<void> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();
  const detail = await getPlanningSessionDetail(sessionId);

  if (!["draft", "proposed"].includes(detail.session.status)) {
    throw new Error("Deelnemers kunnen alleen gewijzigd worden in concept of voorstel.");
  }

  assertParticipantBounds(
    admissionIds.length,
    detail.session.minParticipants,
    detail.session.maxParticipants,
  );

  const { error: deleteError } = await supabase
    .from("activity_session_participants")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) {
    throw new Error(getSupabaseErrorMessage(deleteError));
  }

  if (admissionIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("activity_session_participants")
    .insert(
      admissionIds.map((admissionId) => ({
        session_id: sessionId,
        admission_id: admissionId,
        assigned_by_staff_id: staffId,
      })),
    );

  if (insertError) {
    throw new Error(getSupabaseErrorMessage(insertError));
  }
}

export async function setSessionVolunteers(
  sessionId: string,
  userIds: string[],
): Promise<void> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();
  const detail = await getPlanningSessionDetail(sessionId);

  if (!["draft", "proposed"].includes(detail.session.status)) {
    throw new Error("Vrijwilligers kunnen alleen gewijzigd worden in concept of voorstel.");
  }

  const { error: deleteError } = await supabase
    .from("activity_session_volunteers")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) {
    throw new Error(getSupabaseErrorMessage(deleteError));
  }

  if (userIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("activity_session_volunteers")
    .insert(
      userIds.map((userId) => ({
        session_id: sessionId,
        user_id: userId,
        assigned_by_staff_id: staffId,
      })),
    );

  if (insertError) {
    throw new Error(getSupabaseErrorMessage(insertError));
  }
}

export function isSessionEditable(status: SessionStatus): boolean {
  return status === "draft" || status === "proposed";
}
