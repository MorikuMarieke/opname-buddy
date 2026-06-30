"use client";

import { cn } from "@/lib/utils/cn";
import { PAIN_LABELS } from "@/types/patient";

interface PainScaleProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function PainScale({ id, value, onChange, disabled }: PainScaleProps) {
  return (
    <div className="space-y-3">
      <div
        id={id}
        role="radiogroup"
        aria-label="Pijnscore"
        className="grid grid-cols-6 gap-2 sm:grid-cols-11"
      >
        {Array.from({ length: 11 }, (_, score) => (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              "min-h-12 rounded-xl border text-sm font-medium transition-colors",
              value === score
                ? "border-copper-600 bg-copper-600 text-white"
                : "border-dust-grey-200 bg-white text-carbon-black-900 hover:bg-dust-grey-100",
              disabled && "opacity-50",
            )}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-carbon-black-600">
        <span>{PAIN_LABELS.min} (0)</span>
        <span>{PAIN_LABELS.max} (10)</span>
      </div>
    </div>
  );
}
