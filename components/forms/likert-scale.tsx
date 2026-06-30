"use client";

import { cn } from "@/lib/utils/cn";
import { LIKERT_LABELS } from "@/types/patient";

interface LikertScaleProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({
  id,
  label,
  value,
  onChange,
  disabled,
}: LikertScaleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-carbon-black-900">{label}</p>
      <div
        id={id}
        role="radiogroup"
        aria-label={label}
        className="grid gap-2 sm:grid-cols-5"
      >
        {LIKERT_LABELS.map((optionLabel, index) => {
          const score = index + 1;

          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={value === score}
              disabled={disabled}
              onClick={() => onChange(score)}
              className={cn(
                "min-h-14 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                value === score
                  ? "border-copper-600 bg-copper-600 text-white"
                  : "border-dust-grey-200 bg-white text-carbon-black-900 hover:bg-dust-grey-100",
                disabled && "opacity-50",
              )}
            >
              <span className="block text-base font-semibold">{score}</span>
              <span className="mt-1 block text-xs leading-tight opacity-90">
                {optionLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
