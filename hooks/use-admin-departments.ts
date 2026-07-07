"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDepartmentAction,
  fetchAllDepartmentsAction,
  setDepartmentActiveAction,
  updateDepartmentAction,
} from "@/lib/auth/admin-actions";
import { queryKeys } from "@/lib/constants/query-keys";
import type { DepartmentInputFormValues } from "@/lib/validations/department";

export function useAdminDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchAllDepartmentsAction,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DepartmentInputFormValues) => createDepartmentAction(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.active }),
      ]);
    },
  });
}

export function useUpdateDepartment(departmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DepartmentInputFormValues) =>
      updateDepartmentAction(departmentId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.active }),
      ]);
    },
  });
}

export function useSetDepartmentActive(departmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) =>
      setDepartmentActiveAction(departmentId, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.active }),
      ]);
    },
  });
}
