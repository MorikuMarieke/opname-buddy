import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PatientLinkCodeResult, PatientLinkStatus } from "@/types/clinical-patient";

function getLinkErrorMessage(error: { message: string }): string {
  if (error.message.includes("already linked")) {
    return "Deze patiënt is al gekoppeld aan een account.";
  }

  if (error.message.includes("invalid or expired")) {
    return "Ongeldige of verlopen koppelcode.";
  }

  if (error.message.includes("account is already linked")) {
    return "Je account is al gekoppeld aan een patiënt.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function getPatientLinkStatus(patientId: string): Promise<PatientLinkStatus> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_account_links")
    .select("user_id")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    throw new Error(getLinkErrorMessage(error));
  }

  return {
    isLinked: Boolean(data),
    userId: data?.user_id ?? null,
  };
}

export async function getOwnLinkStatus(): Promise<PatientLinkStatus> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isLinked: false, userId: null };
  }

  const { data, error } = await supabase
    .from("patient_account_links")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(getLinkErrorMessage(error));
  }

  return {
    isLinked: Boolean(data),
    userId: data?.user_id ?? null,
  };
}

export async function redeemPatientLinkCode(code: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("redeem_patient_link_code", {
    p_code: code,
  });

  if (error) {
    throw new Error(getLinkErrorMessage(error));
  }

  if (!data) {
    throw new Error("Koppelen is mislukt. Probeer het opnieuw.");
  }

  return data;
}

export async function generatePatientLinkCode(
  patientId: string,
  actorStaffId: string,
): Promise<PatientLinkCodeResult> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("issue_patient_link_code", {
    p_patient_id: patientId,
    p_created_by_staff_id: actorStaffId,
  });

  if (error) {
    throw new Error(getLinkErrorMessage(error));
  }

  const payload = data as { code?: string; expiresAt?: string } | null;

  if (!payload?.code || !payload.expiresAt) {
    throw new Error("Koppelcode kon niet worden gegenereerd.");
  }

  return {
    code: payload.code,
    expiresAt: payload.expiresAt,
  };
}
