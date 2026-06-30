"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  countOpenQuestions,
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from "@/lib/services/patient-questions";
import type { PatientQuestionFormValues } from "@/lib/validations/patient-question";

export function usePatientQuestions() {
  return useQuery({
    queryKey: queryKeys.questions.all,
    queryFn: listQuestions,
  });
}

export function useOpenQuestionCount() {
  const query = usePatientQuestions();

  return {
    ...query,
    openCount: countOpenQuestions(query.data ?? []),
  };
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientQuestionFormValues) => createQuestion(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: PatientQuestionFormValues;
    }) => updateQuestion(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}
