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
}

export function DashboardShell({
  variant,
  navItems,
  children,
  greeting,
  pageTitle,
  sidebarFooter,
  rightPanel,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (variant === "patient") {
    return (
      <div className="flex min-h-full flex-col bg-parchment">
        <TopNavigation variant="patient" greeting={greeting} />
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <PatientBottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex min-h-full bg-parchment">
      <SidebarNavigation
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        footer={sidebarFooter}
      />

      <div className="flex min-h-full flex-1 flex-col lg:ml-0">
        <TopNavigation
          variant="professional"
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1">
          <main className="flex-1 p-4 sm:p-6">
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
            <aside className="hidden w-72 shrink-0 border-l border-dust-grey bg-white p-6 xl:block">
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
