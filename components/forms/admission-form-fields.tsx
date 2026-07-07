"use client";

import { FormField } from "@/components/forms/form-field";
import { FormSelect } from "@/components/forms/form-select";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { DEPARTMENT_COPY } from "@/lib/constants/department-copy";
import { useDepartments } from "@/hooks/use-departments";
import type { AdmissionFormValues } from "@/lib/validations/clinical-patient";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

interface AdmissionFormFieldsProps {
  values: AdmissionFormValues;
  onChange: (values: AdmissionFormValues) => void;
  errors?: Partial<Record<keyof AdmissionFormValues, string>>;
  disabled?: boolean;
}

export function AdmissionFormFields({
  values,
  onChange,
  errors,
  disabled = false,
}: AdmissionFormFieldsProps) {
  const { data: departments, isLoading, isError } = useDepartments();

  const departmentOptions = [
    { value: "", label: DEPARTMENT_COPY.departmentPlaceholder },
    ...(departments ?? []).map((department) => ({
      value: department.id,
      label: department.code
        ? `${department.name} (${department.code})`
        : department.name,
    })),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label={CLINICAL_PATIENT_COPY.admittedOnLabel}
        htmlFor="admittedOn"
        error={errors?.admittedOn}
      >
        <input
          id="admittedOn"
          type="date"
          disabled={disabled}
          className={inputClasses}
          value={values.admittedOn}
          onChange={(event) =>
            onChange({ ...values, admittedOn: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={DEPARTMENT_COPY.departmentLabel}
        htmlFor="departmentId"
        error={errors?.departmentId}
      >
        <FormSelect
          id="departmentId"
          disabled={disabled || isLoading || isError}
          value={values.departmentId}
          options={departmentOptions}
          onChange={(event) =>
            onChange({ ...values, departmentId: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={DEPARTMENT_COPY.roomNumberLabel}
        htmlFor="roomNumber"
        error={errors?.roomNumber}
      >
        <input
          id="roomNumber"
          type="text"
          disabled={disabled}
          placeholder={DEPARTMENT_COPY.roomNumberPlaceholder}
          className={inputClasses}
          value={values.roomNumber ?? ""}
          onChange={(event) =>
            onChange({
              ...values,
              roomNumber: event.target.value || null,
            })
          }
        />
      </FormField>

      <FormField
        label={CLINICAL_PATIENT_COPY.expectedDischargeLabel}
        htmlFor="expectedDischargeOn"
        hint={CLINICAL_PATIENT_COPY.expectedDischargeHint}
        error={errors?.expectedDischargeOn}
        className="sm:col-span-2"
      >
        <input
          id="expectedDischargeOn"
          type="date"
          disabled={disabled}
          className={inputClasses}
          value={values.expectedDischargeOn ?? ""}
          onChange={(event) =>
            onChange({
              ...values,
              expectedDischargeOn: event.target.value || null,
            })
          }
        />
      </FormField>

      {isError ? (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {DEPARTMENT_COPY.loadError}
        </p>
      ) : null}
    </div>
  );
}
