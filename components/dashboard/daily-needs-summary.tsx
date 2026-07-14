import {
  AFTERNOON_CATEGORY_LABELS,
  PARTICIPATION_NEED_LABELS,
  PARTICIPATION_NEED_VALUES,
  type ParticipationNeedValue,
} from "@/lib/constants/daily-participation";
import type { DailyNeedsSummaryRow } from "@/types/daily-participation";

interface DailyNeedsSummaryProps {
  needs: DailyNeedsSummaryRow[];
  suggestedCategory?: ParticipationNeedValue | null;
}

export function DailyNeedsSummary({
  needs,
  suggestedCategory,
}: DailyNeedsSummaryProps) {
  const counts = new Map(needs.map((row) => [row.need, row.need_count]));

  return (
    <div className="space-y-3">
      <dl className="grid gap-3 sm:grid-cols-2">
        {PARTICIPATION_NEED_VALUES.map((need) => {
          const count = counts.get(need) ?? 0;
          const isSuggested = suggestedCategory === need && count > 0;

          return (
            <div
              key={need}
              className={
                isSuggested
                  ? "rounded-xl border border-copper-200 bg-copper-50 px-4 py-3"
                  : "rounded-xl border border-parchment-200 bg-parchment-50 px-4 py-3"
              }
            >
              <dt className="text-sm text-carbon-black-600">
                {PARTICIPATION_NEED_LABELS[need]}
              </dt>
              <dd className="text-2xl font-semibold text-carbon-black-900">
                {count}
              </dd>
              {isSuggested ? (
                <p className="mt-1 text-xs text-copper-800">
                  Meest gekozen — alleen ter inspiratie
                </p>
              ) : null}
            </div>
          );
        })}
      </dl>

      {needs.length === 0 ? (
        <p className="text-sm text-carbon-black-600">
          Nog geen behoeften ingevuld via check-ins voor deze datum.
        </p>
      ) : null}

      {suggestedCategory && counts.get(suggestedCategory) ? (
        <p className="text-sm text-carbon-black-600">
          Veel patiënten kozen voor{" "}
          <span className="font-medium text-carbon-black-900">
            {AFTERNOON_CATEGORY_LABELS[suggestedCategory].toLowerCase()}
          </span>
          . Jullie bepalen zelf de activiteit.
        </p>
      ) : null}
    </div>
  );
}

export function getSuggestedNeedCategory(
  needs: DailyNeedsSummaryRow[],
): ParticipationNeedValue | null {
  if (needs.length === 0) {
    return null;
  }

  const top = [...needs].sort((a, b) => b.need_count - a.need_count)[0];
  return top?.need ?? null;
}
