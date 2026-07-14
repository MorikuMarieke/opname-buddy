"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import {
  getVolunteerProfile,
  updateVolunteerBio,
} from "@/lib/services/volunteer-profile";

export function useVolunteerProfile() {
  return useQuery({
    queryKey: queryKeys.volunteer.profile,
    queryFn: getVolunteerProfile,
  });
}

export function useUpdateVolunteerBio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVolunteerBio,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.profile,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.coordinatorVolunteerOverview.all,
      });
    },
  });
}
