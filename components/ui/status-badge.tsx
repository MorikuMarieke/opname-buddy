import { cn } from "@/lib/utils/cn";

type StatusBadgeVariant = "neutral" | "attention" | "positive";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  neutral: "bg-dust-grey text-carbon-black",
  attention: "bg-cherry-rose/15 text-cherry-rose",
  positive: "bg-pearl-aqua/40 text-blue-slate",
};

export function StatusBadge({
  children,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
