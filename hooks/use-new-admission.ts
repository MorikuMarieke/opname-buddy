"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { createClient } from "@/lib/supabase/client";
import { createAdmissionForPatient } from "@/lib/services/patients";
import type { NewAdmissionFormValues } from "@/lib/validations/clinical-patient";

export function useNewAdmission(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewAdmissionFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error("Je bent niet ingelogd.");
      }

      return createAdmissionForPatient(
        patientId,
        {
          admittedOn: input.admittedOn,
          departmentId: input.departmentId,
          roomNumber: input.roomNumber,
          expectedDischargeOn: input.expectedDischargeOn,
        },
        user.id,
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.carePatients.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.clinicalPatients.admission(patientId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.clinicalPatients.detail(patientId),
        }),
      ]);
    },
  });
}
