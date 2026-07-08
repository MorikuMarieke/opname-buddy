"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ActivityForm,
  defaultActivityFormValues,
} from "@/components/forms/activity-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useCreateActivity } from "@/hooks/use-activities";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import { activityInputSchema } from "@/lib/validations/activity";
import type { ActivityInputFormValues } from "@/lib/validations/activity";

export function PlanningActivityCreateView() {
  const router = useRouter();
  const createMutation = useCreateActivity();
  const [values, setValues] = useState<ActivityInputFormValues>(
    defaultActivityFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

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
      const activity = await createMutation.mutateAsync(parsed.data);
      router.push(`/planning/activities/${activity.id}/edit`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={PLANNING_COPY.activities.newTitle}
        description={PLANNING_COPY.activities.pageDescription}
        size="compact"
      />
      <DashboardCard density="compact">
        <ActivityForm
          values={values}
          onChange={setValues}
          errors={errors}
          disabled={createMutation.isPending}
          submitLabel={PLANNING_COPY.activities.saveButton}
          onCancel={() => router.push("/planning/activities")}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}
