"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { redeemPatientLinkCode } from "@/lib/services/patient-linking";

export function useRedeemLinkCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => redeemPatientLinkCode(code),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.patientLink.own() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activeAdmission.own() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.carePatients.all }),
      ]);
    },
  });
}
