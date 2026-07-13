import {
  createOneOffSession,
  setSessionFacilitators,
} from "@/lib/services/activity-sessions";
import { createRecurringSchedule } from "@/lib/services/activity-recurring-schedules";
import type {
  PlanActivityInput,
  PlanOneOffActivityInput,
  PlanRecurringActivityInput,
} from "@/lib/validations/plan-activity";

export interface PlanActivityOneOffResult {
  kind: "one_off";
  sessionId: string;
}

export interface PlanActivityRecurringResult {
  kind: "recurring";
  scheduleId: string;
}

export type PlanActivityResult =
  | PlanActivityOneOffResult
  | PlanActivityRecurringResult;

async function planOneOffActivity(
  input: PlanOneOffActivityInput,
): Promise<PlanActivityOneOffResult> {
  const { facilitatorUserIds, ...sessionInput } = input;
  const session = await createOneOffSession(sessionInput);

  if (facilitatorUserIds.length > 0) {
    await setSessionFacilitators(session.id, facilitatorUserIds);
  }

  return { kind: "one_off", sessionId: session.id };
}

async function planRecurringActivity(
  input: PlanRecurringActivityInput,
): Promise<PlanActivityRecurringResult> {
  const { facilitatorUserIds, ...scheduleInput } = input;
  const schedule = await createRecurringSchedule(scheduleInput, {
    facilitatorUserIds,
  });

  return { kind: "recurring", scheduleId: schedule.id };
}

export async function planActivity(
  input: PlanActivityInput,
): Promise<PlanActivityResult> {
  if (input.kind === "one_off") {
    return planOneOffActivity(input);
  }

  return planRecurringActivity(input);
}
