"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listPatientsForCare } from "@/lib/services/patient-context";

export function useCarePatients() {
  return useQuery({
    queryKey: queryKeys.carePatients.all,
    queryFn: listPatientsForCare,
  });
}
