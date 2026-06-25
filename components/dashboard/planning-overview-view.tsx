import { Plus } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/secondary-button";

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
    <div className="space-y-6">
      <SectionHeader
        title="Activiteitenplanning"
        description="Dinsdag 20 mei 2025"
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

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {locations.map((location) => (
          <DashboardCard key={location.name} title={location.name} padding="sm">
            <div className="space-y-3">
              {location.activities.map((activity) => (
                <div
                  key={activity.title}
                  className="rounded-xl bg-pearl-aqua/30 p-3"
                >
                  <p className="font-medium text-carbon-black">{activity.title}</p>
                  <p className="text-sm text-carbon-black/60">{activity.time}</p>
                  <p className="mt-1 text-xs font-medium text-blue-slate">
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
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-carbon-black">
          Vrijwilligers vandaag
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pearl-aqua/50 text-xs font-semibold text-blue-slate">
              LV
            </div>
            <div>
              <p className="font-medium text-carbon-black">Lisa van Dijk</p>
              <p className="text-carbon-black/60">09:00 – 13:00</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pearl-aqua/50 text-xs font-semibold text-blue-slate">
              TH
            </div>
            <div>
              <p className="font-medium text-carbon-black">Tom Hendriks</p>
              <p className="text-carbon-black/60">13:00 – 17:00</p>
            </div>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-carbon-black">Notities</h3>
        <p className="text-sm text-carbon-black/70">
          Extra stoelen nodig voor koffieochtend in de huiskamer.
        </p>
        <p className="mt-2 text-sm text-blue-slate">Notitie toevoegen</p>
      </div>
    </div>
  );
}
