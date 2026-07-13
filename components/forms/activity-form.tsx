"use client";

import {
  ACTIVITY_ALLOWED_SETTINGS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_INTENSITIES,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import type { ActivityInputFormValues } from "@/lib/validations/activity";
import { FormField } from "@/components/forms/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { cn } from "@/lib/utils/cn";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

const textareaClasses =
  "min-h-28 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

interface ActivityFormProps {
  values: ActivityInputFormValues;
  onChange: (values: ActivityInputFormValues) => void;
  errors: Partial<Record<string, string>>;
  disabled?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ActivityForm({
  values,
  onChange,
  errors,
  disabled = false,
  submitLabel,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const copy = PLANNING_COPY.activities.fields;

  function toggleAllowedSetting(setting: (typeof ACTIVITY_ALLOWED_SETTINGS)[number]) {
    const current = values.allowedSettings ?? [];
    const next = current.includes(setting)
      ? current.filter((item) => item !== setting)
      : [...current, setting];
    onChange({ ...values, allowedSettings: next });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label={copy.title} htmlFor="title" error={errors.title}>
        <input
          id="title"
          type="text"
          disabled={disabled}
          className={inputClasses}
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
        />
      </FormField>

      <FormField label={copy.category} htmlFor="category" error={errors.category}>
        <select
          id="category"
          disabled={disabled}
          className={inputClasses}
          value={values.category}
          onChange={(event) =>
            onChange({
              ...values,
              category: event.target.value as ActivityInputFormValues["category"],
            })
          }
        >
          {ACTIVITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {PLANNING_COPY.categoryLabels[category]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={copy.description}
        htmlFor="description"
        hint={copy.descriptionHint}
        error={errors.description}
        className="lg:col-span-2"
      >
        <textarea
          id="description"
          disabled={disabled}
          className={textareaClasses}
          value={values.description}
          onChange={(event) =>
            onChange({ ...values, description: event.target.value })
          }
        />
      </FormField>

      <FormField label={copy.intensity} htmlFor="intensity" error={errors.intensity}>
        <select
          id="intensity"
          disabled={disabled}
          className={inputClasses}
          value={values.intensity}
          onChange={(event) =>
            onChange({
              ...values,
              intensity: event.target.value as ActivityInputFormValues["intensity"],
            })
          }
        >
          {ACTIVITY_INTENSITIES.map((intensity) => (
            <option key={intensity} value={intensity}>
              {PLANNING_COPY.intensityLabels[intensity]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={copy.location} htmlFor="location" error={errors.location}>
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
        label={copy.allowedSettings}
        htmlFor="allowed-settings"
        hint={copy.allowedSettingsHint}
        error={errors.allowedSettings}
        className="lg:col-span-2"
      >
        <div className="flex flex-wrap gap-2" id="allowed-settings">
          {ACTIVITY_ALLOWED_SETTINGS.map((setting) => {
            const selected = (values.allowedSettings ?? []).includes(setting);
            return (
              <button
                key={setting}
                type="button"
                disabled={disabled}
                onClick={() => toggleAllowedSetting(setting)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "bg-blue-slate-700 text-white"
                    : "bg-dust-grey-100 text-carbon-black-700 hover:bg-dust-grey-200",
                )}
              >
                {PLANNING_COPY.allowedSettingLabels[setting]}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        label={copy.defaultDuration}
        htmlFor="defaultDurationMinutes"
        error={errors.defaultDurationMinutes}
      >
        <input
          id="defaultDurationMinutes"
          type="number"
          min={1}
          disabled={disabled}
          className={inputClasses}
          value={
            values.defaultDurationMinutes === null ||
            values.defaultDurationMinutes === undefined
              ? ""
              : String(values.defaultDurationMinutes)
          }
          onChange={(event) =>
            onChange({
              ...values,
              defaultDurationMinutes: event.target.value,
            })
          }
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <FormField
        label={copy.mobilityNotes}
        htmlFor="mobilityNotes"
        error={errors.mobilityNotes}
        className="lg:col-span-2"
      >
        <textarea
          id="mobilityNotes"
          disabled={disabled}
          className={textareaClasses}
          value={values.mobilityNotes ?? ""}
          onChange={(event) =>
            onChange({ ...values, mobilityNotes: event.target.value || null })
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

export const defaultActivityFormValues: ActivityInputFormValues = {
  title: "",
  description: "",
  category: "social",
  intensity: "low",
  location: null,
  allowedSettings: [],
  defaultDurationMinutes: "",
  minParticipants: 1,
  maxParticipants: 8,
  mobilityNotes: null,
};
