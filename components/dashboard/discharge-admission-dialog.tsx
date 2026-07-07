"use client";

import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

interface DischargeAdmissionDialogProps {
  open: boolean;
  patientName: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DischargeAdmissionDialog({
  open,
  patientName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DischargeAdmissionDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-black-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discharge-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-parchment-200 bg-white p-6 shadow-card">
        <h2
          id="discharge-dialog-title"
          className="text-lg font-semibold text-carbon-black-900"
        >
          {CLINICAL_PATIENT_COPY.dischargeConfirmTitle}
        </h2>
        <p className="mt-2 text-sm text-carbon-black-600">
          {CLINICAL_PATIENT_COPY.dischargeConfirmBody}
        </p>
        <p className="mt-2 text-sm font-medium text-carbon-black-900">{patientName}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
            {CLINICAL_PATIENT_COPY.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-cherry-rose-600 hover:bg-cherry-rose-700"
          >
            {isLoading ? "Bezig..." : CLINICAL_PATIENT_COPY.dischargeConfirmAction}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
