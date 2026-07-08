"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";
import type { PatientDemographicMatch } from "@/types/clinical-patient";

interface PatientDemographicMatchListProps {
  matches: PatientDemographicMatch[];
  isLoading?: boolean;
}

export function PatientDemographicMatchList({
  matches,
  isLoading = false,
}: PatientDemographicMatchListProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-carbon-black-600">Mogelijke matches zoeken...</p>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-cherry-rose-200 bg-cherry-rose-50/40 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-carbon-black-900">
          Mogelijke bestaande patiënten
        </p>
        <p className="text-sm text-carbon-black-600">
          {CLINICAL_PATIENT_COPY.duplicateSearchHint}
        </p>
      </div>

      <ul className="space-y-2">
        {matches.map((match) => (
          <li
            key={match.patientId}
            className="rounded-xl border border-parchment-200 bg-white p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-carbon-black-900">
                  {formatPatientDisplayName({
                    first_name: match.firstName,
                    last_name: match.lastName,
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    variant={match.matchTier === "strong" ? "positive" : "attention"}
                  >
                    {match.matchTier === "strong"
                      ? CLINICAL_PATIENT_COPY.strongMatch
                      : CLINICAL_PATIENT_COPY.possibleMatch}
                  </StatusBadge>
                  <StatusBadge
                    variant={match.admissionStatus === "active" ? "positive" : "neutral"}
                  >
                    {match.admissionStatus === "active"
                      ? CLINICAL_PATIENT_COPY.activeAdmission
                      : CLINICAL_PATIENT_COPY.noActiveAdmission}
                  </StatusBadge>
                </div>
                {match.birthDate ? (
                  <p className="text-sm text-carbon-black-600">
                    Geboortedatum: {formatDutchDate(match.birthDate)}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <SecondaryButton href={`/care/patients/${match.patientId}`} size="sm">
                  {CLINICAL_PATIENT_COPY.openPatient}
                </SecondaryButton>
                {match.admissionStatus === "none" ? (
                  <SecondaryButton
                    href={`/care/patients/${match.patientId}/admit`}
                    size="sm"
                  >
                    {CLINICAL_PATIENT_COPY.startNewAdmission}
                  </SecondaryButton>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-carbon-black-600">
        {CLINICAL_PATIENT_COPY.duplicateDisclaimer}
      </p>
    </div>
  );
}
