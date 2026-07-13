"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { planActivity } from "@/lib/services/plan-activity";
import type { PlanActivityInput } from "@/lib/validations/plan-activity";

export function usePlanActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlanActivityInput) => planActivity(input),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.recurringSchedules.all,
        }),
        result.kind === "one_off"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.planning.sessions.detail(result.sessionId),
            })
          : queryClient.invalidateQueries({
              queryKey: queryKeys.planning.recurringSchedules.detail(
                result.scheduleId,
              ),
            }),
      ]);
    },
  });
}
