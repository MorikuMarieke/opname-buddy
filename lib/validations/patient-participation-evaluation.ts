import { z } from "zod";

export const participationEvaluationStatusSchema = z.enum([
  "done",
  "partly_done",
  "not_done",
]);

export const patientParticipationEvaluationSchema = z.object({
  evaluation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ongeldige datum.",
  }),
  activity_title: z
    .string()
    .trim()
    .min(2, "Vul minimaal 2 tekens in.")
    .max(200, "Maximaal 200 tekens."),
  activity_session_id: z.string().uuid().nullable().optional(),
  status: participationEvaluationStatusSchema,
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  effort_score: z.number().int().min(1).max(5),
  after_feeling_score: z.number().int().min(1).max(5),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type PatientParticipationEvaluationFormValues = z.infer<
  typeof patientParticipationEvaluationSchema
>;
