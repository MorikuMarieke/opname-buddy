"use client";

import { cn } from "@/lib/utils/cn";
import { ATTENTION_POINT_OPTIONS, type AttentionPoint } from "@/types/patient-context";

interface AttentionPointChipsProps {
  value: AttentionPoint[];
  onChange: (value: AttentionPoint[]) => void;
  disabled?: boolean;
  density?: "default" | "compact";
}

export function AttentionPointChips({
  value,
  onChange,
  disabled = false,
  density = "default",
}: AttentionPointChipsProps) {
  const isCompact = density === "compact";

  function toggle(point: AttentionPoint) {
    if (disabled) {
      return;
    }

    if (value.includes(point)) {
      onChange(value.filter((item) => item !== point));
      return;
    }

    onChange([...value, point]);
  }

  return (
    <div
      className={cn("flex flex-wrap", isCompact ? "gap-1.5" : "gap-2")}
      role="group"
      aria-label="Aandachtspunten"
    >
      {ATTENTION_POINT_OPTIONS.map((option) => {
        const isSelected = value.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => toggle(option.value)}
            className={cn(
              "rounded-full border font-medium transition-colors touch-manipulation",
              isCompact
                ? "min-h-10 px-3 py-1.5 text-sm"
                : "min-h-11 px-4 py-2 text-sm",
              isSelected
                ? "border-blue-slate-700 bg-blue-slate-700 text-white"
                : "border-parchment-300 bg-white text-carbon-black-800 hover:bg-parchment-100",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
