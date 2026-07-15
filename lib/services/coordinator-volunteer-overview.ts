import { createClient } from "@/lib/supabase/client";
import type { ParticipationBlockId } from "@/lib/constants/daily-participation";
import { mergeWeeklyBlocks } from "@/lib/utils/volunteer-block-availability";
import type {
  VolunteerDayAbsenceRow,
  VolunteerWeeklyBlockRow,
} from "@/types/daily-participation";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function getMonthDateRange(yearMonth: string): { startDate: string; endDate: string } | null {
  const [yearPart, monthPart] = yearMonth.split("-").map(Number);

  if (!yearPart || !monthPart) {
    return null;
  }

  const startDate = `${yearPart}-${String(monthPart).padStart(2, "0")}-01`;
  const endDate = `${yearPart}-${String(monthPart).padStart(2, "0")}-${String(
    new Date(yearPart, monthPart, 0).getDate(),
  ).padStart(2, "0")}`;

  return { startDate, endDate };
}

export interface CoordinatorVolunteerOverviewRow {
  user_id: string;
  full_name: string | null;
  volunteer_bio: string | null;
  weekly_blocks: VolunteerWeeklyBlockRow[];
  month_absences: VolunteerDayAbsenceRow[];
  morning_effective_today: boolean;
  afternoon_effective_today: boolean;
}

export async function listCoordinatorVolunteerOverview(
  planDate: string,
  yearMonth: string,
): Promise<CoordinatorVolunteerOverviewRow[]> {
  const supabase = createClient();

  const [volunteersResult, availabilityResult, weeklyBlocksResult, absencesResult] =
    await Promise.all([
      supabase.rpc("list_planning_volunteers"),
      supabase.rpc("get_volunteer_block_availability_overview", {
        p_plan_date: planDate,
      }),
      supabase.from("volunteer_weekly_blocks").select("*"),
      (async () => {
        const range = getMonthDateRange(yearMonth);

        if (!range) {
          return { data: [], error: null };
        }

        return supabase
          .from("volunteer_day_absences")
          .select("*")
          .gte("absence_date", range.startDate)
          .lte("absence_date", range.endDate)
          .order("absence_date", { ascending: true });
      })(),
    ]);

  if (volunteersResult.error) {
    throw new Error(getSupabaseErrorMessage(volunteersResult.error));
  }

  if (availabilityResult.error) {
    throw new Error(getSupabaseErrorMessage(availabilityResult.error));
  }

  if (weeklyBlocksResult.error) {
    throw new Error(getSupabaseErrorMessage(weeklyBlocksResult.error));
  }

  if (absencesResult.error) {
    throw new Error(getSupabaseErrorMessage(absencesResult.error));
  }

  const availabilityByUserId = new Map(
    (availabilityResult.data ?? []).map((row) => [row.user_id, row]),
  );

  const weeklyBlocksByUserId = new Map<string, VolunteerWeeklyBlockRow[]>();

  for (const row of weeklyBlocksResult.data ?? []) {
    const existing = weeklyBlocksByUserId.get(row.user_id) ?? [];
    existing.push({
      user_id: row.user_id,
      day_of_week: row.day_of_week,
      morning_available: row.morning_available,
      afternoon_available: row.afternoon_available,
      updated_at: row.updated_at,
    });
    weeklyBlocksByUserId.set(row.user_id, existing);
  }

  const absencesByUserId = new Map<string, VolunteerDayAbsenceRow[]>();

  for (const row of absencesResult.data ?? []) {
    const existing = absencesByUserId.get(row.user_id) ?? [];
    existing.push({
      id: row.id,
      user_id: row.user_id,
      absence_date: row.absence_date,
      block: row.block as ParticipationBlockId,
      created_at: row.created_at,
    });
    absencesByUserId.set(row.user_id, existing);
  }

  return (volunteersResult.data ?? []).map((volunteer) => {
    const availability = availabilityByUserId.get(volunteer.user_id);

    return {
      user_id: volunteer.user_id,
      full_name: volunteer.full_name,
      volunteer_bio: volunteer.volunteer_bio,
      weekly_blocks: mergeWeeklyBlocks(
        volunteer.user_id,
        weeklyBlocksByUserId.get(volunteer.user_id) ?? [],
      ),
      month_absences: absencesByUserId.get(volunteer.user_id) ?? [],
      morning_effective_today: availability?.morning_effective ?? false,
      afternoon_effective_today: availability?.afternoon_effective ?? false,
    };
  });
}
