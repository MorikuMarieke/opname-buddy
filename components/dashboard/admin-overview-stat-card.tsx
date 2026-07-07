import Link from "next/link";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { cn } from "@/lib/utils/cn";

interface AdminOverviewStatCardProps {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export function AdminOverviewStatCard({
  href,
  ariaLabel,
  children,
}: AdminOverviewStatCardProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "block rounded-xl border border-parchment-200 bg-white shadow-card transition-colors",
        "cursor-pointer hover:border-pearl-aqua-300 hover:bg-parchment-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600",
      )}
    >
      <DashboardCard density="compact" className="border-0 shadow-none">
        {children}
      </DashboardCard>
    </Link>
  );
}
