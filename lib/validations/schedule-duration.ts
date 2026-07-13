import {
  computeEndTimeFromDuration,
  resolveActiveDurationMinutes,
  type ScheduleDurationConfig,
} from "@/lib/utils/planning-time";

export interface ScheduleTimeFieldsValues extends ScheduleDurationConfig {
  startTime: string;
  endTime: string;
}

export function syncScheduleEndTime<T extends ScheduleTimeFieldsValues>(
  values: T,
  activityDefaultDurationMinutes?: number | null,
): T {
  const endTime =
    computeEndTimeFromDuration(values.startTime, {
      useCustomDuration: values.useCustomDuration,
      customDurationMinutes: values.customDurationMinutes,
      activityDefaultDurationMinutes,
    }) ?? values.endTime;

  return {
    ...values,
    endTime,
  };
}

export function getScheduleDurationFieldErrors(
  values: ScheduleTimeFieldsValues,
  activityDefaultDurationMinutes?: number | null,
): Partial<Record<"startTime" | "endTime" | "customDurationMinutes", string>> {
  const errors: Partial<
    Record<"startTime" | "endTime" | "customDurationMinutes", string>
  > = {};

  const durationMinutes = resolveActiveDurationMinutes({
    useCustomDuration: values.useCustomDuration,
    customDurationMinutes: values.customDurationMinutes,
    activityDefaultDurationMinutes,
  });

  if (durationMinutes == null) {
    errors.customDurationMinutes = "Duur moet groter dan nul zijn.";
    return errors;
  }

  const computedEndTime = computeEndTimeFromDuration(values.startTime, {
    useCustomDuration: values.useCustomDuration,
    customDurationMinutes: values.customDurationMinutes,
    activityDefaultDurationMinutes,
  });

  if (computedEndTime != null && computedEndTime <= values.startTime) {
    errors.endTime = "Eindtijd moet na starttijd liggen.";
  }

  return errors;
}
