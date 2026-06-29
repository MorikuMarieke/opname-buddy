import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

const patients = [
  { name: "Jan de Vries", room: "204", checkin: true, questions: 2, href: "/care/patients/jan-de-vries" },
  { name: "Maria Jansen", room: "112", checkin: true, questions: 0, href: "/care/patients/maria-jansen" },
  { name: "Pieter Bakker", room: "308", checkin: false, questions: 1, href: "/care/patients/pieter-bakker" },
  { name: "Els Vermeer", room: "215", checkin: true, questions: 3, href: "/care/patients/els-vermeer" },
];

export function CarePatientsView() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Patiënten"
        description="Alle patiënten op de afdeling."
        size="compact"
      />

      <DashboardCard density="compact" className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-parchment-100">
            <tr className="border-b border-parchment-200 text-carbon-black-600">
              <th className="px-3 py-2 font-medium">Naam</th>
              <th className="px-3 py-2 font-medium">Kamer</th>
              <th className="px-3 py-2 font-medium">Check-in</th>
              <th className="px-3 py-2 font-medium">Vragen</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.href}
                className="border-b border-dust-grey-100 last:border-0"
              >
                <td className="px-3 py-2">
                  <Link
                    href={patient.href}
                    className="font-medium text-blue-slate-700 hover:underline"
                  >
                    {patient.name}
                  </Link>
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
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}
