"use client";

import { useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  useCreateQuestion,
  useUpdateQuestion,
} from "@/hooks/use-patient-questions";
import { getFieldErrors, getFirstErrorMessage } from "@/lib/validations/error-messages";
import {
  patientQuestionSchema,
  type PatientQuestionFormValues,
} from "@/lib/validations/patient-question";
import {
  CAREGIVER_TARGET_OPTIONS,
  type PatientQuestion,
} from "@/types/patient";

interface QuestionFormProps {
  existingQuestion?: PatientQuestion | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultValues: PatientQuestionFormValues = {
  question_text: "",
  target_type: "nurse",
};

function toFormValues(question: PatientQuestion): PatientQuestionFormValues {
  return {
    question_text: question.question_text,
    target_type: question.target_type as PatientQuestionFormValues["target_type"],
  };
}

export function QuestionForm({
  existingQuestion,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const [values, setValues] = useState<PatientQuestionFormValues>(
    existingQuestion ? toFormValues(existingQuestion) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const isSubmitting = createQuestion.isPending || updateQuestion.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    const parsed = patientQuestionSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues));
      setFormError(getFirstErrorMessage(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    try {
      if (existingQuestion) {
        await updateQuestion.mutateAsync({
          id: existingQuestion.id,
          input: parsed.data,
        });
      } else {
        await createQuestion.mutateAsync(parsed.data);
      }

      onSuccess();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Opslaan is mislukt. Probeer het opnieuw.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Voor wie is je vraag?"
        htmlFor="target_type"
        error={fieldErrors.target_type}
      >
        <FormSelect
          id="target_type"
          value={values.target_type}
          disabled={isSubmitting}
          options={CAREGIVER_TARGET_OPTIONS}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              target_type: event.target.value as PatientQuestionFormValues["target_type"],
            }))
          }
        />
      </FormField>

      <FormField
        label="Je vraag"
        htmlFor="question_text"
        hint="Schrijf je vraag zoals je die wilt stellen tijdens een gesprek."
        error={fieldErrors.question_text}
      >
        <FormTextarea
          id="question_text"
          value={values.question_text}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              question_text: event.target.value,
            }))
          }
          placeholder="Bijv. Wanneer mag ik weer korte stukjes lopen?"
        />
      </FormField>

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <PrimaryButton type="submit" disabled={isSubmitting} className="sm:flex-1">
          {isSubmitting
            ? "Bezig met opslaan..."
            : existingQuestion
              ? "Wijzigingen opslaan"
              : "Vraag opslaan"}
        </PrimaryButton>
        <SecondaryButton
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="sm:flex-1"
        >
          Annuleren
        </SecondaryButton>
      </div>
    </form>
  );
}
