import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type CaregiverTargetType =
  | "doctor"
  | "nurse"
  | "physiotherapist"
  | "other";

export type QuestionStatus = "open" | "discussed" | "answered";

export type PatientCheckin = Tables<"patient_checkins">;
export type PatientCheckinInsert = TablesInsert<"patient_checkins">;
export type PatientCheckinUpdate = TablesUpdate<"patient_checkins">;

export type PatientQuestion = Tables<"patient_questions">;
export type PatientQuestionInsert = TablesInsert<"patient_questions">;
export type PatientQuestionUpdate = TablesUpdate<"patient_questions">;

export type ParticipationEvaluationStatus = "done" | "partly_done" | "not_done";

export type PatientParticipationEvaluation =
  Tables<"patient_participation_evaluations">;
export type PatientParticipationEvaluationInsert =
  TablesInsert<"patient_participation_evaluations">;
export type PatientParticipationEvaluationUpdate =
  TablesUpdate<"patient_participation_evaluations">;

export const CAREGIVER_TARGET_LABELS: Record<CaregiverTargetType, string> = {
  doctor: "Arts",
  nurse: "Verpleging",
  physiotherapist: "Fysiotherapeut",
  other: "Overig",
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "Open",
  discussed: "Besproken",
  answered: "Beantwoord",
};

export const CAREGIVER_TARGET_OPTIONS: {
  value: CaregiverTargetType;
  label: string;
}[] = [
  { value: "doctor", label: CAREGIVER_TARGET_LABELS.doctor },
  { value: "nurse", label: CAREGIVER_TARGET_LABELS.nurse },
  { value: "physiotherapist", label: CAREGIVER_TARGET_LABELS.physiotherapist },
  { value: "other", label: CAREGIVER_TARGET_LABELS.other },
];

export const LIKERT_LABELS = [
  "Zeer slecht",
  "Slecht",
  "Matig",
  "Goed",
  "Uitstekend",
] as const;

export const PAIN_LABELS = {
  min: "Geen pijn",
  max: "Ergste pijn",
} as const;

export const PARTICIPATION_STATUS_LABELS: Record<
  ParticipationEvaluationStatus,
  string
> = {
  done: "Gedaan",
  partly_done: "Gedeeltelijk gedaan",
  not_done: "Niet gedaan",
};

export const PARTICIPATION_STATUS_OPTIONS: {
  value: ParticipationEvaluationStatus;
  label: string;
}[] = [
  { value: "done", label: PARTICIPATION_STATUS_LABELS.done },
  { value: "partly_done", label: PARTICIPATION_STATUS_LABELS.partly_done },
  { value: "not_done", label: PARTICIPATION_STATUS_LABELS.not_done },
];
