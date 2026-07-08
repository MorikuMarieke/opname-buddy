"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  defaultRecurringScheduleFormValues,
  RecurringScheduleForm,
} from "@/components/forms/recurring-schedule-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useRecurringSchedule,
  useUpdateRecurringSchedule,
} from "@/hooks/use-recurring-schedules";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  recurringScheduleInputSchema,
  type RecurringScheduleFormValues,
} from "@/lib/validations/recurring-schedule";
import type { ActivityRecurringSchedule } from "@/types/activity";

interface PlanningRecurringEditViewProps {
  scheduleId: string;
}

function toFormValues(schedule: ActivityRecurringSchedule): RecurringScheduleFormValues {
  return {
    activityId: schedule.activityId,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    location: schedule.location,
    minParticipants: schedule.minParticipants,
    maxParticipants: schedule.maxParticipants,
  };
}

export function PlanningRecurringEditView({ scheduleId }: PlanningRecurringEditViewProps) {
  const router = useRouter();
  const { data: schedule, isLoading, isError } = useRecurringSchedule(scheduleId);
  const updateMutation = useUpdateRecurringSchedule(scheduleId);
  const [values, setValues] = useState<RecurringScheduleFormValues>(
    defaultRecurringScheduleFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (schedule) {
      setValues(toFormValues(schedule));
    }
  }, [schedule]);

  async function handleSubmit() {
    const parsed = recurringScheduleInputSchema.safeParse(values);

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
      router.push("/planning/recurring");
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  async function handleToggleActive() {
    if (!schedule) return;

    try {
      await updateMutation.mutateAsync({ isActive: !schedule.isActive });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Status wijzigen mislukt.",
      });
    }
  }

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
          onCancel={() => router.push("/planning/recurring")}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}
