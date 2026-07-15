"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import type { DailyAdvice } from "@/types/daily-advice";

async function fetchAdvice(): Promise<{ advice: DailyAdvice | null }> {
  const response = await fetch("/api/dailybuddy/advice");
  const body = (await response.json()) as {
    advice?: DailyAdvice | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Advies laden mislukt.");
  }

  return { advice: body.advice ?? null };
}

async function generateAdvice(forceRetry = false): Promise<{
  advice: DailyAdvice;
  startedGeneration: boolean;
}> {
  const response = await fetch("/api/dailybuddy/advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceRetry }),
  });

  const body = (await response.json()) as {
    advice?: DailyAdvice;
    startedGeneration?: boolean;
    error?: string;
  };

  if (!response.ok || !body.advice) {
    throw new Error(body.error ?? "Advies genereren mislukt.");
  }

  return {
    advice: body.advice,
    startedGeneration: Boolean(body.startedGeneration),
  };
}

export function useDailyAdvice() {
  return useQuery({
    queryKey: queryKeys.dailyAdvice.today(),
    queryFn: fetchAdvice,
    refetchInterval: (query) => {
      const status = query.state.data?.advice?.status;
      return status === "generating" ? 2000 : false;
    },
  });
}

export function useGenerateDailyAdvice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forceRetry?: boolean) => generateAdvice(Boolean(forceRetry)),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.dailyAdvice.today(), {
        advice: result.advice,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dailyAdvice.all,
      });
    },
  });
}

/** Fire-and-forget guarded generate after check-in; server enforces idempotency. */
export function requestDailyAdviceGeneration(): void {
  void fetch("/api/dailybuddy/advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).catch(() => undefined);
}
