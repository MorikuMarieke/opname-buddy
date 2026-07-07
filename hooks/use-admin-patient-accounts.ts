"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPatientAccountsAction } from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminPatientAccounts(options?: {
  linkStatus?: "linked" | "unlinked" | "all";
}) {
  return useQuery({
    queryKey: queryKeys.adminAccounts.patients(options),
    queryFn: () => fetchPatientAccountsAction(options),
  });
}
