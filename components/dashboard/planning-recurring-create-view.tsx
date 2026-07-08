"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  defaultRecurringScheduleFormValues,
  RecurringScheduleForm,
} from "@/components/forms/recurring-schedule-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useCreateRecurringSchedule } from "@/hooks/use-recurring-schedules";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import {
  recurringScheduleInputSchema,
  type RecurringScheduleFormValues,
} from "@/lib/validations/recurring-schedule";

export function PlanningRecurringCreateView() {
  const router = useRouter();
  const createMutation = useCreateRecurringSchedule();
  const [values, setValues] = useState<RecurringScheduleFormValues>(
    defaultRecurringScheduleFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

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
      await createMutation.mutateAsync(parsed.data);
      router.push("/planning/recurring");
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Opslaan mislukt.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={PLANNING_COPY.recurring.newTitle}
        description={PLANNING_COPY.recurring.pageDescription}
        size="compact"
      />
      <DashboardCard density="compact">
        <RecurringScheduleForm
          values={values}
          onChange={setValues}
          errors={errors}
          disabled={createMutation.isPending}
          submitLabel={PLANNING_COPY.recurring.saveButton}
          onCancel={() => router.push("/planning/recurring")}
          onSubmit={handleSubmit}
        />
      </DashboardCard>
    </div>
  );
}
