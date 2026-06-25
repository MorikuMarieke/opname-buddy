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
    <div className="space-y-6">
      <SectionHeader
        title="Patiënten"
        description="Alle patiënten op de afdeling."
      />

      <DashboardCard padding="sm" className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-dust-grey text-carbon-black/60">
              <th className="px-3 py-3 font-medium">Naam</th>
              <th className="px-3 py-3 font-medium">Kamer</th>
              <th className="px-3 py-3 font-medium">Check-in</th>
              <th className="px-3 py-3 font-medium">Vragen</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.href}
                className="border-b border-dust-grey/60 last:border-0"
              >
                <td className="px-3 py-3">
                  <Link
                    href={patient.href}
                    className="font-medium text-blue-slate hover:underline"
                  >
                    {patient.name}
                  </Link>
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
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}
