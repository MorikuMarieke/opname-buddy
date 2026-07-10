import { DAY_OF_WEEK_LABELS } from "@/lib/constants/planning-enums";
import { createClient } from "@/lib/supabase/client";
import { formatAmsterdamTime } from "@/lib/utils/amsterdam-date";
import { getAmsterdamDayOfWeek, timeRangesOverlap } from "@/lib/utils/planning-time";
import type {
  VolunteerAvailabilityException,
  VolunteerRecurringAvailability,
} from "@/types/activity";
import type {
  VolunteerAvailabilityExceptionRow,
  VolunteerRecurringAvailabilityRow,
} from "@/types/database";
import type { PlanningVolunteerListItem } from "@/types/activity";

function getSupabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
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

export interface CoordinatorVolunteerProfile extends PlanningVolunteerListItem {
  recurringAvailability: VolunteerRecurringAvailability[];
  availabilityExceptions: VolunteerAvailabilityException[];
}

export interface VolunteerTodayAvailability {
  userId: string;
  fullName: string | null;
  startTime: string;
  endTime: string;
  source: "recurring" | "extra";
}

function isBlockedByUnavailableException(
  slotStart: string,
  slotEnd: string,
  exceptions: VolunteerAvailabilityException[],
): boolean {
  return exceptions.some(
    (exception) =>
      exception.kind === "unavailable" &&
      timeRangesOverlap(slotStart, slotEnd, exception.startTime, exception.endTime),
  );
}

export async function listCoordinatorVolunteerProfiles(): Promise<
  CoordinatorVolunteerProfile[]
> {
  const supabase = createClient();

  const [volunteersResult, recurringResult, exceptionsResult] = await Promise.all([
    supabase.rpc("list_planning_volunteers"),
    supabase
      .from("volunteer_recurring_availability")
      .select("*")
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("volunteer_availability_exceptions")
      .select("*")
      .order("exception_date", { ascending: false })
      .order("start_time"),
  ]);

  if (volunteersResult.error) {
    throw new Error(getSupabaseErrorMessage(volunteersResult.error));
  }

  if (recurringResult.error) {
    throw new Error(getSupabaseErrorMessage(recurringResult.error));
  }

  if (exceptionsResult.error) {
    throw new Error(getSupabaseErrorMessage(exceptionsResult.error));
  }

  const recurringByUser = new Map<string, VolunteerRecurringAvailability[]>();
  for (const row of recurringResult.data ?? []) {
    const mapped = mapRecurringRow(row);
    const existing = recurringByUser.get(mapped.userId) ?? [];
    existing.push(mapped);
    recurringByUser.set(mapped.userId, existing);
  }

  const exceptionsByUser = new Map<string, VolunteerAvailabilityException[]>();
  for (const row of exceptionsResult.data ?? []) {
    const mapped = mapExceptionRow(row);
    const existing = exceptionsByUser.get(mapped.userId) ?? [];
    existing.push(mapped);
    exceptionsByUser.set(mapped.userId, existing);
  }

  return (volunteersResult.data ?? []).map((volunteer) => ({
    userId: volunteer.user_id,
    fullName: volunteer.full_name,
    volunteerBio: volunteer.volunteer_bio,
    recurringAvailability: recurringByUser.get(volunteer.user_id) ?? [],
    availabilityExceptions: exceptionsByUser.get(volunteer.user_id) ?? [],
  }));
}

export function getVolunteersAvailableOnDate(
  profiles: CoordinatorVolunteerProfile[],
  dateString: string,
): VolunteerTodayAvailability[] {
  const dayOfWeek = getAmsterdamDayOfWeek(dateString);
  const results: VolunteerTodayAvailability[] = [];

  for (const profile of profiles) {
    const todaysExceptions = profile.availabilityExceptions.filter(
      (exception) => exception.exceptionDate === dateString,
    );

    for (const slot of profile.recurringAvailability) {
      if (!slot.isActive || slot.dayOfWeek !== dayOfWeek) {
        continue;
      }

      if (
        isBlockedByUnavailableException(
          slot.startTime,
          slot.endTime,
          todaysExceptions,
        )
      ) {
        continue;
      }

      results.push({
        userId: profile.userId,
        fullName: profile.fullName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        source: "recurring",
      });
    }

    for (const exception of todaysExceptions) {
      if (exception.kind !== "extra") {
        continue;
      }

      results.push({
        userId: profile.userId,
        fullName: profile.fullName,
        startTime: exception.startTime,
        endTime: exception.endTime,
        source: "extra",
      });
    }
  }

  return results.sort((a, b) =>
    a.startTime.localeCompare(b.startTime, "nl"),
  );
}

export function formatVolunteerRecurringSummary(
  slots: VolunteerRecurringAvailability[],
): string {
  const active = slots.filter((slot) => slot.isActive);

  if (active.length === 0) {
    return "Geen vaste beschikbaarheid";
  }

  return active
    .map(
      (slot) =>
        `${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} ${formatAmsterdamTime(slot.startTime)}–${formatAmsterdamTime(slot.endTime)}`,
    )
    .join(" · ");
}
