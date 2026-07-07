"use client";

import { usePathname } from "next/navigation";

import { PatientLinkGate } from "@/components/dashboard/patient-link-gate";

interface PatientDashboardContentProps {
  children: React.ReactNode;
}

export function PatientDashboardContent({ children }: PatientDashboardContentProps) {
  const pathname = usePathname();

  if (pathname === "/dashboard/link") {
    return children;
  }

  return <PatientLinkGate>{children}</PatientLinkGate>;
}
