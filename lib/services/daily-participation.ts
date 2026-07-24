import { createClient } from "@/lib/supabase/client";
import type {
  DailyNeedsSummaryRow,
  DailyParticipationPlanRow,
  UpsertDailyParticipationPlanInput,
  VolunteerBlockAvailabilityOverviewRow,
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

export interface DailyParticipationPlanWithAudit extends DailyParticipationPlanRow {
  recorded_by_name: string | null;
}

export async function getDailyNeedsSummary(
  planDate: string,
): Promise<DailyNeedsSummaryRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_daily_needs_summary", {
    p_plan_date: planDate,
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    need: row.need as DailyNeedsSummaryRow["need"],
    need_count: Number(row.need_count),
  }));
}

export async function getVolunteerBlockAvailabilityOverview(
  planDate: string,
): Promise<VolunteerBlockAvailabilityOverviewRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_volunteer_block_availability_overview",
    { p_plan_date: planDate },
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    user_id: row.user_id,
    full_name: row.full_name,
    morning_effective: row.morning_effective,
    afternoon_effective: row.afternoon_effective,
  }));
}

export async function getDailyParticipationPlan(
  planDate: string,
): Promise<DailyParticipationPlanWithAudit | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("daily_participation_plans")
    .select(
      `
      id,
      plan_date,
      afternoon_category,
      afternoon_title,
      participant_message,
      recorded_by_user_id,
      created_at,
      updated_at,
      recorded_by:profiles!daily_participation_plans_recorded_by_user_id_fkey (
        full_name
      )
    `,
    )
    .eq("plan_date", planDate)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  const recordedBy = data.recorded_by as { full_name: string | null } | null;

  return {
    id: data.id,
    plan_date: data.plan_date,
    afternoon_category: data.afternoon_category as DailyParticipationPlanWithAudit["afternoon_category"],
    afternoon_title: data.afternoon_title,
    participant_message: data.participant_message,
    recorded_by_user_id: data.recorded_by_user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    recorded_by_name: recordedBy?.full_name ?? null,
  };
}

export async function upsertDailyParticipationPlan(
  input: UpsertDailyParticipationPlanInput,
): Promise<DailyParticipationPlanWithAudit> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const { data, error } = await supabase
    .from("daily_participation_plans")
    .upsert(
      {
        plan_date: input.plan_date,
        afternoon_category: input.afternoon_category,
        afternoon_title: input.afternoon_title?.trim()
          ? input.afternoon_title.trim()
          : null,
        participant_message: input.participant_message?.trim()
          ? input.participant_message.trim()
          : null,
        recorded_by_user_id: user.id,
      },
      { onConflict: "plan_date" },
    )
    .select(
      `
      id,
      plan_date,
      afternoon_category,
      afternoon_title,
      participant_message,
      recorded_by_user_id,
      created_at,
      updated_at,
      recorded_by:profiles!daily_participation_plans_recorded_by_user_id_fkey (
        full_name
      )
    `,
    )
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  const recordedBy = data.recorded_by as { full_name: string | null } | null;

  const result: DailyParticipationPlanWithAudit = {
    id: data.id,
    plan_date: data.plan_date,
    afternoon_category: data.afternoon_category as DailyParticipationPlanWithAudit["afternoon_category"],
    afternoon_title: data.afternoon_title,
    participant_message: data.participant_message,
    recorded_by_user_id: data.recorded_by_user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    recorded_by_name: recordedBy?.full_name ?? null,
  };

  // Best-effort deterministic afternoon advice patch (non-blocking).
  void fetch("/api/dailybuddy/afternoon-patch", { method: "POST" }).catch(
    () => undefined,
  );

  return result;
}
