import type { User } from "@supabase/supabase-js";
import {
  Calendar,
  ClipboardList,
  LineChart,
  MessageCircleQuestion,
  Sun,
} from "lucide-react";

import { PatientHomeSummary } from "@/components/dashboard/patient-home-summary";
import { ActionTile } from "@/components/ui/action-tile";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface PatientHomeViewProps {
  user: User;
}

function getDisplayName(user: User): string {
  const fullName = user.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  return user.email ?? "Onbekende gebruiker";
}

export function PatientHomeView({ user }: PatientHomeViewProps) {
  const displayName = getDisplayName(user);

  return (
    <div className="space-y-6">
      <DashboardCard density="comfortable" padding="lg">
        <p className="text-sm font-medium text-carbon-black-600">Ingelogd als</p>
        <p className="mt-1 text-lg font-semibold text-carbon-black-900">
          {displayName}
        </p>
        {user.email ? (
          <p className="mt-1 text-sm text-carbon-black-600">{user.email}</p>
        ) : null}
      </DashboardCard>

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
        <PatientHomeSummary />
      </div>
    </div>
  );
}
