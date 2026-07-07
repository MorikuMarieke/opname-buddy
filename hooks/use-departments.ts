"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/constants/query-keys";
import { listActiveDepartments } from "@/lib/services/departments";

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.active,
    queryFn: listActiveDepartments,
    staleTime: 60_000,
  });
}
