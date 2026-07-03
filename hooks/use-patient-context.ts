"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  getOwnPatientContext,
  getPatientContext,
  upsertPatientContext,
} from "@/lib/services/patient-context";
import { createClient } from "@/lib/supabase/client";
import type { PatientContextFormValues } from "@/lib/validations/patient-context";

export function usePatientContext(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patientContext.byPatient(patientId),
    queryFn: () => getPatientContext(patientId),
    enabled: Boolean(patientId),
  });
}

export function useOwnPatientContext() {
  return useQuery({
    queryKey: queryKeys.patientContext.own(),
    queryFn: getOwnPatientContext,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// Keeps the patient's own Zorgcontext live when a caregiver edits it, even if
// the tablet stays open on the page (no navigation or tab refocus). RLS scopes
// realtime events to the patient's own row.
export function useOwnPatientContextRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("patient-context-own")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_context",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.patientContext.all,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useUpsertPatientContext(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientContextFormValues) =>
      upsertPatientContext(patientId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patientContext.all,
      });
    },
  });
}
