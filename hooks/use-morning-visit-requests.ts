"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  cancelMorningVisitRequest,
  createMorningVisitRequest,
  getOwnMorningVisitRequest,
  listMorningVisitRequestsForDate,
} from "@/lib/services/morning-visit-requests";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";

export function useOwnMorningVisitRequest() {
  return useQuery({
    queryKey: queryKeys.morningVisitRequests.own(),
    queryFn: () => getOwnMorningVisitRequest(),
  });
}

export function useCreateMorningVisitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      patientMessage?: string;
      inspirationIds?: string[];
    }) => createMorningVisitRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.morningVisitRequests.all,
      });
    },
  });
}

export function useCancelMorningVisitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => cancelMorningVisitRequest(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.morningVisitRequests.all,
      });
    },
  });
}

export function useMorningVisitRequestList(
  requestDate = getAmsterdamDateString(),
) {
  return useQuery({
    queryKey: queryKeys.morningVisitRequests.byDate(requestDate),
    queryFn: () => listMorningVisitRequestsForDate(requestDate),
  });
}
