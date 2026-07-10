"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVolunteerAvailabilityException,
  createVolunteerRecurringAvailability,
  deleteVolunteerAvailabilityException,
  deleteVolunteerRecurringAvailability,
  listVolunteerAvailabilityExceptions,
  listVolunteerRecurringAvailability,
  updateVolunteerRecurringAvailability,
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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.coordinatorVolunteers.all,
      });
    },
  });
}

export function useDeleteVolunteerRecurringAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVolunteerRecurringAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.recurring,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.coordinatorVolunteers.all,
      });
    },
  });
}

export function useUpdateVolunteerRecurringAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVolunteerRecurringAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.volunteer.availability.recurring,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.coordinatorVolunteers.all,
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
