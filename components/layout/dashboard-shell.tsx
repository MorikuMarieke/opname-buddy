"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { PatientBottomNavigation } from "@/components/layout/patient-bottom-navigation";
import type { NavItem } from "@/types/navigation";

interface DashboardShellProps {
  variant: "patient" | "professional";
  navItems: NavItem[];
  children: React.ReactNode;
  greeting?: string;
  pageTitle?: string;
  sidebarFooter?: React.ReactNode;
  rightPanel?: React.ReactNode;
  showSearch?: boolean;
}

export function DashboardShell({
  variant,
  navItems,
  children,
  greeting,
  pageTitle,
  sidebarFooter,
  rightPanel,
  showSearch = true,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (variant === "patient") {
    return (
      <div className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-parchment-50">
        <TopNavigation variant="patient" greeting={greeting} />
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 pb-28 lg:pb-8">
          <div className="mx-auto w-full max-w-3xl md:max-w-4xl">{children}</div>
        </main>
        <PatientBottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-parchment-50">
      <SidebarNavigation
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        footer={sidebarFooter}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <TopNavigation
          variant="professional"
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          showSearch={showSearch}
        />

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <main className="flex-1 p-4 lg:p-5">
            <div
              className={cn(
                "mx-auto w-full",
                rightPanel ? "max-w-5xl" : "max-w-7xl",
              )}
            >
              {children}
            </div>
          </main>

          {rightPanel ? (
            <aside className="hidden w-64 shrink-0 border-l border-parchment-200 bg-parchment-50 p-4 xl:block">
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
