import {
  Calendar,
  ClipboardList,
  LineChart,
  MessageCircleQuestion,
  Sun,
} from "lucide-react";
import { ActionTile } from "@/components/ui/action-tile";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function PatientHomeView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ActionTile
          href="/dashboard/checkin"
          icon={ClipboardList}
          title="Check-in"
          description="Hoe voel je je vandaag?"
          accent="blue-slate"
        />
        <ActionTile
          href="/dashboard/questions"
          icon={MessageCircleQuestion}
          title="Mijn vragen"
          description="Stel of bekijk je vragen."
          accent="copper"
        />
        <ActionTile
          href="/dashboard/activities"
          icon={Calendar}
          title="Activiteiten"
          description="Bekijk activiteiten."
          accent="blue-slate"
        />
        <ActionTile
          href="/dashboard/advice"
          icon={Sun}
          title="DagBuddy"
          description="Jouw persoonlijke advies."
          accent="copper"
        />
        <ActionTile
          href="/dashboard"
          icon={LineChart}
          title="Mijn overzicht"
          description="Bekijk je weekoverzicht."
          accent="pearl-aqua"
        />
        <DashboardCard className="flex flex-col justify-center">
          <p className="text-sm font-medium text-carbon-black/60">Dinsdag 20 mei</p>
          <p className="mt-2 text-lg font-semibold text-carbon-black">
            Vergeet niet je check-in in te vullen.
          </p>
        </DashboardCard>
      </div>
    </div>
  );
}
