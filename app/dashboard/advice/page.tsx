import { Sun } from "lucide-react";
import { PatientSubPageView } from "@/components/dashboard/patient-sub-page-view";

export default function AdvicePage() {
  return (
    <PatientSubPageView
      title="DagBuddy"
      description="Jouw persoonlijke advies voor vandaag."
      icon={Sun}
      emptyTitle="Advies wordt voorbereid"
      emptyDescription="DagBuddy helpt je met herstel en participatie. Hier verschijnt straks je persoonlijke advies voor vandaag."
    />
  );
}
