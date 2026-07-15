import { z } from "zod";

import {
  AFTERNOON_CATEGORY_VALUES,
  PARTICIPATION_BLOCK_VALUES,
  PARTICIPATION_NEED_VALUES,
} from "@/lib/constants/daily-participation";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Ongeldige datum.",
});

export const participationNeedValueSchema = z.enum(PARTICIPATION_NEED_VALUES);

export const participationBlockSchema = z.enum(PARTICIPATION_BLOCK_VALUES);

export const afternoonCategorySchema = z.enum(AFTERNOON_CATEGORY_VALUES);

export const upsertDailyParticipationPlanSchema = z.object({
  plan_date: dateStringSchema,
  afternoon_category: afternoonCategorySchema.nullable(),
  afternoon_title: z
    .string()
    .trim()
    .max(120, { message: "Titel mag maximaal 120 tekens bevatten." })
    .nullable(),
  participant_message: z
    .string()
    .trim()
    .max(500, { message: "Bericht mag maximaal 500 tekens bevatten." })
    .nullable(),
});

export type UpsertDailyParticipationPlanValues = z.infer<
  typeof upsertDailyParticipationPlanSchema
>;

export const volunteerWeeklyBlockSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  morning_available: z.boolean(),
  afternoon_available: z.boolean(),
});

export const volunteerWeeklyBlocksFormSchema = z.object({
  blocks: z.array(volunteerWeeklyBlockSchema).length(7),
});

export type VolunteerWeeklyBlocksFormValues = z.infer<
  typeof volunteerWeeklyBlocksFormSchema
>;

export const volunteerDayAbsenceSchema = z.object({
  absence_date: dateStringSchema,
  block: participationBlockSchema,
});

export type VolunteerDayAbsenceValues = z.infer<typeof volunteerDayAbsenceSchema>;
