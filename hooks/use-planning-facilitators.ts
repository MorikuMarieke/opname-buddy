"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listPlanningFacilitatorCandidates } from "@/lib/services/planning-facilitators";

export function usePlanningFacilitatorCandidates(search?: string) {
  return useQuery({
    queryKey: queryKeys.planning.facilitators.candidates(search),
    queryFn: () => listPlanningFacilitatorCandidates(search),
  });
}
