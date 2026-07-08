"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { createClient } from "@/lib/supabase/client";
import { createPatientWithAdmission } from "@/lib/services/patients";
import type { AdmitPatientFormValues } from "@/lib/validations/clinical-patient";

export function useAdmitPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdmitPatientFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error("Je bent niet ingelogd.");
      }

      return createPatientWithAdmission(
        {
          firstName: input.firstName,
          lastName: input.lastName,
          birthDate: input.birthDate,
          sex: input.sex,
        },
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.carePatients.all });
    },
  });
}
