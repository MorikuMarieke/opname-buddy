import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CompletenessLevel } from "@/types/patient-context";

interface PatientContextCompletenessIndicatorProps {
  level: CompletenessLevel;
}

function variantForLevel(
  level: CompletenessLevel,
): "positive" | "neutral" {
  switch (level) {
    case "complete":
      return "positive";
    case "insufficient":
      return "neutral";
  }
}

export function PatientContextCompletenessIndicator({
  level,
}: PatientContextCompletenessIndicatorProps) {
  return (
    <StatusBadge variant={variantForLevel(level)}>
      {PATIENT_CONTEXT_COPY.completeness[level]}
    </StatusBadge>
  );
}
