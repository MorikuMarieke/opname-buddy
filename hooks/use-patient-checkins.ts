"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { syncCachesAfterCheckInMutation } from "@/lib/daily-advice/checkin-cache-sync";
import {
  createCheckIn,
  getRecentCheckIns,
  getTodayCheckIn,
  updateCheckIn,
} from "@/lib/services/patient-checkins";
import type { PatientCheckinFormValues } from "@/lib/validations/patient-checkin";

const RECENT_CHECKINS_LIMIT = 7;

export function useTodayCheckIn() {
  return useQuery({
    queryKey: queryKeys.checkIns.today(),
    queryFn: getTodayCheckIn,
  });
}

export function useRecentCheckIns(limit = RECENT_CHECKINS_LIMIT) {
  return useQuery({
    queryKey: queryKeys.checkIns.recent(limit),
    queryFn: () => getRecentCheckIns(limit),
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientCheckinFormValues) => createCheckIn(input),
    onSuccess: async (created) => {
      await syncCachesAfterCheckInMutation(queryClient, created);
    },
  });
}

export function useUpdateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: PatientCheckinFormValues;
    }) => updateCheckIn(id, input),
    onSuccess: async (updated) => {
      await syncCachesAfterCheckInMutation(queryClient, updated);
    },
  });
}
