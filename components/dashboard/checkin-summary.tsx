import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";
import { LIKERT_LABELS } from "@/types/patient";
import type { PatientCheckin } from "@/types/patient";

interface CheckinSummaryProps {
  checkIn: PatientCheckin;
  onEdit: () => void;
}

function getLikertLabel(score: number): string {
  return LIKERT_LABELS[score - 1] ?? String(score);
}

export function CheckinSummary({ checkIn, onEdit }: CheckinSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge variant="positive">Check-in voltooid</StatusBadge>
        <p className="text-sm text-carbon-black-600">
          {formatDutchDate(checkIn.check_in_date)}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-carbon-black-600">Pijn</dt>
          <dd className="text-lg font-semibold text-carbon-black-900">
            {checkIn.pain_score}/10
          </dd>
        </div>
        <div>
          <dt className="text-sm text-carbon-black-600">Energie</dt>
          <dd className="text-lg font-semibold text-carbon-black-900">
            {checkIn.energy_level} — {getLikertLabel(checkIn.energy_level)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-carbon-black-600">Stemming</dt>
          <dd className="text-lg font-semibold text-carbon-black-900">
            {checkIn.mood} — {getLikertLabel(checkIn.mood)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-carbon-black-600">Mobiliteit</dt>
          <dd className="text-lg font-semibold text-carbon-black-900">
            {checkIn.mobility_level} — {getLikertLabel(checkIn.mobility_level)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-carbon-black-600">Motivatie voor activiteit</dt>
          <dd className="text-lg font-semibold text-carbon-black-900">
            {checkIn.motivation_score} — {getLikertLabel(checkIn.motivation_score)}
          </dd>
        </div>
      </dl>

      {checkIn.symptoms ? (
        <div>
          <p className="text-sm text-carbon-black-600">Symptomen</p>
          <p className="mt-1 text-carbon-black-900">{checkIn.symptoms}</p>
        </div>
      ) : null}

      {checkIn.note ? (
        <div>
          <p className="text-sm text-carbon-black-600">Notitie</p>
          <p className="mt-1 whitespace-pre-wrap text-carbon-black-900">
            {checkIn.note}
          </p>
        </div>
      ) : null}

      <SecondaryButton onClick={onEdit}>Aanpassen</SecondaryButton>
    </div>
  );
}
