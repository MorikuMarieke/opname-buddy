"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listPlanningPatients } from "@/lib/services/planning-patients";

export function usePlanningPatients() {
  return useQuery({
    queryKey: queryKeys.planning.patients.all,
    queryFn: listPlanningPatients,
  });
}
