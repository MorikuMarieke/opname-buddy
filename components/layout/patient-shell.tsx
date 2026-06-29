"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { patientNavItems } from "@/lib/constants/navigation";

interface PatientShellProps {
  children: React.ReactNode;
}

export function PatientShell({ children }: PatientShellProps) {
  return (
    <DashboardShell
      variant="patient"
      navItems={patientNavItems}
      greeting="Goedemorgen Jan, hoe gaat het vandaag?"
    >
      {children}
    </DashboardShell>
  );
}
