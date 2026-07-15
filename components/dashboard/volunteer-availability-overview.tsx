import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";
import type { VolunteerBlockAvailabilityOverviewRow } from "@/types/daily-participation";

interface VolunteerAvailabilityOverviewProps {
  volunteers: VolunteerBlockAvailabilityOverviewRow[];
  block: "morning" | "afternoon";
}

export function VolunteerAvailabilityOverview({
  volunteers,
  block,
}: VolunteerAvailabilityOverviewProps) {
  const available = volunteers.filter((volunteer) =>
    block === "morning"
      ? volunteer.morning_effective
      : volunteer.afternoon_effective,
  );

  const blockLabel = PARTICIPATION_BLOCKS[block].label;

  return (
    <div className="space-y-3">
      <p className="text-sm text-carbon-black-600">
        {available.length} vrijwilliger{available.length === 1 ? "" : "s"}{" "}
        beschikbaar voor {blockLabel}
      </p>

      {available.length > 0 ? (
        <ul className="space-y-2">
          {available.map((volunteer) => (
            <li
              key={volunteer.user_id}
              className="rounded-xl border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-carbon-black-900"
            >
              {volunteer.full_name || "Vrijwilliger"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-carbon-black-600">
          Geen vrijwilligers beschikbaar volgens de wekelijkse planning en
          afwezigheden.
        </p>
      )}
    </div>
  );
}
