import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";
import type { DailyBuddyProgressEvent } from "@/lib/daily-advice/progress";
import type { PatientDailyAdvice } from "@/lib/daily-advice/patient-response";

export type DailyBuddyStreamResultEvent = {
  type: "result";
  advice: PatientDailyAdvice;
  startedGeneration: boolean;
};

export type DailyBuddyStreamPrerequisiteEvent = {
  type: "prerequisite";
  status: DailyBuddyPrerequisite;
  startedGeneration: false;
};

export type DailyBuddyStreamErrorEvent = {
  type: "error";
  error: string;
};

export type DailyBuddyStreamEvent =
  | DailyBuddyProgressEvent
  | DailyBuddyStreamResultEvent
  | DailyBuddyStreamPrerequisiteEvent
  | DailyBuddyStreamErrorEvent;

export const DAILYBUDDY_NDJSON_CONTENT_TYPE = "application/x-ndjson";

export function encodeNdjsonLine(event: DailyBuddyStreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

export function isDailyBuddyStreamEvent(
  value: unknown,
): value is DailyBuddyStreamEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const type = (value as { type?: unknown }).type;
  return (
    type === "progress" ||
    type === "result" ||
    type === "prerequisite" ||
    type === "error"
  );
}
