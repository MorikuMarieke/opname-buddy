"use client";

import { FormField } from "@/components/forms/form-field";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  computeEndTimeFromDuration,
  durationMinutesBetween,
  resolveActiveDurationMinutes,
} from "@/lib/utils/planning-time";
import type { ScheduleTimeFieldsValues } from "@/lib/validations/schedule-duration";

const copy = PLANNING_COPY.sessions;

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 disabled:opacity-50";

interface ScheduleTimeFieldsProps {
  values: ScheduleTimeFieldsValues;
  activityDefaultDurationMinutes?: number | null;
  onChange: (values: ScheduleTimeFieldsValues) => void;
  errors?: Partial<
    Record<"startTime" | "endTime" | "customDurationMinutes", string>
  >;
  disabled?: boolean;
  ids?: {
    startTime?: string;
    endTime?: string;
    customDuration?: string;
    useCustomDuration?: string;
  };
}

function withSyncedEndTime(
  values: ScheduleTimeFieldsValues,
  activityDefaultDurationMinutes?: number | null,
): ScheduleTimeFieldsValues {
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

export function ScheduleTimeFields({
  values,
  activityDefaultDurationMinutes,
  onChange,
  errors = {},
  disabled = false,
  ids,
}: ScheduleTimeFieldsProps) {
  const hasActivityDefault = activityDefaultDurationMinutes != null;
  const requiresCustomDuration = !hasActivityDefault || values.useCustomDuration;

  function handleStartTimeChange(startTime: string) {
    onChange(
      withSyncedEndTime(
        {
          ...values,
          startTime,
        },
        activityDefaultDurationMinutes,
      ),
    );
  }

  function handleUseCustomDurationChange(useCustomDuration: boolean) {
    if (!useCustomDuration && hasActivityDefault) {
      onChange(
        withSyncedEndTime(
          {
            ...values,
            useCustomDuration: false,
            customDurationMinutes: activityDefaultDurationMinutes,
          },
          activityDefaultDurationMinutes,
        ),
      );
      return;
    }

    const fallbackDuration =
      resolveActiveDurationMinutes({
        useCustomDuration: true,
        customDurationMinutes: values.customDurationMinutes,
        activityDefaultDurationMinutes: null,
      }) ??
      durationMinutesBetween(values.startTime, values.endTime) ??
      activityDefaultDurationMinutes ??
      90;

    onChange(
      withSyncedEndTime(
        {
          ...values,
          useCustomDuration: true,
          customDurationMinutes: fallbackDuration,
        },
        activityDefaultDurationMinutes,
      ),
    );
  }

  function handleCustomDurationChange(customDurationMinutes: string) {
    onChange(
      withSyncedEndTime(
        {
          ...values,
          useCustomDuration: true,
          customDurationMinutes,
        },
        activityDefaultDurationMinutes,
      ),
    );
  }

  return (
    <>
      <FormField
        label={copy.fields.startTime}
        htmlFor={ids?.startTime ?? "startTime"}
        error={errors.startTime}
      >
        <input
          id={ids?.startTime ?? "startTime"}
          type="time"
          disabled={disabled}
          className={inputClasses}
          value={values.startTime}
          onChange={(event) => handleStartTimeChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={copy.fields.endTime}
        htmlFor={ids?.endTime ?? "endTime"}
        hint={copy.schedule.endTimeHint}
        error={errors.endTime}
      >
        <input
          id={ids?.endTime ?? "endTime"}
          type="time"
          readOnly
          disabled
          aria-readonly="true"
          className={inputClasses}
          value={values.endTime}
        />
      </FormField>

      {hasActivityDefault ? (
        <label
          htmlFor={ids?.useCustomDuration ?? "useCustomDuration"}
          className="flex items-center gap-3 lg:col-span-2"
        >
          <input
            id={ids?.useCustomDuration ?? "useCustomDuration"}
            type="checkbox"
            disabled={disabled}
            checked={values.useCustomDuration}
            onChange={(event) =>
              handleUseCustomDurationChange(event.target.checked)
            }
            className="h-5 w-5 rounded border-dust-grey-300"
          />
          <span className="text-sm text-carbon-black-900">
            {copy.schedule.useCustomDuration}
          </span>
        </label>
      ) : (
        <p className="text-sm text-carbon-black-600 lg:col-span-2">
          {copy.schedule.missingDefaultDurationHint}
        </p>
      )}

      {requiresCustomDuration ? (
        <FormField
          label={copy.schedule.customDurationMinutes}
          htmlFor={ids?.customDuration ?? "customDurationMinutes"}
          error={errors.customDurationMinutes}
          className={hasActivityDefault ? "" : "lg:col-span-2"}
        >
          <input
            id={ids?.customDuration ?? "customDurationMinutes"}
            type="number"
            min={1}
            disabled={disabled}
            className={inputClasses}
            value={String(values.customDurationMinutes)}
            onChange={(event) =>
              handleCustomDurationChange(event.target.value)
            }
          />
        </FormField>
      ) : (
        <p className="text-sm text-carbon-black-600">
          {copy.schedule.defaultDurationHint.replace(
            "{minutes}",
            String(activityDefaultDurationMinutes),
          )}
        </p>
      )}
    </>
  );
}
