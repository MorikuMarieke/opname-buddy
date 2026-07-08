"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdmissionFormFields } from "@/components/forms/admission-form-fields";
import { ClinicalPatientFormFields } from "@/components/forms/clinical-patient-form-fields";
import { PatientDemographicMatchList } from "@/components/dashboard/patient-demographic-match-list";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useAdmitPatient } from "@/hooks/use-admit-patient";
import { usePatientSearch } from "@/hooks/use-patient-search";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { admitPatientSchema } from "@/lib/validations/clinical-patient";
import type { AdmitPatientFormValues } from "@/lib/validations/clinical-patient";

const defaultValues: AdmitPatientFormValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: "X",
  admittedOn: getAmsterdamDateString(),
  departmentId: "",
  roomNumber: null,
  expectedDischargeOn: null,
};

export function AdmitPatientView() {
  const router = useRouter();
  const [values, setValues] = useState<AdmitPatientFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [acknowledgedMatches, setAcknowledgedMatches] = useState(false);

  const { data: matches, isFetching } = usePatientSearch({
    firstName: values.firstName,
    lastName: values.lastName,
    birthDate: values.birthDate,
  });

  const admitMutation = useAdmitPatient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = admitPatientSchema.safeParse(values);

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

    if (matches && matches.length > 0 && !acknowledgedMatches) {
      setErrors({
        submit:
          "Bekijk de mogelijke matches hierboven of kies om toch een nieuwe patiënt op te nemen.",
      });
      return;
    }

    setErrors({});

    try {
      const result = await admitMutation.mutateAsync(parsed.data);
      router.push(`/care/patients/${result.patient.id}`);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Opnemen is mislukt. Probeer het opnieuw.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={CLINICAL_PATIENT_COPY.admitPatient}
        description="Maak een nieuwe klinische patiënt aan en start een actieve opname."
        size="compact"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <DashboardCard density="compact" className="space-y-4">
          <h2 className="text-lg font-semibold text-carbon-black-900">
            {CLINICAL_PATIENT_COPY.patientDetails}
          </h2>
          <ClinicalPatientFormFields
            values={values}
            onChange={(next) => {
              setAcknowledgedMatches(false);
              setValues((current) => ({ ...current, ...next }));
            }}
            errors={errors}
            disabled={admitMutation.isPending}
          />
          <PatientDemographicMatchList
            matches={matches ?? []}
            isLoading={isFetching}
          />
        </DashboardCard>

        <DashboardCard density="compact" className="space-y-4">
          <h2 className="text-lg font-semibold text-carbon-black-900">
            {CLINICAL_PATIENT_COPY.admissionDetails}
          </h2>
          <AdmissionFormFields
            values={values}
            onChange={(next) => setValues((current) => ({ ...current, ...next }))}
            errors={errors}
            disabled={admitMutation.isPending}
          />
        </DashboardCard>

        {errors.submit ? (
          <p className="text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {matches && matches.length > 0 && !acknowledgedMatches ? (
            <SecondaryButton
              type="button"
              onClick={() => {
                setAcknowledgedMatches(true);
                setErrors({});
              }}
            >
              {CLINICAL_PATIENT_COPY.continueNewPatient}
            </SecondaryButton>
          ) : null}
          <PrimaryButton type="submit" disabled={admitMutation.isPending}>
            {admitMutation.isPending
              ? "Bezig met opnemen..."
              : CLINICAL_PATIENT_COPY.admitPatient}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
