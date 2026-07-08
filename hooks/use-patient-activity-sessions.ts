"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listPatientActivitySessions } from "@/lib/services/patient-activity-sessions";

export function usePatientActivitySessions() {
  return useQuery({
    queryKey: queryKeys.patientActivities.all,
    queryFn: listPatientActivitySessions,
  });
}
