"use client";

import { FormField } from "@/components/forms/form-field";
import { FormSelect } from "@/components/forms/form-select";
import {
  CLINICAL_PATIENT_COPY,
  PATIENT_SEX_OPTIONS,
} from "@/lib/constants/clinical-patient-copy";
import type { PatientDemographicsFormValues } from "@/lib/validations/clinical-patient";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

interface ClinicalPatientFormFieldsProps {
  values: PatientDemographicsFormValues;
  onChange: (values: PatientDemographicsFormValues) => void;
  errors?: Partial<Record<keyof PatientDemographicsFormValues, string>>;
  disabled?: boolean;
}

export function ClinicalPatientFormFields({
  values,
  onChange,
  errors,
  disabled = false,
}: ClinicalPatientFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label={CLINICAL_PATIENT_COPY.firstName}
        htmlFor="firstName"
        error={errors?.firstName}
      >
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          disabled={disabled}
          className={inputClasses}
          value={values.firstName}
          onChange={(event) =>
            onChange({ ...values, firstName: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={CLINICAL_PATIENT_COPY.lastName}
        htmlFor="lastName"
        error={errors?.lastName}
      >
        <input
          id="lastName"
          type="text"
          autoComplete="family-name"
          disabled={disabled}
          className={inputClasses}
          value={values.lastName}
          onChange={(event) =>
            onChange({ ...values, lastName: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={CLINICAL_PATIENT_COPY.birthDate}
        htmlFor="birthDate"
        error={errors?.birthDate}
      >
        <input
          id="birthDate"
          type="date"
          disabled={disabled}
          className={inputClasses}
          value={values.birthDate ?? ""}
          onChange={(event) =>
            onChange({
              ...values,
              birthDate: event.target.value || null,
            })
          }
        />
      </FormField>

      <FormField label={CLINICAL_PATIENT_COPY.sex} htmlFor="sex" error={errors?.sex}>
        <FormSelect
          id="sex"
          disabled={disabled}
          value={values.sex}
          options={PATIENT_SEX_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(event) =>
            onChange({
              ...values,
              sex: event.target.value as PatientDemographicsFormValues["sex"],
            })
          }
        />
      </FormField>
    </div>
  );
}
