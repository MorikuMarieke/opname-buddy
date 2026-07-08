"use client";

import { FormField } from "@/components/forms/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useActivities } from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { OneOffSessionFormValues } from "@/lib/validations/activity-session";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 disabled:opacity-50";

const textareaClasses =
  "min-h-24 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900 disabled:opacity-50";

interface OneOffSessionFormProps {
  values: OneOffSessionFormValues;
  onChange: (values: OneOffSessionFormValues) => void;
  errors: Partial<Record<string, string>>;
  disabled?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function OneOffSessionForm({
  values,
  onChange,
  errors,
  disabled = false,
  submitLabel,
  onSubmit,
  onCancel,
}: OneOffSessionFormProps) {
  const { data: activities } = useActivities();
  const activeActivities = (activities ?? []).filter((activity) => activity.isActive);
  const copy = PLANNING_COPY.sessions.fields;

  function handleActivityChange(activityId: string) {
    const activity = activeActivities.find((item) => item.id === activityId);
    if (!activity) {
      onChange({ ...values, activityId });
      return;
    }

    onChange({
      ...values,
      activityId,
      location: activity.location ?? "",
      minParticipants: activity.minParticipants,
      maxParticipants: activity.maxParticipants,
      endTime:
        activity.defaultDurationMinutes != null
          ? addMinutes(values.startTime || "10:00", activity.defaultDurationMinutes)
          : values.endTime,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label={copy.activity} htmlFor="activityId" error={errors.activityId}>
        <select
          id="activityId"
          disabled={disabled}
          className={inputClasses}
          value={values.activityId}
          onChange={(event) => handleActivityChange(event.target.value)}
        >
          <option value="">Kies een activiteit</option>
          {activeActivities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={copy.sessionDate} htmlFor="sessionDate" error={errors.sessionDate}>
        <input
          id="sessionDate"
          type="date"
          disabled={disabled}
          className={inputClasses}
          value={values.sessionDate}
          onChange={(event) =>
            onChange({ ...values, sessionDate: event.target.value })
          }
        />
      </FormField>

      <FormField label={copy.startTime} htmlFor="startTime" error={errors.startTime}>
        <input
          id="startTime"
          type="time"
          disabled={disabled}
          className={inputClasses}
          value={values.startTime}
          onChange={(event) => onChange({ ...values, startTime: event.target.value })}
        />
      </FormField>

      <FormField label={copy.endTime} htmlFor="endTime" error={errors.endTime}>
        <input
          id="endTime"
          type="time"
          disabled={disabled}
          className={inputClasses}
          value={values.endTime}
          onChange={(event) => onChange({ ...values, endTime: event.target.value })}
        />
      </FormField>

      <FormField
        label={copy.location}
        htmlFor="location"
        error={errors.location}
        className="lg:col-span-2"
      >
        <input
          id="location"
          type="text"
          disabled={disabled}
          className={inputClasses}
          value={values.location}
          onChange={(event) => onChange({ ...values, location: event.target.value })}
        />
      </FormField>

      <FormField
        label={copy.minParticipants}
        htmlFor="minParticipants"
        error={errors.minParticipants}
      >
        <input
          id="minParticipants"
          type="number"
          min={1}
          disabled={disabled}
          className={inputClasses}
          value={String(values.minParticipants)}
          onChange={(event) =>
            onChange({ ...values, minParticipants: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={copy.maxParticipants}
        htmlFor="maxParticipants"
        error={errors.maxParticipants}
      >
        <input
          id="maxParticipants"
          type="number"
          min={1}
          disabled={disabled}
          className={inputClasses}
          value={String(values.maxParticipants)}
          onChange={(event) =>
            onChange({ ...values, maxParticipants: event.target.value })
          }
        />
      </FormField>

      <FormField
        label={copy.notes}
        htmlFor="notes"
        error={errors.notes}
        className="lg:col-span-2"
      >
        <textarea
          id="notes"
          disabled={disabled}
          className={textareaClasses}
          value={values.notes ?? ""}
          onChange={(event) =>
            onChange({ ...values, notes: event.target.value || null })
          }
        />
      </FormField>

      <div className="flex flex-wrap gap-3 lg:col-span-2">
        <PrimaryButton type="button" onClick={onSubmit} disabled={disabled}>
          {submitLabel}
        </PrimaryButton>
        {onCancel ? (
          <SecondaryButton type="button" onClick={onCancel} disabled={disabled}>
            {PLANNING_COPY.activities.cancelButton}
          </SecondaryButton>
        ) : null}
      </div>

      {errors.submit ? (
        <p className="text-sm text-red-600 lg:col-span-2" role="alert">
          {errors.submit}
        </p>
      ) : null}
    </div>
  );
}

function addMinutes(time: string, minutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const nextHour = Math.floor(total / 60) % 24;
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export const defaultOneOffSessionFormValues: OneOffSessionFormValues = {
  activityId: "",
  sessionDate: getAmsterdamDateString(),
  startTime: "10:00",
  endTime: "11:30",
  location: "",
  minParticipants: 1,
  maxParticipants: 8,
  notes: null,
};
