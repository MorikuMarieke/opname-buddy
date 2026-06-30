import { z } from "zod";

export const caregiverTargetTypeSchema = z.enum([
  "doctor",
  "nurse",
  "physiotherapist",
  "other",
]);

export const patientQuestionSchema = z.object({
  question_text: z
    .string()
    .trim()
    .min(5, "Vul minimaal 5 tekens in.")
    .max(1000, "Maximaal 1000 tekens."),
  target_type: caregiverTargetTypeSchema,
});

export type PatientQuestionFormValues = z.infer<typeof patientQuestionSchema>;
