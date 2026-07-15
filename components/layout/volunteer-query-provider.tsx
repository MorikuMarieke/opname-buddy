"use client";

import { QueryProvider } from "@/providers/query-provider";

interface VolunteerQueryProviderProps {
  children: React.ReactNode;
}

export function VolunteerQueryProvider({ children }: VolunteerQueryProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
