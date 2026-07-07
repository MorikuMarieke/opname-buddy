"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { getActiveAdmissionId } from "@/lib/services/admissions";

export function useActiveAdmissionId() {
  return useQuery({
    queryKey: queryKeys.activeAdmission.own(),
    queryFn: getActiveAdmissionId,
  });
}
