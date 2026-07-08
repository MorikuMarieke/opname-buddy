"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ActivityForm,
  defaultActivityFormValues,
} from "@/components/forms/activity-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useActivity,
  useSetActivityActive,
  useUpdateActivity,
} from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { activityInputSchema } from "@/lib/validations/activity";
import type { ActivityInputFormValues } from "@/lib/validations/activity";
import type { Activity } from "@/types/activity";

interface PlanningActivityEditViewProps {
  activityId: string;
}

function toFormValues(activity: Activity): ActivityInputFormValues {
  return {
    title: activity.title,
    description: activity.description,
    category: activity.category,
    intensity: activity.intensity,
    location: activity.location,
    allowedSettings: activity.allowedSettings,
    defaultDurationMinutes: activity.defaultDurationMinutes ?? "",
    minParticipants: activity.minParticipants,
    maxParticipants: activity.maxParticipants,
    requiresSupervision: activity.requiresSupervision,
    requiresVolunteer: activity.requiresVolunteer,
    mobilityNotes: activity.mobilityNotes,
  };
}

export function PlanningActivityEditView({ activityId }: PlanningActivityEditViewProps) {
  const router = useRouter();
  const { data: activity, isLoading, isError } = useActivity(activityId);
  const updateMutation = useUpdateActivity(activityId);
  const activeMutation = useSetActivityActive(activityId);
  const [values, setValues] = useState<ActivityInputFormValues>(
    defaultActivityFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (activity) {
      setValues(toFormValues(activity));
    }
  }, [activity]);

  async function handleSubmit() {
    const parsed = activityInputSchema.safeParse(values);

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
      router.push("/planning/activities");
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  async function handleToggleActive() {
    if (!activity) return;

    try {
      await activeMutation.mutateAsync(!activity.isActive);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Status wijzigen mislukt.",
      });
    }
  }

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Activiteit laden…</p>;
  }

  if (isError || !activity) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Activiteit niet gevonden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={PLANNING_COPY.activities.editTitle}
        description={activity.title}
        size="compact"
        action={
          <SecondaryButton
            size="sm"
            onClick={handleToggleActive}
            disabled={activeMutation.isPending}
          >
            {activity.isActive
              ? PLANNING_COPY.activities.deactivateButton
              : PLANNING_COPY.activities.reactivateButton}
          </SecondaryButton>
        }
      />
      <DashboardCard density="compact">
        <ActivityForm
          values={values}
          onChange={setValues}
          errors={errors}
          disabled={updateMutation.isPending || activeMutation.isPending}
          submitLabel={PLANNING_COPY.activities.saveButton}
          onCancel={() => router.push("/planning/activities")}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}
