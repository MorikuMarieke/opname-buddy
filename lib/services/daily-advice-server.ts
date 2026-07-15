import { getCurrentUserRoles } from "@/lib/auth/get-current-user-roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ensureDailyAdviceGenerated,
  getOwnDailyAdvice,
  refreshAfternoonAdviceForDate,
} from "@/lib/services/daily-advice";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { DailyAdvice } from "@/types/daily-advice";

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
}): Promise<{ advice: DailyAdvice; startedGeneration: boolean }> {
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

export async function readAdviceForCurrentPatient(): Promise<DailyAdvice | null> {
  const { supabase: readClient } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(readClient);
  return getOwnDailyAdvice(readClient, admissionId);
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
