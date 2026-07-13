"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  defaultOneOffSessionFormValues,
  OneOffSessionForm,
} from "@/components/forms/one-off-session-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useCreateOneOffSession } from "@/hooks/use-planning-sessions";
import { useActivities } from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { oneOffSessionInputSchema } from "@/lib/validations/activity-session";
import type { OneOffSessionFormValues } from "@/lib/validations/activity-session";
import {
  getScheduleDurationFieldErrors,
  syncScheduleEndTime,
} from "@/lib/validations/schedule-duration";

export function PlanningSessionCreateView() {
  const router = useRouter();
  const createMutation = useCreateOneOffSession();
  const { data: activities } = useActivities();
  const [values, setValues] = useState<OneOffSessionFormValues>(
    defaultOneOffSessionFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  async function handleSubmit() {
    const activityDefaultDurationMinutes = (activities ?? []).find(
      (activity) => activity.id === values.activityId,
    )?.defaultDurationMinutes;
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

    const parsed = oneOffSessionInputSchema.safeParse(syncedValues);

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
      const session = await createMutation.mutateAsync(parsed.data);
      router.push(`/planning/sessions/${session.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={PLANNING_COPY.sessions.newTitle}
        description={PLANNING_COPY.sessions.pageDescription}
        size="compact"
      />
      <DashboardCard density="compact">
        <OneOffSessionForm
          values={values}
          onChange={setValues}
          errors={errors}
          disabled={createMutation.isPending}
          submitLabel={PLANNING_COPY.sessions.saveButton}
          onCancel={() => router.push("/planning/sessions")}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}
