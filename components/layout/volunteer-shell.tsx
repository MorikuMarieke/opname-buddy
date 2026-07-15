"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { VolunteerQueryProvider } from "@/components/layout/volunteer-query-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { volunteerNavItems } from "@/lib/constants/navigation";
import type { DashboardUserHeader } from "@/lib/utils/dashboard-user-header";

interface VolunteerShellProps {
  children: React.ReactNode;
  userHeader: DashboardUserHeader;
}

export function VolunteerShell({ children, userHeader }: VolunteerShellProps) {
  return (
    <VolunteerQueryProvider>
      <DashboardShell
        variant="professional"
        navItems={volunteerNavItems}
        pageTitle="Vrijwilliger"
        showSearch={false}
        showLogout
        sidebarFooter={<LogoutButton variant="sidebar" />}
        userHeader={userHeader}
      >
        {children}
      </DashboardShell>
    </VolunteerQueryProvider>
  );
}
