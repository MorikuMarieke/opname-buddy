import { ClipboardList } from "lucide-react";
import { PatientSubPageView } from "@/components/dashboard/patient-sub-page-view";

export default function CheckinPage() {
  return (
    <PatientSubPageView
      title="Dagelijkse check-in"
      description="Vertel hoe je je vandaag voelt."
      icon={ClipboardList}
      emptyTitle="Check-in nog niet ingevuld"
      emptyDescription="Hier kun je straks je dagelijkse check-in invullen. Neem de tijd en deel hoe je je voelt."
    />
  );
}
