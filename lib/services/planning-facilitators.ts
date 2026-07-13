import { createClient } from "@/lib/supabase/client";
import type { PlanningFacilitatorCandidate } from "@/types/activity";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.code === "42883" ||
    error.message.includes("Could not find the function")
  ) {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listPlanningFacilitatorCandidates(
  search?: string,
): Promise<PlanningFacilitatorCandidate[]> {
  const supabase = createClient();
  const trimmedSearch = search?.trim();
  const rpcArgs = trimmedSearch ? { p_search: trimmedSearch } : {};

  const { data, error } = await supabase.rpc(
    "list_planning_facilitator_candidates",
    rpcArgs,
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
    roleNames: row.role_names ?? [],
  }));
}

export async function setSeriesFacilitators(
  recurringScheduleId: string,
  userIds: string[],
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const { error: deleteError } = await supabase
    .from("activity_recurring_schedule_facilitators")
    .delete()
    .eq("recurring_schedule_id", recurringScheduleId);

  if (deleteError) {
    throw new Error(getSupabaseErrorMessage(deleteError));
  }

  if (userIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("activity_recurring_schedule_facilitators")
    .insert(
      userIds.map((userId) => ({
        recurring_schedule_id: recurringScheduleId,
        user_id: userId,
        assigned_by_staff_id: user.id,
      })),
    );

  if (insertError) {
    throw new Error(getSupabaseErrorMessage(insertError));
  }
}

export async function listSeriesFacilitatorUserIds(
  recurringScheduleId: string,
): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_recurring_schedule_facilitators")
    .select("user_id")
    .eq("recurring_schedule_id", recurringScheduleId);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => row.user_id);
}
