"use client";

import { useState } from "react";

import { QuestionForm } from "@/components/dashboard/question-form";
import { QuestionList } from "@/components/dashboard/question-list";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useDeleteQuestion,
  usePatientQuestions,
} from "@/hooks/use-patient-questions";
import type { PatientQuestion } from "@/types/patient";

export function QuestionsView() {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PatientQuestion | null>(
    null,
  );
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const questionsQuery = usePatientQuestions();
  const deleteQuestion = useDeleteQuestion();

  function handleCreateClick() {
    setEditingQuestion(null);
    setShowForm(true);
    setFormError(null);
  }

  function handleEdit(question: PatientQuestion) {
    setEditingQuestion(question);
    setShowForm(true);
    setFormError(null);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingQuestion(null);
    setFormError(null);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingQuestion(null);
    setFormError(null);
  }

  async function handleDelete(question: PatientQuestion) {
    const confirmed = window.confirm(
      "Weet je zeker dat je deze vraag wilt verwijderen?",
    );

    if (!confirmed) {
      return;
    }

    setFormError(null);
    setDeletingQuestionId(question.id);

    try {
      await deleteQuestion.mutateAsync(question.id);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Verwijderen is mislukt. Probeer het opnieuw.",
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mijn vragen"
        description="Schrijf vragen op voor je zorgteam. Kies het specialisme en bewaar je vraag tot een gesprek of visite."
        size="kiosk"
        action={
          !showForm ? (
            <PrimaryButton onClick={handleCreateClick}>Nieuwe vraag</PrimaryButton>
          ) : null
        }
      />

      {showForm ? (
        <DashboardCard density="comfortable" padding="lg">
          <h3 className="mb-5 text-lg font-semibold text-carbon-black-900">
            {editingQuestion ? "Vraag bewerken" : "Nieuwe vraag"}
          </h3>
          <QuestionForm
            existingQuestion={editingQuestion}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DashboardCard>
      ) : null}

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <DashboardCard density="comfortable" padding="lg">
        {questionsQuery.isLoading ? (
          <p className="text-sm text-carbon-black-600">Vragen laden...</p>
        ) : (
          <QuestionList
            questions={questionsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingQuestionId={deletingQuestionId}
          />
        )}
      </DashboardCard>

      <p className="text-sm text-carbon-black-600">
        Later kun je hier een dagelijkse vragensamenvatting krijgen — QuestionBuddy
        helpt je open vragen overzichtelijk te maken voor een gesprek met je
        zorgteam. Vragen worden niet beantwoord in de app.
      </p>
    </div>
  );
}
