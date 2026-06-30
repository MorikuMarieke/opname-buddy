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
