"use client";

import { usePathname } from "next/navigation";
import { CareQueryProvider } from "@/components/layout/care-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CareOverviewRightPanel } from "@/components/dashboard/care-overview-view";
import { careNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface CareShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function CareShell({ children, userHeader }: CareShellProps) {
  const pathname = usePathname();
  const rightPanel = pathname === "/care" ? <CareOverviewRightPanel /> : undefined;

  return (
    <CareQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={careNavItems}
        pageTitle="Zorg dashboard"
        rightPanel={rightPanel}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </CareQueryProvider>
  );
}
