"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAdminOverviewStatsAction,
  fetchRecentAuditEventsAction,
} from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.adminOverview.all,
    queryFn: fetchAdminOverviewStatsAction,
  });
}

export function useAdminRecentAudit(limit = 10) {
  return useQuery({
    queryKey: queryKeys.adminOverview.audit(limit),
    queryFn: () => fetchRecentAuditEventsAction(limit),
  });
}
