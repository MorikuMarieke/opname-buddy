import { z } from "zod";

import {
  AVAILABILITY_EXCEPTION_KINDS,
  DAYS_OF_WEEK,
} from "@/lib/constants/planning-enums";

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

export const volunteerRecurringAvailabilitySchema = z
  .object({
    dayOfWeek: dayOfWeekSchema,
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Eindtijd moet na starttijd liggen.",
    path: ["endTime"],
  });

export const volunteerAvailabilityExceptionSchema = z
  .object({
    exceptionDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Kies een geldige datum."),
    startTime: timeSchema,
    endTime: timeSchema,
    kind: z.enum(AVAILABILITY_EXCEPTION_KINDS),
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable()
      .transform((value) => value || null),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Eindtijd moet na starttijd liggen.",
    path: ["endTime"],
  });

export type VolunteerRecurringAvailabilityInput = z.infer<
  typeof volunteerRecurringAvailabilitySchema
>;

export type VolunteerAvailabilityExceptionInput = z.infer<
  typeof volunteerAvailabilityExceptionSchema
>;
