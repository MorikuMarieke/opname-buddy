import type { ZodIssue } from "zod";

const FIELD_LABELS: Record<string, string> = {
  check_in_date: "Datum",
  pain_score: "Pijn",
  energy_level: "Energie",
  mood: "Stemming",
  mobility_level: "Mobiliteit",
  motivation_score: "Motivatie",
  symptoms: "Symptomen",
  note: "Notitie",
  question_text: "Vraag",
  target_type: "Voor wie",
  activity_title: "Activiteit",
  status: "Status",
  reason: "Reden",
  effort_score: "Inspanning",
  after_feeling_score: "Gevoel achteraf",
  notes: "Notities",
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
