import type { ZodIssue } from "zod";

const FIELD_LABELS: Record<string, string> = {
  check_in_date: "Datum",
  pain_score: "Pijn",
  energy_level: "Energie",
  mood: "Stemming",
  mobility_level: "Mobiliteit",
  symptoms: "Symptomen",
  note: "Notitie",
  question_text: "Vraag",
  target_type: "Voor wie",
};

export function getFieldErrors(issues: ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message || `Ongeldige waarde voor ${FIELD_LABELS[field] ?? field}.`;
    }
  }

  return errors;
}

export function getFirstErrorMessage(issues: ZodIssue[]): string {
  const fieldErrors = getFieldErrors(issues);
  const firstKey = Object.keys(fieldErrors)[0];

  if (firstKey) {
    return fieldErrors[firstKey] ?? "Controleer je invoer.";
  }

  return "Controleer je invoer.";
}
