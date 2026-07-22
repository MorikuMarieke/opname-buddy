import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import type { DailyAdviceQueryData } from "@/lib/daily-advice/client-cache";
import type { PatientCheckin } from "@/types/patient";

/**
 * After a successful check-in create/update, sync React Query so DailyBuddy
 * does not keep a stale checkin_required gate until hard refresh.
 */
export async function syncCachesAfterCheckInMutation(
  queryClient: QueryClient,
  checkIn: PatientCheckin,
): Promise<void> {
  await queryClient.cancelQueries({ queryKey: queryKeys.checkIns.today() });
  await queryClient.cancelQueries({ queryKey: queryKeys.dailyAdvice.today() });

  queryClient.setQueryData(queryKeys.checkIns.today(), checkIn);
  queryClient.setQueryData(
    queryKeys.dailyAdvice.today(),
    (current: DailyAdviceQueryData | undefined) => ({
      advice: current?.advice ?? null,
    }),
  );

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.checkIns.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dailyAdvice.all }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.patientDailyParticipation.all,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.afternoonInterest.all,
    }),
  ]);
}

/** Query keys that depend on today's check-in for DailyBuddy eligibility. */
export const CHECKIN_DEPENDENT_QUERY_KEYS = [
  queryKeys.checkIns.all,
  queryKeys.dailyAdvice.all,
  queryKeys.patientDailyParticipation.all,
  queryKeys.afternoonInterest.all,
] as const;
