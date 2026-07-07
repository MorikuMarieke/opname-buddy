"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { searchPatientsByDemographics } from "@/lib/services/patients";

export function usePatientSearch(input: {
  firstName: string;
  lastName: string;
  birthDate?: string | null;
}) {
  const canSearch =
    input.firstName.trim().length >= 2 && input.lastName.trim().length >= 2;

  return useQuery({
    queryKey: queryKeys.carePatients.search({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: input.birthDate ?? undefined,
    }),
    queryFn: () =>
      searchPatientsByDemographics({
        firstName: input.firstName,
        lastName: input.lastName,
        birthDate: input.birthDate,
      }),
    enabled: canSearch,
  });
}
