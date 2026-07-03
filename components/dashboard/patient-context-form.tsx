"use client";

import { useState } from "react";

import { ContextFormField } from "@/components/dashboard/patient-context/context-form-field";
import { ContextFormSectionLabel } from "@/components/dashboard/patient-context/context-form-section-label";
import { ContextFormSelect } from "@/components/dashboard/patient-context/context-form-select";
import { AttentionPointChips } from "@/components/forms/attention-point-chips";
import { formTextareaClasses } from "@/components/forms/form-styles";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useUpsertPatientContext } from "@/hooks/use-patient-context";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { getCriticalFieldsForContext } from "@/lib/patient-context/completeness";
import { mobilityStatusShowsAidFields } from "@/lib/patient-context/mobility-aid";
import {
  getFieldErrors,
  getFirstErrorMessage,
} from "@/lib/validations/error-messages";
import {
  defaultPatientContextFormValues,
  patientContextFormSchema,
  toFormValues,
  type PatientContextFormValues,
} from "@/lib/validations/patient-context";
import { cn } from "@/lib/utils/cn";
import {
  FALL_RISK_OPTIONS,
  GUIDANCE_LEVEL_OPTIONS,
  ISOLATION_TYPE_OPTIONS,
  MOBILITY_AID_AVAILABLE_OPTIONS,
  MOBILITY_AID_TYPE_OPTIONS,
  MOBILITY_STATUS_OPTIONS,
  MOVEMENT_FREEDOM_OPTIONS,
  PATIENT_CONTEXT_FIELD_LABELS,
  TRANSFER_SUPPORT_OPTIONS,
  type PatientContext,
} from "@/types/patient-context";

interface PatientContextFormProps {
  patientId: string;
  existingContext: PatientContext | null;
  onSuccess?: () => void;
}

function isFieldIncomplete(
  values: PatientContextFormValues,
  field: string,
): boolean {
  const criticalFields = getCriticalFieldsForContext({
    mobility_status: values.mobility_status,
  } as PatientContext);

  if (!criticalFields.includes(field as never)) {
    return false;
  }

  return values[field as keyof PatientContextFormValues] === "unknown";
}

const compactTextareaClasses = cn(
  formTextareaClasses,
  "min-h-0 resize-y py-2",
);

export function PatientContextForm({
  patientId,
  existingContext,
  onSuccess,
}: PatientContextFormProps) {
  const [values, setValues] = useState<PatientContextFormValues>(
    existingContext ? toFormValues(existingContext) : defaultPatientContextFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const upsertContext = useUpsertPatientContext(patientId);
  const showAidFields = mobilityStatusShowsAidFields(values.mobility_status);
  const showOtherNotes = values.additional_attention_points.includes("other");

  function updateField<K extends keyof PatientContextFormValues>(
    field: K,
    value: PatientContextFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setSavedMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (upsertContext.isPending) {
      return;
    }

    setFormError(null);
    setSavedMessage(null);

    const parsed = patientContextFormSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues));
      setFormError(getFirstErrorMessage(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    try {
      await upsertContext.mutateAsync(parsed.data);
      setSavedMessage("Zorgcontext opgeslagen.");
      onSuccess?.();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Opslaan is niet gelukt.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <DashboardCard density="compact" padding="sm" className="space-y-3">
        <ContextFormSectionLabel>
          {PATIENT_CONTEXT_COPY.sections.core}
        </ContextFormSectionLabel>

        <div className="grid gap-2 md:grid-cols-2">
          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.mobility_status}
            htmlFor="mobility_status"
            error={fieldErrors.mobility_status}
            incomplete={isFieldIncomplete(values, "mobility_status")}
          >
            <ContextFormSelect
              id="mobility_status"
              value={values.mobility_status}
              options={MOBILITY_STATUS_OPTIONS}
              onChange={(event) =>
                updateField(
                  "mobility_status",
                  event.target.value as PatientContextFormValues["mobility_status"],
                )
              }
            />
          </ContextFormField>

          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.transfer_support}
            htmlFor="transfer_support"
            error={fieldErrors.transfer_support}
            incomplete={isFieldIncomplete(values, "transfer_support")}
          >
            <ContextFormSelect
              id="transfer_support"
              value={values.transfer_support}
              options={TRANSFER_SUPPORT_OPTIONS}
              onChange={(event) =>
                updateField(
                  "transfer_support",
                  event.target.value as PatientContextFormValues["transfer_support"],
                )
              }
            />
          </ContextFormField>

          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.fall_risk}
            htmlFor="fall_risk"
            error={fieldErrors.fall_risk}
            incomplete={isFieldIncomplete(values, "fall_risk")}
          >
            <ContextFormSelect
              id="fall_risk"
              value={values.fall_risk}
              options={FALL_RISK_OPTIONS}
              onChange={(event) =>
                updateField(
                  "fall_risk",
                  event.target.value as PatientContextFormValues["fall_risk"],
                )
              }
            />
          </ContextFormField>

          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.requires_supervision}
            htmlFor="requires_supervision"
            error={fieldErrors.requires_supervision}
            incomplete={isFieldIncomplete(values, "requires_supervision")}
          >
            <ContextFormSelect
              id="requires_supervision"
              value={values.requires_supervision}
              options={GUIDANCE_LEVEL_OPTIONS}
              onChange={(event) =>
                updateField(
                  "requires_supervision",
                  event.target.value as PatientContextFormValues["requires_supervision"],
                )
              }
            />
          </ContextFormField>

          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.room_restriction}
            htmlFor="room_restriction"
            error={fieldErrors.room_restriction}
            incomplete={isFieldIncomplete(values, "room_restriction")}
          >
            <ContextFormSelect
              id="room_restriction"
              value={values.room_restriction}
              options={MOVEMENT_FREEDOM_OPTIONS}
              onChange={(event) =>
                updateField(
                  "room_restriction",
                  event.target.value as PatientContextFormValues["room_restriction"],
                )
              }
            />
          </ContextFormField>

          <ContextFormField
            label={PATIENT_CONTEXT_FIELD_LABELS.isolation_type}
            htmlFor="isolation_type"
            error={fieldErrors.isolation_type}
            incomplete={isFieldIncomplete(values, "isolation_type")}
          >
            <ContextFormSelect
              id="isolation_type"
              value={values.isolation_type}
              options={ISOLATION_TYPE_OPTIONS}
              onChange={(event) =>
                updateField(
                  "isolation_type",
                  event.target.value as PatientContextFormValues["isolation_type"],
                )
              }
            />
          </ContextFormField>
        </div>

        {showAidFields ? (
          <div className="grid gap-2 border-t border-parchment-100 pt-2 md:grid-cols-2">
            <ContextFormField
              label={PATIENT_CONTEXT_FIELD_LABELS.mobility_aid_type}
              htmlFor="mobility_aid_type"
              hint="Optioneel"
              error={fieldErrors.mobility_aid_type}
            >
              <ContextFormSelect
                id="mobility_aid_type"
                value={values.mobility_aid_type}
                options={MOBILITY_AID_TYPE_OPTIONS}
                onChange={(event) =>
                  updateField(
                    "mobility_aid_type",
                    event.target.value as PatientContextFormValues["mobility_aid_type"],
                  )
                }
              />
            </ContextFormField>

            <ContextFormField
              label={PATIENT_CONTEXT_FIELD_LABELS.mobility_aid_available}
              htmlFor="mobility_aid_available"
              error={fieldErrors.mobility_aid_available}
              incomplete={isFieldIncomplete(values, "mobility_aid_available")}
            >
              <ContextFormSelect
                id="mobility_aid_available"
                value={values.mobility_aid_available}
                options={MOBILITY_AID_AVAILABLE_OPTIONS}
                onChange={(event) =>
                  updateField(
                    "mobility_aid_available",
                    event.target.value as PatientContextFormValues["mobility_aid_available"],
                  )
                }
              />
            </ContextFormField>
          </div>
        ) : null}

        <ContextFormSectionLabel optional>
          {PATIENT_CONTEXT_COPY.sections.optional}
        </ContextFormSectionLabel>

        <p className="text-xs text-carbon-black-500">
          {PATIENT_CONTEXT_COPY.optionalHint}
        </p>

        <AttentionPointChips
          density="compact"
          value={values.additional_attention_points}
          onChange={(points) => updateField("additional_attention_points", points)}
        />

        {showOtherNotes ? (
          <ContextFormField
            label={PATIENT_CONTEXT_COPY.attentionOtherLabel}
            htmlFor="additional_attention_notes"
            error={fieldErrors.additional_attention_notes}
          >
            <textarea
              id="additional_attention_notes"
              rows={2}
              value={values.additional_attention_notes}
              onChange={(event) =>
                updateField("additional_attention_notes", event.target.value)
              }
              className={compactTextareaClasses}
            />
          </ContextFormField>
        ) : null}

        <ContextFormField
          label={PATIENT_CONTEXT_COPY.notesLabel}
          htmlFor="notes"
          error={fieldErrors.notes}
        >
          <textarea
            id="notes"
            rows={2}
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className={compactTextareaClasses}
          />
        </ContextFormField>

        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        {savedMessage ? (
          <p className="text-sm text-pearl-aqua-700" role="status">
            {savedMessage}
          </p>
        ) : null}

        <div className="flex justify-end pt-1">
          <PrimaryButton type="submit" disabled={upsertContext.isPending}>
            {upsertContext.isPending ? "Opslaan..." : "Opslaan"}
          </PrimaryButton>
        </div>
      </DashboardCard>
    </form>
  );
}
