"use client";

import { useQuery } from "@tanstack/react-query";

import { listFacilitatorSessions } from "@/lib/services/facilitator-sessions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useFacilitatorSessions(from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.volunteer.facilitators.sessions.all,
    queryFn: () => listFacilitatorSessions(from, to),
  });
}
