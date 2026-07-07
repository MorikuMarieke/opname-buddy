"use client";

import { AdminQueryProvider } from "@/components/layout/admin-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface AdminShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function AdminShell({ children, userHeader }: AdminShellProps) {
  return (
    <AdminQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={adminNavItems}
        pageTitle="Beheer"
        showSearch={false}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </AdminQueryProvider>
  );
}
