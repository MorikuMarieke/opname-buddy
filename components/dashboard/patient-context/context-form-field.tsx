import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import { cn } from "@/lib/utils/cn";

interface ContextFormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  incomplete?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ContextFormField({
  label,
  htmlFor,
  hint,
  error,
  incomplete = false,
  children,
  className,
}: ContextFormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-medium text-carbon-black-700"
      >
        {incomplete ? (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-carbon-black-300"
            title={PATIENT_CONTEXT_COPY.fieldIncompleteHint}
            aria-hidden="true"
          />
        ) : null}
        <span>{label}</span>
        {incomplete ? (
          <span className="sr-only">{PATIENT_CONTEXT_COPY.fieldIncompleteHint}</span>
        ) : null}
      </label>
      <div>{children}</div>
      {hint ? (
        <p className="text-xs text-carbon-black-500">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
