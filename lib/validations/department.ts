import { z } from "zod";

export const departmentInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Naam is verplicht.")
    .max(120, "Naam is te lang."),
  code: z
    .string()
    .trim()
    .max(20, "Afkorting is te lang.")
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export const departmentUpdateSchema = departmentInputSchema.partial();

export type DepartmentInputFormValues = z.infer<typeof departmentInputSchema>;
