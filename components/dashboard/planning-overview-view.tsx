import { Plus } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { cn } from "@/lib/utils/cn";

const nestedActivityColors = [
  "bg-pearl-aqua-100",
  "bg-copper-100",
  "bg-blue-slate-100",
] as const;

const locations = [
  {
    name: "Huiskamer",
    activities: [
      { title: "Koffieochtend", time: "09:00 – 10:30", participants: "5 / 10" },
      { title: "Muziek luisteren", time: "14:00 – 15:00", participants: "3 / 8" },
    ],
  },
  {
    name: "Bewegingsruimte",
    activities: [
      { title: "Ochtendgym", time: "10:00 – 11:00", participants: "6 / 12" },
    ],
  },
  {
    name: "Creatieve ruimte",
    activities: [
      { title: "Schilderen", time: "13:30 – 15:00", participants: "4 / 8" },
    ],
  },
  {
    name: "Buitenruimte",
    activities: [
      { title: "Tuinwandeling", time: "11:00 – 12:00", participants: "2 / 6" },
    ],
  },
];

export function PlanningOverviewView() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Activiteitenplanning"
        description="Dinsdag 20 mei 2025"
        size="compact"
        action={
          <div className="flex flex-wrap gap-2">
            <SecondaryButton size="sm">Week</SecondaryButton>
            <SecondaryButton size="sm">Dag</SecondaryButton>
            <PrimaryButton size="sm" icon={<Plus className="h-4 w-4" />}>
              Activiteit toevoegen
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {locations.map((location) => (
          <DashboardCard key={location.name} title={location.name} density="compact">
            <div className="space-y-2">
              {location.activities.map((activity, activityIndex) => (
                <div
                  key={activity.title}
                  className={cn(
                    "rounded-lg p-2.5",
                    nestedActivityColors[activityIndex % nestedActivityColors.length],
                  )}
                >
                  <p className="text-sm font-medium text-carbon-black-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-carbon-black-600">{activity.time}</p>
                  <p className="mt-1 text-xs font-medium text-blue-slate-700">
                    {activity.participants} deelnemers
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}

export function PlanningOverviewRightPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">
          Vrijwilligers vandaag
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pearl-aqua-200 text-xs font-semibold text-pearl-aqua-800">
              LV
            </div>
            <div>
              <p className="font-medium text-carbon-black-900">Lisa van Dijk</p>
              <p className="text-xs text-carbon-black-600">09:00 – 13:00</p>
            </div>
          </li>
          <li className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pearl-aqua-200 text-xs font-semibold text-pearl-aqua-800">
              TH
            </div>
            <div>
              <p className="font-medium text-carbon-black-900">Tom Hendriks</p>
              <p className="text-xs text-carbon-black-600">13:00 – 17:00</p>
            </div>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">Notities</h3>
        <p className="text-sm text-carbon-black-600">
          Extra stoelen nodig voor koffieochtend in de huiskamer.
        </p>
        <p className="mt-1.5 text-sm text-blue-slate-700">Notitie toevoegen</p>
      </div>
    </div>
  );
}
