import { ContextEnumSelect } from "@/components/forms/context-enum-select";
import { cn } from "@/lib/utils/cn";
import { formSelectClasses } from "@/components/forms/form-styles";

interface ContextFormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id: string;
  options: { value: string; label: string }[];
}

export function ContextFormSelect({
  className,
  options,
  ...props
}: ContextFormSelectProps) {
  return (
    <ContextEnumSelect
      {...props}
      options={options}
      className={cn(
        formSelectClasses,
        "h-9 rounded-lg px-3 py-0 text-sm",
        className,
      )}
    />
  );
}
