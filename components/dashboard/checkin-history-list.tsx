import { formatDutchDate, getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { PatientCheckin } from "@/types/patient";

interface CheckinHistoryListProps {
  checkIns: PatientCheckin[];
  todayCheckInId?: string;
}

export function CheckinHistoryList({
  checkIns,
  todayCheckInId,
}: CheckinHistoryListProps) {
  const today = getAmsterdamDateString();
  const history = checkIns.filter((checkIn) => checkIn.id !== todayCheckInId);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-carbon-black-900">
        Recente check-ins
      </h3>
      <ul className="space-y-3">
        {history.map((checkIn) => (
          <li
            key={checkIn.id}
            className="rounded-xl border border-parchment-200 bg-white px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-carbon-black-900">
                {formatDutchDate(checkIn.check_in_date)}
              </p>
              {checkIn.check_in_date === today ? (
                <span className="text-xs font-medium text-copper-600">Vandaag</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-carbon-black-600">
              Pijn {checkIn.pain_score}/10 · Energie {checkIn.energy_level}/5 ·
              Stemming {checkIn.mood}/5
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
