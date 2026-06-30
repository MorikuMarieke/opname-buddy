"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  createParticipationEvaluation,
  getRecentEvaluations,
  getTodayEvaluations,
  updateParticipationEvaluation,
} from "@/lib/services/patient-participation-evaluations";
import type { PatientParticipationEvaluationFormValues } from "@/lib/validations/patient-participation-evaluation";

const RECENT_EVALUATIONS_LIMIT = 7;

export function useTodayParticipationEvaluations() {
  return useQuery({
    queryKey: queryKeys.participationEvaluations.today(),
    queryFn: getTodayEvaluations,
  });
}

export function useRecentParticipationEvaluations(
  limit = RECENT_EVALUATIONS_LIMIT,
) {
  return useQuery({
    queryKey: queryKeys.participationEvaluations.recent(limit),
    queryFn: () => getRecentEvaluations(limit),
  });
}

export function useCreateParticipationEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientParticipationEvaluationFormValues) =>
      createParticipationEvaluation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.participationEvaluations.all,
      });
    },
  });
}

export function useUpdateParticipationEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: PatientParticipationEvaluationFormValues;
    }) => updateParticipationEvaluation(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.participationEvaluations.all,
      });
    },
  });
}
