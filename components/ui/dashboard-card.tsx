import { cn } from "@/lib/utils/cn";

type DashboardCardPadding = "sm" | "md" | "lg";

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  padding?: DashboardCardPadding;
  className?: string;
}

const paddingClasses: Record<DashboardCardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function DashboardCard({
  children,
  title,
  padding = "md",
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dust-grey bg-white shadow-sm",
        paddingClasses[padding],
        className,
      )}
    >
      {title ? (
        <h3 className="mb-4 text-lg font-semibold text-carbon-black">{title}</h3>
      ) : null}
      {children}
    </div>
  );
}
