"use client";

import { QueryProvider } from "@/providers/query-provider";

interface PatientQueryProviderProps {
  children: React.ReactNode;
}

export function PatientQueryProvider({ children }: PatientQueryProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
