"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { getPatientLinkStatus } from "@/lib/services/patient-linking";

export function usePatientLinkStatus(patientId: string) {
  return useQuery({
    queryKey: queryKeys.clinicalPatients.linkStatus(patientId),
    queryFn: () => getPatientLinkStatus(patientId),
    enabled: Boolean(patientId),
  });
}

export function useOwnLinkStatus() {
  return useQuery({
    queryKey: queryKeys.patientLink.own(),
    queryFn: async () => {
      const { getOwnLinkStatus } = await import("@/lib/services/patient-linking");
      return getOwnLinkStatus();
    },
  });
}
