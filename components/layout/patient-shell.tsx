"use client";

import type { User } from "@supabase/supabase-js";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { patientNavItems } from "@/lib/constants/navigation";

interface PatientShellProps {
  children: React.ReactNode;
  user: User;
}

function getGreetingName(user: User): string {
  const fullName = user.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? fullName;
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "daar";
  }

  return "daar";
}

export function PatientShell({ children, user }: PatientShellProps) {
  const greetingName = getGreetingName(user);

  return (
    <DashboardShell
      variant="patient"
      navItems={patientNavItems}
      greeting={`Goedemorgen ${greetingName}, hoe gaat het vandaag?`}
    >
      {children}
    </DashboardShell>
  );
}
