"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ParticipationBlockId } from "@/lib/constants/daily-participation";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  getMyDayAbsencesForMonth,
  getMyWeeklyBlocks,
  saveMyWeeklyBlocks,
  setMyDayAbsence,
} from "@/lib/services/volunteer-block-availability";
import type { VolunteerWeeklyBlockInput } from "@/types/daily-participation";

export function useMyWeeklyBlocks() {
  return useQuery({
    queryKey: queryKeys.volunteer.blockAvailability.weekly,
    queryFn: getMyWeeklyBlocks,
  });
}

export function useSaveMyWeeklyBlocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blocks: VolunteerWeeklyBlockInput[]) => saveMyWeeklyBlocks(blocks),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.blockAvailability.weekly,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.dailyParticipation.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.dailyParticipation.all,
      });
    },
  });
}

export function useMyDayAbsencesForMonth(yearMonth: string) {
  return useQuery({
    queryKey: queryKeys.volunteer.blockAvailability.absences(yearMonth),
    queryFn: () => getMyDayAbsencesForMonth(yearMonth),
    enabled: Boolean(yearMonth),
  });
}

export function useSetMyDayAbsence(yearMonth: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      absenceDate,
      block,
      isAbsent,
    }: {
      absenceDate: string;
      block: ParticipationBlockId;
      isAbsent: boolean;
    }) => setMyDayAbsence(absenceDate, block, isAbsent),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.blockAvailability.absences(yearMonth),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.dailyParticipation.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.dailyParticipation.all,
      });
    },
  });
}
