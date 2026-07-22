import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRoles } from "@/lib/auth/get-current-user-roles";
import {
  canShowAfternoonInterestCta,
} from "@/lib/ai/participation-advice-policy";
import { isEssentialCareContextComplete } from "@/lib/patient-context/completeness";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { AfternoonGroupInterestSignal } from "@/types/daily-advice";
import type { PatientContext } from "@/types/patient-context";

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

async function requirePatientSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Niet ingelogd.");
  }

  const roles = await getCurrentUserRoles();
  if (!roles.includes("patient")) {
    throw new Error("Alleen patiënten kunnen interesse aangeven.");
  }

  return { supabase, user };
}

async function assertInterestEligibility(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admissionId: string,
  interestDate: string,
): Promise<void> {
  const [contextResult, planResult, checkinResult] = await Promise.all([
    supabase
      .from("patient_context")
      .select(
        "mobility_status, transfer_support, fall_risk, requires_supervision, mobility_aid_type, mobility_aid_available, visit_activity_possibility, room_restriction, can_independently_reach_activity_room",
      )
      .eq("admission_id", admissionId)
      .maybeSingle(),
    supabase
      .from("daily_participation_plans")
      .select("afternoon_title")
      .eq("plan_date", interestDate)
      .maybeSingle(),
    supabase
      .from("patient_checkins")
      .select("id, energy_level, mood, motivation_score")
      .eq("admission_id", admissionId)
      .eq("check_in_date", interestDate)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (contextResult.error) {
    throw new Error(contextResult.error.message);
  }
  if (planResult.error) {
    throw new Error(planResult.error.message);
  }
  if (checkinResult.error) {
    throw new Error(checkinResult.error.message);
  }

  const checkin = checkinResult.data;
  const eligible = canShowAfternoonInterestCta({
    access: contextResult.data?.can_independently_reach_activity_room,
    visitActivityPossibility: contextResult.data?.visit_activity_possibility,
    roomRestriction: contextResult.data?.room_restriction,
    hasPlan: Boolean(planResult.data?.afternoon_title),
    hasCheckIn: Boolean(checkin),
    careContextComplete: isEssentialCareContextComplete(
      (contextResult.data as PatientContext | null) ?? null,
    ),
    energy_level: checkin?.energy_level ?? 0,
    mood: checkin?.mood ?? 0,
    motivation_score: checkin?.motivation_score ?? 0,
  });

  if (!eligible) {
    throw new Error(
      "Interesse aangeven is nu niet mogelijk. Er is al een middagplan, de toegang is beperkt, of rust past vandaag beter.",
    );
  }
}

export async function readOwnAfternoonInterest(): Promise<AfternoonGroupInterestSignal | null> {
  const { supabase } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(supabase);
  const interestDate = getAmsterdamDateString();

  const { data, error } = await supabase
    .from("afternoon_group_interest_signals")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("interest_date", interestDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function expressAfternoonInterest(): Promise<AfternoonGroupInterestSignal> {
  const { supabase } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(supabase);
  const interestDate = getAmsterdamDateString();

  await assertInterestEligibility(supabase, admissionId, interestDate);

  // Upsert via service role after admission + eligibility verified (unique pair).
  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("afternoon_group_interest_signals")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("interest_date", interestDate)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    if (existing.status === "interested") {
      return existing;
    }

    const { data, error } = await admin
      .from("afternoon_group_interest_signals")
      .update({ status: "interested" })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Interesse opslaan mislukt.");
    }

    return data;
  }

  const { data, error } = await admin
    .from("afternoon_group_interest_signals")
    .insert({
      admission_id: admissionId,
      interest_date: interestDate,
      status: "interested",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Interesse opslaan mislukt.");
  }

  return data;
}

export async function withdrawAfternoonInterest(): Promise<AfternoonGroupInterestSignal | null> {
  const { supabase } = await requirePatientSession();
  const admissionId = await resolveActiveAdmissionId(supabase);
  const interestDate = getAmsterdamDateString();

  const { data: existing, error: existingError } = await supabase
    .from("afternoon_group_interest_signals")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("interest_date", interestDate)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing || existing.status === "withdrawn") {
    return existing;
  }

  const { data, error } = await supabase
    .from("afternoon_group_interest_signals")
    .update({ status: "withdrawn" })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Intrekken mislukt.");
  }

  return data;
}
