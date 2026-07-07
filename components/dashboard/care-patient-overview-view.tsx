"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CarePatientAdmissionCard } from "@/components/dashboard/care-patient-admission-card";
import { CarePatientLinkCard } from "@/components/dashboard/care-patient-link-card";
import { CarePatientShell } from "@/components/dashboard/care-patient-shell";
import { ClinicalPatientFormFields } from "@/components/forms/clinical-patient-form-fields";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useClinicalPatient, useUpdateClinicalPatient } from "@/hooks/use-clinical-patient";
import { usePatientAdmission } from "@/hooks/use-patient-admission";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { calculateAge, formatPatientDisplayName } from "@/lib/utils/patient-greeting";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";
import { patientDemographicsSchema } from "@/lib/validations/clinical-patient";
import type { PatientDemographicsFormValues } from "@/lib/validations/clinical-patient";

interface EditClinicalPatientViewProps {
  patientId: string;
}

export function EditClinicalPatientView({ patientId }: EditClinicalPatientViewProps) {
  const router = useRouter();
  const { data: patient, isLoading } = useClinicalPatient(patientId);
  const updateMutation = useUpdateClinicalPatient(patientId);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [values, setValues] = useState<PatientDemographicsFormValues | null>(null);

  if (isLoading || !patient) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-carbon-black-600">Patiëntgegevens laden...</p>
      </CarePatientShell>
    );
  }

  const formValues =
    values ??
    ({
      firstName: patient.first_name,
      lastName: patient.last_name,
      birthDate: patient.birth_date,
      sex: (patient.sex as PatientDemographicsFormValues["sex"]) ?? "X",
    } satisfies PatientDemographicsFormValues);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = patientDemographicsSchema.safeParse(formValues);

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
      await updateMutation.mutateAsync(parsed.data);
      router.push(`/care/patients/${patientId}`);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Opslaan is mislukt.",
      });
    }
  }

  return (
    <CarePatientShell patientId={patientId}>
      <SectionHeader
        title={CLINICAL_PATIENT_COPY.editPatient}
        description="Wijzig de demografische gegevens van de klinische patiënt."
        size="compact"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <DashboardCard density="compact">
          <ClinicalPatientFormFields
            values={formValues}
            onChange={(next) => setValues(next)}
            errors={errors}
            disabled={updateMutation.isPending}
          />
        </DashboardCard>

        {errors.submit ? (
          <p className="text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}

        <PrimaryButton type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Opslaan..." : CLINICAL_PATIENT_COPY.savePatient}
        </PrimaryButton>
      </form>
    </CarePatientShell>
  );
}

interface CarePatientOverviewViewProps {
  patientId: string;
}

export function CarePatientOverviewView({ patientId }: CarePatientOverviewViewProps) {
  const { data: patient, isLoading, isError } = useClinicalPatient(patientId);
  const { data: admission } = usePatientAdmission(patientId);

  if (isLoading) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-carbon-black-600">Patiëntoverzicht laden...</p>
      </CarePatientShell>
    );
  }

  if (isError || !patient) {
    return (
      <CarePatientShell patientId={patientId}>
        <p className="text-sm text-red-600" role="alert">
          Patiënt kon niet worden geladen.
        </p>
      </CarePatientShell>
    );
  }

  const displayName = formatPatientDisplayName(patient);
  const age = patient.birth_date ? calculateAge(patient.birth_date) : null;

  return (
    <CarePatientShell patientId={patientId}>
      <SectionHeader
        title="Patiëntoverzicht"
        description="Demografische gegevens, opname en accountkoppeling."
        size="compact"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCard density="compact" className="space-y-3">
          <h2 className="text-lg font-semibold text-carbon-black-900">
            {CLINICAL_PATIENT_COPY.patientDetails}
          </h2>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-carbon-black-600">Naam</dt>
              <dd className="font-medium text-carbon-black-900">{displayName}</dd>
            </div>
            <div>
              <dt className="text-carbon-black-600">{CLINICAL_PATIENT_COPY.birthDate}</dt>
              <dd className="font-medium text-carbon-black-900">
                {patient.birth_date ? formatDutchDate(patient.birth_date) : "—"}
                {age !== null ? ` (${age} jaar)` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-carbon-black-600">{CLINICAL_PATIENT_COPY.sex}</dt>
              <dd className="font-medium text-carbon-black-900">{patient.sex ?? "—"}</dd>
            </div>
          </dl>
        </DashboardCard>

        <CarePatientAdmissionCard
          patientId={patientId}
          patientName={displayName}
          admission={admission ?? null}
        />

        <div className="xl:col-span-2">
          <CarePatientLinkCard patientId={patientId} />
        </div>
      </div>
    </CarePatientShell>
  );
}
