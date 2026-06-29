import { CheckCircle2, MessageCircle, Shield, Users } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

const patients = [
  {
    name: "Jan de Vries",
    room: "204",
    checkin: true,
    questions: 2,
    restrictions: "Mobiliteit",
    updated: "09:15",
  },
  {
    name: "Maria Jansen",
    room: "112",
    checkin: true,
    questions: 0,
    restrictions: "—",
    updated: "08:42",
  },
  {
    name: "Pieter Bakker",
    room: "308",
    checkin: false,
    questions: 1,
    restrictions: "Dieet",
    updated: "Gisteren",
  },
  {
    name: "Els Vermeer",
    room: "215",
    checkin: true,
    questions: 3,
    restrictions: "Mobiliteit",
    updated: "10:03",
  },
];

export function CareOverviewView() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Patiëntenoverzicht"
        description="Overzicht van vandaag op de afdeling."
        size="compact"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-pearl-aqua-50 p-2 text-blue-slate-700">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Patiënten vandaag</p>
              <p className="text-xl font-semibold text-carbon-black-900">24</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-pearl-aqua-50 p-2 text-blue-slate-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Check-ins voltooid</p>
              <p className="text-xl font-semibold text-carbon-black-900">
                17{" "}
                <span className="text-sm font-normal text-carbon-black-600">
                  / 71%
                </span>
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-copper-50 p-2 text-copper-600">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Open vragen</p>
              <p className="text-xl font-semibold text-carbon-black-900">
                8{" "}
                <StatusBadge variant="attention" className="ml-1 align-middle">
                  3 urgent
                </StatusBadge>
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard density="compact">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-slate-50 p-2 text-blue-slate-700">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-carbon-black-600">Actieve beperkingen</p>
              <p className="text-xl font-semibold text-carbon-black-900">12</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard density="compact" className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-dust-grey-200 text-carbon-black-600">
              <th className="px-3 py-2 font-medium">Naam</th>
              <th className="px-3 py-2 font-medium">Kamer</th>
              <th className="px-3 py-2 font-medium">Check-in</th>
              <th className="px-3 py-2 font-medium">Vragen</th>
              <th className="px-3 py-2 font-medium">Beperkingen</th>
              <th className="px-3 py-2 font-medium">Laatst bijgewerkt</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.name}
                className="border-b border-dust-grey-100 last:border-0"
              >
                <td className="px-3 py-2 font-medium text-carbon-black-900">
                  {patient.name}
                </td>
                <td className="px-3 py-2">{patient.room}</td>
                <td className="px-3 py-2">
                  {patient.checkin ? (
                    <CheckCircle2
                      className="h-4 w-4 text-pearl-aqua-500"
                      aria-label="Voltooid"
                    />
                  ) : (
                    <span className="text-carbon-black-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {patient.questions > 0 ? (
                    <StatusBadge variant="attention">{patient.questions}</StatusBadge>
                  ) : (
                    <span className="text-carbon-black-400">0</span>
                  )}
                </td>
                <td className="px-3 py-2">{patient.restrictions}</td>
                <td className="px-3 py-2 text-carbon-black-600">{patient.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}

export function CareOverviewRightPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">Acties</h3>
        <ul className="space-y-1.5 text-sm text-blue-slate-700">
          <li>
            <span className="cursor-default hover:underline">Nieuwe patiënt</span>
          </li>
          <li>
            <span className="cursor-default hover:underline">Alle vragen bekijken</span>
          </li>
          <li>
            <span className="cursor-default hover:underline">Beperkingen beheren</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-carbon-black-900">Meldingen</h3>
        <ul className="space-y-2 text-sm">
          <li className="rounded-lg bg-parchment-50 p-3">
            <p className="font-medium text-carbon-black-900">3 urgente vragen</p>
            <p className="text-carbon-black-600">Wachten op beantwoording</p>
          </li>
          <li className="rounded-lg bg-parchment-50 p-3">
            <p className="font-medium text-carbon-black-900">Check-in herinnering</p>
            <p className="text-carbon-black-600">7 patiënten nog niet ingevuld</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
