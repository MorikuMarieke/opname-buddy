"use client";

import { useQuery } from "@tanstack/react-query";

import { listCoordinatorVolunteerProfiles } from "@/lib/services/planning-coordinator-volunteers";
import { queryKeys } from "@/lib/constants/query-keys";

export function useCoordinatorVolunteerProfiles() {
  return useQuery({
    queryKey: queryKeys.planning.coordinatorVolunteers.all,
    queryFn: listCoordinatorVolunteerProfiles,
  });
}
