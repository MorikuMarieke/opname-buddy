"use client";

import { useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { formInputClasses } from "@/components/forms/form-styles";
import { FormTextarea } from "@/components/forms/form-textarea";
import { LikertScale } from "@/components/forms/likert-scale";
import { PainScale } from "@/components/forms/pain-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  useCreateCheckIn,
  useUpdateCheckIn,
} from "@/hooks/use-patient-checkins";
import { getFieldErrors, getFirstErrorMessage } from "@/lib/validations/error-messages";
import {
  patientCheckinFormSchema,
  type PatientCheckinFormValues,
} from "@/lib/validations/patient-checkin";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { PatientCheckin } from "@/types/patient";

interface CheckinFormProps {
  existingCheckIn?: PatientCheckin | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const defaultValues: PatientCheckinFormValues = {
  check_in_date: getAmsterdamDateString(),
  pain_score: 0,
  energy_level: 3,
  mood: 3,
  mobility_level: 3,
  motivation_score: 3,
  symptoms: "",
  note: "",
};

function toFormValues(checkIn: PatientCheckin): PatientCheckinFormValues {
  return {
    check_in_date: checkIn.check_in_date,
    pain_score: checkIn.pain_score,
    energy_level: checkIn.energy_level,
    mood: checkIn.mood,
    mobility_level: checkIn.mobility_level,
    motivation_score: checkIn.motivation_score,
    symptoms: checkIn.symptoms,
    note: checkIn.note ?? "",
  };
}

export function CheckinForm({
  existingCheckIn,
  onSuccess,
  onCancel,
}: CheckinFormProps) {
  const [values, setValues] = useState<PatientCheckinFormValues>(
    existingCheckIn ? toFormValues(existingCheckIn) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();

  const isSubmitting = createCheckIn.isPending || updateCheckIn.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    const parsed = patientCheckinFormSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues));
      setFormError(getFirstErrorMessage(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    try {
      if (existingCheckIn) {
        await updateCheckIn.mutateAsync({
          id: existingCheckIn.id,
          input: parsed.data,
        });
      } else {
        await createCheckIn.mutateAsync(parsed.data);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Pijn"
        htmlFor="pain_score"
        error={fieldErrors.pain_score}
      >
        <PainScale
          id="pain_score"
          value={values.pain_score}
          disabled={isSubmitting}
          onChange={(pain_score) =>
            setValues((current) => ({ ...current, pain_score }))
          }
        />
      </FormField>

      <LikertScale
        id="energy_level"
        label="Energie"
        value={values.energy_level}
        disabled={isSubmitting}
        onChange={(energy_level) =>
          setValues((current) => ({ ...current, energy_level }))
        }
      />

      <LikertScale
        id="mood"
        label="Stemming"
        value={values.mood}
        disabled={isSubmitting}
        onChange={(mood) => setValues((current) => ({ ...current, mood }))}
      />

      <LikertScale
        id="mobility_level"
        label="Mobiliteit"
        value={values.mobility_level}
        disabled={isSubmitting}
        onChange={(mobility_level) =>
          setValues((current) => ({ ...current, mobility_level }))
        }
      />

      <LikertScale
        id="motivation_score"
        label="Motivatie voor activiteit"
        value={values.motivation_score}
        disabled={isSubmitting}
        onChange={(motivation_score) =>
          setValues((current) => ({ ...current, motivation_score }))
        }
      />

      <FormField
        label="Symptomen"
        htmlFor="symptoms"
        hint="Beschrijf kort wat je merkt, of laat leeg als je geen bijzondere symptomen hebt."
        error={fieldErrors.symptoms}
      >
        <input
          id="symptoms"
          type="text"
          value={values.symptoms}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              symptoms: event.target.value,
            }))
          }
          placeholder="Bijv. lichte hoofdpijn"
          className={formInputClasses}
        />
      </FormField>

      <FormField
        label="Notitie (optioneel)"
        htmlFor="note"
        error={fieldErrors.note}
      >
        <FormTextarea
          id="note"
          value={values.note ?? ""}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((current) => ({ ...current, note: event.target.value }))
          }
          placeholder="Alles wat je kwijt wilt over hoe je je vandaag voelt."
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
            : existingCheckIn
              ? "Wijzigingen opslaan"
              : "Check-in opslaan"}
        </PrimaryButton>
        {onCancel ? (
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="sm:flex-1"
          >
            Annuleren
          </SecondaryButton>
        ) : null}
      </div>
    </form>
  );
}
