"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVolunteerAvailabilityException,
  createVolunteerRecurringAvailability,
  deleteVolunteerAvailabilityException,
  listVolunteerAvailabilityExceptions,
  listVolunteerRecurringAvailability,
  setVolunteerRecurringAvailabilityActive,
} from "@/lib/services/volunteer-availability";
import { queryKeys } from "@/lib/constants/query-keys";

export function useVolunteerRecurringAvailability() {
  return useQuery({
    queryKey: queryKeys.volunteer.availability.recurring,
    queryFn: listVolunteerRecurringAvailability,
  });
}

export function useVolunteerAvailabilityExceptions() {
  return useQuery({
    queryKey: queryKeys.volunteer.availability.exceptions,
    queryFn: listVolunteerAvailabilityExceptions,
  });
}

export function useCreateVolunteerRecurringAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVolunteerRecurringAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.recurring,
      });
    },
  });
}

export function useSetVolunteerRecurringAvailabilityActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setVolunteerRecurringAvailabilityActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.recurring,
      });
    },
  });
}

export function useCreateVolunteerAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVolunteerAvailabilityException,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.exceptions,
      });
    },
  });
}

export function useDeleteVolunteerAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVolunteerAvailabilityException,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.exceptions,
      });
    },
  });
}
