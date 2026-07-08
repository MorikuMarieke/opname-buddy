"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { FormField } from "@/components/forms/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useAdminDepartments,
  useCreateDepartment,
  useSetDepartmentActive,
  useUpdateDepartment,
} from "@/hooks/use-admin-departments";
import { DEPARTMENT_COPY } from "@/lib/constants/department-copy";
import { departmentInputSchema } from "@/lib/validations/department";
import type { Department } from "@/types/department";
import type { DepartmentInputFormValues } from "@/lib/validations/department";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

const emptyForm: DepartmentInputFormValues = {
  name: "",
  code: null,
};

function DepartmentForm({
  values,
  onChange,
  errors,
  disabled,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  values: DepartmentInputFormValues;
  onChange: (values: DepartmentInputFormValues) => void;
  errors: Partial<Record<string, string>>;
  disabled: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label={DEPARTMENT_COPY.nameLabel} htmlFor="name" error={errors.name}>
        <input
          id="name"
          type="text"
          disabled={disabled}
          className={inputClasses}
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
        />
      </FormField>
      <FormField
        label={DEPARTMENT_COPY.codeLabel}
        htmlFor="code"
        hint={DEPARTMENT_COPY.codeHint}
        error={errors.code}
      >
        <input
          id="code"
          type="text"
          disabled={disabled}
          className={inputClasses}
          value={values.code ?? ""}
          onChange={(event) =>
            onChange({ ...values, code: event.target.value || null })
          }
        />
      </FormField>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <PrimaryButton type="button" onClick={onSubmit} disabled={disabled}>
          {submitLabel}
        </PrimaryButton>
        {onCancel ? (
          <SecondaryButton type="button" onClick={onCancel} disabled={disabled}>
            {DEPARTMENT_COPY.cancel}
          </SecondaryButton>
        ) : null}
      </div>
      {errors.submit ? (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {errors.submit}
        </p>
      ) : null}
    </div>
  );
}

function DepartmentRow({
  department,
}: {
  department: Department;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<DepartmentInputFormValues>({
    name: department.name,
    code: department.code,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const updateMutation = useUpdateDepartment(department.id);
  const activeMutation = useSetDepartmentActive(department.id);

  async function handleSave() {
    const parsed = departmentInputSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const result = await updateMutation.mutateAsync(parsed.data);

    if ("error" in result) {
      setErrors({ submit: result.error });
      return;
    }

    setIsEditing(false);
    setErrors({});
  }

  async function handleToggleActive() {
    const result = await activeMutation.mutateAsync(!department.isActive);

    if ("error" in result) {
      setErrors({ submit: result.error });
      return;
    }

    setErrors({});
  }

  if (isEditing) {
    return (
      <tr className="border-b border-dust-grey-100 bg-parchment-50">
        <td colSpan={3} className="px-3 py-4">
          <DepartmentForm
            values={values}
            onChange={setValues}
            errors={errors}
            disabled={updateMutation.isPending}
            submitLabel={
              updateMutation.isPending ? "Opslaan..." : DEPARTMENT_COPY.saveDepartment
            }
            onSubmit={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setValues({
                name: department.name,
                code: department.code,
              });
              setErrors({});
            }}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-dust-grey-100 last:border-0">
      <td className="px-3 py-2 font-medium text-carbon-black-900">{department.name}</td>
      <td className="px-3 py-2 text-carbon-black-700">{department.code ?? "—"}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={department.isActive ? "positive" : "neutral"}>
            {department.isActive
              ? DEPARTMENT_COPY.activeLabel
              : DEPARTMENT_COPY.inactiveLabel}
          </StatusBadge>
          <SecondaryButton type="button" onClick={() => setIsEditing(true)}>
            {DEPARTMENT_COPY.edit}
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={handleToggleActive}
            disabled={activeMutation.isPending}
            className={
              department.isActive
                ? "border-cherry-rose-200 text-cherry-rose-700 hover:bg-cherry-rose-50"
                : undefined
            }
          >
            {department.isActive
              ? DEPARTMENT_COPY.deactivate
              : DEPARTMENT_COPY.reactivate}
          </SecondaryButton>
        </div>
        {errors.submit ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

export function AdminDepartmentsView() {
  const { data: departments, isLoading, isError } = useAdminDepartments();
  const createMutation = useCreateDepartment();
  const [createValues, setCreateValues] = useState<DepartmentInputFormValues>(emptyForm);
  const [createErrors, setCreateErrors] = useState<Partial<Record<string, string>>>({});

  async function handleCreate() {
    const parsed = departmentInputSchema.safeParse(createValues);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setCreateErrors(fieldErrors);
      return;
    }

    const result = await createMutation.mutateAsync(parsed.data);

    if ("error" in result) {
      setCreateErrors({ submit: result.error });
      return;
    }

    setCreateValues(emptyForm);
    setCreateErrors({});
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={DEPARTMENT_COPY.pageTitle}
        description={DEPARTMENT_COPY.pageDescription}
        size="compact"
      />

      <DashboardCard density="compact" className="space-y-4">
        <h2 className="text-lg font-semibold text-carbon-black-900">
          {DEPARTMENT_COPY.createDepartment}
        </h2>
        <DepartmentForm
          values={createValues}
          onChange={setCreateValues}
          errors={createErrors}
          disabled={createMutation.isPending}
          submitLabel={
            createMutation.isPending ? "Opslaan..." : DEPARTMENT_COPY.createDepartment
          }
          onSubmit={handleCreate}
        />
      </DashboardCard>

      <DashboardCard density="compact" className="overflow-x-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {isError ? (
          <p className="px-3 py-4 text-sm text-red-600" role="alert">
            {DEPARTMENT_COPY.loadError}
          </p>
        ) : null}

        {departments && departments.length > 0 ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-parchment-100">
              <tr className="border-b border-parchment-200 text-carbon-black-600">
                <th className="px-3 py-2 font-medium">{DEPARTMENT_COPY.nameLabel}</th>
                <th className="px-3 py-2 font-medium">{DEPARTMENT_COPY.codeLabel}</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <DepartmentRow key={department.id} department={department} />
              ))}
            </tbody>
          </table>
        ) : null}

        {!isLoading && !isError && departments?.length === 0 ? (
          <p className="px-3 py-4 text-sm text-carbon-black-600">
            {DEPARTMENT_COPY.noDepartments}
          </p>
        ) : null}
      </DashboardCard>
    </div>
  );
}
