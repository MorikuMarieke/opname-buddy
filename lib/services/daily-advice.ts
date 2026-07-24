import type { SupabaseClient } from "@supabase/supabase-js";

import {
  afternoonStatusForAccess,
  buildAfternoonPatchNote,
  buildCareContextFingerprint,
  buildDeterministicAdviceWhenNoPlan,
  buildNeutralAfternoonNote,
  canConsiderAfternoonGroupRoute,
  DETERMINISTIC_POLICY_MODEL_ID,
  enforceAccessGateOnOutput,
  morningVisitAvailable,
  type EnforceAdvicePolicyOptions,
} from "@/lib/ai/participation-advice-policy";
import { generateDailyBuddyAdvice } from "@/lib/ai/dailybuddy";
import type { InspirationCareContext } from "@/lib/ai/inspiration-filter";
import { createProgressEmitter } from "@/lib/daily-advice/progress";
import type { DailyBuddyProgressEvent } from "@/lib/daily-advice/progress";
import { resolveDailyBuddyPrerequisites } from "@/lib/services/daily-advice-prerequisites";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { DailyBuddyStructuredOutput } from "@/lib/validations/daily-advice";
import type { DailyAdvice } from "@/types/daily-advice";
import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";
import type { Database } from "@/types/database";

type ServerSupabase = SupabaseClient<Database>;

const GENERATION_CLAIM_TTL_MS = 5 * 60 * 1000;

export type GenerateAdviceResult =
  | {
      advice: null;
      startedGeneration: false;
      prerequisite: DailyBuddyPrerequisite;
    }
  | {
      advice: DailyAdvice;
      startedGeneration: boolean;
      prerequisite?: undefined;
    };

export type EnsureDailyAdviceOptions = {
  forceRetry?: boolean;
  onProgress?: (event: DailyBuddyProgressEvent) => void;
};

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
          "mobility_status, transfer_support, fall_risk, requires_supervision, mobility_aid_type, mobility_aid_available, visit_activity_possibility, room_restriction, can_independently_reach_activity_room, additional_attention_points",
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
        .select(
          "id, participation_needs, energy_level, mood, motivation_score",
        )
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

  const checkinScores = checkinResult.data
    ? {
        energy_level: checkinResult.data.energy_level,
        mood: checkinResult.data.mood,
        motivation_score: checkinResult.data.motivation_score,
      }
    : null;

  const policyOptions: EnforceAdvicePolicyOptions = {
    access: careContext?.can_independently_reach_activity_room ?? "unknown",
    hasPlan: Boolean(planResult.data?.afternoon_title),
    planCategory: planResult.data?.afternoon_category ?? null,
    participationNeeds: checkinResult.data?.participation_needs ?? [],
    morningAvailable: Boolean(morningResult.data),
    visitActivityPossibility: careContext?.visit_activity_possibility ?? null,
    roomRestriction: careContext?.room_restriction ?? null,
    checkinScores,
  };

  return {
    access: policyOptions.access,
    plan: planResult.data,
    checkin: checkinResult.data,
    careContext,
    morningAvailable: policyOptions.morningAvailable,
    contextFingerprint: buildCareContextFingerprint(careContext),
    policyOptions,
  };
}

function adviceNeedsRefresh(
  advice: DailyAdvice,
  latestCheckinId: string,
  contextFingerprint: string,
): { stale: boolean; reason: string | null } {
  if (advice.source_checkin_id !== latestCheckinId) {
    return { stale: true, reason: "checkin_changed" };
  }

  if (
    !advice.source_context_fingerprint ||
    advice.source_context_fingerprint !== contextFingerprint
  ) {
    return { stale: true, reason: "care_context_changed" };
  }

  return { stale: false, reason: null };
}

function isClaimExpired(generationStartedAt: string | null): boolean {
  if (!generationStartedAt) {
    return true;
  }

  const started = new Date(generationStartedAt).getTime();
  return Number.isNaN(started) || Date.now() - started > GENERATION_CLAIM_TTL_MS;
}

async function getActiveAdviceRow(
  writeClient: ServerSupabase,
  admissionId: string,
  adviceDate: string,
): Promise<DailyAdvice | null> {
  const { data, error } = await writeClient
    .from("daily_advice")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("advice_date", adviceDate)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Advice lookup failed: ${error.message}`);
  }

  return data;
}

/**
 * Idempotent generate controller.
 * `writeClient` must be service-role (patients cannot insert/update daily_advice).
 * `readClient` must be the authenticated session client (RLS + morning RPC).
 * `admissionId` must already be verified via the session client.
 */
export async function ensureDailyAdviceGenerated(
  writeClient: ServerSupabase,
  readClient: ServerSupabase,
  admissionId: string,
  options?: EnsureDailyAdviceOptions,
): Promise<GenerateAdviceResult> {
  const adviceDate = getAmsterdamDateString();
  const progress = createProgressEmitter(options?.onProgress);

  const prerequisites = await resolveDailyBuddyPrerequisites(
    readClient,
    admissionId,
    adviceDate,
  );

  if (!prerequisites.ok) {
    return {
      advice: null,
      startedGeneration: false,
      prerequisite: prerequisites.prerequisite,
    };
  }

  const latestCheckinId = await getLatestCheckinId(
    readClient,
    admissionId,
    adviceDate,
  );

  // Prerequisites already verified a check-in exists; keep a hard guard for races.
  if (!latestCheckinId) {
    return {
      advice: null,
      startedGeneration: false,
      prerequisite: "checkin_required",
    };
  }

  const meta = await getGenerationMeta(readClient, admissionId, adviceDate);
  const existing = await getActiveAdviceRow(
    writeClient,
    admissionId,
    adviceDate,
  );

  const refresh =
    existing?.status === "ready"
      ? adviceNeedsRefresh(existing, latestCheckinId, meta.contextFingerprint)
      : { stale: false, reason: null };

  if (
    existing?.status === "ready" &&
    !refresh.stale &&
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
        iteration: 1,
        generation_kind: "standard",
        is_active: true,
        source_checkin_id: latestCheckinId,
        source_context_fingerprint: meta.contextFingerprint,
        generation_started_at: nowIso,
        error_message: null,
        stale_reason: null,
      })
      .select("*")
      .single();

    if (error) {
      const raced = await getActiveAdviceRow(
        writeClient,
        admissionId,
        adviceDate,
      );

      if (
        raced?.status === "generating" &&
        !isClaimExpired(raced.generation_started_at)
      ) {
        return { advice: raced, startedGeneration: false };
      }

      if (raced?.status === "ready") {
        const racedRefresh = adviceNeedsRefresh(
          raced,
          latestCheckinId,
          meta.contextFingerprint,
        );
        if (!racedRefresh.stale) {
          return { advice: raced, startedGeneration: false };
        }
      }

      throw new Error(error.message);
    }

    claimed = data;
  } else {
    const canClaim =
      options?.forceRetry ||
      existing.status === "failed" ||
      existing.status === "stale" ||
      (existing.status === "ready" && refresh.stale) ||
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
        source_context_fingerprint: meta.contextFingerprint,
        generation_started_at: nowIso,
        error_message: null,
        stale_reason: null,
      })
      .eq("id", existing.id)
      .eq("status", existing.status)
      .eq("is_active", true)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      const current = await getActiveAdviceRow(
        writeClient,
        admissionId,
        adviceDate,
      );
      return { advice: current!, startedGeneration: false };
    }

    claimed = data;
  }

  try {
    let output: DailyBuddyStructuredOutput;
    let modelId: string;
    let usedDeterministic = false;

    const deterministic = buildDeterministicAdviceWhenNoPlan(meta.policyOptions);
    if (deterministic) {
      // Deterministic path: no LLM — only communicate day's possibilities + compose.
      progress.emit("possibilities", "deterministic");
      progress.emit("composing", "deterministic");
      output = deterministic;
      modelId = DETERMINISTIC_POLICY_MODEL_ID;
      usedDeterministic = true;
    } else {
      const generated = await generateDailyBuddyAdvice({
        supabase: readClient,
        admissionId,
        adviceDate,
        careContext: meta.careContext,
        onProgress: options?.onProgress,
      });

      // Structured output is available (already schema-validated + sanitised).
      progress.emit("validating", "llm");
      output = enforceAccessGateOnOutput(generated.output, meta.policyOptions);
      modelId = generated.modelId;
    }

    const path = usedDeterministic ? "deterministic" : "llm";
    if (usedDeterministic) {
      progress.emit("validating", "deterministic");
    }

    const ready = await persistReadyAdvice(writeClient, claimed.id, {
      output,
      modelId,
      sourceCheckinId: latestCheckinId,
      sourceContextFingerprint: meta.contextFingerprint,
      access: meta.access ?? "unknown",
      visitActivityPossibility: meta.policyOptions.visitActivityPossibility,
      roomRestriction: meta.policyOptions.roomRestriction,
      plan: meta.plan,
    });

    progress.emit("ready", path);

    return { advice: ready, startedGeneration: true };
  } catch (error) {
    // Persist internal detail server-side only; never send to the patient wire.
    const message =
      error instanceof Error ? error.message : "DailyBuddy-generatie mislukt.";
    console.error("[DailyBuddy] generation failed:", message);

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
    sourceContextFingerprint: string;
    access: string;
    visitActivityPossibility?: string | null;
    roomRestriction?: string | null;
    plan: {
      afternoon_category: string | null;
      afternoon_title: string | null;
      updated_at: string;
    } | null;
  },
): Promise<DailyAdvice> {
  const {
    output,
    modelId,
    sourceCheckinId,
    sourceContextFingerprint,
    access,
    visitActivityPossibility,
    roomRestriction,
    plan,
  } = input;
  const hasPlan = Boolean(plan?.afternoon_title);
  const mayGroup = canConsiderAfternoonGroupRoute({
    access,
    visitActivityPossibility,
    roomRestriction,
  });
  let afternoonStatus = afternoonStatusForAccess(access, hasPlan, {
    visitActivityPossibility,
    roomRestriction,
  });
  let afternoonTitle: string | null = null;
  let afternoonNote: string | null = null;
  let afternoonClaimsNeedMatch = false;

  if (output.primary_outcome === "rest" && hasPlan) {
    afternoonStatus = mayGroup ? "informational" : "not_recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = mayGroup
      ? buildNeutralAfternoonNote(plan!.afternoon_title!)
      : null;
    afternoonClaimsNeedMatch = false;
  } else if (output.primary_outcome === "afternoon_group_activity" && hasPlan) {
    afternoonStatus = "recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = output.afternoon?.note ?? null;
    afternoonClaimsNeedMatch = Boolean(output.afternoon?.claims_need_match);
  } else if (output.afternoon?.recommend && hasPlan && mayGroup) {
    afternoonStatus = "recommended";
    afternoonTitle = plan!.afternoon_title;
    afternoonNote = output.afternoon.note;
    afternoonClaimsNeedMatch = output.afternoon.claims_need_match;
  } else if (hasPlan && mayGroup) {
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
      source_context_fingerprint: sourceContextFingerprint,
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
    .eq("is_active", true)
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
    .eq("status", "ready")
    .eq("is_active", true);

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
      .select(
        "can_independently_reach_activity_room, visit_activity_possibility, room_restriction",
      )
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
    const mayGroup = canConsiderAfternoonGroupRoute({
      access,
      visitActivityPossibility: context?.visit_activity_possibility,
      roomRestriction: context?.room_restriction,
    });

    if (!mayGroup) {
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

/**
 * Marks ready advice stale when check-in or material care context changed.
 * Does not regenerate — caller/UI uses existing stale refresh UX.
 */
export async function markAdviceStaleIfOutdated(
  writeClient: ServerSupabase,
  readClient: ServerSupabase,
  admissionId: string,
  advice: DailyAdvice,
  adviceDate = getAmsterdamDateString(),
): Promise<DailyAdvice> {
  if (advice.status !== "ready") {
    return advice;
  }

  const [latestCheckinId, meta] = await Promise.all([
    getLatestCheckinId(readClient, admissionId, adviceDate),
    getGenerationMeta(readClient, admissionId, adviceDate),
  ]);

  if (!latestCheckinId) {
    return advice;
  }

  const refresh = adviceNeedsRefresh(
    advice,
    latestCheckinId,
    meta.contextFingerprint,
  );

  if (!refresh.stale) {
    return advice;
  }

  const { data, error } = await writeClient
    .from("daily_advice")
    .update({
      status: "stale",
      stale_reason: refresh.reason,
    })
    .eq("id", advice.id)
    .eq("status", "ready")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? advice;
}

export { morningVisitAvailable };
