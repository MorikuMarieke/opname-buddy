"use client";

import { Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  formatDutchDateInput,
  parseDutchDateInput,
} from "@/lib/utils/amsterdam-date";
import { cn } from "@/lib/utils/cn";

const defaultInputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 pr-11 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

interface DutchDateInputProps {
  id?: string;
  value: string;
  onChange: (isoValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  pickerAriaLabel?: string;
}

export function DutchDateInput({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  placeholder = "dd/mm/jjjj",
  inputMode = "numeric",
  pickerAriaLabel = "Datum kiezen",
}: DutchDateInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => formatDutchDateInput(value));

  useEffect(() => {
    setText(formatDutchDateInput(value));
  }, [value]);

  function handleTextChange(nextText: string) {
    setText(nextText);

    const parsed = parseDutchDateInput(nextText);

    if (parsed) {
      onChange(parsed);
    }
  }

  function handleBlur(nextText: string) {
    const parsed = parseDutchDateInput(nextText);

    if (parsed) {
      onChange(parsed);
      setText(formatDutchDateInput(parsed));
      return;
    }

    setText(formatDutchDateInput(value));
  }

  function handlePickerChange(nextValue: string) {
    onChange(nextValue);
    setText(formatDutchDateInput(nextValue));
  }

  function openDatePicker() {
    const picker = pickerRef.current;

    if (!picker || disabled) {
      return;
    }

    if ("showPicker" in picker && typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }

    picker.click();
  }

  return (
    <div className="relative min-w-0">
      <input
        id={id}
        type="text"
        required={required}
        disabled={disabled}
        className={cn(defaultInputClasses, className)}
        value={text}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        onChange={(event) => handleTextChange(event.target.value)}
        onBlur={(event) => handleBlur(event.target.value)}
      />
      <input
        ref={pickerRef}
        type="date"
        value={value}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(event) => handlePickerChange(event.target.value)}
      />
      <button
        type="button"
        onClick={openDatePicker}
        disabled={disabled}
        aria-label={pickerAriaLabel}
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-carbon-black-500 hover:text-carbon-black-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600 disabled:opacity-50"
      >
        <Calendar className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
