"use client";

import { Pencil, Trash2 } from "lucide-react";

import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CAREGIVER_TARGET_LABELS,
  QUESTION_STATUS_LABELS,
  type CaregiverTargetType,
  type PatientQuestion,
  type QuestionStatus,
} from "@/types/patient";

interface QuestionCardProps {
  question: PatientQuestion;
  onEdit: (question: PatientQuestion) => void;
  onDelete: (question: PatientQuestion) => void;
  isDeleting?: boolean;
}

function getStatusVariant(
  status: string,
): "neutral" | "attention" | "positive" {
  if (status === "open") {
    return "attention";
  }

  if (status === "answered") {
    return "positive";
  }

  return "neutral";
}

export function QuestionCard({
  question,
  onEdit,
  onDelete,
  isDeleting = false,
}: QuestionCardProps) {
  const isOpen = question.status === "open";
  const targetLabel =
    CAREGIVER_TARGET_LABELS[question.target_type as CaregiverTargetType] ??
    question.target_type;
  const statusLabel =
    QUESTION_STATUS_LABELS[question.status as QuestionStatus] ??
    question.status;

  return (
    <article className="rounded-2xl border border-parchment-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant="neutral">{targetLabel}</StatusBadge>
        <StatusBadge variant={getStatusVariant(question.status)}>
          {statusLabel}
        </StatusBadge>
      </div>

      <p className="mt-4 text-base text-carbon-black-900">
        {question.question_text}
      </p>

      {question.answer_notes ? (
        <div className="mt-4 rounded-xl bg-pearl-aqua-100 px-4 py-3">
          <p className="text-sm font-medium text-carbon-black-600">Antwoord</p>
          <p className="mt-1 text-sm text-carbon-black-900">
            {question.answer_notes}
          </p>
        </div>
      ) : null}

      {isOpen ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <SecondaryButton
            icon={<Pencil className="h-4 w-4" aria-hidden />}
            onClick={() => onEdit(question)}
            disabled={isDeleting}
          >
            Bewerken
          </SecondaryButton>
          <SecondaryButton
            icon={<Trash2 className="h-4 w-4" aria-hidden />}
            onClick={() => onDelete(question)}
            disabled={isDeleting}
          >
            {isDeleting ? "Verwijderen..." : "Verwijderen"}
          </SecondaryButton>
        </div>
      ) : null}
    </article>
  );
}
