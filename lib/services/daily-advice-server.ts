import { getCurrentUserRoles } from "@/lib/auth/get-current-user-roles";
import { assertDailyBuddyDevIterateAllowed } from "@/lib/config/dailybuddy-dev";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ensureDailyAdviceGenerated,
  getOwnDailyAdvice,
  markAdviceStaleIfOutdated,
  refreshAfternoonAdviceForDate,
  type GenerateAdviceResult,
} from "@/lib/services/daily-advice";
import { resolveDailyBuddyPrerequisites } from "@/lib/services/daily-advice-prerequisites";
import type { DailyBuddyProgressEvent } from "@/lib/daily-advice/progress";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { DailyAdvice } from "@/types/daily-advice";
import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";

/**
 * Resolves the caller's active admission via session RLS.
 * Never accept a client-supplied admission id.
 */
async function resolveActiveAdmissionId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data, error } = await supabase
    .from("admissions")
    .select("id")
    .eq("status", "active")
    .order("admitted_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Geen actieve opname gevonden.");
  }

  return data.id;
}

export async function requirePatientSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Niet ingelogd.");
  }

  const roles = await getCurrentUserRoles();
  if (!roles.includes("patient")) {
    throw new Error("Alleen patiënten kunnen DagBuddy-advies opvragen.");
  }

  return { supabase, user };
}

export async function generateAdviceForCurrentPatient(options?: {
  forceRetry?: boolean;
  devIterate?: boolean;
  onProgress?: (event: DailyBuddyProgressEvent) => void;
}): Promise<GenerateAdviceResult> {
  if (options?.devIterate) {
    assertDailyBuddyDevIterateAllowed();
  }

  const { supabase: readClient } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(readClient);
  // Writes require service role after admission was verified via session RLS.
  const writeClient = createAdminClient();
  return ensureDailyAdviceGenerated(
    writeClient,
    readClient,
    admissionId,
    options,
  );
}

export interface ReadAdviceForCurrentPatientResult {
  advice: DailyAdvice | null;
  /**
   * Present only when authoritative gates block generation and the row is not
   * already `ready` / `generating` (those paths skip prerequisite lookups so
   * foreign-generation polling does not re-query check-in/context).
   */
  prerequisite?: DailyBuddyPrerequisite;
}

/**
 * Read today's advice. Prerequisite lookups are skipped for `ready` and
 * `generating` rows so the 2s poll path does not add check-in/context work.
 */
export async function readAdviceForCurrentPatient(): Promise<ReadAdviceForCurrentPatientResult> {
  const { supabase: readClient } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(readClient);
  const adviceDate = getAmsterdamDateString();
  let advice = await getOwnDailyAdvice(readClient, admissionId, adviceDate);

  if (advice?.status === "ready") {
    const writeClient = createAdminClient();
    advice = await markAdviceStaleIfOutdated(
      writeClient,
      readClient,
      admissionId,
      advice,
      adviceDate,
    );
  }

  if (advice?.status === "ready" || advice?.status === "generating") {
    return { advice };
  }

  const prerequisites = await resolveDailyBuddyPrerequisites(
    readClient,
    admissionId,
    adviceDate,
  );

  if (!prerequisites.ok) {
    return {
      advice,
      prerequisite: prerequisites.prerequisite,
    };
  }

  return { advice };
}

export async function patchAfternoonAdviceForToday(): Promise<{
  updated: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Niet ingelogd.");
  }

  const roles = await getCurrentUserRoles();
  const allowed =
    roles.includes("volunteer") ||
    roles.includes("activity_coordinator") ||
    roles.includes("admin");

  if (!allowed) {
    throw new Error("Geen toegang tot deze actie.");
  }

  const admin = createAdminClient();
  const updated = await refreshAfternoonAdviceForDate(
    admin,
    getAmsterdamDateString(),
  );

  return { updated };
}
