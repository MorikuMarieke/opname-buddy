import { z } from "zod";

import {
  ACTIVITY_ALLOWED_SETTINGS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_INTENSITIES,
} from "@/lib/constants/planning-enums";

const activityInputFields = z.object({
  title: z.string().trim().min(1, "Titel is verplicht.").max(200),
  description: z.string().trim().min(1, "Beschrijving is verplicht.").max(5000),
  category: z.enum(ACTIVITY_CATEGORIES, {
    message: "Kies een categorie.",
  }),
  intensity: z.enum(ACTIVITY_INTENSITIES, {
    message: "Kies een intensiteit.",
  }),
  location: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((value) => value || null),
  allowedSettings: z
    .array(z.enum(ACTIVITY_ALLOWED_SETTINGS))
    .default([]),
  defaultDurationMinutes: z
    .union([z.literal(""), z.coerce.number().int().positive()])
    .optional()
    .nullable()
    .transform((value) => (value === "" || value == null ? null : value)),
  minParticipants: z.coerce.number().int().min(1, "Minimaal 1 deelnemer."),
  maxParticipants: z.coerce.number().int().min(1, "Maximaal minstens 1."),
  requiresSupervision: z.boolean(),
  requiresVolunteer: z.boolean(),
  mobilityNotes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value || null),
});

function refineParticipantBounds(
  data: { minParticipants?: number; maxParticipants?: number },
  ctx: z.RefinementCtx,
) {
  if (
    data.minParticipants !== undefined &&
    data.maxParticipants !== undefined &&
    data.maxParticipants < data.minParticipants
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum moet minimaal het minimum zijn.",
      path: ["maxParticipants"],
    });
  }
}

export const activityInputSchema =
  activityInputFields.superRefine(refineParticipantBounds);

export const activityUpdateSchema = activityInputFields
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .superRefine(refineParticipantBounds);

export type ActivityInputFormValues = {
  title: string;
  description: string;
  category: (typeof ACTIVITY_CATEGORIES)[number];
  intensity: (typeof ACTIVITY_INTENSITIES)[number];
  location?: string | null;
  allowedSettings?: (typeof ACTIVITY_ALLOWED_SETTINGS)[number][];
  defaultDurationMinutes?: string | number | null;
  minParticipants: string | number;
  maxParticipants: string | number;
  requiresSupervision: boolean;
  requiresVolunteer: boolean;
  mobilityNotes?: string | null;
};

export type ActivityInputValues = z.infer<typeof activityInputSchema>;
export type ActivityUpdateFormValues = z.infer<typeof activityUpdateSchema>;
