"use client";

import { useMemo, useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  useMyDayAbsencesForMonth,
  useMyWeeklyBlocks,
  useSaveMyWeeklyBlocks,
  useSetMyDayAbsence,
} from "@/hooks/use-volunteer-block-availability";
import {
  PARTICIPATION_BLOCKS,
  WEEKLY_AVAILABILITY_CHANGE_CONFIRMATION,
} from "@/lib/constants/daily-participation";
import { formInputClasses } from "@/components/forms/form-styles";
import type { DayOfWeek } from "@/lib/constants/planning-enums";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import {
  getMonthAbsenceSlots,
  getWeeklyDayLabel,
  WEEKLY_BLOCK_DISPLAY_ORDER,
} from "@/lib/utils/volunteer-block-availability";
import type { VolunteerWeeklyBlockInput } from "@/types/daily-participation";

function getCurrentYearMonth(): string {
  return getAmsterdamDateString().slice(0, 7);
}

export function VolunteerBlockAvailabilityView() {
  const { data: weeklyBlocks, isLoading } = useMyWeeklyBlocks();
  const saveWeeklyBlocks = useSaveMyWeeklyBlocks();
  const [draftBlocks, setDraftBlocks] = useState<VolunteerWeeklyBlockInput[] | null>(
    null,
  );
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const { data: absences } = useMyDayAbsencesForMonth(yearMonth);
  const setDayAbsence = useSetMyDayAbsence(yearMonth);

  const blocks = useMemo<VolunteerWeeklyBlockInput[]>(() => {
    const source = draftBlocks ?? weeklyBlocks;

    if (!source) {
      return [];
    }

    return source.map((block) => ({
      day_of_week: block.day_of_week,
      morning_available: block.morning_available,
      afternoon_available: block.afternoon_available,
    }));
  }, [draftBlocks, weeklyBlocks]);

  const monthSlots = useMemo(
    () =>
      getMonthAbsenceSlots(
        yearMonth,
        blocks.map((block) => ({
          user_id: "",
          day_of_week: block.day_of_week,
          morning_available: block.morning_available,
          afternoon_available: block.afternoon_available,
          updated_at: "",
        })),
      ),
    [yearMonth, blocks],
  );

  const absenceKeys = useMemo(() => {
    const keys = new Set<string>();

    for (const absence of absences ?? []) {
      keys.add(`${absence.absence_date}:${absence.block}`);
    }

    return keys;
  }, [absences]);

  function getBlockForDay(dayOfWeek: DayOfWeek): VolunteerWeeklyBlockInput {
    return (
      blocks.find((block) => block.day_of_week === dayOfWeek) ?? {
        day_of_week: dayOfWeek,
        morning_available: false,
        afternoon_available: false,
      }
    );
  }

  function updateBlock(
    dayOfWeek: DayOfWeek,
    field: "morning_available" | "afternoon_available",
    checked: boolean,
  ) {
    setDraftBlocks((current) => {
      const source = current ?? blocks;
      const existing = source.find((block) => block.day_of_week === dayOfWeek);

      if (existing) {
        return source.map((block) =>
          block.day_of_week === dayOfWeek
            ? { ...block, [field]: checked }
            : block,
        );
      }

      return [
        ...source,
        {
          day_of_week: dayOfWeek,
          morning_available: field === "morning_available" ? checked : false,
          afternoon_available:
            field === "afternoon_available" ? checked : false,
        },
      ];
    });
  }

  async function handleSaveWeeklyBlocks() {
    const confirmed = window.confirm(WEEKLY_AVAILABILITY_CHANGE_CONFIRMATION);

    if (!confirmed) {
      return;
    }

    await saveWeeklyBlocks.mutateAsync(blocks);
    setDraftBlocks(null);
  }

  async function handleToggleAbsence(
    absenceDate: string,
    block: "morning" | "afternoon",
    checked: boolean,
  ) {
    await setDayAbsence.mutateAsync({
      absenceDate,
      block,
      isAbsent: checked,
    });
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Wekelijkse beschikbaarheid" density="compact">
        <p className="mb-4 text-sm text-carbon-black-600">
          Geef per dag aan wanneer je normaal beschikbaar bent voor de vaste
          blokken.
        </p>

        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : (
          <div className="space-y-4">
            {WEEKLY_BLOCK_DISPLAY_ORDER.map((dayOfWeek) => {
              const block = getBlockForDay(dayOfWeek);

              return (
                <div
                  key={dayOfWeek}
                  className="rounded-xl border border-parchment-200 bg-parchment-50 p-4"
                >
                  <p className="mb-3 font-medium text-carbon-black-900">
                    {getWeeklyDayLabel(dayOfWeek)}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    <label className="flex min-h-11 items-center gap-3 text-sm text-carbon-black-800">
                      <input
                        type="checkbox"
                        checked={block.morning_available}
                        disabled={saveWeeklyBlocks.isPending}
                        onChange={(event) =>
                          updateBlock(
                            dayOfWeek,
                            "morning_available",
                            event.target.checked,
                          )
                        }
                        className="h-5 w-5 rounded border-parchment-300"
                      />
                      Ochtend ({PARTICIPATION_BLOCKS.morning.label})
                    </label>
                    <label className="flex min-h-11 items-center gap-3 text-sm text-carbon-black-800">
                      <input
                        type="checkbox"
                        checked={block.afternoon_available}
                        disabled={saveWeeklyBlocks.isPending}
                        onChange={(event) =>
                          updateBlock(
                            dayOfWeek,
                            "afternoon_available",
                            event.target.checked,
                          )
                        }
                        className="h-5 w-5 rounded border-parchment-300"
                      />
                      Middag ({PARTICIPATION_BLOCKS.afternoon.label})
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <PrimaryButton
            type="button"
            disabled={saveWeeklyBlocks.isPending || isLoading}
            onClick={() => void handleSaveWeeklyBlocks()}
          >
            {saveWeeklyBlocks.isPending
              ? "Bezig met opslaan..."
              : "Wekelijkse beschikbaarheid opslaan"}
          </PrimaryButton>
        </div>
      </DashboardCard>

      <DashboardCard title="Eenmalige afwezigheid" density="compact">
        <p className="mb-4 text-sm text-carbon-black-600">
          Markeer specifieke dagdelen als niet beschikbaar. Alleen dagdelen
          waarvoor je normaal beschikbaar bent worden getoond.
        </p>

        <div className="mb-4 max-w-xs">
          <label
            htmlFor="absence_month"
            className="mb-2 block text-sm font-medium text-carbon-black-900"
          >
            Maand
          </label>
          <input
            id="absence_month"
            type="month"
            value={yearMonth}
            onChange={(event) => setYearMonth(event.target.value)}
            className={formInputClasses}
          />
        </div>

        {monthSlots.length === 0 ? (
          <p className="text-sm text-carbon-black-600">
            Geen beschikbare dagdelen in deze maand volgens je wekelijkse
            planning.
          </p>
        ) : (
          <ul className="space-y-3">
            {monthSlots.map((slot) => {
              const key = `${slot.absenceDate}:${slot.block}`;
              const isAbsent = absenceKeys.has(key);

              return (
                <li key={key}>
                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-parchment-200 bg-white px-4 py-3 text-sm text-carbon-black-800">
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      disabled={setDayAbsence.isPending}
                      onChange={(event) =>
                        void handleToggleAbsence(
                          slot.absenceDate,
                          slot.block,
                          event.target.checked,
                        )
                      }
                      className="h-5 w-5 rounded border-parchment-300"
                    />
                    {slot.label}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
