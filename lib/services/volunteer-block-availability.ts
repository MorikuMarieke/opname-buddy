import { createClient } from "@/lib/supabase/client";
import {
  getDefaultWeeklyBlocks,
  mergeWeeklyBlocks,
} from "@/lib/utils/volunteer-block-availability";
import type {
  VolunteerDayAbsenceRow,
  VolunteerWeeklyBlockInput,
  VolunteerWeeklyBlockRow,
} from "@/types/daily-participation";
import type { ParticipationBlockId } from "@/lib/constants/daily-participation";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
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

export async function getMyWeeklyBlocks(): Promise<VolunteerWeeklyBlockRow[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("volunteer_weekly_blocks")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mergeWeeklyBlocks(userId, data ?? []);
}

export async function saveMyWeeklyBlocks(
  blocks: VolunteerWeeklyBlockInput[],
): Promise<VolunteerWeeklyBlockRow[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const rows = blocks.map((block) => ({
    user_id: userId,
    day_of_week: block.day_of_week,
    morning_available: block.morning_available,
    afternoon_available: block.afternoon_available,
  }));

  const { error: deleteError } = await supabase
    .from("volunteer_weekly_blocks")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(getSupabaseErrorMessage(deleteError));
  }

  const blocksToInsert = rows.filter(
    (row) => row.morning_available || row.afternoon_available,
  );

  if (blocksToInsert.length === 0) {
    return getDefaultWeeklyBlocks(userId);
  }

  const { data, error } = await supabase
    .from("volunteer_weekly_blocks")
    .insert(blocksToInsert)
    .select("*");

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mergeWeeklyBlocks(userId, data ?? []);
}

export async function getMyDayAbsencesForMonth(
  yearMonth: string,
): Promise<VolunteerDayAbsenceRow[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const [yearPart, monthPart] = yearMonth.split("-").map(Number);

  if (!yearPart || !monthPart) {
    return [];
  }

  const startDate = `${yearPart}-${String(monthPart).padStart(2, "0")}-01`;
  const endDate = `${yearPart}-${String(monthPart).padStart(2, "0")}-${String(
    new Date(yearPart, monthPart, 0).getDate(),
  ).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("volunteer_day_absences")
    .select("*")
    .eq("user_id", userId)
    .gte("absence_date", startDate)
    .lte("absence_date", endDate)
    .order("absence_date", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    absence_date: row.absence_date,
    block: row.block as ParticipationBlockId,
    created_at: row.created_at,
  }));
}

export async function setMyDayAbsence(
  absenceDate: string,
  block: ParticipationBlockId,
  isAbsent: boolean,
): Promise<void> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  if (!isAbsent) {
    const { error } = await supabase
      .from("volunteer_day_absences")
      .delete()
      .eq("user_id", userId)
      .eq("absence_date", absenceDate)
      .eq("block", block);

    if (error) {
      throw new Error(getSupabaseErrorMessage(error));
    }

    return;
  }

  const { error } = await supabase.from("volunteer_day_absences").insert({
    user_id: userId,
    absence_date: absenceDate,
    block,
  });

  if (error && error.code !== "23505") {
    throw new Error(getSupabaseErrorMessage(error));
  }
}
