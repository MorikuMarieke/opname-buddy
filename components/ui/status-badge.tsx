import { cn } from "@/lib/utils/cn";

type StatusBadgeVariant = "neutral" | "attention" | "positive";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  neutral: "bg-parchment-200 text-carbon-black-800",
  attention: "bg-cherry-rose-50 text-cherry-rose-600",
  positive: "bg-pearl-aqua-200 text-blue-slate-800",
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
