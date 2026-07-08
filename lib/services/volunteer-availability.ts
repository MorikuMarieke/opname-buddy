import { createClient } from "@/lib/supabase/client";
import type {
  VolunteerAvailabilityException,
  VolunteerRecurringAvailability,
} from "@/types/activity";
import type {
  VolunteerAvailabilityExceptionRow,
  VolunteerRecurringAvailabilityRow,
} from "@/types/database";
import type {
  VolunteerAvailabilityExceptionInput,
  VolunteerRecurringAvailabilityInput,
} from "@/lib/validations/volunteer-availability";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function mapRecurringRow(
  row: VolunteerRecurringAvailabilityRow,
): VolunteerRecurringAvailability {
  return {
    id: row.id,
    userId: row.user_id,
    dayOfWeek: row.day_of_week as VolunteerRecurringAvailability["dayOfWeek"],
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapExceptionRow(
  row: VolunteerAvailabilityExceptionRow,
): VolunteerAvailabilityException {
  return {
    id: row.id,
    userId: row.user_id,
    exceptionDate: row.exception_date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    kind: row.kind as VolunteerAvailabilityException["kind"],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentUserId(): Promise<string> {
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

export async function listVolunteerRecurringAvailability(): Promise<
  VolunteerRecurringAvailability[]
> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_recurring_availability")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week")
    .order("start_time");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapRecurringRow);
}

export async function createVolunteerRecurringAvailability(
  input: VolunteerRecurringAvailabilityInput,
): Promise<VolunteerRecurringAvailability> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_recurring_availability")
    .insert({
      user_id: userId,
      day_of_week: input.dayOfWeek,
      start_time: normalizeTime(input.startTime),
      end_time: normalizeTime(input.endTime),
      is_active: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Insert failed" }));
  }

  return mapRecurringRow(data);
}

export async function setVolunteerRecurringAvailabilityActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("volunteer_recurring_availability")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}

export async function listVolunteerAvailabilityExceptions(): Promise<
  VolunteerAvailabilityException[]
> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_availability_exceptions")
    .select("*")
    .eq("user_id", userId)
    .order("exception_date", { ascending: false })
    .order("start_time");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapExceptionRow);
}

export async function createVolunteerAvailabilityException(
  input: VolunteerAvailabilityExceptionInput,
): Promise<VolunteerAvailabilityException> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_availability_exceptions")
    .insert({
      user_id: userId,
      exception_date: input.exceptionDate,
      start_time: normalizeTime(input.startTime),
      end_time: normalizeTime(input.endTime),
      kind: input.kind,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Insert failed" }));
  }

  return mapExceptionRow(data);
}

export async function deleteVolunteerAvailabilityException(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("volunteer_availability_exceptions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}
