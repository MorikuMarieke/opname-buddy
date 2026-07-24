"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useAfternoonInterestCount } from "@/hooks/use-afternoon-interest";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";
import { VOLUNTEER_VISIT_REQUEST_COPY } from "@/lib/constants/volunteer-visit-request-copy";

interface AfternoonInterestCountProps {
  interestDate: string;
}

export function AfternoonInterestCount({
  interestDate,
}: AfternoonInterestCountProps) {
  const { data, isLoading, error } = useAfternoonInterestCount(interestDate);

  return (
    <DashboardCard
      title={VOLUNTEER_VISIT_REQUEST_COPY.afternoonInterestTitle}
      density="compact"
      className="space-y-3"
    >
      <p className="text-sm text-carbon-black-700">
        Aantal niet-bindende interessesignalen voor een mogelijke gedeelde
        middagactiviteit ({PARTICIPATION_BLOCKS.afternoon.label}). Geen namen of
        kamers — alleen een teller voor planning. Dit is geen inschrijving.
      </p>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Teller laden...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof Error ? error.message : "Laden mislukt."}
        </p>
      ) : null}

      {!isLoading && !error ? (
        <p className="text-2xl font-semibold text-carbon-black-900">
          {data ?? 0}
          <span className="ml-2 text-base font-normal text-carbon-black-600">
            interesse{data === 1 ? "" : "s"}
          </span>
        </p>
      ) : null}
    </DashboardCard>
  );
}
