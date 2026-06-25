"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlanningOverviewRightPanel } from "@/components/dashboard/planning-overview-view";
import { planningNavItems } from "@/lib/constants/navigation";

interface PlanningShellProps {
  children: React.ReactNode;
}

export function PlanningShell({ children }: PlanningShellProps) {
  const pathname = usePathname();
  const rightPanel =
    pathname === "/planning" ? <PlanningOverviewRightPanel /> : undefined;

  return (
    <DashboardShell
      variant="professional"
      navItems={planningNavItems}
      pageTitle="Planning"
      rightPanel={rightPanel}
    >
      {children}
    </DashboardShell>
  );
}
