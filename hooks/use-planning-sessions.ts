"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import type { SessionStatus } from "@/lib/constants/planning-enums";
import {
  createOneOffSession,
  getPlanningSessionDetail,
  listPlanningSessions,
  setSessionParticipants,
  setSessionVolunteers,
  updateSessionStatus,
  type ListPlanningSessionsFilters,
} from "@/lib/services/activity-sessions";
import type {
  OneOffSessionInputValues,
} from "@/lib/validations/activity-session";

export function usePlanningSessions(filters: ListPlanningSessionsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.planning.sessions.list({
      status: filters.status ?? undefined,
      sessionKind: filters.sessionKind ?? undefined,
    }),
    queryFn: () => listPlanningSessions(filters),
  });
}

export function usePlanningSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.planning.sessions.detail(sessionId),
    queryFn: () => getPlanningSessionDetail(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useCreateOneOffSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OneOffSessionInputValues) => createOneOffSession(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.planning.sessions.all,
      });
    },
  });
}

export function useUpdateSessionStatus(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: SessionStatus) => updateSessionStatus(sessionId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.detail(sessionId),
        }),
      ]);
    },
  });
}

export function useSetSessionParticipants(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (admissionIds: string[]) =>
      setSessionParticipants(sessionId, admissionIds),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.detail(sessionId),
        }),
      ]);
    },
  });
}

export function useSetSessionVolunteers(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => setSessionVolunteers(sessionId, userIds),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.planning.sessions.detail(sessionId),
        }),
      ]);
    },
  });
}
