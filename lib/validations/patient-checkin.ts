import { z } from "zod";

export const patientCheckinSchema = z.object({
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ongeldige datum.",
  }),
  pain_score: z.number().int().min(0).max(10),
  energy_level: z.number().int().min(1).max(5),
  mood: z.number().int().min(1).max(5),
  mobility_level: z.number().int().min(1).max(5),
  symptoms: z.string().trim().max(500),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type PatientCheckinFormValues = z.infer<typeof patientCheckinSchema>;

export const patientCheckinFormSchema = patientCheckinSchema;
