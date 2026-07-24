"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useMorningVisitRequestList } from "@/hooks/use-morning-visit-requests";
import { getInspirationLabels } from "@/lib/constants/visit-inspirations";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";
import { VOLUNTEER_VISIT_REQUEST_COPY } from "@/lib/constants/volunteer-visit-request-copy";

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

              <ul className="mt-2 flex flex-col gap-1.5">
                {request.cannot_participate_in_afternoon_activity ? (
                  <li>
                    <span className="inline-block rounded-md border border-carbon-black-300 bg-white px-2.5 py-1 text-sm font-semibold text-carbon-black-900">
                      {VOLUNTEER_VISIT_REQUEST_COPY.wardStayLabel}
                    </span>
                  </li>
                ) : null}
                {request.requires_protection_before_room_entry ? (
                  <li>
                    <span className="inline-block rounded-md border border-parchment-300 bg-parchment-100 px-2.5 py-1 text-sm font-medium text-carbon-black-800">
                      {VOLUNTEER_VISIT_REQUEST_COPY.protectionLabel}
                    </span>
                  </li>
                ) : null}
              </ul>

              {request.patient_message ? (
                <p className="mt-2 text-sm text-carbon-black-700">
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
