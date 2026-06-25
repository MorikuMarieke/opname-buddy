import { Calendar } from "lucide-react";
import { PatientSubPageView } from "@/components/dashboard/patient-sub-page-view";

export default function ActivitiesPage() {
  return (
    <PatientSubPageView
      title="Activiteiten"
      description="Bekijk geplande activiteiten op de afdeling."
      icon={Calendar}
      emptyTitle="Geen activiteiten vandaag"
      emptyDescription="Er zijn vandaag nog geen activiteiten gepland. Kom later terug of vraag je zorgteam om meer informatie."
    />
  );
}
