"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listCoordinatorVolunteerOverview } from "@/lib/services/coordinator-volunteer-overview";

export function useCoordinatorVolunteerOverview(
  planDate: string,
  yearMonth: string,
) {
  return useQuery({
    queryKey: queryKeys.planning.coordinatorVolunteerOverview.byDate(
      planDate,
      yearMonth,
    ),
    queryFn: () => listCoordinatorVolunteerOverview(planDate, yearMonth),
    enabled: Boolean(planDate && yearMonth),
  });
}
