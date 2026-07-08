"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CarePatientShell } from "@/components/dashboard/care-patient-shell";
import { AdmissionFormFields } from "@/components/forms/admission-form-fields";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useNewAdmission } from "@/hooks/use-new-admission";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";
import { newAdmissionSchema } from "@/lib/validations/clinical-patient";
import type { NewAdmissionFormValues } from "@/lib/validations/clinical-patient";
import { useClinicalPatient } from "@/hooks/use-clinical-patient";

interface NewAdmissionViewProps {
  patientId: string;
}

export function NewAdmissionView({ patientId }: NewAdmissionViewProps) {
  const router = useRouter();
  const { data: patient } = useClinicalPatient(patientId);
  const [values, setValues] = useState<NewAdmissionFormValues>({
    admittedOn: getAmsterdamDateString(),
    departmentId: "",
    roomNumber: null,
    expectedDischargeOn: null,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const newAdmissionMutation = useNewAdmission(patientId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = newAdmissionSchema.safeParse(values);

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

    try {
      await newAdmissionMutation.mutateAsync(parsed.data);
      router.push(`/care/patients/${patientId}`);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Nieuwe opname kon niet worden gestart.",
      });
    }
  }

  return (
    <CarePatientShell patientId={patientId}>
      <SectionHeader
        title={CLINICAL_PATIENT_COPY.newAdmission}
        description={
          patient
            ? `Start een nieuwe opname voor ${formatPatientDisplayName(patient)}.`
            : "Start een nieuwe opname voor deze patiënt."
        }
        size="compact"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <DashboardCard density="compact" className="space-y-4">
          <AdmissionFormFields
            values={values}
            onChange={setValues}
            errors={errors}
            disabled={newAdmissionMutation.isPending}
          />
        </DashboardCard>

        {errors.submit ? (
          <p className="text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}

        <PrimaryButton type="submit" disabled={newAdmissionMutation.isPending}>
          {newAdmissionMutation.isPending
            ? "Bezig..."
            : CLINICAL_PATIENT_COPY.createAdmission}
        </PrimaryButton>
      </form>
    </CarePatientShell>
  );
}
