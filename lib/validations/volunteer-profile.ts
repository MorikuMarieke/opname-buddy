import { z } from "zod";

export const volunteerBioSchema = z
  .string()
  .trim()
  .max(500, "Maximaal 500 tekens.")
  .transform((value) => value || null);

export type VolunteerBioInput = z.infer<typeof volunteerBioSchema>;
