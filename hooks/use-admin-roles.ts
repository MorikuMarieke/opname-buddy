"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRolesWithCountsAction } from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminRoles() {
  return useQuery({
    queryKey: queryKeys.adminRoles.all,
    queryFn: fetchRolesWithCountsAction,
  });
}
