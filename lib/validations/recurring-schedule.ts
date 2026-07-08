import { z } from "zod";

import { DAYS_OF_WEEK } from "@/lib/constants/planning-enums";

const dayOfWeekSchema = z.coerce
  .number()
  .int()
  .refine((value) => (DAYS_OF_WEEK as readonly number[]).includes(value), {
    message: "Kies een geldige weekdag.",
  });

const timeSchema = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Gebruik een geldige tijd (uu:mm).");

export const recurringScheduleInputSchema = z
  .object({
    activityId: z.string().uuid("Kies een activiteit."),
    dayOfWeek: dayOfWeekSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .max(200)
      .optional()
      .nullable()
      .transform((value) => value || null),
    minParticipants: z
      .union([z.literal(""), z.coerce.number().int().min(1)])
      .optional()
      .nullable()
      .transform((value) => (value === "" || value == null ? null : value)),
    maxParticipants: z
      .union([z.literal(""), z.coerce.number().int().min(1)])
      .optional()
      .nullable()
      .transform((value) => (value === "" || value == null ? null : value)),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Eindtijd moet na starttijd liggen.",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      if (data.minParticipants == null || data.maxParticipants == null) {
        return true;
      }
      return data.maxParticipants >= data.minParticipants;
    },
    {
      message: "Maximum moet minimaal het minimum zijn.",
      path: ["maxParticipants"],
    },
  );

export const recurringScheduleUpdateSchema = recurringScheduleInputSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type RecurringScheduleFormValues = {
  activityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  minParticipants?: string | number | null;
  maxParticipants?: string | number | null;
};

export type RecurringScheduleInputValues = z.infer<
  typeof recurringScheduleInputSchema
>;

export type RecurringScheduleUpdateValues = z.infer<
  typeof recurringScheduleUpdateSchema
>;
