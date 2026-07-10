import { createClient } from "@/lib/supabase/client";
import {
  findOverlappingRecurringSlot,
  OVERLAPPING_AVAILABILITY_MESSAGE,
} from "@/lib/utils/volunteer-availability-validation";
import type {
  VolunteerAvailabilityException,
  VolunteerRecurringAvailability,
} from "@/types/activity";
import type {
  VolunteerAvailabilityExceptionRow,
  VolunteerRecurringAvailabilityRow,
} from "@/types/database";
import {
  volunteerAvailabilityExceptionSchema,
  volunteerRecurringAvailabilitySchema,
  volunteerRecurringAvailabilityUpdateSchema,
  type VolunteerAvailabilityExceptionInput,
  type VolunteerRecurringAvailabilityInput,
  type VolunteerRecurringAvailabilityUpdateInput,
} from "@/lib/validations/volunteer-availability";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.message.includes("overlapping_availability") ||
    error.code === "23514"
  ) {
    return OVERLAPPING_AVAILABILITY_MESSAGE;
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

async function assertNoOverlappingRecurringSlot(
  userId: string,
  input: VolunteerRecurringAvailabilityInput,
  excludeId?: string,
): Promise<void> {
  const supabase = createClient();

  let query = supabase
    .from("volunteer_recurring_availability")
    .select("id, day_of_week, start_time, end_time, is_active")
    .eq("user_id", userId)
    .eq("day_of_week", input.dayOfWeek)
    .eq("is_active", true);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const existingSlots = (data ?? []).map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    isActive: row.is_active,
  }));

  const overlapping = findOverlappingRecurringSlot(existingSlots, input, excludeId);

  if (overlapping) {
    throw new Error(OVERLAPPING_AVAILABILITY_MESSAGE);
  }
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
  const parsed = volunteerRecurringAvailabilitySchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = createClient();
  const userId = await getCurrentUserId();

  await assertNoOverlappingRecurringSlot(userId, parsed.data);

  const { data, error } = await supabase
    .from("volunteer_recurring_availability")
    .insert({
      user_id: userId,
      day_of_week: parsed.data.dayOfWeek,
      start_time: normalizeTime(parsed.data.startTime),
      end_time: normalizeTime(parsed.data.endTime),
      is_active: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Insert failed" }));
  }

  return mapRecurringRow(data);
}

export async function updateVolunteerRecurringAvailability(
  input: VolunteerRecurringAvailabilityUpdateInput,
): Promise<VolunteerRecurringAvailability> {
  const parsed = volunteerRecurringAvailabilityUpdateSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = createClient();
  const userId = await getCurrentUserId();
  const { id, ...availability } = parsed.data;

  await assertNoOverlappingRecurringSlot(userId, availability, id);

  const { data, error } = await supabase
    .from("volunteer_recurring_availability")
    .update({
      day_of_week: availability.dayOfWeek,
      start_time: normalizeTime(availability.startTime),
      end_time: normalizeTime(availability.endTime),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Update failed" }));
  }

  return mapRecurringRow(data);
}

export async function deleteVolunteerRecurringAvailability(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("volunteer_recurring_availability")
    .delete()
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
  const parsed = volunteerAvailabilityExceptionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_availability_exceptions")
    .insert({
      user_id: userId,
      exception_date: parsed.data.exceptionDate,
      start_time: normalizeTime(parsed.data.startTime),
      end_time: normalizeTime(parsed.data.endTime),
      kind: parsed.data.kind,
      note: parsed.data.note ?? null,
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
