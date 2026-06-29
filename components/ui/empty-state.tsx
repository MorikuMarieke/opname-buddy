import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type EmptyStateSize = "default" | "kiosk";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  size?: EmptyStateSize;
  className?: string;
}

const containerSizeClasses: Record<EmptyStateSize, string> = {
  default: "px-6 py-12",
  kiosk: "px-8 py-16",
};

const iconWrapSizeClasses: Record<EmptyStateSize, string> = {
  default: "h-14 w-14",
  kiosk: "h-20 w-20",
};

const iconSizeClasses: Record<EmptyStateSize, string> = {
  default: "h-7 w-7",
  kiosk: "h-10 w-10",
};

const titleSizeClasses: Record<EmptyStateSize, string> = {
  default: "text-lg",
  kiosk: "text-xl",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-parchment-200 bg-white text-center shadow-card",
        containerSizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-full bg-pearl-aqua-200 text-pearl-aqua-800",
          iconWrapSizeClasses[size],
        )}
      >
        <Icon className={iconSizeClasses[size]} aria-hidden />
      </div>
      <h3 className={cn("font-semibold text-carbon-black-900", titleSizeClasses[size])}>
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-carbon-black-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
