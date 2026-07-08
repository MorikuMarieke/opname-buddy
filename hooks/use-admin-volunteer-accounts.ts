"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVolunteerAccountAction,
  fetchVolunteerAccountsAction,
} from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminVolunteerAccounts(options?: {
  search?: string;
  status?: "active" | "inactive" | "all";
}) {
  return useQuery({
    queryKey: queryKeys.adminAccounts.volunteers(options),
    queryFn: () => fetchVolunteerAccountsAction(options),
  });
}

export function useCreateVolunteerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVolunteerAccountAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminOverview.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminRoles.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.planning.volunteers.all,
      });
    },
  });
}
