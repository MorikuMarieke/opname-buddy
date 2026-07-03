import { createClient } from "@/lib/supabase/client";

/**
 * Resolves the active admission id for the currently signed-in patient.
 *
 * RLS (`admissions_select_linked`) scopes the `admissions` table to the caller's
 * own linked patient(s), so this returns the calling patient's active stay.
 * Used to stamp `admission_id` on patient-owned care rows (Phase 2 dual-write).
 * Returns null when the account has no active admission yet.
 */
export async function getActiveAdmissionId(): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("admissions")
    .select("id")
    .eq("status", "active")
    .order("admitted_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("De opname van de patiënt kon niet worden bepaald.");
  }

  return data?.id ?? null;
}
