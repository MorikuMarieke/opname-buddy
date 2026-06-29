import { cn } from "@/lib/utils/cn";

type SectionHeaderSize = "default" | "compact" | "kiosk";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: SectionHeaderSize;
}

const containerSizeClasses: Record<SectionHeaderSize, string> = {
  default: "mb-6",
  compact: "mb-4",
  kiosk: "mb-8",
};

const titleSizeClasses: Record<SectionHeaderSize, string> = {
  default: "text-2xl",
  compact: "text-xl",
  kiosk: "text-3xl",
};

const descriptionSizeClasses: Record<SectionHeaderSize, string> = {
  default: "text-base",
  compact: "text-sm",
  kiosk: "text-lg",
};

export function SectionHeader({
  title,
  description,
  action,
  size = "default",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        containerSizeClasses[size],
      )}
    >
      <div className="space-y-1">
        <h2
          className={cn(
            "font-semibold text-carbon-black-900",
            titleSizeClasses[size],
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "text-carbon-black-600",
              descriptionSizeClasses[size],
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
