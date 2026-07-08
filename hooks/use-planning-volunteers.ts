"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listPlanningVolunteers } from "@/lib/services/planning-volunteers";

export function usePlanningVolunteers() {
  return useQuery({
    queryKey: queryKeys.planning.volunteers.all,
    queryFn: listPlanningVolunteers,
  });
}
