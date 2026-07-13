import { RECURRING_MATERIALIZE_WEEKS_AHEAD } from "@/lib/constants/planning-enums";
import { createClient } from "@/lib/supabase/client";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { setSeriesFacilitators, listSeriesFacilitatorUserIds } from "@/lib/services/planning-facilitators";
import type {
  ActivityRecurringSchedule,
  ActivitySession,
} from "@/types/activity";
import type {
  ActivityRecurringScheduleRow,
  ActivitySessionRow,
} from "@/types/database";
import type {
  RecurringScheduleInputValues,
  RecurringScheduleUpdateValues,
} from "@/lib/validations/recurring-schedule";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.message.includes("does not exist") ||
    error.code === "42P01"
  ) {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function mapRecurringSchedule(row: ActivityRecurringScheduleRow): ActivityRecurringSchedule {
  return {
    id: row.id,
    activityId: row.activity_id,
    dayOfWeek: row.day_of_week as ActivityRecurringSchedule["dayOfWeek"],
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    location: row.location,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    intervalWeeks: row.interval_weeks as ActivityRecurringSchedule["intervalWeeks"],
    seriesStartsOn: row.series_starts_on,
    seriesEndsOn: row.series_ends_on,
    endedAt: row.ended_at,
    isActive: row.is_active,
    createdByStaffId: row.created_by_staff_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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

async function materializeSchedule(scheduleId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("materialize_recurring_sessions", {
    p_schedule_id: scheduleId,
    p_weeks_ahead: RECURRING_MATERIALIZE_WEEKS_AHEAD,
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}

export interface RecurringScheduleListItem extends ActivityRecurringSchedule {
  activityTitle: string;
}

export async function listRecurringSchedules(): Promise<RecurringScheduleListItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .select("*, activities(title)")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => {
    const schedule = mapRecurringSchedule(row as ActivityRecurringScheduleRow);
    const activity = row.activities as { title: string } | null;
    return {
      ...schedule,
      activityTitle: activity?.title ?? "Onbekende activiteit",
    };
  });
}

export async function getRecurringSchedule(
  scheduleId: string,
): Promise<ActivityRecurringSchedule> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapRecurringSchedule(data);
}

export async function createRecurringSchedule(
  input: RecurringScheduleInputValues,
  options?: { facilitatorUserIds?: string[] },
): Promise<ActivityRecurringSchedule> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();
  const seriesStartsOn = getAmsterdamDateString();
  const seriesEndsOn = addDaysToIsoDate(seriesStartsOn, 84);

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .insert({
      activity_id: input.activityId,
      day_of_week: input.dayOfWeek,
      start_time: normalizeTime(input.startTime),
      end_time: normalizeTime(input.endTime),
      location: input.location,
      min_participants: input.minParticipants,
      max_participants: input.maxParticipants,
      interval_weeks: 1,
      series_starts_on: seriesStartsOn,
      series_ends_on: seriesEndsOn,
      created_by_staff_id: staffId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const schedule = mapRecurringSchedule(data);

  if (options?.facilitatorUserIds?.length) {
    await setSeriesFacilitators(schedule.id, options.facilitatorUserIds);
  }

  await materializeSchedule(schedule.id);
  return schedule;
}

export async function updateRecurringSchedule(
  scheduleId: string,
  input: RecurringScheduleUpdateValues,
): Promise<ActivityRecurringSchedule> {
  const supabase = createClient();
  const payload: Partial<ActivityRecurringScheduleRow> = {};

  if (input.activityId !== undefined) payload.activity_id = input.activityId;
  if (input.dayOfWeek !== undefined) payload.day_of_week = input.dayOfWeek;
  if (input.startTime !== undefined) payload.start_time = normalizeTime(input.startTime);
  if (input.endTime !== undefined) payload.end_time = normalizeTime(input.endTime);
  if (input.location !== undefined) payload.location = input.location;
  if (input.minParticipants !== undefined) payload.min_participants = input.minParticipants;
  if (input.maxParticipants !== undefined) payload.max_participants = input.maxParticipants;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  if (Object.keys(payload).length === 0) {
    return getRecurringSchedule(scheduleId);
  }

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .update(payload)
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const schedule = mapRecurringSchedule(data);

  if (input.isActive !== false) {
    await materializeSchedule(schedule.id);
  }

  return schedule;
}

function mapSessionRow(row: ActivitySessionRow): ActivitySession {
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
    recurringOccurrenceDate: row.recurring_occurrence_date,
    isDetached: row.is_detached,
    confirmedAt: row.confirmed_at,
    confirmedByStaffId: row.confirmed_by_staff_id,
    createdByStaffId: row.created_by_staff_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type SeriesReminderStatus = "ending_soon" | "ended" | null;

export function getSeriesReminderStatus(
  schedule: ActivityRecurringSchedule,
): SeriesReminderStatus {
  if (schedule.endedAt) {
    return "ended";
  }

  const today = getAmsterdamDateString();
  const warningDate = addDaysToIsoDate(today, 14);

  if (schedule.seriesEndsOn <= warningDate) {
    return "ending_soon";
  }

  return null;
}

export interface RecurringSeriesDetail {
  schedule: ActivityRecurringSchedule;
  activityTitle: string;
  facilitatorUserIds: string[];
  sessions: ActivitySession[];
}

export async function getRecurringSeriesDetail(
  scheduleId: string,
): Promise<RecurringSeriesDetail> {
  const supabase = createClient();

  const { data: scheduleRow, error: scheduleError } = await supabase
    .from("activity_recurring_schedules")
    .select("*, activities(title)")
    .eq("id", scheduleId)
    .single();

  if (scheduleError) {
    throw new Error(getSupabaseErrorMessage(scheduleError));
  }

  const { data: sessionRows, error: sessionsError } = await supabase
    .from("activity_sessions")
    .select("*")
    .eq("recurring_schedule_id", scheduleId)
    .order("starts_at", { ascending: true });

  if (sessionsError) {
    throw new Error(getSupabaseErrorMessage(sessionsError));
  }

  const facilitatorUserIds = await listSeriesFacilitatorUserIds(scheduleId);
  const activity = scheduleRow.activities as { title: string } | null;

  return {
    schedule: mapRecurringSchedule(scheduleRow as ActivityRecurringScheduleRow),
    activityTitle: activity?.title ?? "Onbekende activiteit",
    facilitatorUserIds,
    sessions: (sessionRows ?? []).map((row) =>
      mapSessionRow(row as ActivitySessionRow),
    ),
  };
}

export async function extendRecurringSeries(
  scheduleId: string,
  additionalWeeks = 12,
): Promise<ActivityRecurringSchedule> {
  const schedule = await getRecurringSchedule(scheduleId);
  const newEndsOn = addDaysToIsoDate(schedule.seriesEndsOn, additionalWeeks * 7);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .update({ series_ends_on: newEndsOn })
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const updated = mapRecurringSchedule(data);
  await materializeSchedule(updated.id);
  return updated;
}

export async function endRecurringSeries(
  scheduleId: string,
): Promise<ActivityRecurringSchedule> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_recurring_schedules")
    .update({
      ended_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapRecurringSchedule(data);
}

export async function setRecurringSeriesFacilitators(
  scheduleId: string,
  userIds: string[],
): Promise<void> {
  await setSeriesFacilitators(scheduleId, userIds);
  await materializeSchedule(scheduleId);
}
