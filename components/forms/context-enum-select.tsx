import { FormSelect } from "@/components/forms/form-select";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";

interface ContextEnumSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id: string;
  options: { value: string; label: string }[];
}

export function ContextEnumSelect({
  id,
  options,
  ...props
}: ContextEnumSelectProps) {
  const withUnknownFirst = [
    ...options.filter((option) => option.value === "unknown"),
    ...options.filter((option) => option.value !== "unknown"),
  ].map((option) =>
    option.value === "unknown"
      ? { ...option, label: PATIENT_CONTEXT_COPY.unknownSelectHint }
      : option,
  );

  return <FormSelect id={id} options={withUnknownFirst} {...props} />;
}
