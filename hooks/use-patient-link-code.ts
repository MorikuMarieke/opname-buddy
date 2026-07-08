"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { generatePatientLinkCodeAction } from "@/lib/auth/care-patient-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useGeneratePatientLinkCode(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await generatePatientLinkCodeAction(patientId);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.clinicalPatients.linkStatus(patientId),
      });
    },
  });
}
