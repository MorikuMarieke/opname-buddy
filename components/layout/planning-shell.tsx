"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlanningQueryProvider } from "@/components/layout/planning-query-provider";
import { PlanningOverviewRightPanel } from "@/components/dashboard/planning-overview-view";
import { planningNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface PlanningShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function PlanningShell({ children, userHeader }: PlanningShellProps) {
  const pathname = usePathname();
  const rightPanel =
    pathname === "/planning" ? <PlanningOverviewRightPanel /> : undefined;

  return (
    <PlanningQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={planningNavItems}
        pageTitle="Planning"
        rightPanel={rightPanel}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </PlanningQueryProvider>
  );
}
