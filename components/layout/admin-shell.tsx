"use client";

import { AdminQueryProvider } from "@/components/layout/admin-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/lib/constants/navigation";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <AdminQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={adminNavItems}
        pageTitle="Beheer"
      >
        {children}
      </DashboardShell>
    </AdminQueryProvider>
  );
}
