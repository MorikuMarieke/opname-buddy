"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { getPatientDailyParticipation } from "@/lib/services/patient-daily-participation";

export function usePatientDailyParticipation(planDate: string) {
  return useQuery({
    queryKey: queryKeys.patientDailyParticipation.byDate(planDate),
    queryFn: () => getPatientDailyParticipation(planDate),
  });
}
