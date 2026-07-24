"use client";

import type { User } from "@supabase/supabase-js";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PatientQueryProvider } from "@/components/layout/patient-query-provider";
import { patientNavItems } from "@/lib/constants/navigation";

interface PatientShellProps {
  children: React.ReactNode;
  user: User;
}

function getGreetingFirstName(user: User): string | null {
  const fullName = user.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? null;
  }

  return null;
}

export function PatientShell({ children, user }: PatientShellProps) {
  const firstName = getGreetingFirstName(user);
  const greeting = firstName ? `Hallo, ${firstName}!` : "Hallo!";

  return (
    <PatientQueryProvider>
      <DashboardShell
        variant="patient"
        navItems={patientNavItems}
        greeting={greeting}
      >
        {children}
      </DashboardShell>
    </PatientQueryProvider>
  );
}
