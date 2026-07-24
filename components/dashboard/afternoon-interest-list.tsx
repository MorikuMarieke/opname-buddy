"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useAfternoonInterestList } from "@/hooks/use-afternoon-interest";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";

interface AfternoonInterestListProps {
  interestDate: string;
}

export function AfternoonInterestList({
  interestDate,
}: AfternoonInterestListProps) {
  const { data, isLoading, error } = useAfternoonInterestList(interestDate);

  return (
    <DashboardCard
      title="Middaginteresse"
      density="compact"
      className="space-y-3"
    >
      <p className="text-sm text-carbon-black-700">
        Niet-bindende signalen van patiënten die later mogelijk interesse hebben
        in een gedeelde middagactiviteit ({PARTICIPATION_BLOCKS.afternoon.label}
        ). Geen inschrijving of reservering.
      </p>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Interesse laden...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof Error ? error.message : "Laden mislukt."}
        </p>
      ) : null}

      {!isLoading && data && data.length === 0 ? (
        <p className="text-sm text-carbon-black-600">
          Geen actieve interessesignalen voor deze datum.
        </p>
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-parchment-200 bg-parchment-50 px-4 py-3"
            >
              <p className="font-medium text-carbon-black-900">
                {item.patient_display_name}
                {item.room_number ? ` · kamer ${item.room_number}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}
