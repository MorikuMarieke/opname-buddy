"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  countAfternoonInterestForDate,
  listAfternoonInterestForDate,
} from "@/lib/services/afternoon-interest";
import type { AfternoonGroupInterestSignal } from "@/types/daily-advice";

async function fetchOwnInterest(): Promise<AfternoonGroupInterestSignal | null> {
  const response = await fetch("/api/dailybuddy/afternoon-interest");
  const body = (await response.json()) as {
    interest?: AfternoonGroupInterestSignal | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Interesse laden mislukt.");
  }

  return body.interest ?? null;
}

async function mutateInterest(
  action: "express" | "withdraw",
): Promise<AfternoonGroupInterestSignal | null> {
  const response = await fetch("/api/dailybuddy/afternoon-interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const body = (await response.json()) as {
    interest?: AfternoonGroupInterestSignal | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Interesse bijwerken mislukt.");
  }

  return body.interest ?? null;
}

export function useOwnAfternoonInterest() {
  return useQuery({
    queryKey: queryKeys.afternoonInterest.own(),
    queryFn: fetchOwnInterest,
  });
}

export function useExpressAfternoonInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mutateInterest("express"),
    onSuccess: (interest) => {
      queryClient.setQueryData(queryKeys.afternoonInterest.own(), interest);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.afternoonInterest.all,
      });
    },
  });
}

export function useWithdrawAfternoonInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mutateInterest("withdraw"),
    onSuccess: (interest) => {
      queryClient.setQueryData(queryKeys.afternoonInterest.own(), interest);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.afternoonInterest.all,
      });
    },
  });
}

export function useAfternoonInterestList(interestDate: string) {
  return useQuery({
    queryKey: queryKeys.afternoonInterest.byDate(interestDate),
    queryFn: () => listAfternoonInterestForDate(interestDate),
  });
}

export function useAfternoonInterestCount(interestDate: string) {
  return useQuery({
    queryKey: queryKeys.afternoonInterest.count(interestDate),
    queryFn: () => countAfternoonInterestForDate(interestDate),
  });
}
