"use client";

import { useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { formInputClasses, formSelectClasses, formTextareaClasses } from "@/components/forms/form-styles";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  AFTERNOON_CATEGORY_LABELS,
  AFTERNOON_CATEGORY_VALUES,
  type AfternoonCategoryValue,
} from "@/lib/constants/daily-participation";
import { getFieldErrors, getFirstErrorMessage } from "@/lib/validations/error-messages";
import {
  upsertDailyParticipationPlanSchema,
  type UpsertDailyParticipationPlanValues,
} from "@/lib/validations/daily-participation";
import type { DailyParticipationPlanWithAudit } from "@/lib/services/daily-participation";

interface AfternoonActivityRecordFormProps {
  planDate: string;
  existingPlan: DailyParticipationPlanWithAudit | null;
  suggestedCategory?: AfternoonCategoryValue | null;
  isSubmitting: boolean;
  onSubmit: (values: UpsertDailyParticipationPlanValues) => Promise<void>;
}

export function AfternoonActivityRecordForm({
  planDate,
  existingPlan,
  suggestedCategory,
  isSubmitting,
  onSubmit,
}: AfternoonActivityRecordFormProps) {
  const [values, setValues] = useState<UpsertDailyParticipationPlanValues>(() => ({
    plan_date: planDate,
    afternoon_category:
      existingPlan?.afternoon_category ?? suggestedCategory ?? null,
    afternoon_title: existingPlan?.afternoon_title ?? "",
    participant_message: existingPlan?.participant_message ?? "",
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    const parsed = upsertDailyParticipationPlanSchema.safeParse({
      ...values,
      afternoon_title: values.afternoon_title || null,
      participant_message: values.participant_message || null,
    });

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues));
      setFormError(getFirstErrorMessage(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    try {
      await onSubmit(parsed.data);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Opslaan is mislukt. Probeer het opnieuw.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Categorie"
        htmlFor="afternoon_category"
        error={fieldErrors.afternoon_category}
      >
        <select
          id="afternoon_category"
          value={values.afternoon_category ?? ""}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              afternoon_category: event.target.value
                ? (event.target.value as AfternoonCategoryValue)
                : null,
            }))
          }
          className={formSelectClasses}
        >
          <option value="">Kies een categorie</option>
          {AFTERNOON_CATEGORY_VALUES.map((category) => (
            <option key={category} value={category}>
              {AFTERNOON_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Activiteitstitel"
        htmlFor="afternoon_title"
        error={fieldErrors.afternoon_title}
      >
        <input
          id="afternoon_title"
          type="text"
          value={values.afternoon_title ?? ""}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              afternoon_title: event.target.value,
            }))
          }
          placeholder="Bijv. Creatieve middag"
          className={formInputClasses}
        />
      </FormField>

      <FormField
        label="Bericht voor patiënten (optioneel)"
        htmlFor="participant_message"
        error={fieldErrors.participant_message}
      >
        <textarea
          id="participant_message"
          value={values.participant_message ?? ""}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              participant_message: event.target.value,
            }))
          }
          placeholder="Korte uitleg die patiënten te zien krijgen."
          className={formTextareaClasses}
        />
      </FormField>

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Bezig met opslaan..." : "Middagactiviteit vastleggen"}
      </PrimaryButton>
    </form>
  );
}
