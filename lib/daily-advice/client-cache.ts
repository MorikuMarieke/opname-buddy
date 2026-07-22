import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";
import type { PatientDailyAdvice } from "@/lib/daily-advice/patient-response";

export interface DailyAdviceQueryData {
  advice: PatientDailyAdvice | null;
  prerequisite?: DailyBuddyPrerequisite;
}

export type GenerateAdviceCacheResult =
  | {
      advice: null;
      startedGeneration: false;
      prerequisite: DailyBuddyPrerequisite;
    }
  | {
      advice: PatientDailyAdvice;
      startedGeneration: boolean;
      prerequisite?: undefined;
    };

/** Browser/Next must not reuse a stale GET after a long POST completes. */
export const ADVICE_FETCH_INIT = {
  cache: "no-store",
} as const satisfies RequestInit;

const LOCAL_GENERATING_ID = "local-generating";

/**
 * Marks the query cache as generating so refetchInterval can poll while a
 * *foreign* claim is in flight. The owning stream should pause polling
 * via `pausePolling` while its own POST is active.
 */
export function markAdviceGenerating(
  current: DailyAdviceQueryData | undefined,
): DailyAdviceQueryData {
  if (current?.advice) {
    return {
      advice: {
        ...current.advice,
        status: "generating",
        stale_reason: null,
      },
    };
  }

  const now = new Date().toISOString();
  return {
    advice: {
      id: LOCAL_GENERATING_ID,
      admission_id: "local",
      advice_date: getAmsterdamDateString(),
      status: "generating",
      iteration: 1,
      generation_kind: "standard",
      is_active: true,
      afternoon_claims_need_match: false,
      afternoon_note: null,
      afternoon_status: null,
      afternoon_title: null,
      choice_reminder: null,
      created_at: now,
      explanation: null,
      generated_at: null,
      generation_started_at: now,
      inspiration_ids: [],
      model_id: null,
      motivation: null,
      primary_outcome: null,
      safety_flags_applied: [],
      secondary_morning_note: null,
      secondary_morning_visit: false,
      source_checkin_id: null,
      source_context_fingerprint: null,
      source_plan_updated_at: null,
      stale_reason: null,
      updated_at: now,
    },
  };
}

/**
 * Applies the POST generation result as the authoritative cache value.
 * Ready/failed from POST must win over an in-flight poll that still saw generating.
 */
export function applyGenerateAdviceSuccess(
  current: DailyAdviceQueryData | undefined,
  result: GenerateAdviceCacheResult,
): DailyAdviceQueryData {
  if (result.prerequisite) {
    return {
      advice: current?.advice ?? null,
      prerequisite: result.prerequisite,
    };
  }

  return { advice: result.advice };
}

/**
 * Prevent a late poll GET (or HTTP-cached GET) from regressing ready → generating.
 */
export function mergeAdviceFetchIntoCache(
  current: DailyAdviceQueryData | undefined,
  fetched: DailyAdviceQueryData,
): DailyAdviceQueryData {
  const currentStatus = current?.advice?.status;
  const fetchedStatus = fetched.advice?.status;

  if (
    (currentStatus === "ready" || currentStatus === "failed") &&
    fetchedStatus === "generating"
  ) {
    return current!;
  }

  if (
    currentStatus === "ready" &&
    fetched.advice &&
    fetched.advice.id === current!.advice!.id &&
    fetchedStatus === "ready"
  ) {
    return fetched;
  }

  return fetched;
}
