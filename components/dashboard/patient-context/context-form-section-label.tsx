import { cn } from "@/lib/utils/cn";

interface ContextFormSectionLabelProps {
  children: React.ReactNode;
  optional?: boolean;
  className?: string;
}

export function ContextFormSectionLabel({
  children,
  optional = false,
  className,
}: ContextFormSectionLabelProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wide",
        optional
          ? "border-t border-parchment-200 pt-2 text-carbon-black-400"
          : "text-carbon-black-500",
        className,
      )}
    >
      {children}
    </p>
  );
}
