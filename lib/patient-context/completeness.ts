import { mobilityStatusRequiresAid } from "@/lib/patient-context/mobility-aid";
import {
  CRITICAL_CONTEXT_FIELDS,
  PATIENT_CONTEXT_FIELD_LABELS,
  type CompletenessLevel,
  type CriticalContextField,
  type PatientContext,
} from "@/types/patient-context";

export interface PatientContextCompleteness {
  level: CompletenessLevel;
  unknownCriticalFieldLabels: string[];
}

function getFieldLabel(field: string): string {
  return PATIENT_CONTEXT_FIELD_LABELS[field] ?? field;
}

function isUnknown(value: string): boolean {
  return value === "unknown";
}

export function getCriticalFieldsForContext(
  context: Pick<PatientContext, "mobility_status">,
): (CriticalContextField | "mobility_aid_available")[] {
  const fields: (CriticalContextField | "mobility_aid_available")[] = [
    ...CRITICAL_CONTEXT_FIELDS,
  ];

  if (mobilityStatusRequiresAid(context.mobility_status as never)) {
    fields.push("mobility_aid_available");
  }

  return fields;
}

export function getPatientContextCompleteness(
  context: PatientContext | null,
): PatientContextCompleteness {
  if (!context) {
    return {
      level: "insufficient",
      unknownCriticalFieldLabels: CRITICAL_CONTEXT_FIELDS.map(getFieldLabel),
    };
  }

  const criticalFields = getCriticalFieldsForContext(context);
  const unknownCritical = criticalFields.filter((field) =>
    isUnknown(context[field]),
  );
  const unknownCriticalFieldLabels = unknownCritical.map(getFieldLabel);

  if (unknownCritical.length > 0) {
    return {
      level: "insufficient",
      unknownCriticalFieldLabels,
    };
  }

  return {
    level: "complete",
    unknownCriticalFieldLabels: [],
  };
}

export function isCriticalFieldUnknown(
  context: PatientContext | null,
  field: string,
): boolean {
  if (!context) {
    return CRITICAL_CONTEXT_FIELDS.includes(field as CriticalContextField);
  }

  const criticalFields = getCriticalFieldsForContext(context);
  if (!criticalFields.includes(field as CriticalContextField | "mobility_aid_available")) {
    return false;
  }

  return isUnknown(context[field as keyof PatientContext] as string);
}
