"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  dischargeActiveAdmission,
  updateAdmission,
} from "@/lib/services/patients";
import type { AdmissionFormValues } from "@/lib/validations/clinical-patient";

export function useUpdateAdmission(patientId: string, admissionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdmissionFormValues) => {
      if (!admissionId) {
        throw new Error("Geen actieve opname gevonden.");
      }

      return updateAdmission(admissionId, {
        admittedOn: input.admittedOn,
        departmentId: input.departmentId,
        roomNumber: input.roomNumber,
        expectedDischargeOn: input.expectedDischargeOn,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.carePatients.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.clinicalPatients.admission(patientId),
        }),
      ]);
    },
  });
}

export function useDischargeAdmission(patientId: string, admissionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!admissionId) {
        throw new Error("Geen actieve opname gevonden.");
      }

      return dischargeActiveAdmission(admissionId);
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

export function usePatientAdmission(patientId: string) {
  return usePatientAdmissionQuery(patientId);
}

function usePatientAdmissionQuery(patientId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clinicalPatients.admission(patientId),
    queryFn: async () => {
      const { getActiveAdmissionForPatient } = await import("@/lib/services/patients");
      return getActiveAdmissionForPatient(patientId);
    },
    enabled: enabled && Boolean(patientId),
  });
}
