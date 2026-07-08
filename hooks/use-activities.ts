"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  createActivity,
  getActivity,
  listActivities,
  setActivityActive,
  updateActivity,
} from "@/lib/services/activities";
import type { ActivityInputValues, ActivityUpdateFormValues } from "@/lib/validations/activity";

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.planning.activities.all,
    queryFn: listActivities,
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: queryKeys.planning.activities.detail(activityId),
    queryFn: () => getActivity(activityId),
    enabled: Boolean(activityId),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActivityInputValues) => createActivity(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.planning.activities.all,
      });
    },
  });
}

export function useUpdateActivity(activityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActivityUpdateFormValues) =>
      updateActivity(activityId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.activities.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.activities.detail(activityId),
        }),
      ]);
    },
  });
}

export function useSetActivityActive(activityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) => setActivityActive(activityId, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.activities.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.activities.detail(activityId),
        }),
      ]);
    },
  });
}
