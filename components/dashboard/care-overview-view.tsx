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
    <div className="space-y-6">
      <SectionHeader
        title="Patiëntenoverzicht"
        description="Overzicht van vandaag op de afdeling."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard padding="sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-pearl-aqua/40 p-2 text-blue-slate">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-carbon-black/60">Patiënten vandaag</p>
              <p className="text-2xl font-semibold text-carbon-black">24</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard padding="sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-pearl-aqua/40 p-2 text-blue-slate">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-carbon-black/60">Check-ins voltooid</p>
              <p className="text-2xl font-semibold text-carbon-black">
                17 <span className="text-base font-normal text-carbon-black/60">/ 71%</span>
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard padding="sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-copper/15 p-2 text-copper">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-carbon-black/60">Open vragen</p>
              <p className="text-2xl font-semibold text-carbon-black">
                8{" "}
                <StatusBadge variant="attention" className="ml-1 align-middle">
                  3 urgent
                </StatusBadge>
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard padding="sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-slate/10 p-2 text-blue-slate">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-carbon-black/60">Actieve beperkingen</p>
              <p className="text-2xl font-semibold text-carbon-black">12</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard padding="sm" className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-dust-grey text-carbon-black/60">
              <th className="px-3 py-3 font-medium">Naam</th>
              <th className="px-3 py-3 font-medium">Kamer</th>
              <th className="px-3 py-3 font-medium">Check-in</th>
              <th className="px-3 py-3 font-medium">Vragen</th>
              <th className="px-3 py-3 font-medium">Beperkingen</th>
              <th className="px-3 py-3 font-medium">Laatst bijgewerkt</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.name}
                className="border-b border-dust-grey/60 last:border-0"
              >
                <td className="px-3 py-3 font-medium text-carbon-black">
                  {patient.name}
                </td>
                <td className="px-3 py-3">{patient.room}</td>
                <td className="px-3 py-3">
                  {patient.checkin ? (
                    <CheckCircle2 className="h-5 w-5 text-pearl-aqua" aria-label="Voltooid" />
                  ) : (
                    <span className="text-carbon-black/40">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {patient.questions > 0 ? (
                    <StatusBadge variant="attention">{patient.questions}</StatusBadge>
                  ) : (
                    <span className="text-carbon-black/40">0</span>
                  )}
                </td>
                <td className="px-3 py-3">{patient.restrictions}</td>
                <td className="px-3 py-3 text-carbon-black/60">{patient.updated}</td>
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
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-carbon-black">Acties</h3>
        <ul className="space-y-2 text-sm text-blue-slate">
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
        <h3 className="mb-3 text-sm font-semibold text-carbon-black">Meldingen</h3>
        <ul className="space-y-3 text-sm">
          <li className="rounded-xl bg-parchment p-3">
            <p className="font-medium text-carbon-black">3 urgente vragen</p>
            <p className="text-carbon-black/60">Wachten op beantwoording</p>
          </li>
          <li className="rounded-xl bg-parchment p-3">
            <p className="font-medium text-carbon-black">Check-in herinnering</p>
            <p className="text-carbon-black/60">7 patiënten nog niet ingevuld</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
