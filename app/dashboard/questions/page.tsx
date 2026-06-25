import { MessageCircleQuestion } from "lucide-react";
import { PatientSubPageView } from "@/components/dashboard/patient-sub-page-view";

export default function QuestionsPage() {
  return (
    <PatientSubPageView
      title="Mijn vragen"
      description="Stel vragen aan je zorgteam."
      icon={MessageCircleQuestion}
      emptyTitle="Nog geen vragen"
      emptyDescription="Heb je een vraag voor je zorgteam? Hier kun je straks vragen stellen en antwoorden bekijken."
    />
  );
}
