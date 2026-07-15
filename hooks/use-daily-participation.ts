"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  getDailyNeedsSummary,
  getDailyParticipationPlan,
  getVolunteerBlockAvailabilityOverview,
  upsertDailyParticipationPlan,
} from "@/lib/services/daily-participation";
import type { UpsertDailyParticipationPlanInput } from "@/types/daily-participation";

export function useDailyParticipation(planDate: string) {
  return useQuery({
    queryKey: queryKeys.planning.dailyParticipation.byDate(planDate),
    queryFn: async () => {
      const [needs, availability, plan] = await Promise.all([
        getDailyNeedsSummary(planDate),
        getVolunteerBlockAvailabilityOverview(planDate),
        getDailyParticipationPlan(planDate),
      ]);

      return { needs, availability, plan };
    },
  });
}

export function useVolunteerDailyParticipation(planDate: string) {
  return useQuery({
    queryKey: queryKeys.volunteer.dailyParticipation.byDate(planDate),
    queryFn: async () => {
      const [needs, availability, plan] = await Promise.all([
        getDailyNeedsSummary(planDate),
        getVolunteerBlockAvailabilityOverview(planDate),
        getDailyParticipationPlan(planDate),
      ]);

      return { needs, availability, plan };
    },
  });
}

export function useUpsertDailyParticipationPlan(planDate: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertDailyParticipationPlanInput) =>
      upsertDailyParticipationPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.dailyParticipation.byDate(planDate),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.dailyParticipation.byDate(planDate),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patientDailyParticipation.byDate(planDate),
      });
    },
  });
}
