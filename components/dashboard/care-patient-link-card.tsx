"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useGeneratePatientLinkCode } from "@/hooks/use-patient-link-code";
import { usePatientLinkStatus } from "@/hooks/use-patient-link-status";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";

interface CarePatientLinkCardProps {
  patientId: string;
}

export function CarePatientLinkCard({ patientId }: CarePatientLinkCardProps) {
  const { data: linkStatus, isLoading } = usePatientLinkStatus(patientId);
  const generateMutation = useGeneratePatientLinkCode(patientId);
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);

    try {
      const result = await generateMutation.mutateAsync();
      setGeneratedCode(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Genereren mislukt.");
    }
  }

  return (
    <DashboardCard density="compact" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-carbon-black-900">Accountkoppeling</h2>
        {isLoading ? null : (
          <StatusBadge variant={linkStatus?.isLinked ? "positive" : "attention"}>
            {linkStatus?.isLinked
              ? CLINICAL_PATIENT_COPY.accountLinked
              : CLINICAL_PATIENT_COPY.accountNotLinked}
          </StatusBadge>
        )}
      </div>

      {linkStatus?.isLinked ? (
        <p className="text-sm text-carbon-black-600">
          De patiënt heeft een gekoppeld loginaccount. Bij een nieuwe opname is geen
          nieuwe koppelcode nodig.
        </p>
      ) : (
        <>
          <p className="text-sm text-carbon-black-600">
            {CLINICAL_PATIENT_COPY.linkCodeInstructions}
          </p>

          {generatedCode ? (
            <div className="rounded-xl border border-pearl-aqua-300 bg-pearl-aqua-50 p-4">
              <p className="text-sm font-medium text-carbon-black-900">
                {CLINICAL_PATIENT_COPY.linkCodeTitle}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-[0.3em] text-blue-slate-800">
                {generatedCode.code}
              </p>
              <p className="mt-2 text-sm text-carbon-black-600">
                {CLINICAL_PATIENT_COPY.linkCodeShownOnce}
              </p>
              <p className="mt-1 text-sm text-carbon-black-600">
                {CLINICAL_PATIENT_COPY.linkCodeExpiry}:{" "}
                {formatDutchDateTime(generatedCode.expiresAt)}
              </p>
            </div>
          ) : (
            <PrimaryButton
              type="button"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending
                ? "Genereren..."
                : CLINICAL_PATIENT_COPY.generateLinkCode}
            </PrimaryButton>
          )}

          {generatedCode ? (
            <SecondaryButton type="button" onClick={() => setGeneratedCode(null)}>
              Sluiten
            </SecondaryButton>
          ) : null}
        </>
      )}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </DashboardCard>
  );
}
