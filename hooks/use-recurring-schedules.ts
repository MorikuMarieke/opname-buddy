"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  createRecurringSchedule,
  getRecurringSchedule,
  listRecurringSchedules,
  updateRecurringSchedule,
} from "@/lib/services/activity-recurring-schedules";
import type {
  RecurringScheduleInputValues,
  RecurringScheduleUpdateValues,
} from "@/lib/validations/recurring-schedule";

export function useRecurringSchedules() {
  return useQuery({
    queryKey: queryKeys.planning.recurringSchedules.all,
    queryFn: listRecurringSchedules,
  });
}

export function useRecurringSchedule(scheduleId: string) {
  return useQuery({
    queryKey: queryKeys.planning.recurringSchedules.detail(scheduleId),
    queryFn: () => getRecurringSchedule(scheduleId),
    enabled: Boolean(scheduleId),
  });
}

export function useCreateRecurringSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecurringScheduleInputValues) =>
      createRecurringSchedule(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.planning.recurringSchedules.all,
      });
    },
  });
}

export function useUpdateRecurringSchedule(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecurringScheduleUpdateValues) =>
      updateRecurringSchedule(scheduleId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.recurringSchedules.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.recurringSchedules.detail(scheduleId),
        }),
      ]);
    },
  });
}
