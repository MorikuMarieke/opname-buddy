import { createClient } from "@/lib/supabase/client";
import type { PatientQuestionFormValues } from "@/lib/validations/patient-question";
import type { PatientQuestion } from "@/types/patient";

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  discussed: 1,
  answered: 2,
};

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.message.includes("does not exist") ||
    error.code === "42P01"
  ) {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  if (error.code === "23503") {
    return "Je profiel is niet gevonden. Log uit en opnieuw in, of neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function sortQuestions(questions: PatientQuestion[]): PatientQuestion[] {
  return [...questions].sort((a, b) => {
    const statusDiff =
      (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}

export async function listQuestions(): Promise<PatientQuestion[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return sortQuestions(data ?? []);
}

export async function createQuestion(
  input: PatientQuestionFormValues,
): Promise<PatientQuestion> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  const { data, error } = await supabase
    .from("patient_questions")
    .insert({
      patient_id: user.id,
      question_text: input.question_text,
      target_type: input.target_type,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function updateQuestion(
  id: string,
  input: PatientQuestionFormValues,
): Promise<PatientQuestion> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patient_questions")
    .update({
      question_text: input.question_text,
      target_type: input.target_type,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("patient_questions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}

export function countOpenQuestions(questions: PatientQuestion[]): number {
  return questions.filter((question) => question.status === "open").length;
}
