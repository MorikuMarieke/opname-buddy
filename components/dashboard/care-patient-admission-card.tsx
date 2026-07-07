"use client";

import { useEffect, useState } from "react";

import { DischargeAdmissionDialog } from "@/components/dashboard/discharge-admission-dialog";
import { AdmissionFormFields } from "@/components/forms/admission-form-fields";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useDischargeAdmission,
  useUpdateAdmission,
} from "@/hooks/use-patient-admission";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { DEPARTMENT_COPY } from "@/lib/constants/department-copy";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";
import { admissionFormSchema } from "@/lib/validations/clinical-patient";
import type { AdmissionWithDepartment } from "@/types/clinical-patient";
import type { AdmissionFormValues } from "@/lib/validations/clinical-patient";

interface CarePatientAdmissionCardProps {
  patientId: string;
  patientName: string;
  admission: AdmissionWithDepartment | null;
}

function admissionToFormValues(
  admission: AdmissionWithDepartment,
): AdmissionFormValues {
  return {
    admittedOn: admission.admitted_on,
    departmentId: admission.department_id ?? "",
    roomNumber: admission.room_number,
    expectedDischargeOn: admission.expected_discharge_on,
  };
}

export function CarePatientAdmissionCard({
  patientId,
  patientName,
  admission,
}: CarePatientAdmissionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const [values, setValues] = useState<AdmissionFormValues>({
    admittedOn: "",
    departmentId: "",
    roomNumber: null,
    expectedDischargeOn: null,
  });

  const updateMutation = useUpdateAdmission(patientId, admission?.id ?? null);
  const dischargeMutation = useDischargeAdmission(patientId, admission?.id ?? null);

  useEffect(() => {
    if (admission && !isEditing) {
      setValues(admissionToFormValues(admission));
    }
  }, [admission, isEditing]);

  if (!admission) {
    return (
      <DashboardCard density="compact" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-carbon-black-900">
            {CLINICAL_PATIENT_COPY.admissionDetails}
          </h2>
          <StatusBadge variant="neutral">{CLINICAL_PATIENT_COPY.noActiveAdmission}</StatusBadge>
        </div>
        <p className="text-sm text-carbon-black-600">
          Deze patiënt heeft momenteel geen actieve opname.
        </p>
        <SecondaryButton href={`/care/patients/${patientId}/admit`}>
          {CLINICAL_PATIENT_COPY.newAdmission}
        </SecondaryButton>
      </DashboardCard>
    );
  }

  async function handleSave() {
    const parsed = admissionFormSchema.safeParse(values);

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
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Opslaan is mislukt.",
      });
    }
  }

  async function handleDischarge() {
    try {
      await dischargeMutation.mutateAsync();
      setShowDischargeDialog(false);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Ontslag kon niet worden verwerkt.",
      });
      setShowDischargeDialog(false);
    }
  }

  function startEditing() {
    if (!admission) {
      return;
    }

    setValues(admissionToFormValues(admission));
    setIsEditing(true);
    setErrors({});
  }

  return (
    <>
      <DashboardCard density="compact" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-carbon-black-900">
            {CLINICAL_PATIENT_COPY.admissionDetails}
          </h2>
          <StatusBadge variant="positive">
            {CLINICAL_PATIENT_COPY.activeAdmission}
          </StatusBadge>
        </div>

        {isEditing ? (
          <>
            <AdmissionFormFields
              values={values}
              onChange={setValues}
              errors={errors}
              disabled={updateMutation.isPending}
            />
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Opslaan..." : CLINICAL_PATIENT_COPY.savePatient}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setValues(admissionToFormValues(admission));
                }}
              >
                {CLINICAL_PATIENT_COPY.cancel}
              </SecondaryButton>
            </div>
          </>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-carbon-black-600">
                {CLINICAL_PATIENT_COPY.admittedOnLabel}
              </dt>
              <dd className="font-medium text-carbon-black-900">
                {formatDutchDate(admission.admitted_on)}
              </dd>
            </div>
            <div>
              <dt className="text-carbon-black-600">
                {DEPARTMENT_COPY.departmentLabel}
              </dt>
              <dd className="font-medium text-carbon-black-900">
                {admission.departmentName?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-carbon-black-600">
                {DEPARTMENT_COPY.roomNumberLabel}
              </dt>
              <dd className="font-medium text-carbon-black-900">
                {admission.room_number?.trim() || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-carbon-black-600">
                {CLINICAL_PATIENT_COPY.expectedDischargeLabel}
              </dt>
              <dd className="font-medium text-carbon-black-900">
                {admission.expected_discharge_on
                  ? formatDutchDate(admission.expected_discharge_on)
                  : "—"}
              </dd>
            </div>
          </dl>
        )}

        {errors.submit ? (
          <p className="text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}

        {!isEditing ? (
          <div className="flex flex-wrap gap-3">
            <SecondaryButton type="button" onClick={startEditing}>
              Bewerken
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() => setShowDischargeDialog(true)}
              className="border-cherry-rose-200 text-cherry-rose-700 hover:bg-cherry-rose-50"
            >
              {CLINICAL_PATIENT_COPY.discharge}
            </SecondaryButton>
          </div>
        ) : null}
      </DashboardCard>

      <DischargeAdmissionDialog
        open={showDischargeDialog}
        patientName={patientName}
        isLoading={dischargeMutation.isPending}
        onConfirm={handleDischarge}
        onCancel={() => setShowDischargeDialog(false)}
      />
    </>
  );
}
