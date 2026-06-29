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
      <div className="grid gap-6 sm:grid-cols-2">
        <ActionTile
          href="/dashboard/checkin"
          icon={ClipboardList}
          title="Check-in"
          description="Hoe voel je je vandaag?"
          accent="blue-slate"
          size="kiosk"
        />
        <ActionTile
          href="/dashboard/questions"
          icon={MessageCircleQuestion}
          title="Mijn vragen"
          description="Stel of bekijk je vragen."
          accent="copper"
          size="kiosk"
        />
        <ActionTile
          href="/dashboard/activities"
          icon={Calendar}
          title="Activiteiten"
          description="Bekijk activiteiten."
          accent="blue-slate"
          size="kiosk"
        />
        <ActionTile
          href="/dashboard/advice"
          icon={Sun}
          title="DagBuddy"
          description="Jouw persoonlijke advies."
          accent="copper"
          size="kiosk"
        />
        <ActionTile
          href="/dashboard"
          icon={LineChart}
          title="Mijn overzicht"
          description="Bekijk je weekoverzicht."
          accent="pearl-aqua"
          size="kiosk"
        />
        <DashboardCard
          density="comfortable"
          padding="lg"
          className="flex min-h-[180px] flex-col justify-center bg-pearl-aqua-50"
        >
          <p className="text-base font-medium text-carbon-black-600">
            Dinsdag 20 mei
          </p>
          <p className="mt-3 text-xl font-semibold text-carbon-black-900">
            Vergeet niet je check-in in te vullen.
          </p>
        </DashboardCard>
      </div>
    </div>
  );
}
