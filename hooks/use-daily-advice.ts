"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useCallback, useState } from "react";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  ADVICE_FETCH_INIT,
  applyGenerateAdviceSuccess,
  markAdviceGenerating,
  mergeAdviceFetchIntoCache,
  type DailyAdviceQueryData,
  type GenerateAdviceCacheResult,
} from "@/lib/daily-advice/client-cache";
import {
  DAILYBUDDY_PROGRESS_MESSAGES,
  type DailyBuddyProgressStage,
} from "@/lib/daily-advice/progress";
import {
  DAILYBUDDY_PATIENT_SAFE_ERROR,
  toPatientSafeErrorMessage,
  type PatientDailyAdvice,
} from "@/lib/daily-advice/patient-response";
import {
  DAILYBUDDY_NDJSON_CONTENT_TYPE,
  isDailyBuddyStreamEvent,
} from "@/lib/daily-advice/stream-events";
import { isDailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";

export type { DailyAdviceQueryData };

export type GenerateAdviceMutationResult = GenerateAdviceCacheResult;

export type GenerateAdviceRequest =
  | boolean
  | {
      forceRetry?: boolean;
    };

function assertNoErrorMessageField(advice: PatientDailyAdvice): void {
  if (
    typeof advice === "object" &&
    advice !== null &&
    "error_message" in advice
  ) {
    throw new Error(DAILYBUDDY_PATIENT_SAFE_ERROR);
  }
}

async function fetchAdvice(): Promise<DailyAdviceQueryData> {
  const response = await fetch("/api/dailybuddy/advice", ADVICE_FETCH_INIT);
  const body = (await response.json()) as {
    advice?: PatientDailyAdvice | null;
    prerequisite?: unknown;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? DAILYBUDDY_PATIENT_SAFE_ERROR);
  }

  if (body.advice) {
    assertNoErrorMessageField(body.advice);
  }

  return {
    advice: body.advice ?? null,
    ...(isDailyBuddyPrerequisite(body.prerequisite)
      ? { prerequisite: body.prerequisite }
      : {}),
  };
}

async function generateAdviceStreaming(
  request: GenerateAdviceRequest,
  onProgress: (message: string, stage: DailyBuddyProgressStage) => void,
): Promise<GenerateAdviceMutationResult> {
  const options =
    typeof request === "boolean"
      ? { forceRetry: request }
      : {
          forceRetry: Boolean(request.forceRetry),
        };

  const response = await fetch("/api/dailybuddy/advice", {
    method: "POST",
    ...ADVICE_FETCH_INIT,
    headers: {
      "Content-Type": "application/json",
      Accept: DAILYBUDDY_NDJSON_CONTENT_TYPE,
    },
    body: JSON.stringify({ ...options, stream: true }),
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? DAILYBUDDY_PATIENT_SAFE_ERROR);
  }

  // Fallback if a proxy strips NDJSON (keep JSON contract).
  if (!contentType.includes(DAILYBUDDY_NDJSON_CONTENT_TYPE)) {
    const body = (await response.json()) as {
      advice?: PatientDailyAdvice | null;
      startedGeneration?: boolean;
      status?: unknown;
      error?: string;
    };

    if (isDailyBuddyPrerequisite(body.status)) {
      return {
        advice: null,
        startedGeneration: false,
        prerequisite: body.status,
      };
    }

    if (!body.advice) {
      throw new Error(body.error ?? DAILYBUDDY_PATIENT_SAFE_ERROR);
    }

    assertNoErrorMessageField(body.advice);

    onProgress(DAILYBUDDY_PROGRESS_MESSAGES.ready, "ready");

    return {
      advice: body.advice,
      startedGeneration: Boolean(body.startedGeneration),
    };
  }

  if (!response.body) {
    throw new Error(DAILYBUDDY_PATIENT_SAFE_ERROR);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: GenerateAdviceMutationResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }

      if (!isDailyBuddyStreamEvent(parsed)) {
        continue;
      }

      if (parsed.type === "progress") {
        onProgress(parsed.message, parsed.stage);
        continue;
      }

      if (parsed.type === "prerequisite") {
        finalResult = {
          advice: null,
          startedGeneration: false,
          prerequisite: parsed.status,
        };
        continue;
      }

      if (parsed.type === "result") {
        assertNoErrorMessageField(parsed.advice);
        onProgress(DAILYBUDDY_PROGRESS_MESSAGES.ready, "ready");
        finalResult = {
          advice: parsed.advice,
          startedGeneration: parsed.startedGeneration,
        };
        continue;
      }

      if (parsed.type === "error") {
        throw new Error(
          parsed.error === DAILYBUDDY_PATIENT_SAFE_ERROR
            ? parsed.error
            : DAILYBUDDY_PATIENT_SAFE_ERROR,
        );
      }
    }
  }

  if (!finalResult) {
    throw new Error(DAILYBUDDY_PATIENT_SAFE_ERROR);
  }

  return finalResult;
}

export function useDailyAdvice(options?: { pausePolling?: boolean }) {
  const queryClient = useQueryClient();
  const pausePolling = Boolean(options?.pausePolling);

  return useQuery({
    queryKey: queryKeys.dailyAdvice.today(),
    queryFn: async () => {
      const data = await fetchAdvice();
      const current = queryClient.getQueryData<DailyAdviceQueryData>(
        queryKeys.dailyAdvice.today(),
      );

      if (
        data.prerequisite === "checkin_required" &&
        queryClient.getQueryData(queryKeys.checkIns.today())
      ) {
        return mergeAdviceFetchIntoCache(current, {
          advice: data.advice ?? null,
        });
      }

      return mergeAdviceFetchIntoCache(current, data);
    },
    refetchInterval: (query) => {
      // Stream owner must not poll while its own generation POST is active.
      if (pausePolling) {
        return false;
      }
      const data = query.state.data;
      if (data?.prerequisite) {
        return false;
      }
      return data?.advice?.status === "generating" ? 2000 : false;
    },
  });
}

export function useGenerateDailyAdvice() {
  const queryClient = useQueryClient();
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [progressStage, setProgressStage] =
    useState<DailyBuddyProgressStage | null>(null);

  const clearProgress = useCallback(() => {
    setProgressMessage(null);
    setProgressStage(null);
  }, []);

  const mutation = useMutation({
    mutationFn: (request?: GenerateAdviceRequest) =>
      generateAdviceStreaming(request ?? false, (message, stage) => {
        startTransition(() => {
          setProgressMessage(message);
          setProgressStage(stage);
        });
      }),
    onMutate: async () => {
      clearProgress();
      await queryClient.cancelQueries({
        queryKey: queryKeys.dailyAdvice.today(),
      });
      const previous = queryClient.getQueryData<DailyAdviceQueryData>(
        queryKeys.dailyAdvice.today(),
      );
      queryClient.setQueryData<DailyAdviceQueryData>(
        queryKeys.dailyAdvice.today(),
        markAdviceGenerating(previous),
      );
      return { previous };
    },
    onSuccess: async (result) => {
      if (
        result.prerequisite === "checkin_required" &&
        queryClient.getQueryData(queryKeys.checkIns.today())
      ) {
        clearProgress();
        return;
      }

      await queryClient.cancelQueries({
        queryKey: queryKeys.dailyAdvice.today(),
      });

      const current = queryClient.getQueryData<DailyAdviceQueryData>(
        queryKeys.dailyAdvice.today(),
      );
      const next = applyGenerateAdviceSuccess(current, result);

      queryClient.setQueryData<DailyAdviceQueryData>(
        queryKeys.dailyAdvice.today(),
        next,
      );

      if (result.prerequisite || next.advice?.status === "failed") {
        clearProgress();
      }
    },
    onError: (_error, _variables, context) => {
      clearProgress();
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          queryKeys.dailyAdvice.today(),
          context.previous,
        );
      }
    },
  });

  const patientSafeError =
    mutation.error instanceof Error
      ? new Error(toPatientSafeErrorMessage(mutation.error))
      : mutation.error
        ? new Error(DAILYBUDDY_PATIENT_SAFE_ERROR)
        : null;

  return {
    ...mutation,
    error: patientSafeError,
    progressMessage,
    progressStage,
    clearProgress,
  };
}

