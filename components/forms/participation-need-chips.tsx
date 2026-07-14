"use client";

import { cn } from "@/lib/utils/cn";
import {
  PARTICIPATION_NEED_LABELS,
  PARTICIPATION_NEED_VALUES,
  type ParticipationNeedValue,
} from "@/lib/constants/daily-participation";

interface ParticipationNeedChipsProps {
  id?: string;
  value: ParticipationNeedValue[];
  onChange: (value: ParticipationNeedValue[]) => void;
  disabled?: boolean;
}

export function ParticipationNeedChips({
  id,
  value,
  onChange,
  disabled = false,
}: ParticipationNeedChipsProps) {
  function toggle(need: ParticipationNeedValue) {
    if (disabled) {
      return;
    }

    if (value.includes(need)) {
      onChange(value.filter((item) => item !== need));
      return;
    }

    onChange([...value, need]);
  }

  return (
    <div
      id={id}
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Wat zou je vandaag fijn vinden?"
    >
      {PARTICIPATION_NEED_VALUES.map((need) => {
        const isSelected = value.includes(need);

        return (
          <button
            key={need}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => toggle(need)}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors touch-manipulation",
              isSelected
                ? "border-blue-slate-700 bg-blue-slate-700 text-white"
                : "border-parchment-300 bg-white text-carbon-black-800 hover:bg-parchment-100",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {PARTICIPATION_NEED_LABELS[need]}
          </button>
        );
      })}
    </div>
  );
}
