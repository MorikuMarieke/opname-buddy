"use client";

import { CareQueryProvider } from "@/components/layout/care-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { careNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface CareShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function CareShell({ children, userHeader }: CareShellProps) {
  return (
    <CareQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={careNavItems}
        pageTitle="Zorg dashboard"
        showSearch={false}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </CareQueryProvider>
  );
}
