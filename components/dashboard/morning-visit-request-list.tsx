"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useMorningVisitRequestList } from "@/hooks/use-morning-visit-requests";
import { getInspirationLabels } from "@/lib/constants/visit-inspirations";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";

interface MorningVisitRequestListProps {
  requestDate: string;
}

export function MorningVisitRequestList({
  requestDate,
}: MorningVisitRequestListProps) {
  const { data, isLoading, error } = useMorningVisitRequestList(requestDate);

  return (
    <DashboardCard
      title="Ochtendverzoeken"
      density="compact"
      className="space-y-3"
    >
      <p className="text-sm text-carbon-black-700">
        Eenvoudige verzoeken voor persoonlijk contact in het ochtendblok{" "}
        {PARTICIPATION_BLOCKS.morning.label}. Geen toewijzing via de app —
        stem onderling af.
      </p>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Verzoeken laden...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof Error ? error.message : "Laden mislukt."}
        </p>
      ) : null}

      {!isLoading && data && data.length === 0 ? (
        <p className="text-sm text-carbon-black-600">
          Geen actieve verzoeken voor deze datum.
        </p>
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((request) => (
            <li
              key={request.id}
              className="rounded-lg border border-parchment-200 bg-parchment-50 px-4 py-3"
            >
              <p className="font-medium text-carbon-black-900">
                {request.patient_display_name}
                {request.room_number ? ` · kamer ${request.room_number}` : ""}
              </p>
              {request.patient_message ? (
                <p className="mt-1 text-sm text-carbon-black-700">
                  “{request.patient_message}”
                </p>
              ) : null}
              {request.inspiration_ids.length > 0 ? (
                <p className="mt-1 text-sm text-carbon-black-600">
                  Inspiratie:{" "}
                  {getInspirationLabels(request.inspiration_ids).join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}
