"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStaffAccountAction,
  fetchStaffAccountsAction,
} from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminStaffAccounts(options?: {
  search?: string;
  status?: "active" | "inactive" | "all";
}) {
  return useQuery({
    queryKey: queryKeys.adminAccounts.staff(options),
    queryFn: () => fetchStaffAccountsAction(options),
  });
}

export function useCreateStaffAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaffAccountAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminAccounts.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminOverview.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminRoles.all });
    },
  });
}
