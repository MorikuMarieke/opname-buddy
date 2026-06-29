import { cn } from "@/lib/utils/cn";

type DashboardCardDensity = "comfortable" | "compact";
type DashboardCardPadding = "sm" | "md" | "lg";

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  padding?: DashboardCardPadding;
  density?: DashboardCardDensity;
  className?: string;
}

const paddingClasses: Record<DashboardCardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const densityClasses: Record<DashboardCardDensity, string> = {
  comfortable: "rounded-2xl",
  compact: "rounded-xl",
};

const titleDensityClasses: Record<DashboardCardDensity, string> = {
  comfortable: "mb-4 text-lg",
  compact: "mb-3 text-base",
};

export function DashboardCard({
  children,
  title,
  padding,
  density = "comfortable",
  className,
}: DashboardCardProps) {
  const resolvedPadding = padding ?? (density === "compact" ? "sm" : "md");

  return (
    <div
      className={cn(
        "border border-parchment-200 bg-white shadow-card",
        densityClasses[density],
        paddingClasses[resolvedPadding],
        className,
      )}
    >
      {title ? (
        <h3
          className={cn(
            "font-semibold text-carbon-black-900",
            titleDensityClasses[density],
          )}
        >
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}
