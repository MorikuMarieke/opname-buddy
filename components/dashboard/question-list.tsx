"use client";

import { MessageCircleQuestion } from "lucide-react";

import { QuestionCard } from "@/components/dashboard/question-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PatientQuestion } from "@/types/patient";

interface QuestionListProps {
  questions: PatientQuestion[];
  onEdit: (question: PatientQuestion) => void;
  onDelete: (question: PatientQuestion) => void;
  deletingQuestionId?: string | null;
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
  deletingQuestionId,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="Nog geen vragen"
        description="Heb je een vraag voor je zorgteam? Voeg je eerste vraag toe."
        size="kiosk"
      />
    );
  }

  const openQuestions = questions.filter((question) => question.status === "open");
  const otherQuestions = questions.filter((question) => question.status !== "open");

  return (
    <div className="space-y-8">
      {openQuestions.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Open vragen
          </h3>
          <div className="space-y-4">
            {openQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingQuestionId === question.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {otherQuestions.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Eerdere vragen
          </h3>
          <div className="space-y-4">
            {otherQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
