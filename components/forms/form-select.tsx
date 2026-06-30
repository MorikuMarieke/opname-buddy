import { formSelectClasses } from "@/components/forms/form-styles";
import { cn } from "@/lib/utils/cn";

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  options: FormSelectOption[];
}

export function FormSelect({
  className,
  options,
  ...props
}: FormSelectProps) {
  return (
    <select {...props} className={cn(formSelectClasses, className)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
