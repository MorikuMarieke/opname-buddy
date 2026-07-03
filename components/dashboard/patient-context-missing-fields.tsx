import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";

interface PatientContextMissingFieldsProps {
  fieldLabels: string[];
}

export function PatientContextMissingFields({
  fieldLabels,
}: PatientContextMissingFieldsProps) {
  if (fieldLabels.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-carbon-black-800"
      role="status"
    >
      <span className="font-medium">{PATIENT_CONTEXT_COPY.missingInfoHeading}</span>{" "}
      {fieldLabels.join(", ")}
    </div>
  );
}
