"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { getActiveAdmissionLocation } from "@/lib/services/admissions";

export function useActiveAdmissionLocation() {
  return useQuery({
    queryKey: queryKeys.activeAdmission.location(),
    queryFn: getActiveAdmissionLocation,
  });
}
