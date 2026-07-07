"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRecentAuditEventsForTargetUserAction } from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminUserAuditEvents(userId: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.adminAccounts.audit(userId, limit),
    queryFn: () => fetchRecentAuditEventsForTargetUserAction(userId, limit),
    enabled: Boolean(userId),
  });
}
