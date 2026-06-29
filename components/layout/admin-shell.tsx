"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/lib/constants/navigation";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <DashboardShell
      variant="professional"
      navItems={adminNavItems}
      pageTitle="Beheer"
    >
      {children}
    </DashboardShell>
  );
}
