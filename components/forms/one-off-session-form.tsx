"use client";



import { FormField } from "@/components/forms/form-field";

import { ScheduleTimeFields } from "@/components/forms/schedule-time-fields";

import { PrimaryButton } from "@/components/ui/primary-button";

import { SecondaryButton } from "@/components/ui/secondary-button";

import { useActivities } from "@/hooks/use-activities";

import { PLANNING_COPY } from "@/lib/constants/planning-copy";

import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";

import { applyActivityDefaultDuration } from "@/lib/utils/planning-time";

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

  const selectedActivity = activeActivities.find(

    (activity) => activity.id === values.activityId,

  );



  function handleActivityChange(activityId: string) {

    const activity = activeActivities.find((item) => item.id === activityId);

    if (!activity) {

      onChange({ ...values, activityId });

      return;

    }



    onChange(

      applyActivityDefaultDuration(

        {

          ...values,

          activityId,

          location: activity.location?.trim() ?? "",

          minParticipants: activity.minParticipants,

          maxParticipants: activity.maxParticipants,

        },

        activity.defaultDurationMinutes,

      ),

    );

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



      <ScheduleTimeFields

        values={values}

        activityDefaultDurationMinutes={selectedActivity?.defaultDurationMinutes}

        onChange={(nextValues) => onChange({ ...values, ...nextValues })}

        errors={errors}

        disabled={disabled}

      />



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



export const defaultOneOffSessionFormValues: OneOffSessionFormValues = {

  activityId: "",

  sessionDate: getAmsterdamDateString(),

  startTime: "10:00",

  endTime: "11:30",

  useCustomDuration: false,

  customDurationMinutes: 90,

  location: "",

  minParticipants: 1,

  maxParticipants: 8,

  notes: null,

};


