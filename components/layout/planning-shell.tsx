"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlanningQueryProvider } from "@/components/layout/planning-query-provider";
import { planningNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface PlanningShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function PlanningShell({ children, userHeader }: PlanningShellProps) {
  return (
    <PlanningQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={planningNavItems}
        pageTitle="Dagplanning"
        showSearch={false}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </PlanningQueryProvider>
  );
}
