/**
 * Patient-facing DailyBuddy generation progress (NDJSON stream events).
 * Stages map to real server work — never a client-side timed script.
 */

export const DAILYBUDDY_PROGRESS_STAGES = [
  "checkin",
  "care_context",
  "possibilities",
  "composing",
  "validating",
  "ready",
] as const;

export type DailyBuddyProgressStage =
  (typeof DAILYBUDDY_PROGRESS_STAGES)[number];

export type DailyBuddyGenerationPath = "llm" | "deterministic";

export const DAILYBUDDY_PROGRESS_MESSAGES: Record<
  DailyBuddyProgressStage,
  string
> = {
  checkin: "Ik haal je check-in van vandaag op…",
  care_context: "Ik bekijk je zorgcontext…",
  possibilities: "Ik kijk welke activiteiten vandaag mogelijk zijn…",
  composing: "Ik stel je persoonlijke dagadvies samen…",
  validating: "Ik controleer en bewaar je dagadvies…",
  ready: "Je dagadvies is klaar.",
};

/** Maps AI SDK tool names to patient-facing progress stages. */
export const DAILYBUDDY_TOOL_PROGRESS_STAGE: Record<
  string,
  DailyBuddyProgressStage
> = {
  getPatientCheckin: "checkin",
  getPatientContext: "care_context",
  getDailyParticipationPlan: "possibilities",
  getMorningVolunteerAvailabilitySignal: "possibilities",
};

export type DailyBuddyProgressEvent = {
  type: "progress";
  stage: DailyBuddyProgressStage;
  message: string;
  path?: DailyBuddyGenerationPath;
};

export function isDailyBuddyProgressStage(
  value: unknown,
): value is DailyBuddyProgressStage {
  return (
    typeof value === "string" &&
    (DAILYBUDDY_PROGRESS_STAGES as readonly string[]).includes(value)
  );
}

export function progressEventForStage(
  stage: DailyBuddyProgressStage,
  path?: DailyBuddyGenerationPath,
): DailyBuddyProgressEvent {
  return {
    type: "progress",
    stage,
    message: DAILYBUDDY_PROGRESS_MESSAGES[stage],
    ...(path ? { path } : {}),
  };
}

export function progressEventForTool(
  toolName: string,
  path: DailyBuddyGenerationPath = "llm",
): DailyBuddyProgressEvent | null {
  const stage = DAILYBUDDY_TOOL_PROGRESS_STAGE[toolName];
  if (!stage) {
    return null;
  }
  return progressEventForStage(stage, path);
}

/**
 * Deduplicates stage emissions so each patient-facing stage is shown once
 * per generation (tools may re-run; messages should not flicker).
 */
export function createProgressEmitter(
  onProgress: ((event: DailyBuddyProgressEvent) => void) | undefined,
) {
  const emitted = new Set<DailyBuddyProgressStage>();

  return {
    emit(
      stage: DailyBuddyProgressStage,
      path?: DailyBuddyGenerationPath,
    ): void {
      if (!onProgress || emitted.has(stage)) {
        return;
      }
      emitted.add(stage);
      onProgress(progressEventForStage(stage, path));
    },
    emitTool(toolName: string, path: DailyBuddyGenerationPath = "llm"): void {
      const event = progressEventForTool(toolName, path);
      if (!event || !onProgress || emitted.has(event.stage)) {
        return;
      }
      emitted.add(event.stage);
      onProgress(event);
    },
  };
}
