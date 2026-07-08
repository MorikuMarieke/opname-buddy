"use client";

import { QueryProvider } from "@/providers/query-provider";

interface PlanningQueryProviderProps {
  children: React.ReactNode;
}

export function PlanningQueryProvider({ children }: PlanningQueryProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
