import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { formatDutchDateTime } from "@/lib/utils/amsterdam-date";

interface PatientContextAuditMetaProps {
  updatedAt?: string | null;
  updatedByName?: string | null;
  patientView?: boolean;
  variant?: "default" | "inline";
}

export function PatientContextAuditMeta({
  updatedAt,
  updatedByName,
  patientView = false,
  variant = "default",
}: PatientContextAuditMetaProps) {
  const copy = PATIENT_CONTEXT_COPY.audit;

  const updatedAtText = updatedAt
    ? formatDutchDateTime(updatedAt)
    : copy.notYetSaved;

  const updatedByText = patientView
    ? copy.patientUpdatedBy
    : updatedByName?.trim() || copy.caregiverFallback;

  if (variant === "inline") {
    if (!updatedAt && patientView) {
      return null;
    }

    return (
      <p className="text-xs text-carbon-black-500">
        {copy.lastUpdated}: {updatedAtText}
        {!patientView ? (
          <>
            {" "}
            · {copy.updatedBy}: {updatedByText}
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div className="grid gap-3 text-sm text-carbon-black-700 sm:grid-cols-2">
      <div>
        <p className="font-medium text-carbon-black-900">{copy.lastUpdated}</p>
        <p>{updatedAtText}</p>
      </div>
      <div>
        <p className="font-medium text-carbon-black-900">{copy.updatedBy}</p>
        <p>{updatedByText}</p>
      </div>
    </div>
  );
}
