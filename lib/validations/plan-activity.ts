import { z } from "zod";

import { oneOffSessionInputSchema } from "@/lib/validations/activity-session";
import { recurringScheduleInputSchema } from "@/lib/validations/recurring-schedule";

export const planActivityKindSchema = z.enum(["one_off", "recurring"]);

export type PlanActivityKind = z.infer<typeof planActivityKindSchema>;

export const planActivityActivityStepSchema = z.object({
  activityId: z.string().uuid("Kies een activiteit."),
});

export const planActivityKindStepSchema = z.object({
  kind: planActivityKindSchema,
});

export const planActivityFacilitatorsStepSchema = z.object({
  facilitatorUserIds: z.array(z.string().uuid()),
});

export const planOneOffActivityInputSchema = oneOffSessionInputSchema.extend({
  facilitatorUserIds: z.array(z.string().uuid()).default([]),
});

export const planRecurringActivityInputSchema = recurringScheduleInputSchema.extend({
  facilitatorUserIds: z.array(z.string().uuid()).default([]),
});

export type PlanOneOffActivityInput = z.infer<typeof planOneOffActivityInputSchema>;
export type PlanRecurringActivityInput = z.infer<typeof planRecurringActivityInputSchema>;

export type PlanActivityInput =
  | ({ kind: "one_off" } & PlanOneOffActivityInput)
  | ({ kind: "recurring" } & PlanRecurringActivityInput);

export interface PlanActivityFormState {
  activityId: string;
  kind: PlanActivityKind | "";
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string;
  minParticipants: string | number;
  maxParticipants: string | number;
  notes: string | null;
  dayOfWeek: number;
  recurringLocation: string | null;
  recurringMinParticipants: string | number | null;
  recurringMaxParticipants: string | number | null;
  facilitatorUserIds: string[];
}
