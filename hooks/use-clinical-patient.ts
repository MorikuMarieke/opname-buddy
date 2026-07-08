"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  getActiveAdmissionForPatient,
  getPatientById,
  updatePatient,
} from "@/lib/services/patients";
import type { PatientDemographicsInput } from "@/types/clinical-patient";

export function useClinicalPatient(patientId: string) {
  return useQuery({
    queryKey: queryKeys.clinicalPatients.detail(patientId),
    queryFn: () => getPatientById(patientId),
    enabled: Boolean(patientId),
  });
}

export function usePatientAdmission(patientId: string) {
  return useQuery({
    queryKey: queryKeys.clinicalPatients.admission(patientId),
    queryFn: () => getActiveAdmissionForPatient(patientId),
    enabled: Boolean(patientId),
  });
}

export function useUpdateClinicalPatient(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientDemographicsInput) => updatePatient(patientId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.clinicalPatients.detail(patientId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.carePatients.all }),
      ]);
    },
  });
}
