"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ZodIssue } from "zod";

import { ScheduleTimeFields } from "@/components/forms/schedule-time-fields";
import { FacilitatorPicker } from "@/components/forms/facilitator-picker";
import { FormField } from "@/components/forms/form-field";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { useActivities } from "@/hooks/use-activities";
import { usePlanActivity } from "@/hooks/use-plan-activity";
import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
} from "@/lib/constants/planning-enums";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { applyActivityDefaultDuration } from "@/lib/utils/planning-time";
import {
  getScheduleDurationFieldErrors,
  syncScheduleEndTime,
} from "@/lib/validations/schedule-duration";
import {
  planActivityActivityStepSchema,
  planActivityKindStepSchema,
  planOneOffActivityInputSchema,
  planRecurringActivityInputSchema,
  type PlanActivityFormState,
  type PlanActivityKind,
} from "@/lib/validations/plan-activity";
import { cn } from "@/lib/utils/cn";

const copy = PLANNING_COPY.plan;

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 disabled:opacity-50";

const textareaClasses =
  "min-h-24 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900 disabled:opacity-50";

const STEPS = [
  { id: "activity", label: copy.steps.activity },
  { id: "kind", label: copy.steps.kind },
  { id: "schedule", label: copy.steps.schedule },
  { id: "facilitators", label: copy.steps.facilitators },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function createDefaultFormState(): PlanActivityFormState {
  return {
    activityId: "",
    kind: "",
    sessionDate: getAmsterdamDateString(),
    startTime: "10:00",
    endTime: "11:30",
    useCustomDuration: false,
    customDurationMinutes: 90,
    location: "",
    minParticipants: 1,
    maxParticipants: 8,
    notes: null,
    dayOfWeek: 1,
    recurringLocation: null,
    recurringMinParticipants: null,
    recurringMaxParticipants: null,
    facilitatorUserIds: [],
  };
}

function collectFieldErrors(issues: ZodIssue[]): Partial<Record<string, string>> {
  const fieldErrors: Partial<Record<string, string>> = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    } else if (typeof key === "number" && !fieldErrors[String(key)]) {
      fieldErrors[String(key)] = issue.message;
    }
  }

  return fieldErrors;
}

export function PlanningPlanView() {
  const router = useRouter();
  const planMutation = usePlanActivity();
  const { data: activities } = useActivities();
  const activeActivities = (activities ?? []).filter((activity) => activity.isActive);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<PlanActivityFormState>(createDefaultFormState);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const currentStep = STEPS[stepIndex].id;
  const selectedActivity = activeActivities.find(
    (activity) => activity.id === values.activityId,
  );

  function handleActivityChange(activityId: string) {
    const activity = activeActivities.find((item) => item.id === activityId);
    if (!activity) {
      setValues((current) => ({ ...current, activityId }));
      return;
    }

    setValues((current) => {
      const defaultLocation = activity.location?.trim() ?? "";
      return applyActivityDefaultDuration(
        {
          ...current,
          activityId,
          location: defaultLocation,
          recurringLocation: defaultLocation || null,
          minParticipants: activity.minParticipants,
          maxParticipants: activity.maxParticipants,
        },
        activity.defaultDurationMinutes,
      );
    });
  }

  function getSyncedScheduleValues() {
    return syncScheduleEndTime(
      values,
      selectedActivity?.defaultDurationMinutes,
    );
  }

  function validateScheduleDuration(
    scheduleValues: PlanActivityFormState,
  ): Partial<Record<string, string>> {
    return getScheduleDurationFieldErrors(
      scheduleValues,
      selectedActivity?.defaultDurationMinutes,
    );
  }

  function validateStep(stepId: StepId): boolean {
    if (stepId === "activity") {
      const parsed = planActivityActivityStepSchema.safeParse({
        activityId: values.activityId,
      });
      if (!parsed.success) {
        setErrors(collectFieldErrors(parsed.error.issues));
        return false;
      }
    }

    if (stepId === "kind") {
      const parsed = planActivityKindStepSchema.safeParse({ kind: values.kind });
      if (!parsed.success) {
        setErrors(collectFieldErrors(parsed.error.issues));
        return false;
      }
    }

    if (stepId === "schedule") {
      const scheduleValues = getSyncedScheduleValues();
      const durationErrors = validateScheduleDuration(scheduleValues);

      if (Object.keys(durationErrors).length > 0) {
        setErrors(durationErrors);
        return false;
      }

      if (values.kind === "one_off") {
        const parsed = planOneOffActivityInputSchema.safeParse({
          activityId: scheduleValues.activityId,
          sessionDate: scheduleValues.sessionDate,
          startTime: scheduleValues.startTime,
          endTime: scheduleValues.endTime,
          location: scheduleValues.location,
          minParticipants: scheduleValues.minParticipants,
          maxParticipants: scheduleValues.maxParticipants,
          notes: scheduleValues.notes,
          facilitatorUserIds: [],
        });
        if (!parsed.success) {
          setErrors(collectFieldErrors(parsed.error.issues));
          return false;
        }
      } else if (values.kind === "recurring") {
        const resolvedLocation =
          values.recurringLocation?.trim() ||
          selectedActivity?.location?.trim() ||
          "";
        if (!resolvedLocation) {
          setErrors({ location: "Locatie is verplicht." });
          return false;
        }

        const parsed = planRecurringActivityInputSchema.safeParse({
          activityId: scheduleValues.activityId,
          dayOfWeek: scheduleValues.dayOfWeek,
          startTime: scheduleValues.startTime,
          endTime: scheduleValues.endTime,
          location: resolvedLocation,
          minParticipants: scheduleValues.recurringMinParticipants,
          maxParticipants: scheduleValues.recurringMaxParticipants,
          facilitatorUserIds: [],
        });
        if (!parsed.success) {
          setErrors(collectFieldErrors(parsed.error.issues));
          return false;
        }
      }
    }

    setErrors({});
    return true;
  }

  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit() {
    if (!validateStep("schedule")) {
      setStepIndex(2);
      return;
    }

    setErrors({});

    try {
      const scheduleValues = getSyncedScheduleValues();

      if (values.kind === "one_off") {
        const parsed = planOneOffActivityInputSchema.parse({
          activityId: scheduleValues.activityId,
          sessionDate: scheduleValues.sessionDate,
          startTime: scheduleValues.startTime,
          endTime: scheduleValues.endTime,
          location: scheduleValues.location,
          minParticipants: scheduleValues.minParticipants,
          maxParticipants: scheduleValues.maxParticipants,
          notes: scheduleValues.notes,
          facilitatorUserIds: values.facilitatorUserIds,
        });

        const result = await planMutation.mutateAsync({
          kind: "one_off",
          ...parsed,
        });
        if (result.kind === "one_off") {
          router.push(`/planning/sessions/${result.sessionId}`);
        }
        return;
      }

      if (values.kind === "recurring") {
        const resolvedLocation =
          values.recurringLocation?.trim() ||
          selectedActivity?.location?.trim() ||
          "";
        const parsed = planRecurringActivityInputSchema.parse({
          activityId: scheduleValues.activityId,
          dayOfWeek: scheduleValues.dayOfWeek,
          startTime: scheduleValues.startTime,
          endTime: scheduleValues.endTime,
          location: resolvedLocation,
          minParticipants: scheduleValues.recurringMinParticipants,
          maxParticipants: scheduleValues.recurringMaxParticipants,
          facilitatorUserIds: values.facilitatorUserIds,
        });

        await planMutation.mutateAsync({
          kind: "recurring",
          ...parsed,
        });
        router.push("/planning/series");
        return;
      }

      setErrors({ kind: "Kies een planningstype." });
      setStepIndex(1);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : copy.saveError,
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
        action={
          <SecondaryButton size="sm" href="/planning">
            {copy.cancelButton}
          </SecondaryButton>
        }
      />

      <nav aria-label="Planningsstappen" className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "rounded-full px-3 py-1 text-sm",
              index === stepIndex
                ? "bg-pearl-aqua-200 text-carbon-black-900"
                : index < stepIndex
                  ? "bg-dust-grey-100 text-carbon-black-700"
                  : "bg-parchment-100 text-carbon-black-500",
            )}
          >
            {index + 1}. {step.label}
          </span>
        ))}
      </nav>

      <DashboardCard density="compact">
        {currentStep === "activity" ? (
          <div className="space-y-4">
            <FormField
              label={PLANNING_COPY.sessions.fields.activity}
              htmlFor="activityId"
              error={errors.activityId}
            >
              <select
                id="activityId"
                className={inputClasses}
                value={values.activityId}
                onChange={(event) => handleActivityChange(event.target.value)}
              >
                <option value="">{copy.chooseActivityPlaceholder}</option>
                {activeActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </FormField>
            <p className="text-sm text-carbon-black-600">
              {copy.newActivityHint}{" "}
              <Link
                href="/planning/activities/new"
                className="font-medium text-pearl-aqua-800 underline"
              >
                {copy.newActivityLink}
              </Link>
            </p>
          </div>
        ) : null}

        {currentStep === "kind" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {(["one_off", "recurring"] as const).map((kind) => (
              <label
                key={kind}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                  values.kind === kind
                    ? "border-pearl-aqua-400 bg-pearl-aqua-50"
                    : "border-dust-grey-200",
                )}
              >
                <input
                  type="radio"
                  name="planKind"
                  checked={values.kind === kind}
                  onChange={() => {
                    setValues((current) => {
                      const defaultLocation =
                        selectedActivity?.location?.trim() ??
                        current.location.trim();
                      return {
                        ...current,
                        kind: kind as PlanActivityKind,
                        recurringLocation:
                          kind === "recurring"
                            ? defaultLocation || current.recurringLocation
                            : current.recurringLocation,
                      };
                    });
                  }}
                  className="mt-1 h-5 w-5"
                />
                <span>
                  <span className="block text-sm font-medium text-carbon-black-900">
                    {copy.kindLabels[kind]}
                  </span>
                  <span className="mt-1 block text-sm text-carbon-black-600">
                    {copy.kindDescriptions[kind]}
                  </span>
                </span>
              </label>
            ))}
            {errors.kind ? (
              <p className="text-sm text-red-600 sm:col-span-2" role="alert">
                {errors.kind}
              </p>
            ) : null}
          </div>
        ) : null}

        {currentStep === "schedule" && values.kind === "one_off" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedActivity ? (
              <p className="text-sm text-carbon-black-700 lg:col-span-2">
                {copy.selectedActivityLabel}: {selectedActivity.title}
              </p>
            ) : null}
            <FormField
              label={PLANNING_COPY.sessions.fields.sessionDate}
              htmlFor="sessionDate"
              error={errors.sessionDate}
            >
              <input
                id="sessionDate"
                type="date"
                className={inputClasses}
                value={values.sessionDate}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sessionDate: event.target.value,
                  }))
                }
              />
            </FormField>
            <ScheduleTimeFields
              values={values}
              activityDefaultDurationMinutes={selectedActivity?.defaultDurationMinutes}
              onChange={(nextValues) => setValues((current) => ({ ...current, ...nextValues }))}
              errors={errors}
              ids={{
                startTime: "startTime",
                endTime: "endTime",
                customDuration: "customDurationMinutes",
                useCustomDuration: "useCustomDuration",
              }}
            />
            <FormField
              label={PLANNING_COPY.sessions.fields.location}
              htmlFor="location"
              error={errors.location}
              className="lg:col-span-2"
            >
              <input
                id="location"
                type="text"
                className={inputClasses}
                value={values.location}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={PLANNING_COPY.sessions.fields.minParticipants}
              htmlFor="minParticipants"
              error={errors.minParticipants}
            >
              <input
                id="minParticipants"
                type="number"
                min={1}
                className={inputClasses}
                value={String(values.minParticipants)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    minParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={PLANNING_COPY.sessions.fields.maxParticipants}
              htmlFor="maxParticipants"
              error={errors.maxParticipants}
            >
              <input
                id="maxParticipants"
                type="number"
                min={1}
                className={inputClasses}
                value={String(values.maxParticipants)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    maxParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={PLANNING_COPY.sessions.fields.notes}
              htmlFor="notes"
              error={errors.notes}
              className="lg:col-span-2"
            >
              <textarea
                id="notes"
                className={textareaClasses}
                value={values.notes ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    notes: event.target.value || null,
                  }))
                }
              />
            </FormField>
          </div>
        ) : null}

        {currentStep === "schedule" && values.kind === "recurring" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedActivity ? (
              <p className="text-sm text-carbon-black-700 lg:col-span-2">
                {copy.selectedActivityLabel}: {selectedActivity.title}
              </p>
            ) : null}
            <FormField
              label={PLANNING_COPY.recurring.fields.dayOfWeek}
              htmlFor="dayOfWeek"
              error={errors.dayOfWeek}
            >
              <select
                id="dayOfWeek"
                className={inputClasses}
                value={values.dayOfWeek}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    dayOfWeek: Number(event.target.value),
                  }))
                }
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {DAY_OF_WEEK_LABELS[day]}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="hidden lg:block" />
            <ScheduleTimeFields
              values={values}
              activityDefaultDurationMinutes={selectedActivity?.defaultDurationMinutes}
              onChange={(nextValues) => setValues((current) => ({ ...current, ...nextValues }))}
              errors={errors}
              ids={{
                startTime: "recurringStartTime",
                endTime: "recurringEndTime",
                customDuration: "recurringCustomDuration",
                useCustomDuration: "recurringUseCustomDuration",
              }}
            />
            <FormField
              label={PLANNING_COPY.recurring.fields.location}
              htmlFor="recurringLocation"
              hint={PLANNING_COPY.recurring.fields.locationHint}
              error={errors.location}
              className="lg:col-span-2"
            >
              <input
                id="recurringLocation"
                type="text"
                className={inputClasses}
                value={values.recurringLocation ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    recurringLocation: event.target.value || null,
                  }))
                }
              />
            </FormField>
            <FormField
              label={PLANNING_COPY.recurring.fields.minParticipants}
              htmlFor="recurringMinParticipants"
              error={errors.minParticipants}
            >
              <input
                id="recurringMinParticipants"
                type="number"
                min={1}
                className={inputClasses}
                value={
                  values.recurringMinParticipants === null ||
                  values.recurringMinParticipants === undefined
                    ? ""
                    : String(values.recurringMinParticipants)
                }
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    recurringMinParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label={PLANNING_COPY.recurring.fields.maxParticipants}
              htmlFor="recurringMaxParticipants"
              error={errors.maxParticipants}
            >
              <input
                id="recurringMaxParticipants"
                type="number"
                min={1}
                className={inputClasses}
                value={
                  values.recurringMaxParticipants === null ||
                  values.recurringMaxParticipants === undefined
                    ? ""
                    : String(values.recurringMaxParticipants)
                }
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    recurringMaxParticipants: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>
        ) : null}

        {currentStep === "facilitators" ? (
          <div className="space-y-4">
            {selectedActivity ? (
              <p className="text-sm text-carbon-black-700">
                {copy.summaryPrefix}{" "}
                <span className="font-medium">{selectedActivity.title}</span>
                {" · "}
                {values.kind === "one_off"
                  ? copy.kindLabels.one_off
                  : copy.kindLabels.recurring}
              </p>
            ) : null}
            <FacilitatorPicker
              selectedUserIds={values.facilitatorUserIds}
              onChange={(facilitatorUserIds) =>
                setValues((current) => ({ ...current, facilitatorUserIds }))
              }
              disabled={planMutation.isPending}
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {stepIndex > 0 ? (
            <SecondaryButton
              type="button"
              onClick={handleBack}
              disabled={planMutation.isPending}
            >
              {copy.backButton}
            </SecondaryButton>
          ) : null}
          {stepIndex < STEPS.length - 1 ? (
            <PrimaryButton type="button" onClick={handleNext}>
              {copy.nextButton}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              onClick={handleSubmit}
              disabled={planMutation.isPending}
            >
              {copy.saveButton}
            </PrimaryButton>
          )}
        </div>

        {errors.submit ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}
      </DashboardCard>
    </div>
  );
}
