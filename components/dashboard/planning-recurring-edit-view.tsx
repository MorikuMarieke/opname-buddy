"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { RecurringScheduleForm } from "@/components/forms/recurring-schedule-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useRecurringSchedule,
  useUpdateRecurringSchedule,
} from "@/hooks/use-recurring-schedules";
import { useActivities } from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { inferScheduleDurationState } from "@/lib/utils/planning-time";
import {
  getScheduleDurationFieldErrors,
  syncScheduleEndTime,
} from "@/lib/validations/schedule-duration";
import {
  recurringScheduleInputSchema,
  type RecurringScheduleFormValues,
} from "@/lib/validations/recurring-schedule";
import type { ActivityRecurringSchedule } from "@/types/activity";

interface PlanningRecurringEditViewProps {
  scheduleId: string;
}

function toFormValues(
  schedule: ActivityRecurringSchedule,
  activityDefaultDurationMinutes?: number | null,
): RecurringScheduleFormValues {
  const durationState = inferScheduleDurationState(
    schedule.startTime,
    schedule.endTime,
    activityDefaultDurationMinutes,
  );

  return {
    activityId: schedule.activityId,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    ...durationState,
    location: schedule.location,
    minParticipants: schedule.minParticipants,
    maxParticipants: schedule.maxParticipants,
  };
}

interface PlanningRecurringEditFormProps {
  schedule: ActivityRecurringSchedule;
  scheduleId: string;
}

function PlanningRecurringEditForm({
  schedule,
  scheduleId,
}: PlanningRecurringEditFormProps) {
  const router = useRouter();
  const updateMutation = useUpdateRecurringSchedule(scheduleId);
  const { data: activities } = useActivities();
  const activityDefaultDurationMinutes = (activities ?? []).find(
    (activity) => activity.id === schedule.activityId,
  )?.defaultDurationMinutes;
  const durationHydratedRef = useRef(false);
  const [values, setValues] = useState(() => toFormValues(schedule));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (durationHydratedRef.current || activityDefaultDurationMinutes == null) {
      return;
    }

    durationHydratedRef.current = true;
    setValues((current) => ({
      ...current,
      ...inferScheduleDurationState(
        current.startTime,
        current.endTime,
        activityDefaultDurationMinutes,
      ),
    }));
  }, [activityDefaultDurationMinutes]);

  async function handleSubmit() {
    const syncedValues = syncScheduleEndTime(
      values,
      activityDefaultDurationMinutes,
    );
    const durationErrors = getScheduleDurationFieldErrors(
      syncedValues,
      activityDefaultDurationMinutes,
    );

    if (Object.keys(durationErrors).length > 0) {
      setErrors(durationErrors);
      return;
    }

    const parsed = recurringScheduleInputSchema.safeParse(syncedValues);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      await updateMutation.mutateAsync(parsed.data);
      router.push(`/planning/series/${scheduleId}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  async function handleToggleActive() {
    try {
      await updateMutation.mutateAsync({ isActive: !schedule.isActive });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Status wijzigen mislukt.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={PLANNING_COPY.recurring.editTitle}
        description={PLANNING_COPY.recurring.pageDescription}
        size="compact"
        action={
          <SecondaryButton
            size="sm"
            onClick={handleToggleActive}
            disabled={updateMutation.isPending}
          >
            {schedule.isActive
              ? PLANNING_COPY.activities.deactivateButton
              : PLANNING_COPY.activities.reactivateButton}
          </SecondaryButton>
        }
      />
      <DashboardCard density="compact">
        <RecurringScheduleForm
          values={values}
          onChange={setValues}
          errors={errors}
          disabled={updateMutation.isPending}
          submitLabel={PLANNING_COPY.recurring.saveButton}
          onCancel={() => router.push(`/planning/series/${scheduleId}`)}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}

export function PlanningRecurringEditView({ scheduleId }: PlanningRecurringEditViewProps) {
  const { data: schedule, isLoading, isError } = useRecurringSchedule(scheduleId);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Schema laden…</p>;
  }

  if (isError || !schedule) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Schema niet gevonden.
      </p>
    );
  }

  return (
    <PlanningRecurringEditForm
      key={`${schedule.id}-${schedule.updatedAt}`}
      schedule={schedule}
      scheduleId={scheduleId}
    />
  );
}
