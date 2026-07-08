"use client";

import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS } from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { FormField } from "@/components/forms/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useActivities } from "@/hooks/use-activities";
import type { RecurringScheduleFormValues } from "@/lib/validations/recurring-schedule";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 disabled:opacity-50";

interface RecurringScheduleFormProps {
  values: RecurringScheduleFormValues;
  onChange: (values: RecurringScheduleFormValues) => void;
  errors: Partial<Record<string, string>>;
  disabled?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function RecurringScheduleForm({
  values,
  onChange,
  errors,
  disabled = false,
  submitLabel,
  onSubmit,
  onCancel,
}: RecurringScheduleFormProps) {
  const { data: activities } = useActivities();
  const activeActivities = (activities ?? []).filter((activity) => activity.isActive);
  const copy = PLANNING_COPY.recurring.fields;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label={copy.activity} htmlFor="activityId" error={errors.activityId}>
        <select
          id="activityId"
          disabled={disabled}
          className={inputClasses}
          value={values.activityId}
          onChange={(event) => onChange({ ...values, activityId: event.target.value })}
        >
          <option value="">Kies een activiteit</option>
          {activeActivities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={copy.dayOfWeek} htmlFor="dayOfWeek" error={errors.dayOfWeek}>
        <select
          id="dayOfWeek"
          disabled={disabled}
          className={inputClasses}
          value={values.dayOfWeek}
          onChange={(event) =>
            onChange({ ...values, dayOfWeek: Number(event.target.value) })
          }
        >
          {DAYS_OF_WEEK.map((day) => (
            <option key={day} value={day}>
              {DAY_OF_WEEK_LABELS[day]}
            </option>
          ))}
        </select>
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
        hint={copy.locationHint}
        error={errors.location}
        className="lg:col-span-2"
      >
        <input
          id="location"
          type="text"
          disabled={disabled}
          className={inputClasses}
          value={values.location ?? ""}
          onChange={(event) =>
            onChange({ ...values, location: event.target.value || null })
          }
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
          value={
            values.minParticipants === null || values.minParticipants === undefined
              ? ""
              : String(values.minParticipants)
          }
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
          value={
            values.maxParticipants === null || values.maxParticipants === undefined
              ? ""
              : String(values.maxParticipants)
          }
          onChange={(event) =>
            onChange({ ...values, maxParticipants: event.target.value })
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

export const defaultRecurringScheduleFormValues: RecurringScheduleFormValues = {
  activityId: "",
  dayOfWeek: 1,
  startTime: "10:00",
  endTime: "11:30",
  location: null,
  minParticipants: null,
  maxParticipants: null,
};
