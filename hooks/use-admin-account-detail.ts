"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchStaffAccountAction,
  fetchVolunteerAccountAction,
  setAccountActiveAction,
  setStaffRolesAction,
  updateAccountProfileAction,
} from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminStaffAccountDetail(userId: string) {
  return useQuery({
    queryKey: queryKeys.adminAccounts.detail(userId),
    queryFn: () => fetchStaffAccountAction(userId),
    enabled: Boolean(userId),
  });
}

export function useAdminVolunteerAccountDetail(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.adminAccounts.detail(userId), "volunteer"] as const,
    queryFn: () => fetchVolunteerAccountAction(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateAccountProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: unknown) => updateAccountProfileAction(userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.detail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminOverview.all,
      });
    },
  });
}

export function useSetStaffRoles(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: unknown) => setStaffRolesAction(userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.detail(userId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminRoles.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminOverview.all,
      });
    },
  });
}

export function useSetAccountActive(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (active: boolean) => setAccountActiveAction(userId, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.detail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminOverview.all,
      });
    },
  });
}
