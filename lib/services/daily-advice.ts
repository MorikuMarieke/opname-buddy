import type { SupabaseClient } from "@supabase/supabase-js";

import {
  afternoonStatusForAccess,
  buildAfternoonPatchNote,
  buildNeutralAfternoonNote,
  canConsiderAfternoonActivity,
  enforceAccessGateOnOutput,
  morningVisitAvailable,
} from "@/lib/ai/afternoon-gates";
import { generateDailyBuddyAdvice } from "@/lib/ai/dailybuddy";
import type { InspirationCareContext } from "@/lib/ai/inspiration-filter";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { DailyBuddyStructuredOutput } from "@/lib/validations/daily-advice";
import type { DailyAdvice } from "@/types/daily-advice";
import type { Database } from "@/types/database";

type ServerSupabase = SupabaseClient<Database>;

const GENERATION_CLAIM_TTL_MS = 5 * 60 * 1000;

export interface GenerateAdviceResult {
  advice: DailyAdvice;
  startedGeneration: boolean;
}

async function getLatestCheckinId(
  supabase: ServerSupabase,
  admissionId: string,
  adviceDate: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("patient_checkins")
    .select("id")
    .eq("admission_id", admissionId)
    .eq("check_in_date", adviceDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Check-in lookup failed: ${error.message}`);
  }

  return data?.id ?? null;
}

async function getGenerationMeta(
  supabase: ServerSupabase,
  admissionId: string,
  adviceDate: string,
) {
  const [contextResult, planResult, checkinResult, morningResult] =
    await Promise.all([
      supabase
        .from("patient_context")
        .select(
          "mobility_status, transfer_support, fall_risk, requires_supervision, mobility_aid_type, mobility_aid_available, isolation_type, room_restriction, can_independently_reach_activity_room, additional_attention_points, notes",
        )
        .eq("admission_id", admissionId)
        .maybeSingle(),
      supabase
        .from("daily_participation_plans")
        .select("afternoon_category, afternoon_title, updated_at")
        .eq("plan_date", adviceDate)
        .maybeSingle(),
      supabase
        .from("patient_checkins")
        .select("id, participation_needs")
        .eq("admission_id", admissionId)
        .eq("check_in_date", adviceDate)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.rpc("get_morning_contact_availability_signal", {
        p_plan_date: adviceDate,
      }),
    ]);

  if (contextResult.error) {
    throw new Error(`Context lookup failed: ${contextResult.error.message}`);
  }
  if (planResult.error) {
    throw new Error(`Plan lookup failed: ${planResult.error.message}`);
  }
  if (checkinResult.error) {
    throw new Error(`Check-in meta failed: ${checkinResult.error.message}`);
  }
  if (morningResult.error) {
    throw new Error(
      `Morning signal failed: ${morningResult.error.message}`,
    );
  }

  const careContext = (contextResult.data ??
    null) as InspirationCareContext | null;

  return {
    access:
      careContext?.can_independently_reach_activity_room ?? "unknown",
    plan: planResult.data,
    checkin: checkinResult.data,
    careContext,
    morningAvailable: Boolean(morningResult.data),
  };
}

function isClaimExpired(generationStartedAt: string | null): boolean {
  if (!generationStartedAt) {
    return true;
  }

  const started = new Date(generationStartedAt).getTime();
  return Number.isNaN(started) || Date.now() - started > GENERATION_CLAIM_TTL_MS;
}

/**
 * Idempotent generate controller.
 * `writeClient` must be service-role (patients cannot insert/update daily_advice).
 * `readClient` may be session or service-role; admissionId must already be verified.
 */
export async function ensureDailyAdviceGenerated(
  writeClient: ServerSupabase,
  readClient: ServerSupabase,
  admissionId: string,
  options?: { forceRetry?: boolean },
): Promise<GenerateAdviceResult> {
  const adviceDate = getAmsterdamDateString();
  const latestCheckinId = await getLatestCheckinId(
    readClient,
    admissionId,
    adviceDate,
  );

  if (!latestCheckinId) {
    throw new Error("Vul eerst de check-in van vandaag in.");
  }

  const { data: existing, error: existingError } = await writeClient
    .from("daily_advice")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("advice_date", adviceDate)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Advice lookup failed: ${existingError.message}`);
  }

  if (
    existing?.status === "ready" &&
    existing.source_checkin_id === latestCheckinId &&
    !options?.forceRetry
  ) {
    return { advice: existing, startedGeneration: false };
  }

  if (
    existing?.status === "generating" &&
    !isClaimExpired(existing.generation_started_at) &&
    !options?.forceRetry
  ) {
    return { advice: existing, startedGeneration: false };
  }

  const nowIso = new Date().toISOString();
  let claimed: DailyAdvice;

  if (!existing) {
    const { data, error } = await writeClient
      .from("daily_advice")
      .insert({
        admission_id: admissionId,
        advice_date: adviceDate,
        status: "generating",
        source_checkin_id: latestCheckinId,
        generation_started_at: nowIso,
        error_message: null,
        stale_reason: null,
      })
      .select("*")
      .single();

    if (error) {
      const { data: raced } = await writeClient
        .from("daily_advice")
        .select("*")
        .eq("admission_id", admissionId)
        .eq("advice_date", adviceDate)
        .maybeSingle();

      if (
        raced?.status === "generating" &&
        !isClaimExpired(raced.generation_started_at)
      ) {
        return { advice: raced, startedGeneration: false };
      }

      if (
        raced?.status === "ready" &&
        raced.source_checkin_id === latestCheckinId
      ) {
        return { advice: raced, startedGeneration: false };
      }

      throw new Error(error.message);
    }

    claimed = data;
  } else {
    const canClaim =
      options?.forceRetry ||
      existing.status === "failed" ||
      existing.status === "stale" ||
      (existing.status === "ready" &&
        existing.source_checkin_id !== latestCheckinId) ||
      (existing.status === "generating" &&
        isClaimExpired(existing.generation_started_at));

    if (!canClaim) {
      return { advice: existing, startedGeneration: false };
    }

    const { data, error } = await writeClient
      .from("daily_advice")
      .update({
        status: "generating",
        source_checkin_id: latestCheckinId,
        generation_started_at: nowIso,
        error_message: null,
        stale_reason: null,
      })
      .eq("id", existing.id)
      .eq("status", existing.status)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      const { data: current } = await writeClient
        .from("daily_advice")
        .select("*")
        .eq("id", existing.id)
        .single();

      return { advice: current!, startedGeneration: false };
    }

    claimed = data;
  }

  try {
    const meta = await getGenerationMeta(readClient, admissionId, adviceDate);

    const generated = await generateDailyBuddyAdvice({
      supabase: readClient,
      admissionId,
      adviceDate,
      careContext: meta.careContext,
    });

    const output = enforceAccessGateOnOutput(generated.output, {
      access: meta.access,
      planCategory: meta.plan?.afternoon_category ?? null,
      participationNeeds: meta.checkin?.participation_needs ?? [],
      morningAvailable: meta.morningAvailable,
    });

    const ready = await persistReadyAdvice(writeClient, claimed.id, {
      output,
      modelId: generated.modelId,
      sourceCheckinId: latestCheckinId,
      access: meta.access,
      plan: meta.plan,
    });

    return { advice: ready, startedGeneration: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DailyBuddy-generatie mislukt.";

    const { data: failed } = await writeClient
      .from("daily_advice")
      .update({
        status: "failed",
        error_message: message,
        generation_started_at: null,
      })
      .eq("id", claimed.id)
      .select("*")
      .single();

    if (failed) {
      return { advice: failed, startedGeneration: true };
    }

    throw error;
  }
}

async function persistReadyAdvice(
  writeClient: ServerSupabase,
  adviceId: string,
  input: {
    output: DailyBuddyStructuredOutput;
    modelId: string;
    sourceCheckinId: string;
    access: string;
    plan: {
      afternoon_category: string | null;
      afternoon_title: string | null;
      updated_at: string;
    } | null;
  },
): Promise<DailyAdvice> {
  const { output, modelId, sourceCheckinId, access, plan } = input;
  const hasPlan = Boolean(plan?.afternoon_title);
  let afternoonStatus = afternoonStatusForAccess(access, hasPlan);
  let afternoonTitle: string | null = null;
  let afternoonNote: string | null = null;
  let afternoonClaimsNeedMatch = false;

  if (output.primary_outcome === "rest" && hasPlan) {
    // Rest primary: plan may be shown later as informational only (initial generate).
    afternoonStatus = canConsiderAfternoonActivity(access)
      ? "informational"
      : "not_recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = canConsiderAfternoonActivity(access)
      ? buildNeutralAfternoonNote(plan!.afternoon_title!)
      : null;
    afternoonClaimsNeedMatch = false;
  } else if (output.primary_outcome === "afternoon_group_activity" && hasPlan) {
    afternoonStatus = "recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = output.afternoon?.note ?? null;
    afternoonClaimsNeedMatch = Boolean(output.afternoon?.claims_need_match);
  } else if (
    output.afternoon?.recommend &&
    hasPlan &&
    canConsiderAfternoonActivity(access)
  ) {
    afternoonStatus = "recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = output.afternoon.note;
    afternoonClaimsNeedMatch = output.afternoon.claims_need_match;
  } else if (hasPlan && canConsiderAfternoonActivity(access)) {
    afternoonStatus = "none";
    afternoonTitle = plan!.afternoon_title;
  }

  const secondarySuggest = Boolean(output.secondary_morning_visit?.suggest);

  const { data, error } = await writeClient
    .from("daily_advice")
    .update({
      status: "ready",
      primary_outcome: output.primary_outcome,
      motivation: output.motivation,
      explanation: output.explanation,
      choice_reminder: output.choice_reminder,
      inspiration_ids: output.inspiration_ids,
      secondary_morning_visit: secondarySuggest,
      secondary_morning_note: output.secondary_morning_visit?.note ?? null,
      afternoon_status: afternoonStatus,
      afternoon_title: afternoonTitle,
      afternoon_note: afternoonNote,
      afternoon_claims_need_match: afternoonClaimsNeedMatch,
      source_checkin_id: sourceCheckinId,
      source_plan_updated_at: plan?.updated_at ?? null,
      safety_flags_applied: output.safety_flags_applied,
      model_id: modelId,
      generated_at: new Date().toISOString(),
      generation_started_at: null,
      error_message: null,
      stale_reason: null,
    })
    .eq("id", adviceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Opslaan van advies mislukt.");
  }

  return data;
}

export async function getOwnDailyAdvice(
  supabase: ServerSupabase,
  admissionId: string,
  adviceDate = getAmsterdamDateString(),
): Promise<DailyAdvice | null> {
  const { data, error } = await supabase
    .from("daily_advice")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("advice_date", adviceDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Deterministic afternoon patch when volunteers record today's plan later.
 * Service-role client required.
 */
export async function refreshAfternoonAdviceForDate(
  writeClient: ServerSupabase,
  adviceDate: string,
): Promise<number> {
  const { data: plan, error: planError } = await writeClient
    .from("daily_participation_plans")
    .select("afternoon_category, afternoon_title, updated_at")
    .eq("plan_date", adviceDate)
    .maybeSingle();

  if (planError) {
    throw new Error(planError.message);
  }

  if (!plan?.afternoon_title) {
    return 0;
  }

  const { data: rows, error: rowsError } = await writeClient
    .from("daily_advice")
    .select("id, admission_id, primary_outcome, status, source_plan_updated_at")
    .eq("advice_date", adviceDate)
    .eq("status", "ready");

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  if (!rows?.length) {
    return 0;
  }

  let updated = 0;

  for (const row of rows) {
    if (
      row.source_plan_updated_at &&
      plan.updated_at &&
      row.source_plan_updated_at >= plan.updated_at
    ) {
      continue;
    }

    const { data: context } = await writeClient
      .from("patient_context")
      .select("can_independently_reach_activity_room")
      .eq("admission_id", row.admission_id)
      .maybeSingle();

    const { data: checkin } = await writeClient
      .from("patient_checkins")
      .select("participation_needs")
      .eq("admission_id", row.admission_id)
      .eq("check_in_date", adviceDate)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const access =
      context?.can_independently_reach_activity_room ?? "unknown";
    const needs = checkin?.participation_needs ?? [];
    const exactMatch = needs.includes(plan.afternoon_category ?? "");

    if (!canConsiderAfternoonActivity(access)) {
      await writeClient
        .from("daily_advice")
        .update({
          afternoon_status: "not_recommended",
          afternoon_title: plan.afternoon_title,
          afternoon_note: null,
          afternoon_claims_need_match: false,
          source_plan_updated_at: plan.updated_at,
          primary_outcome:
            row.primary_outcome === "afternoon_group_activity"
              ? "rest"
              : row.primary_outcome,
        })
        .eq("id", row.id);
      updated += 1;
      continue;
    }

    if (row.primary_outcome === "rest") {
      await writeClient
        .from("daily_advice")
        .update({
          afternoon_status: "informational",
          afternoon_title: plan.afternoon_title,
          afternoon_note: buildNeutralAfternoonNote(plan.afternoon_title),
          afternoon_claims_need_match: false,
          source_plan_updated_at: plan.updated_at,
        })
        .eq("id", row.id);
      updated += 1;
      continue;
    }

    const note = buildAfternoonPatchNote({
      title: plan.afternoon_title,
      claimsNeedMatch: exactMatch,
    });

    await writeClient
      .from("daily_advice")
      .update({
        afternoon_status: "recommended",
        afternoon_title: plan.afternoon_title,
        afternoon_note: note,
        afternoon_claims_need_match: exactMatch,
        source_plan_updated_at: plan.updated_at,
      })
      .eq("id", row.id);

    updated += 1;
  }

  return updated;
}

export { morningVisitAvailable };
