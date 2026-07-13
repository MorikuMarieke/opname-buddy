import { z } from "zod";

import { SESSION_STATUSES } from "@/lib/constants/planning-enums";

const timeSchema = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Gebruik een geldige tijd (uu:mm).");

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Kies een geldige datum.");

export const oneOffSessionInputSchema = z
  .object({
    activityId: z.string().uuid("Kies een activiteit."),
    sessionDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "Locatie is verplicht.")
      .max(200),
    minParticipants: z.coerce.number().int().min(1),
    maxParticipants: z.coerce.number().int().min(1),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .nullable()
      .transform((value) => value || null),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Eindtijd moet na starttijd liggen.",
    path: ["endTime"],
  })
  .refine((data) => data.maxParticipants >= data.minParticipants, {
    message: "Maximum moet minimaal het minimum zijn.",
    path: ["maxParticipants"],
  });

export const sessionStatusUpdateSchema = z.object({
  status: z.enum(SESSION_STATUSES),
});

export type OneOffSessionFormValues = {
  activityId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  useCustomDuration: boolean;
  customDurationMinutes: string | number;
  location: string;
  minParticipants: string | number;
  maxParticipants: string | number;
  notes?: string | null;
};

export type OneOffSessionInputValues = z.infer<typeof oneOffSessionInputSchema>;

export const sessionParticipantsSchema = z.object({
  admissionIds: z.array(z.string().uuid()).min(0),
});

export const sessionVolunteersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(0),
});

export const updateActivitySessionSchema = z
  .object({
    sessionDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "Locatie is verplicht.")
      .max(200),
    minParticipants: z.coerce.number().int().min(1),
    maxParticipants: z.coerce.number().int().min(1),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .nullable()
      .transform((value) => value || null),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Eindtijd moet na starttijd liggen.",
    path: ["endTime"],
  })
  .refine((data) => data.maxParticipants >= data.minParticipants, {
    message: "Maximum moet minimaal het minimum zijn.",
    path: ["maxParticipants"],
  });

export type UpdateActivitySessionInput = z.infer<typeof updateActivitySessionSchema>;

export type UpdateActivitySessionFormValues = {
  sessionDate: string;
  startTime: string;
  endTime: string;
  useCustomDuration: boolean;
  customDurationMinutes: string | number;
  location: string;
  minParticipants: string | number;
  maxParticipants: string | number;
  notes?: string | null;
};
