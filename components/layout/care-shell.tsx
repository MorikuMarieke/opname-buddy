"use client";

import { usePathname } from "next/navigation";
import { CareQueryProvider } from "@/components/layout/care-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CareOverviewRightPanel } from "@/components/dashboard/care-overview-view";
import { careNavItems } from "@/lib/constants/navigation";

interface CareShellProps {
  children: React.ReactNode;
}

export function CareShell({ children }: CareShellProps) {
  const pathname = usePathname();
  const rightPanel = pathname === "/care" ? <CareOverviewRightPanel /> : undefined;

  return (
    <CareQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={careNavItems}
        pageTitle="Zorg dashboard"
        rightPanel={rightPanel}
      >
        {children}
      </DashboardShell>
    </CareQueryProvider>
  );
}
